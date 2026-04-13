import { getClient, query } from '../../../db/postgres.js';
import { createError } from '../../../middleware/error.middleware.js';
import type { AcademicsContext } from '../core/academics-context.middleware.js';

type JsonMap = Record<string, any>;

const SemesterModel = {
  async listSemesters(context: AcademicsContext) {
    const result = await query(
      `SELECT * FROM academics_semesters WHERE institution_id = $1 AND academic_year = $2 ORDER BY start_date DESC`,
      [context.institutionId, context.academicYear]
    );
    return result.rows;
  },

  async getSemester(context: AcademicsContext, id: string) {
    const result = await query(
      `SELECT * FROM academics_semesters WHERE institution_id = $1 AND id = $2`,
      [context.institutionId, id]
    );
    if (result.rows.length === 0) throw createError('Semester not found', 404);
    return result.rows[0];
  },

  async registerSemester(context: AcademicsContext, payload: JsonMap, userId: string) {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      const semester = await client.query(
        `INSERT INTO academics_semesters (institution_id, academic_year, name, start_date, end_date, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING *`,
        [context.institutionId, context.academicYear, payload.name, payload.start_date ?? null, payload.end_date ?? null, userId]
      );
      await client.query('COMMIT');
      return semester.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async updateSemester(context: AcademicsContext, id: string, payload: JsonMap, userId: string) {
    const result = await query(
      `UPDATE academics_semesters SET name = COALESCE($1, name), start_date = COALESCE($2, start_date),
       end_date = COALESCE($3, end_date), updated_by = $4, updated_at = NOW()
       WHERE institution_id = $5 AND id = $6 RETURNING *`,
      [payload.name ?? null, payload.start_date ?? null, payload.end_date ?? null, userId, context.institutionId, id]
    );
    if (result.rowCount === 0) throw createError('Semester not found', 404);
    return result.rows[0];
  },

  async toggleSemesterStatus(context: AcademicsContext, id: string, status: string, userId: string) {
    const result = await query(
      `UPDATE academics_semesters SET status = $1, updated_by = $2, updated_at = NOW()
       WHERE institution_id = $3 AND id = $4`,
      [status, userId, context.institutionId, id]
    );
    if (result.rowCount === 0) throw createError('Semester not found', 404);
  },

  async deleteSemester(context: AcademicsContext, id: string) {
    const result = await query(
      `DELETE FROM academics_semesters WHERE institution_id = $1 AND id = $2 RETURNING id`,
      [context.institutionId, id]
    );
    if (result.rowCount === 0) throw createError('Semester not found or cannot be deleted', 422);
  },

  async getStudentSemesterRegistrations(context: AcademicsContext, studentId: string) {
    const result = await query(
      `SELECT r.id, s.name, s.academic_year, s.status, r.registered_at
       FROM academics_semester_registrations r
       JOIN academics_semesters s ON s.id = r.semester_id
       WHERE s.institution_id = $1 AND r.student_id = $2
       ORDER BY r.registered_at DESC`,
      [context.institutionId, studentId]
    );
    return result.rows;
  }
};

export default SemesterModel;
