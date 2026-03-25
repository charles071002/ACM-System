const express = require('express');
const pool = require('../db');

const router = express.Router();
const tableName = process.env.DB_DEV_TABLE || 'developer_accounts';
const usernameColumn = process.env.DB_DEV_USERNAME_COLUMN || 'username';
const passwordColumn = process.env.DB_DEV_PASSWORD_COLUMN || 'password';
const defaultUsername = process.env.DEV_USERNAME || 'Developer';
const defaultPassword = process.env.DEV_PASSWORD || 'dev123';

const ensureDevTableAndDefault = async () => {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS ${tableName} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ${usernameColumn} VARCHAR(100) NOT NULL UNIQUE,
      ${passwordColumn} VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  );

  const [rows] = await pool.query(`SELECT id FROM ${tableName} WHERE ${usernameColumn} = ? LIMIT 1`, [defaultUsername]);
  if (!rows.length) {
    await pool.query(`INSERT INTO ${tableName} (${usernameColumn}, ${passwordColumn}) VALUES (?, ?)`, [defaultUsername, defaultPassword]);
  }
};

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ ok: false, message: 'Username and password are required' });
  }

  try {
    await ensureDevTableAndDefault();
    const [rows] = await pool.query(`SELECT ${passwordColumn} AS password_value FROM ${tableName} WHERE ${usernameColumn} = ? LIMIT 1`, [
      String(username),
    ]);
    if (!rows.length) return res.status(401).json({ ok: false, message: 'Invalid credentials' });

    const dbPassword = String(rows[0].password_value ?? '');
    if (String(password) !== dbPassword) {
      return res.status(401).json({ ok: false, message: 'Invalid credentials' });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Dev login failed:', error);
    return res.status(500).json({ ok: false, message: 'Login failed' });
  }
});

router.patch('/password', async (req, res) => {
  const { username, currentPassword, newPassword } = req.body || {};

  if (!username || !currentPassword || !newPassword) {
    return res.status(400).json({ ok: false, message: 'username, currentPassword, newPassword are required' });
  }

  try {
    await ensureDevTableAndDefault();
    const [rows] = await pool.query(`SELECT ${passwordColumn} AS password_value FROM ${tableName} WHERE ${usernameColumn} = ? LIMIT 1`, [
      String(username),
    ]);
    if (!rows.length) return res.status(404).json({ ok: false, message: 'Developer account not found' });

    const dbPassword = String(rows[0].password_value ?? '');
    if (String(currentPassword) !== dbPassword) {
      return res.status(401).json({ ok: false, message: 'Current password is incorrect' });
    }

    await pool.query(`UPDATE ${tableName} SET ${passwordColumn} = ? WHERE ${usernameColumn} = ?`, [String(newPassword), String(username)]);
    return res.json({ ok: true });
  } catch (error) {
    console.error('Change password failed:', error);
    return res.status(500).json({ ok: false, message: 'Failed to change password' });
  }
});

module.exports = router;
