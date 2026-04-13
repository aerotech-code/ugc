import { query } from '../../db/postgres.js';
import { createError } from '../../middleware/error.middleware.js';
import type { AcademicsContext } from './academics-context.middleware.js';

type JsonMap = Record<string, any>;

const pagination = (page?: unknown, limit?: unknown) => {
  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
  return { page: pageNum, limit: limitNum, offset: (pageNum - 1) * limitNum };
};

const SyllabusModel = {
  async create(context: AcademicsContext, payload: JsonMap, userId: string) {
    const result = await query(
      `INSERT INTO academics_syllabi (
        institution_id, course_id, title, description, unit_number, topics,
        learning_objectives, teaching_hours, reference_books, status, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
      RETURNING *`,
      [
        context.institutionId,
        payload.course_id,
        payload.title,
        payload.description ?? null,
        payload.unit_number ?? null,
        JSON.stringify(payload.topics ?? []),
        JSON.stringify(payload.learning_objectives ?? []),
        payload.teaching_hours ?? null,
        JSON.stringify(payload.reference_books ?? []),
        payload.status ?? 'active',
        userId,
      ],
    );
    return result.rows[0];
  },

  async list(context: AcademicsContext, filters: JsonMap) {
    const pageInfo = pagination(filters.page, filters.limit);
    const clauses: string[] = [];
    const values: unknown[] = [context.institutionId];
    let idx = 2;

    if (filters.course_id) {
      clauses.push(`course_id = $${idx}`);
      values.push(filters.course_id);
      idx++;
    }
    if (filters.status) {
      clauses.push(`status = $${idx}`);
      values.push(filters.status);
      idx++;
    }

    const filterSql = clauses.length > 0 ? ` AND ${clauses.join(' AND ')}` : '';

    const total = await query(
      `SELECT COUNT(*)::int AS total FROM academics_syllabi WHERE institution_id = $1${filterSql}`,
      values,
    );

    const rows = await query(
      `SELECT s.*, c.code AS course_code, c.name AS course_name
       FROM academics_syllabi s
       LEFT JOIN academics_courses c ON c.id = s.course_id
       WHERE s.institution_id = $1${filterSql}
       ORDER BY s.unit_number ASC NULLS LAST, s.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, pageInfo.limit, pageInfo.offset],
    );

    return {
      data: rows.rows,
      total: total.rows[0]?.total ?? 0,
      page: pageInfo.page,
      limit: pageInfo.limit,
    };
  },

  async getByCourse(context: AcademicsContext, courseId: string) {
    const result = await query(
      `SELECT s.*, c.code AS course_code, c.name AS course_name
       FROM academics_syllabi s
       LEFT JOIN academics_courses c ON c.id = s.course_id
       WHERE s.institution_id = $1 AND s.course_id = $2
       ORDER BY s.unit_number ASC NULLS LAST, s.created_at ASC`,
      [context.institutionId, courseId],
    );
    if (result.rows.length === 0) {
      throw createError('No syllabus found for this course', 404);
    }
    return result.rows;
  },

  async update(context: AcademicsContext, id: string, payload: JsonMap, userId: string) {
    const result = await query(
      `UPDATE academics_syllabi
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           unit_number = COALESCE($3, unit_number),
           topics = COALESCE($4, topics),
           learning_objectives = COALESCE($5, learning_objectives),
           teaching_hours = COALESCE($6, teaching_hours),
           reference_books = COALESCE($7, reference_books),
           status = COALESCE($8, status),
           updated_by = $9,
           updated_at = NOW()
       WHERE institution_id = $10 AND id = $11
       RETURNING *`,
      [
        payload.title ?? null,
        payload.description ?? null,
        payload.unit_number ?? null,
        payload.topics ? JSON.stringify(payload.topics) : null,
        payload.learning_objectives ? JSON.stringify(payload.learning_objectives) : null,
        payload.teaching_hours ?? null,
        payload.reference_books ? JSON.stringify(payload.reference_books) : null,
        payload.status ?? null,
        userId,
        context.institutionId,
        id,
      ],
    );
    if (result.rows.length === 0) {
      throw createError('Syllabus not found', 404);
    }
    return result.rows[0];
  },

  async delete(context: AcademicsContext, id: string) {
    const result = await query(
      `DELETE FROM academics_syllabi WHERE institution_id = $1 AND id = $2 RETURNING id`,
      [context.institutionId, id],
    );
    if (result.rows.length === 0) {
      throw createError('Syllabus not found', 404);
    }
  },
};

export default SyllabusModel;
