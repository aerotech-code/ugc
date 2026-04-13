import { query } from '../../../db/postgres.js';
import { createError } from '../../../middleware/error.middleware.js';

const StaffModel = {
  async listStaffRecords() {
    const result = await query(
      `SELECT id, name, email, role, department, TO_CHAR(joining_date, 'YYYY-MM-DD') as joining_date, created_at FROM staff_records ORDER BY created_at DESC`
    );
    return result.rows;
  },

  async getStaffRecord(id: string) {
    const result = await query(
      `SELECT id, name, email, role, department, TO_CHAR(joining_date, 'YYYY-MM-DD') as joining_date, created_at FROM staff_records WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) throw createError('Staff record not found', 404);
    return result.rows[0];
  },

  async createStaffRecord(payload: { name: string; email: string; role: string; department: string; joining_date: string }) {
    const result = await query(
      `INSERT INTO staff_records (name, email, role, department, joining_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, department, TO_CHAR(joining_date, 'YYYY-MM-DD') as joining_date, created_at`,
      [payload.name, payload.email, payload.role, payload.department, payload.joining_date]
    );
    return result.rows[0];
  },

  async updateStaffRecord(id: string, payload: { name?: string; email?: string; role?: string; department?: string; joining_date?: string }) {
    const result = await query(
      `UPDATE staff_records SET 
        name = COALESCE($1, name), 
        email = COALESCE($2, email),
        role = COALESCE($3, role),
        department = COALESCE($4, department),
        joining_date = COALESCE($5, joining_date)
       WHERE id = $6 RETURNING id, name, email, role, department, TO_CHAR(joining_date, 'YYYY-MM-DD') as joining_date, created_at`,
      [payload.name ?? null, payload.email ?? null, payload.role ?? null, payload.department ?? null, payload.joining_date ?? null, id]
    );
    if (result.rowCount === 0) throw createError('Staff record not found', 404);
    return result.rows[0];
  },

  async deleteStaffRecord(id: string) {
    const result = await query(
      `DELETE FROM staff_records WHERE id = $1 RETURNING id`,
      [id]
    );
    if (result.rowCount === 0) throw createError('Staff record not found', 404);
    return { message: 'Staff record deleted' };
  }
};

export default StaffModel;
