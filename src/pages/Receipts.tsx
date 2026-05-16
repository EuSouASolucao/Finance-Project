import { ChangeEvent, useMemo, useState } from 'react';
import { Camera, CheckCircle2, FileImage, Loader2, Plus, ReceiptText, ScanLine, Trash2, UploadCloud } from 'lucide-react';
import SummaryCards from '@/components/SummaryCards';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFinance } from '@/contexts/FinanceContext';
import { panelPortalDarkRootClass, usePanelTheme } from '@/contexts/PanelThemeContext';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { cn } from '@/lib/utils';
import { financeApi, getApiToken, isApiConfigured } from '@/services/api';
import { Category, CATEGORIES, PaymentStatus, TransactionType } from '@/types/finance';
import { toast } from 'sonner';
import { recognize } from 'tesseract.js';

interface ReceiptDraft {
  type: TransactionType;
  description: string;
  companyName: string;
  cnpj: string;
  purchaseDate: string;
  totalAmount: string;
  items: ReceiptItem[];
  category: Category;
  paymentStatus: PaymentStatus;
  notes: string;
}

interface ReceiptItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  total: string;
}

const today = new Date().toISOString().split('T')[0];

function parseMoney(value?: string) {
  if (!value) return 0;
  const cleaned = value.replace(/[^\d,.]/g, '');
  if (!cleaned) return 0;

  if (cleaned.includes(',') && cleaned.includes('.')) {
    return Number(cleaned.replace(/\./g, '').replace(',', '.')) || 0;
  }

  if (cleaned.includes(',')) {
    return Number(cleaned.replace(',', '.')) || 0;
  }

  return Number(cleaned) || 0;
}

function formatMoney(value: number) {
  return value.toFixed(2);
}

function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 14) return value;
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function formatDate(value: string) {
  const match = value.match(/(\d{2})[\/.-](\d{2})[\/.-](\d{2,4})/);
  if (!match) return today;
  const [, day, month, year] = match;
  const fullYear = year.length === 2 ? `20${year}` : year;
  return `${fullYear}-${month}-${day}`;
}

function extractTotal(lines: string[]) {
  const totalLine = [...lines].reverse().find(line => /total/i.test(line) && /\d+[,.]\d{2}/.test(line));
  const totalValues = totalLine?.match(/\d+[,.]\d{2}/g);
  if (totalValues?.length) return parseMoney(totalValues[totalValues.length - 1]);

  const moneyValues = lines.join(' ').match(/\d+[,.]\d{2}/g) || [];
  const parsedValues = moneyValues.map(parseMoney).filter(value => value > 0 && value < 100000);
  return parsedValues.length ? Math.min(...parsedValues.slice(-4)) : 0;
}

function normalizeOcrMoney(value: string) {
  return value
    .replace(/[Oo]/g, '0')
    .replace(/[Ss]/g, '5')
    .replace(/[lI]/g, '1')
    .replace(/[^\d,.]/g, '');
}

function getMoneyValues(line: string) {
  const matches = line.match(/[\dOoSsIl]{1,6}[,.][\dOoSsIl]{2}/g) || [];
  return matches.map(value => parseMoney(normalizeOcrMoney(value))).filter(value => value > 0);
}

function getItemQuantity(line: string) {
  const normalized = line.replace(/,/g, '.');
  const unitMatch = normalized.match(/(?:^|\s)(\d+(?:\.\d+)?)\s*(un|und|kg|g|l|lt|cx|pc|pct)\b/i);
  if (unitMatch) return Number(unitMatch[1]) || 1;

  const multiplierMatch = normalized.match(/(?:qtd|qtde|quantidade)?\s*(\d+(?:\.\d+)?)\s*[xX]\s*[\dOoSsIl]{1,6}[,.][\dOoSsIl]{2}/i);
  if (multiplierMatch) return Number(multiplierMatch[1]) || 1;

  return 1;
}

