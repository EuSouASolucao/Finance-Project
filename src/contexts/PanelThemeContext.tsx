import { createContext, useContext } from 'react';

export type PanelThemeContextValue = {
  isDarkMode: boolean;
};

export const PanelThemeContext = createContext<PanelThemeContextValue>({ isDarkMode: false });

export function usePanelTheme() {
  return useContext(PanelThemeContext);
}

/** Classes para superfícies em portal (Radix) quando o painel está escuro — ativa variáveis `.dark` do tema. */
export function panelPortalDarkRootClass(isDark: boolean) {
  return isDark ? 'dark border-slate-700' : '';
}

/**
 * Modal/dialog no portal: `bg-background` + ordem das utilities Tailwind pode manter o fundo claro só com `dark`.
 * Força fundo/texto/bordas e descendentes comuns (inputs, SelectTrigger).
 */
export function panelModalDarkSurfaceClass(isDark: boolean) {
  if (!isDark) return '';
  return [
    'dark border-slate-600 !bg-slate-950 text-slate-50',
    /* Sombras do modal alinhadas ao painel escuro (profundidade + brilho azul suave, sem “caixa” cinza). */
    '!shadow-[0_0_0_1px_rgb(71_85_105_/_0.35),0_22px_48px_-14px_rgb(0_0_0_/_0.52),0_12px_28px_-12px_rgb(29_78_216_/_0.14)]',
    '[&_input]:!border-slate-600 [&_input]:!bg-slate-900 [&_input]:!text-slate-100 [&_input]:placeholder:!text-slate-500',
    '[&_input[type=date]]:scheme-dark',
    '[&_[role=combobox]]:!border-slate-600 [&_[role=combobox]]:!bg-slate-900 [&_[role=combobox]]:!text-slate-100',
    '[&_label]:!text-slate-200',
    '[&_button]:!ring-offset-slate-950',
    '[&>button.absolute]:!text-slate-400 [&>button.absolute:hover]:!text-slate-100',
  ].join(' ');
}
