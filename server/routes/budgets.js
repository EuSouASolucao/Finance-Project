import express from 'express';
import { pool } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { createId } from '../services/ids.js';
import { mapBudget } from '../services/mappers.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM category_budgets WHERE user_id = ? ORDER BY category ASC', [req.user.id]);
    return res.json({ budgets: rows.map(mapBudget) });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { category, monthlyLimit, alertPercentage } = req.body;
    if (!category || !monthlyLimit) {
      return res.status(400).json({ message: 'Informe categoria e limite mensal.' });
    }

    const id = createId();
    await pool.execute(
      `INSERT INTO category_budgets (id, user_id, category, monthly_limit, alert_percentage)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE monthly_limit = VALUES(monthly_limit), alert_percentage = VALUES(alert_percentage)`,
      [id, req.user.id, category, monthlyLimit, alertPercentage || 80]
    );

    const [rows] = await pool.execute('SELECT * FROM category_budgets WHERE user_id = ? AND category = ?', [req.user.id, category]);
    return res.status(201).json({ budget: mapBudget(rows[0]) });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await pool.execute('DELETE FROM category_budgets WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
