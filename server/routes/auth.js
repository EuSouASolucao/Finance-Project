import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { createId } from '../services/ids.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET || 'financeapp-dev-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

const ALLOWED_CURRENCIES = ['BRL', 'USD', 'EUR', 'GBP'];

function normalizePreferredCurrency(raw) {
  const value = String(raw || 'BRL').toUpperCase();
  return ALLOWED_CURRENCIES.includes(value) ? value : 'BRL';
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    document: user.document,
    plan: user.plan,
    role: user.role || 'user',
    avatarUrl: user.avatar_url,
    preferredCurrency: normalizePreferredCurrency(user.preferred_currency),
    createdAt: user.created_at,
  };
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone, document, plan, avatarUrl } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nome, e-mail e senha são obrigatórios.' });
    }

    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Este e-mail já está cadastrado.' });
    }

    const id = createId();
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.execute(
      `INSERT INTO users (id, name, email, password_hash, phone, document, plan, avatar_url, preferred_currency)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, email, passwordHash, phone || null, document || null, plan || 'Sem Plano', avatarUrl || null, 'BRL']
    );

    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    const user = rows[0];

    return res.status(201).json({ user: sanitizeUser(user), token: createToken(user) });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }

    return res.json({ user: sanitizeUser(user), token: createToken(user) });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Usuário não encontrado.' });
    return res.json({ user: sanitizeUser(rows[0]) });
  } catch (error) {
    return next(error);
  }
});

router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const { name, email, phone, document, plan, avatarUrl, preferredCurrency } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Nome e e-mail são obrigatórios.' });
    }

    const currency = normalizePreferredCurrency(preferredCurrency);

    await pool.execute(
      `UPDATE users
       SET name = ?, email = ?, phone = ?, document = ?, plan = ?, avatar_url = ?, preferred_currency = ?
       WHERE id = ?`,
      [name, email, phone || null, document || null, plan || 'Sem Plano', avatarUrl || null, currency, req.user.id]
    );

    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.user.id]);
    return res.json({ user: sanitizeUser(rows[0]) });
  } catch (error) {
    return next(error);
  }
});

export default router;
