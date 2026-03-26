const express = require('express');
const pool = require('../db');

const router = express.Router();
const tableName = process.env.DB_PROFESSORS_TABLE || 'professors';
const pinColumn = process.env.DB_PIN_COLUMN || 'pincode';
const nameColumn = process.env.DB_NAME_COLUMN || 'professor';
const compartmentColumn = process.env.DB_COMPARTMENT_COLUMN || 'compartment_qr';

// submissions table columns
const submissionsTable = process.env.DB_SUBMISSIONS_TABLE || 'submissions';
const submissionIdColumn = process.env.DB_SUBMISSION_ID_COLUMN || 'submission_id';
const professorIdColumn = process.env.DB_PROFESSOR_ID_COLUMN || 'professor_id';
const cabinetNoColumn = process.env.DB_CABINET_NO_COLUMN || 'cabinet_no';
const startTimeColumn = process.env.DB_START_TIME_COLUMN || 'start_time';
const endTimeColumn = process.env.DB_END_TIME_COLUMN || 'end_time';
const statusColumn = process.env.DB_STATUS_COLUMN || 'status';

// column in professors table that points to a row in `cabinets`
const professorsCabinetNoColumn = process.env.DB_CABINET_NO_COLUMN || 'cabinet_no';

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

/**
 * Create a new submission row when professor generates a QR.
 * Body: { submissionId, startTime, endTime }
 * - cabinet_no is derived from professors.cabinet_no (foreign key to cabinets)
 * - status is computed using NOW():
 *   pending: NOW() < start_time
 *   active: start_time <= NOW() <= end_time
 *   expired: NOW() > end_time
 */
router.post('/:id/submissions', async (req, res) => {
  const { id } = req.params;
  const { submissionId, startTime, endTime, cabinetNo } = req.body || {};

  if (!id || !submissionId || !startTime || !endTime || cabinetNo === undefined || cabinetNo === null || cabinetNo === '') {
    return res.status(400).json({ ok: false, message: 'professor id, submissionId, startTime, endTime, cabinetNo are required' });
  }

  try {
    // Insert + compute status in one query.
    const query = `
      INSERT INTO ${submissionsTable}
        (${submissionIdColumn}, ${professorIdColumn}, ${cabinetNoColumn}, ${startTimeColumn}, ${endTimeColumn}, ${statusColumn})
      VALUES
        (?, ?, ?, ?, ?, 
          CASE
            WHEN ? > NOW() THEN 'pending'
            WHEN NOW() BETWEEN ? AND ? THEN 'active'
            ELSE 'expired'
          END
        )
    `;

    await pool.query(query, [
      String(submissionId).trim(),
      id,
      String(cabinetNo).trim(),
      startTime,
      endTime,
      startTime,
      startTime,
      endTime,
    ]);

    return res.json({ ok: true });
  } catch (error) {
    console.error('Failed to create submission:', error);
    return res.status(500).json({ ok: false, message: 'Failed to create submission' });
  }
});

/**
 * Update an existing submission (identified by professor_id + submission_id).
 * Body: { submissionId, startTime, endTime }
 * cabinet_no is also refreshed from professors.cabinet_no.
 */
router.patch('/:id/submissions', async (req, res) => {
  const { id } = req.params;
  const { submissionId, startTime, endTime, cabinetNo } = req.body || {};

  if (
    !id ||
    !submissionId ||
    !startTime ||
    !endTime ||
    cabinetNo === undefined ||
    cabinetNo === null ||
    cabinetNo === ''
  ) {
    return res.status(400).json({ ok: false, message: 'professor id, submissionId, startTime, endTime, cabinetNo are required' });
  }

  try {
    const query = `
      UPDATE ${submissionsTable}
      SET
        ${cabinetNoColumn} = ?,
        ${startTimeColumn} = ?,
        ${endTimeColumn} = ?,
        ${statusColumn} = CASE
          WHEN ? > NOW() THEN 'pending'
          WHEN NOW() BETWEEN ? AND ? THEN 'active'
          ELSE 'expired'
        END
      WHERE ${professorIdColumn} = ? AND ${submissionIdColumn} = ?
    `;

    const [result] = await pool.query(query, [
      String(cabinetNo).trim(),
      startTime,
      endTime,
      startTime,
      startTime,
      endTime,
      id,
      String(submissionId).trim(),
    ]);

    if (!result.affectedRows) {
      return res.status(404).json({ ok: false, message: 'Submission not found' });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Failed to update submission:', error);
    return res.status(500).json({ ok: false, message: 'Failed to update submission' });
  }
});

/**
 * Delete a submission row (manual delete from QR logs).
 * Params: professor id, submissionId
 */
router.delete('/:id/submissions/:submissionId', async (req, res) => {
  const { id, submissionId } = req.params;

  if (!id || !submissionId) {
    return res.status(400).json({ ok: false, message: 'professor id and submissionId are required' });
  }

  try {
    const query = `
      DELETE FROM ${submissionsTable}
      WHERE ${professorIdColumn} = ? AND ${submissionIdColumn} = ?
    `;

    const [result] = await pool.query(query, [id, String(submissionId).trim()]);

    // mysql2: result.affectedRows tells how many rows deleted
    if (!result || !('affectedRows' in result)) {
      return res.json({ ok: true });
    }

    return res.json({ ok: true, deleted: result.affectedRows ?? 0 });
  } catch (error) {
    console.error('Failed to delete submission:', error);
    return res.status(500).json({ ok: false, message: 'Failed to delete submission' });
  }
});

module.exports = router;
