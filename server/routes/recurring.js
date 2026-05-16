import express from 'express';
import { pool } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { createId } from '../services/ids.js';
import { mapRecurring } from '../services/mappers.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM recurring_transactions WHERE user_id = ? ORDER BY day_of_month ASC',
      [req.user.id]
    );
    return res.json({ recurringTransactions: rows.map(mapRecurring) });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { description, type, amount, category, dayOfMonth, paymentStatus, active } = req.body;
    if (!description || !type || !amount || !category || !dayOfMonth) {
      return res.status(400).json({ message: 'Preencha os dados da recorrência.' });
    }

    const id = createId();
    await pool.execute(
      `INSERT INTO recurring_transactions
       (id, user_id, description, type, amount, category, day_of_month, payment_status, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, req.user.id, description, type, amount, category, dayOfMonth, paymentStatus || 'pending', active ?? true]
    );

    const [rows] = await pool.execute('SELECT * FROM recurring_transactions WHERE id = ? AND user_id = ?', [id, req.user.id]);
    return res.status(201).json({ recurringTransaction: mapRecurring(rows[0]) });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await pool.execute('DELETE FROM recurring_transactions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
