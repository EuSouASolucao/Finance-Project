import express from 'express';
import multer from 'multer';
import path from 'path';
import { pool } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { createId } from '../services/ids.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/receipts',
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `${createId()}${extension}`);
  },
});

const upload = multer({ storage });

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM receipts WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    return res.json({ receipts: rows });
  } catch (error) {
    return next(error);
  }
});

router.post('/', upload.single('image'), async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { companyName, cnpj, purchaseDate, totalAmount, ocrText, items = '[]' } = req.body;
    const parsedItems = typeof items === 'string' ? JSON.parse(items || '[]') : items;
    const receiptId = createId();

    await connection.beginTransaction();
    await connection.execute(
      `INSERT INTO receipts (id, user_id, company_name, cnpj, purchase_date, total_amount, image_path, ocr_text)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        receiptId,
        req.user.id,
        companyName || null,
        cnpj || null,
        purchaseDate || null,
        totalAmount || null,
        req.file?.path || null,
        ocrText || null,
      ]
    );

    for (const item of parsedItems) {
      await connection.execute(
        `INSERT INTO receipt_items (id, receipt_id, description, quantity, unit_price, total)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          createId(),
          receiptId,
          item.description || 'Item sem descrição',
          item.quantity || 1,
          item.unitPrice || null,
          item.total || null,
        ]
      );
    }

    await connection.commit();
    return res.status(201).json({ id: receiptId });
  } catch (error) {
    await connection.rollback();
    return next(error);
  } finally {
    connection.release();
  }
});

export default router;
