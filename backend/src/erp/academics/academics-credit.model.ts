import { query } from '../../db/postgres.js';
import { createError } from '../../middleware/error.middleware.js';
import type { AcademicsContext } from './academics-context.middleware.js';

type JsonMap = Record<string, any>;

const CreditModel = {
  async create(context: AcademicsContext, payload: JsonMap, userId: string) {
    const theoryCredits = Number(payload.theory_credits) || 0;
    const practicalCredits = Number(payload.practical_credits) || 0;
    const totalCredits = payload.total_credits != null ? Number(payload.total_credits) : theoryCredits + practicalCredits;

    const result = await query(
      `INSERT INTO academics_credits (
        institution_id, course_id, theory_credits, practical_credits, total_credits,
        lecture_hours_per_week, tutorial_hours_per_week, practical_hours_per_week,
        remarks, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)
      RETURNING *`,
      [
        context.institutionId,
        payload.course_id,
        theoryCredits,
        practicalCredits,
        totalCredits,
        payload.lecture_hours_per_week ?? null,
        payload.tutorial_hours_per_week ?? null,
        payload.practical_hours_per_week ?? null,
        payload.remarks ?? null,
        userId,
      ],
    );
    return result.rows[0];
  },

  async list(context: AcademicsContext, filters: JsonMap) {
    const clauses: string[] = [];
    const values: unknown[] = [context.institutionId];
    let idx = 2;

    if (filters.course_id) {
      clauses.push(`cr.course_id = $${idx}`);
      values.push(filters.course_id);
      idx++;
    }

    const filterSql = clauses.length > 0 ? ` AND ${clauses.join(' AND ')}` : '';

    const result = await query(
      `SELECT cr.*, c.code AS course_code, c.name AS course_name
       FROM academics_credits cr
       LEFT JOIN academics_courses c ON c.id = cr.course_id
       WHERE cr.institution_id = $1${filterSql}
       ORDER BY c.code ASC NULLS LAST, cr.created_at DESC`,
      values,
    );

    return { data: result.rows, total: result.rows.length };
  },

  async getByCourse(context: AcademicsContext, courseId: string) {
    const result = await query(
      `SELECT cr.*, c.code AS course_code, c.name AS course_name
       FROM academics_credits cr
       LEFT JOIN academics_courses c ON c.id = cr.course_id
       WHERE cr.institution_id = $1 AND cr.course_id = $2`,
      [context.institutionId, courseId],
    );
    if (result.rows.length === 0) {
      throw createError('Credits not found for this course', 404);
    }
    return result.rows[0];
  },

  async update(context: AcademicsContext, id: string, payload: JsonMap, userId: string) {
    // Recalculate total if theory or practical change
    const existing = await query(
      `SELECT * FROM academics_credits WHERE institution_id = $1 AND id = $2`,
      [context.institutionId, id],
    );
    if (existing.rows.length === 0) {
      throw createError('Credits record not found', 404);
    }

    const row = existing.rows[0];
    const theoryCredits = payload.theory_credits != null ? Number(payload.theory_credits) : Number(row.theory_credits);
    const practicalCredits = payload.practical_credits != null ? Number(payload.practical_credits) : Number(row.practical_credits);
    const totalCredits = payload.total_credits != null ? Number(payload.total_credits) : theoryCredits + practicalCredits;

    const result = await query(
      `UPDATE academics_credits
       SET theory_credits = $1,
           practical_credits = $2,
           total_credits = $3,
           lecture_hours_per_week = COALESCE($4, lecture_hours_per_week),
           tutorial_hours_per_week = COALESCE($5, tutorial_hours_per_week),
           practical_hours_per_week = COALESCE($6, practical_hours_per_week),
           remarks = COALESCE($7, remarks),
           updated_by = $8,
           updated_at = NOW()
       WHERE institution_id = $9 AND id = $10
       RETURNING *`,
      [
        theoryCredits,
        practicalCredits,
        totalCredits,
        payload.lecture_hours_per_week ?? null,
        payload.tutorial_hours_per_week ?? null,
        payload.practical_hours_per_week ?? null,
        payload.remarks ?? null,
        userId,
        context.institutionId,
        id,
      ],
    );
    return result.rows[0];
  },
};

export default CreditModel;