function cleanItemDescription(line: string) {
  return line
    .replace(/[\dOoSsIl]{1,6}[,.][\dOoSsIl]{2}/g, '')
    .replace(/\b\d{1,4}\s*(un|und|kg|g|l|lt|cx|pc|pct)\b/gi, '')
    .replace(/\b(item|codigo|c[oó]digo|descri[cç][aã]o|qtd|qtde|un|vlr|valor|unit[aá]rio|total|st)\b/gi, '')
    .replace(/^\s*\d{1,4}\s+/, '')
    .replace(/\b\d{4,}\b/g, '')
    .replace(/\bx\b/gi, '')
    .replace(/[|_*:;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractItems(lines: string[], totalAmount: number): ReceiptItem[] {
  const totalIndex = lines.findIndex(line => /total/i.test(line));
  const headerIndex = lines.findIndex(line => /item|descri[cç][aã]o|qtd|vlr|valor/i.test(line));
  const itemLines = lines.filter((line, index) => {
    const values = getMoneyValues(line);
    const beforeTotal = totalIndex === -1 || index < totalIndex;
    const afterHeader = headerIndex === -1 || index > headerIndex;
    const notHeader = !/cnpj|cpf|endereco|telefone|cupom|extrato|dinheiro|troco|valor total|total\s*r|consumidor|chave|sat/i.test(line);
    const hasProductText = /[a-zA-ZÀ-ÿ]{3,}/.test(cleanItemDescription(line));
    const hasItemCode = /^\s*\d{1,4}\b/.test(line) || /\b\d{4,}\b/.test(line);

    return values.length > 0 && beforeTotal && afterHeader && notHeader && (hasProductText || hasItemCode);
  }).slice(0, 12);

  const items = itemLines.map(line => {
    const values = getMoneyValues(line);
    const quantity = getItemQuantity(line);
    const itemTotal = values[values.length - 1] || totalAmount;
    const possibleUnitPrice = values.length >= 2 ? values[values.length - 2] : itemTotal / Math.max(quantity, 1);
    const unitPrice = possibleUnitPrice > itemTotal ? itemTotal / Math.max(quantity, 1) : possibleUnitPrice;
    const description = cleanItemDescription(line);

    return {
      id: crypto.randomUUID(),
      description: description || 'Item identificado no cupom',
      quantity: String(quantity),
      unitPrice: formatMoney(unitPrice),
      total: formatMoney(itemTotal),
    };
  });

  if (items.length) return items;

  return [{
    id: crypto.randomUUID(),
    description: lines.join(' ').toLowerCase().includes('coca') ? 'Coca-Cola' : 'Item identificado no cupom',
    quantity: '1',
    unitPrice: '',
    total: '',
  }];
}

function createDraftFromOcr(text: string, fileName?: string): ReceiptDraft {
  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  const fullText = lines.join(' ');
  const cnpjMatch = fullText.match(/\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/);
  const dateMatch = fullText.match(/\d{2}[\/.-]\d{2}[\/.-]\d{2,4}/);
  const totalAmount = extractTotal(lines);
  const items = extractItems(lines, totalAmount);
  const firstCompanyLine = lines.find(line => {
    const lower = line.toLowerCase();
    return !/cnpj|cpf|endereco|telefone|cupom|item|total|dinheiro|data|hora|extrato|consumidor/i.test(lower) && /[a-z]/i.test(line);
  });
  const hasCocaCola = /coca/i.test(fullText);

  return {
    type: 'expense',
    description: hasCocaCola ? 'Compra de Coca-Cola identificada no cupom' : 'Compra identificada por OCR',
    companyName: firstCompanyLine || 'Empresa identificada no comprovante',
    cnpj: cnpjMatch ? formatCnpj(cnpjMatch[0]) : 'CNPJ não identificado',
    purchaseDate: dateMatch ? formatDate(dateMatch[0]) : today,
    totalAmount: formatMoney(totalAmount || items.reduce((sum, item) => sum + parseMoney(item.total), 0)),
    items,
    category: hasCocaCola || /mercado|supermercado|alimento/i.test(`${fullText} ${fileName}`) ? 'Alimentação' : 'Outros',
    paymentStatus: 'paid',
    notes: `Leitura OCR local realizada. Texto reconhecido parcialmente: ${fullText.slice(0, 180)}${fullText.length > 180 ? '...' : ''}`,
  };
}

function createBlankDraft(): ReceiptDraft {
  return {
    type: 'expense',
    description: 'Comprovante para revisão manual',
    companyName: '',
    cnpj: '',
    purchaseDate: today,
    totalAmount: '',
    items: [
      { id: crypto.randomUUID(), description: '', quantity: '1', unitPrice: '', total: '' },
    ],
    category: 'Outros',
    paymentStatus: 'paid',
    notes: 'O OCR não encontrou valores com segurança. Preencha somente com os dados conferidos no comprovante.',
  };
}

export default function Receipts() {
  const formatCurrency = useFormatCurrency();
  const { isDarkMode } = usePanelTheme();
  const { addTransaction } = useFinance();
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [draft, setDraft] = useState<ReceiptDraft | null>(null);

  const canConfirm = useMemo(() => {
    if (!draft) return false;
    const amount = Number(draft.totalAmount);
    return draft.description.trim().length > 0 && draft.companyName.trim().length > 0 && !Number.isNaN(amount) && amount > 0;
  }, [draft]);

  const itemsTotal = useMemo(() => {
    if (!draft) return 0;
    return draft.items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  }, [draft]);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setSelectedFile(file);
    setDraft(null);

    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  const analyzeReceipt = async () => {
    if (!preview) {
      toast.error('Envie ou tire uma foto do comprovante primeiro.');
      return;
    }

    setIsReading(true);
    try {
      const result = await recognize(preview, 'por+eng');
      const text = result.data.text.trim();
      setDraft(text ? createDraftFromOcr(text, fileName) : createBlankDraft());
      setIsReading(false);
      toast.success('Leitura OCR concluída. Revise os dados encontrados.');
    } catch {
      setDraft(createBlankDraft());
      setIsReading(false);
      toast.error('Não foi possível ler o texto da imagem. Preencha os campos manualmente.');
    }
  };

  const updateDraft = <K extends keyof ReceiptDraft>(key: K, value: ReceiptDraft[K]) => {
    setDraft(current => current ? { ...current, [key]: value } : current);
  };

  const updateItem = <K extends keyof ReceiptItem>(id: string, key: K, value: ReceiptItem[K]) => {
    setDraft(current => {
      if (!current) return current;
      const items = current.items.map(item => {
        if (item.id !== id) return item;
        const updated = { ...item, [key]: value };
        const quantity = Number(updated.quantity) || 0;
        const unitPrice = Number(updated.unitPrice) || 0;
        if (key === 'quantity' || key === 'unitPrice') {
          updated.total = (quantity * unitPrice).toFixed(2);
        }
        return updated;
      });
      const totalAmount = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0).toFixed(2);
      return { ...current, items, totalAmount };
    });
  };

  const addItem = () => {
    setDraft(current => current ? {
      ...current,
      items: [
        ...current.items,
        { id: crypto.randomUUID(), description: 'Novo item', quantity: '1', unitPrice: '0.00', total: '0.00' },
      ],
    } : current);
  };

  const removeItem = (id: string) => {
    setDraft(current => {
      if (!current) return current;
      const items = current.items.filter(item => item.id !== id);
      const totalAmount = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0).toFixed(2);
      return { ...current, items, totalAmount };
    });
  };

  const confirmTransaction = () => {
    if (!draft || !canConfirm) {
      toast.error('Revise os dados antes de confirmar.');
      return;
    }

    addTransaction({
      type: 'expense',
      description: `${draft.description.trim()} - ${draft.companyName.trim()}`,
      amount: Number(draft.totalAmount),
      category: draft.category,
      date: draft.purchaseDate,
      paymentStatus: draft.paymentStatus,
    });

    if (isApiConfigured() && getApiToken()) {
      const receiptData = new FormData();
      receiptData.append('companyName', draft.companyName);
      receiptData.append('cnpj', draft.cnpj);
      receiptData.append('purchaseDate', draft.purchaseDate);
      receiptData.append('totalAmount', draft.totalAmount);
      receiptData.append('ocrText', draft.notes);
      receiptData.append('items', JSON.stringify(draft.items));
      if (selectedFile) receiptData.append('image', selectedFile);

      void financeApi.receipts.create(receiptData).catch(error => {
        console.error('Erro ao salvar comprovante no MySQL:', error);
      });
    }

    toast.success('Transação adicionada a partir do comprovante!');
    setDraft(null);
    setPreview(null);
    setSelectedFile(null);
    setFileName('');
  };

  return (
    <div className="space-y-6">
      <SummaryCards />

      <section
        className={cn(
          'rounded-2xl border shadow-xl',
          isDarkMode
            ? 'border-slate-800 bg-slate-950/50 shadow-none ring-1 ring-slate-800/90'
            : 'border-slate-100 bg-white shadow-slate-200/70',
        )}
      >
        <div className={cn('border-b p-6', isDarkMode ? 'border-slate-800' : 'border-slate-100')}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className={cn('font-heading text-lg font-bold', isDarkMode ? 'text-slate-50' : 'text-slate-900')}>
                Leitura de Comprovante
              </h1>
              <p className={cn('mt-1 text-sm', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                Tire uma foto ou envie um comprovante para gerar uma transação automaticamente.
              </p>
            </div>
            <Badge
              className={
                isDarkMode
                  ? 'w-fit border border-blue-800/80 bg-blue-950/50 text-blue-200 hover:bg-blue-950/50'
                  : 'w-fit bg-blue-50 text-blue-700 hover:bg-blue-50'
              }
            >
              <ScanLine className="mr-1 h-3.5 w-3.5" /> OCR local ativado
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <div
              className={cn(
                'rounded-[2rem] border border-dashed p-6',
                isDarkMode
                  ? 'border-blue-700/35 bg-slate-900/70 ring-1 ring-slate-700/80'
                  : 'border-blue-200 bg-blue-50/60',
              )}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-emerald-600 text-white">
                <ReceiptText className="h-6 w-6" />
              </div>
              <h2 className={cn('mt-5 font-heading text-xl font-bold', isDarkMode ? 'text-slate-50' : 'text-slate-900')}>Enviar comprovante</h2>
              <p className={cn('mt-2 text-sm leading-6', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                No celular, o botão pode abrir a câmera. No computador, você pode anexar uma imagem.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-slate-800">
                  <Camera className="h-4 w-4" /> Tirar foto
                  <Input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
                </Label>
                <Label
                  className={cn(
                    'flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors',
                    isDarkMode
                      ? 'border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                  )}
                >
                  <UploadCloud className="h-4 w-4" /> Anexar imagem
                  <Input type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </Label>
              </div>
            </div>

            <div className={cn('rounded-[2rem] border p-4', isDarkMode ? 'border-slate-700/90 bg-slate-900/55' : 'border-slate-100 bg-slate-50')}>
              {preview ? (
                <div>
                  <img
                    src={preview}
                    alt="Prévia do comprovante"
                    className={cn('max-h-[420px] w-full rounded-2xl object-contain', isDarkMode ? 'bg-slate-950' : 'bg-white')}
                  />
                  <div className={cn('mt-3 flex items-center justify-between gap-3 text-sm', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                    <span className="truncate">{fileName || 'Comprovante enviado'}</span>
                    <FileImage className="h-4 w-4 shrink-0" />
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    'flex min-h-72 flex-col items-center justify-center rounded-2xl text-center text-sm',
                    isDarkMode ? 'border border-dashed border-slate-600 bg-slate-950/60 text-slate-400' : 'bg-white text-slate-500',
                  )}
                >
                  <FileImage className={cn('h-10 w-10', isDarkMode ? 'text-slate-600' : 'text-slate-300')} />
                  <p className="mt-3">Nenhum comprovante selecionado.</p>
                </div>
              )}
            </div>

            <Button
              className="w-full rounded-xl bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700"
              onClick={analyzeReceipt}
              disabled={isReading}
            >
              {isReading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}
              {isReading ? 'Lendo comprovante...' : 'Ler comprovante'}
            </Button>
          </div>

          <div
            className={cn(
              'rounded-[2rem] border p-6',
              isDarkMode ? 'border-slate-700/90 bg-slate-900/55' : 'border-slate-100 bg-slate-50',
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-2xl',
                  isDarkMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-700',
                )}
              >
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className={cn('font-heading text-xl font-bold', isDarkMode ? 'text-slate-50' : 'text-slate-900')}>Dados encontrados</h2>
                <p className={cn('text-sm', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>Revise antes de salvar no sistema.</p>
              </div>
            </div>

            {!draft ? (
              <div
                className={cn(
                  'mt-6 rounded-2xl p-6 text-sm leading-6',
                  isDarkMode ? 'border border-slate-700/80 bg-slate-950/60 text-slate-400' : 'bg-white text-slate-500',
                )}
              >
                Após a leitura, o sistema tentará reconhecer o texto da imagem, localizar CNPJ, data, itens e valor total.
                Revise os campos porque imagens borradas ou cupons antigos podem exigir ajuste manual.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className={isDarkMode ? 'text-slate-300' : undefined}>Tipo</Label>
                    <Input
                      className={cn(
                        'rounded-xl',
                        isDarkMode ? 'border-slate-600 bg-slate-950 text-red-400' : 'bg-white text-red-600',
                      )}
                      value="Despesa"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className={isDarkMode ? 'text-slate-300' : undefined}>Status</Label>
                    <Select value={draft.paymentStatus} onValueChange={value => updateDraft('paymentStatus', value as PaymentStatus)}>
                      <SelectTrigger
                        className={cn(
                          'rounded-xl',
                          isDarkMode ? 'border-slate-600 bg-slate-950 text-slate-100' : 'bg-white',
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={panelPortalDarkRootClass(isDarkMode)}>
                        <SelectItem value="paid">Pago</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="overdue">Atrasado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={isDarkMode ? 'text-slate-300' : undefined}>Descrição</Label>
                  <Input
                    className={cn(
                      'rounded-xl',
                      isDarkMode ? 'border-slate-600 bg-slate-950 text-slate-100 placeholder:text-slate-500' : 'bg-white',
                    )}
                    value={draft.description}
                    onChange={event => updateDraft('description', event.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className={isDarkMode ? 'text-slate-300' : undefined}>Nome da empresa</Label>
                    <Input
                      className={cn(
                        'rounded-xl',
                        isDarkMode ? 'border-slate-600 bg-slate-950 text-slate-100 placeholder:text-slate-500' : 'bg-white',
                      )}
                      value={draft.companyName}
                      onChange={event => updateDraft('companyName', event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className={isDarkMode ? 'text-slate-300' : undefined}>CNPJ</Label>
                    <Input
                      className={cn(
                        'rounded-xl',
                        isDarkMode ? 'border-slate-600 bg-slate-950 text-slate-100 placeholder:text-slate-500' : 'bg-white',
                      )}
                      value={draft.cnpj}
                      onChange={event => updateDraft('cnpj', event.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className={isDarkMode ? 'text-slate-300' : undefined}>Data da compra</Label>
                    <Input
                      className={cn(
                        'rounded-xl',
                        isDarkMode ? 'border-slate-600 bg-slate-950 text-slate-100 scheme-dark' : 'bg-white',
                      )}
                      type="date"
                      value={draft.purchaseDate}
                      onChange={event => updateDraft('purchaseDate', event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className={isDarkMode ? 'text-slate-300' : undefined}>Valor total (R$)</Label>
                    <Input
                      className={cn(
                        'rounded-xl',
                        isDarkMode ? 'border-slate-600 bg-slate-950 text-slate-100 placeholder:text-slate-500' : 'bg-white',
                      )}
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={draft.totalAmount}
                      onChange={event => updateDraft('totalAmount', event.target.value)}
                    />
                  </div>
                </div>

                <div
                  className={cn(
                    'rounded-2xl p-4',
                    isDarkMode ? 'border border-slate-700/80 bg-slate-950/50' : 'bg-white',
                  )}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <Label className={isDarkMode ? 'text-slate-300' : undefined}>Itens identificados na nota</Label>
                      <p className={cn('mt-1 text-xs', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                        Total dos itens: {formatCurrency(itemsTotal)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn(
                        'rounded-xl',
                        isDarkMode ? 'border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800 hover:text-white' : '',
                      )}
                      onClick={addItem}
                    >
                      <Plus className="h-4 w-4" /> Adicionar item
                    </Button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {draft.items.map(item => (
                      <div
                        key={item.id}
                        className={cn(
                          'rounded-2xl border p-3',
                          isDarkMode ? 'border-slate-700/85 bg-slate-900/65' : 'border-slate-100 bg-slate-50',
                        )}
                      >
                        <div className="grid gap-3 lg:grid-cols-[1.5fr_0.6fr_0.8fr_0.8fr_auto]">
                          <div className="space-y-1">
                            <span className={cn('text-xs', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>Descrição do item</span>
                            <Input
                              className={cn(
                                'rounded-xl',
                                isDarkMode ? 'border-slate-600 bg-slate-950 text-slate-100 placeholder:text-slate-500' : 'bg-white',
                              )}
                              value={item.description}
                              onChange={event => updateItem(item.id, 'description', event.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <span className={cn('text-xs', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>Qtd.</span>
                            <Input
                              className={cn(
                                'rounded-xl',
                                isDarkMode ? 'border-slate-600 bg-slate-950 text-slate-100' : 'bg-white',
                              )}
                              type="number"
                              step="0.01"
                              value={item.quantity}
                              onChange={event => updateItem(item.id, 'quantity', event.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <span className={cn('text-xs', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>Valor unit.</span>
                            <Input
                              className={cn(
                                'rounded-xl',
                                isDarkMode ? 'border-slate-600 bg-slate-950 text-slate-100' : 'bg-white',
                              )}
                              type="number"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={event => updateItem(item.id, 'unitPrice', event.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <span className={cn('text-xs', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>Total item</span>
                            <Input
                              className={cn(
                                'rounded-xl',
                                isDarkMode ? 'border-slate-600 bg-slate-950 text-slate-100' : 'bg-white',
                              )}
                              type="number"
                              step="0.01"
                              value={item.total}
                              onChange={event => updateItem(item.id, 'total', event.target.value)}
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className={cn(
                                'h-10 w-10 hover:text-red-500',
                                isDarkMode ? 'text-slate-500 hover:bg-slate-800 hover:text-red-400' : 'text-slate-400',
                              )}
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={isDarkMode ? 'text-slate-300' : undefined}>Categoria</Label>
                  <Select value={draft.category} onValueChange={value => updateDraft('category', value as Category)}>
                    <SelectTrigger
                      className={cn(
                        'rounded-xl',
                        isDarkMode ? 'border-slate-600 bg-slate-950 text-slate-100' : 'bg-white',
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={panelPortalDarkRootClass(isDarkMode)}>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className={isDarkMode ? 'text-slate-300' : undefined}>Observação da leitura</Label>
                  <Textarea
                    className={cn(
                      'rounded-xl',
                      isDarkMode ? 'border-slate-600 bg-slate-950 text-slate-100 placeholder:text-slate-500' : 'bg-white',
                    )}
                    value={draft.notes}
                    onChange={event => updateDraft('notes', event.target.value)}
                  />
                </div>

                <Button className="w-full rounded-xl bg-slate-950 hover:bg-slate-800" onClick={confirmTransaction} disabled={!canConfirm}>
                  <CheckCircle2 className="h-4 w-4" /> Confirmar e adicionar transação
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
