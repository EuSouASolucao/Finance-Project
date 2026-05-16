import express from 'express';
import { pool } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { createId } from '../services/ids.js';
import { mapTransaction } from '../services/mappers.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC, created_at DESC',
      [req.user.id]
    );

    return res.json({ transactions: rows.map(mapTransaction) });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { type, description, amount, category, date, paymentStatus } = req.body;

    if (!type || !description || !amount || !category || !date) {
      return res.status(400).json({ message: 'Preencha tipo, descrição, valor, categoria e data.' });
    }

    const id = createId();
    await pool.execute(
      `INSERT INTO transactions (id, user_id, type, description, amount, category, transaction_date, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, req.user.id, type, description, amount, category, date, paymentStatus || 'paid']
    );

    const [rows] = await pool.execute('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [id, req.user.id]);
    return res.status(201).json({ transaction: mapTransaction(rows[0]) });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    await pool.execute(
      'UPDATE transactions SET payment_status = ? WHERE id = ? AND user_id = ?',
      [status, req.params.id, req.user.id]
    );

    const [rows] = await pool.execute('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Transação não encontrada.' });

    return res.json({ transaction: mapTransaction(rows[0]) });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await pool.execute('DELETE FROM transactions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
