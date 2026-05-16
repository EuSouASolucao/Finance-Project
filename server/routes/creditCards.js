import express from 'express';
import { pool } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { createId } from '../services/ids.js';
import { mapCreditCard } from '../services/mappers.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM credit_cards WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    return res.json({ creditCards: rows.map(mapCreditCard) });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, limit, closingDay, dueDay, currentInvoice } = req.body;
    if (!name || !limit || !closingDay || !dueDay) {
      return res.status(400).json({ message: 'Informe nome, limite, fechamento e vencimento do cartão.' });
    }

    const id = createId();
    await pool.execute(
      `INSERT INTO credit_cards (id, user_id, name, card_limit, closing_day, due_day, current_invoice)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, req.user.id, name, limit, closingDay, dueDay, currentInvoice || 0]
    );

    const [rows] = await pool.execute('SELECT * FROM credit_cards WHERE id = ? AND user_id = ?', [id, req.user.id]);
    return res.status(201).json({ creditCard: mapCreditCard(rows[0]) });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await pool.execute('DELETE FROM credit_cards WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
