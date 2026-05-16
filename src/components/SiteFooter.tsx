import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, ShieldCheck, Wallet } from 'lucide-react';
import type { FooterT } from '@/i18n/translations/types';

interface SiteFooterProps {
  footer: FooterT;
}

export default function SiteFooter({ footer }: SiteFooterProps) {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-800 shadow-xl">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="font-heading text-xl font-bold leading-none">FinanceApp</p>
                <p className="mt-1 text-xs text-white/60">{footer.tagline}</p>
              </div>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-6 text-white/60">{footer.description}</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              {footer.securityNote}
            </div>
          </div>

          <div>
            <h3 className="font-heading text-lg font-bold">{footer.companyTitle}</h3>
            <div className="mt-4 space-y-3 text-sm text-white/65">
              {footer.companyLines.map(line => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-heading text-lg font-bold">{footer.contactTitle}</h3>
            <div className="mt-4 space-y-3 text-sm text-white/65">
              <p className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                Av. Paulista, 1000 - Bela Vista, São Paulo - SP
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-300" />
                contato@financeapp.com.br
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-300" />
                (11) 4002-8922
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
          <p>{footer.copyright}</p>
          <div className="flex flex-wrap gap-4">
            {footer.links.map(link => (
              <a key={link.label} href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
