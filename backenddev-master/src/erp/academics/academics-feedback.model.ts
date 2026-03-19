import { query } from '../../db/postgres.js';
import { createError } from '../../middleware/error.middleware.js';
import type { AcademicsContext } from './academics-context.middleware.js';

type JsonMap = Record<string, any>;

const pagination = (page?: unknown, limit?: unknown) => {
  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
  return { page: pageNum, limit: limitNum, offset: (pageNum - 1) * limitNum };
};

const FeedbackModel = {
  async create(context: AcademicsContext, payload: JsonMap, userId: string) {
    const result = await query(
      `INSERT INTO academics_feedback (
        institution_id, course_id, student_id, student_name, rating, comment,
        category, is_anonymous, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        context.institutionId,
        payload.course_id,
        payload.student_id ?? null,
        payload.student_name ?? null,
        payload.rating ?? null,
        payload.comment ?? null,
        payload.category ?? null,
        payload.is_anonymous ?? false,
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
      clauses.push(`f.course_id = $${idx}`);
      values.push(filters.course_id);
      idx++;
    }
    if (filters.student_id) {
      clauses.push(`f.student_id = $${idx}`);
      values.push(filters.student_id);
      idx++;
    }
    if (filters.category) {
      clauses.push(`f.category = $${idx}`);
      values.push(filters.category);
      idx++;
    }
    if (filters.status) {
      clauses.push(`f.status = $${idx}`);
      values.push(filters.status);
      idx++;
    }

    const filterSql = clauses.length > 0 ? ` AND ${clauses.join(' AND ')}` : '';

    const total = await query(
      `SELECT COUNT(*)::int AS total FROM academics_feedback f WHERE f.institution_id = $1${filterSql}`,
      values,
    );

    const rows = await query(
      `SELECT f.*, c.code AS course_code, c.name AS course_name
       FROM academics_feedback f
       LEFT JOIN academics_courses c ON c.id = f.course_id
       WHERE f.institution_id = $1${filterSql}
       ORDER BY f.created_at DESC
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

  async getById(context: AcademicsContext, id: string) {
    const result = await query(
      `SELECT f.*, c.code AS course_code, c.name AS course_name
       FROM academics_feedback f
       LEFT JOIN academics_courses c ON c.id = f.course_id
       WHERE f.institution_id = $1 AND f.id = $2`,
      [context.institutionId, id],
    );
    if (result.rows.length === 0) {
      throw createError('Feedback not found', 404);
    }
    return result.rows[0];
  },

  async getByCourse(context: AcademicsContext, courseId: string) {
    const result = await query(
      `SELECT f.*, c.code AS course_code, c.name AS course_name
       FROM academics_feedback f
       LEFT JOIN academics_courses c ON c.id = f.course_id
       WHERE f.institution_id = $1 AND f.course_id = $2
       ORDER BY f.created_at DESC`,
      [context.institutionId, courseId],
    );

    // Compute average rating
    const ratings = result.rows.filter((r: any) => r.rating != null).map((r: any) => Number(r.rating));
    const avgRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : null;

    return {
      feedback: result.rows,
      count: result.rows.length,
      average_rating: avgRating ? Math.round(avgRating * 100) / 100 : null,
    };
  },

  async delete(context: AcademicsContext, id: string) {
    const result = await query(
      `DELETE FROM academics_feedback WHERE institution_id = $1 AND id = $2 RETURNING id`,
      [context.institutionId, id],
    );
    if (result.rows.length === 0) {
      throw createError('Feedback not found', 404);
    }
  },
};

export default FeedbackModel;
