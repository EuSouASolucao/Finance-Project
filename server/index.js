import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import goalRoutes from './routes/goals.js';
import budgetRoutes from './routes/budgets.js';
import recurringRoutes from './routes/recurring.js';
import receiptRoutes from './routes/receipts.js';
import creditCardRoutes from './routes/creditCards.js';
import sharedAccessRoutes from './routes/sharedAccesses.js';
import { testDatabaseConnection } from './config/database.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3333);
const uploadsDir = path.resolve('uploads/receipts');

fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.resolve('uploads')));

app.get('/api/health', async (_req, res) => {
  try {
    await testDatabaseConnection();
    return res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    return res.status(500).json({ status: 'error', database: 'disconnected', message: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/recurring-transactions', recurringRoutes);
app.use('/api/credit-cards', creditCardRoutes);
app.use('/api/shared-accesses', sharedAccessRoutes);
app.use('/api/receipts', receiptRoutes);

app.use((req, res) => {
  return res.status(404).json({ message: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
});

app.use((error, _req, res, _next) => {
  console.error(error);

  if (error.code === 'ER_HOST_NOT_PRIVILEGED') {
    return res.status(503).json({
      message: 'O MySQL bloqueou o IP deste servidor. Libere o acesso remoto ao banco ou rode a API na mesma hospedagem do MySQL.',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }

  return res.status(500).json({
    message: 'Erro interno no servidor.',
    detail: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
});

app.listen(port, () => {
  console.log(`FinanceApp API rodando em http://localhost:${port}`);
});
