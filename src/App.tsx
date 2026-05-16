import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Goals from "@/pages/Goals";
import Payments from "@/pages/Payments";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Receipts from "@/pages/Receipts";
import ProfessionalCenter from "@/pages/ProfessionalCenter";
import InvestmentAI from "@/pages/InvestmentAI";
import Admin from "@/pages/Admin";
import InvoicePayment from "@/pages/InvoicePayment";
import AccessDenied from "@/pages/AccessDenied";
import RequirePermission from "@/components/RequirePermission";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/painel" element={<AppLayout />}>
            <Route index element={<RequirePermission permission="panelDashboard"><Dashboard /></RequirePermission>} />
            <Route path="acesso-negado" element={<AccessDenied />} />
            <Route path="transacoes" element={<RequirePermission permission="panelTransactions"><Transactions /></RequirePermission>} />
            <Route path="metas" element={<RequirePermission permission="panelGoals"><Goals /></RequirePermission>} />
            <Route path="pagamentos" element={<RequirePermission permission="panelPayments"><Payments /></RequirePermission>} />
            <Route path="comprovantes" element={<RequirePermission permission="panelReceipts"><Receipts /></RequirePermission>} />
            <Route path="ia-investimentos" element={<RequirePermission permission="panelInvestmentAi"><InvestmentAI /></RequirePermission>} />
            <Route path="profissional" element={<RequirePermission permission="panelProfessional"><ProfessionalCenter /></RequirePermission>} />
            <Route path="relatorios" element={<RequirePermission permission="panelReports"><Reports /></RequirePermission>} />
            <Route path="configuracoes" element={<RequirePermission permission="panelSettings"><Settings /></RequirePermission>} />
            <Route path="pagar/:invoiceId" element={<InvoicePayment />} />
          </Route>
          <Route path="/transacoes" element={<Navigate to="/painel/transacoes" replace />} />
          <Route path="/metas" element={<Navigate to="/painel/metas" replace />} />
          <Route path="/pagamentos" element={<Navigate to="/painel/pagamentos" replace />} />
          <Route path="/comprovantes" element={<Navigate to="/painel/comprovantes" replace />} />
          <Route path="/ia-investimentos" element={<Navigate to="/painel/ia-investimentos" replace />} />
          <Route path="/profissional" element={<Navigate to="/painel/profissional" replace />} />
          <Route path="/relatorios" element={<Navigate to="/painel/relatorios" replace />} />
          <Route path="/configuracoes" element={<Navigate to="/painel/configuracoes" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
