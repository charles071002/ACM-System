const express = require('express');
const pool = require('../db');

const router = express.Router();
const tableName = process.env.DB_PROFESSORS_TABLE || 'professors';
const pinColumn = process.env.DB_PIN_COLUMN || 'pincode';
const nameColumn = process.env.DB_NAME_COLUMN || 'professor';
const compartmentColumn = process.env.DB_COMPARTMENT_COLUMN || 'compartment_qr';

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, ${nameColumn} AS name, 'CPE' AS department FROM ${tableName} ORDER BY id ASC`
    );

    res.json({
      ok: true,
      data: rows.map((row) => ({
        id: String(row.id),
        name: row.name,
        department: row.department || 'CPE',
      })),
    });
  } catch (error) {
    console.error('Failed to fetch professors:', error);
    res.status(500).json({ ok: false, message: 'Failed to fetch professors' });
  }
});

router.post('/verify-pin', async (req, res) => {
  const { id, pin } = req.body || {};

  if (!id || !pin) {
    return res.status(400).json({ ok: false, message: 'Professor id and pin are required' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT ${pinColumn} AS pin_value FROM ${tableName} WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ ok: false, message: 'Professor not found' });
    }

    const dbPin = String(rows[0].pin_value ?? '');
    if (String(pin) !== dbPin) {
      return res.status(401).json({ ok: false, message: 'Invalid pin' });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Failed to verify pin:', error);
    return res.status(500).json({ ok: false, message: 'Failed to verify pin' });
  }
});

router.patch('/:id/name', async (req, res) => {
  const { id } = req.params;
  const { newName } = req.body || {};

  if (!id || typeof newName !== 'string' || !newName.trim()) {
    return res.status(400).json({ ok: false, message: 'Professor id and new name are required' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE ${tableName} SET ${nameColumn} = ? WHERE id = ?`,
      [newName.trim(), id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ ok: false, message: 'Professor not found' });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Failed to update professor name:', error);
    return res.status(500).json({ ok: false, message: 'Failed to update professor name' });
  }
});

router.patch('/:id/pin', async (req, res) => {
  const { id } = req.params;
  const { newPin } = req.body || {};

  if (!id || !newPin) {
    return res.status(400).json({ ok: false, message: 'Professor id and new pin are required' });
  }

  if (!/^\d{6}$/.test(String(newPin))) {
    return res.status(400).json({ ok: false, message: 'PIN must be exactly 6 digits' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE ${tableName} SET ${pinColumn} = ? WHERE id = ?`,
      [String(newPin), id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ ok: false, message: 'Professor not found' });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Failed to update pin:', error);
    return res.status(500).json({ ok: false, message: 'Failed to update pin' });
  }
});

router.patch('/:id/compartment-qr', async (req, res) => {
  const { id } = req.params;
  const { compartmentQr } = req.body || {};

  if (!id || typeof compartmentQr !== 'string') {
    return res.status(400).json({ ok: false, message: 'Professor id and compartmentQr are required' });
  }

  const nextValue = compartmentQr.trim();

  try {
    const [result] = await pool.query(
      `UPDATE ${tableName} SET ${compartmentColumn} = ? WHERE id = ?`,
      [nextValue, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ ok: false, message: 'Professor not found' });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Failed to update compartment QR:', error);
    return res.status(500).json({ ok: false, message: 'Failed to update compartment QR' });
  }
});

module.exports = router;
