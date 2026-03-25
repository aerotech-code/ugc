import { query } from '../../../db/postgres.js';
import { createError } from '../../../middleware/error.middleware.js';

const LeaveModel = {
  async listLeaveRecords() {
    const result = await query(
      `SELECT id, staff_id, leave_type, TO_CHAR(start_date, 'YYYY-MM-DD') as start_date, TO_CHAR(end_date, 'YYYY-MM-DD') as end_date, reason, status, created_at FROM leave_records ORDER BY created_at DESC`
    );
    return result.rows;
  },

  async getLeaveRecord(id: string) {
    const result = await query(
      `SELECT id, staff_id, leave_type, TO_CHAR(start_date, 'YYYY-MM-DD') as start_date, TO_CHAR(end_date, 'YYYY-MM-DD') as end_date, reason, status, created_at FROM leave_records WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) throw createError('Leave record not found', 404);
    return result.rows[0];
  },

  async submitLeaveRequest(payload: { staff_id: string; leave_type: string; start_date: string; end_date: string; reason: string }) {
    const result = await query(
      `INSERT INTO leave_records (staff_id, leave_type, start_date, end_date, reason, status)
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING id, staff_id, leave_type, TO_CHAR(start_date, 'YYYY-MM-DD') as start_date, TO_CHAR(end_date, 'YYYY-MM-DD') as end_date, status, created_at`,
      [payload.staff_id, payload.leave_type, payload.start_date, payload.end_date, payload.reason]
    );
    return result.rows[0];
  },

  async updateLeaveStatus(id: string, status: string) {
    const result = await query(
      `UPDATE leave_records SET status = $1 WHERE id = $2 RETURNING id, staff_id, leave_type, TO_CHAR(start_date, 'YYYY-MM-DD') as start_date, TO_CHAR(end_date, 'YYYY-MM-DD') as end_date, status, created_at`,
      [status, id]
    );
    if (result.rowCount === 0) throw createError('Leave record not found', 404);
    return result.rows[0];
  },

  async cancelLeaveRequest(id: string) {
    const result = await query(
      `DELETE FROM leave_records WHERE id = $1 RETURNING id`,
      [id]
    );
    if (result.rowCount === 0) throw createError('Leave record not found', 404);
    return { message: 'Leave request cancelled' };
  }
};

export default LeaveModel;
