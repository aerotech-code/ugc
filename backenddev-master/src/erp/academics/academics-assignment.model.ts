import { query } from '../../db/postgres.js';
import { createError } from '../../middleware/error.middleware.js';
import type { AcademicsContext } from './academics-context.middleware.js';

type JsonMap = Record<string, any>;

const pagination = (page?: unknown, limit?: unknown) => {
  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
  return { page: pageNum, limit: limitNum, offset: (pageNum - 1) * limitNum };
};

const AssignmentModel = {
  // ==================== ASSIGNMENTS ====================
  async create(context: AcademicsContext, payload: JsonMap, userId: string) {
    const result = await query(
      `INSERT INTO academics_assignments (
        institution_id, course_id, title, description, due_date, max_score, status, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
      RETURNING *`,
      [
        context.institutionId,
        payload.course_id,
        payload.title,
        payload.description ?? null,
        payload.due_date ?? null,
        payload.max_score ?? null,
        payload.status ?? 'published',
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
      clauses.push(`a.course_id = $${idx}`);
      values.push(filters.course_id);
      idx++;
    }
    if (filters.status) {
      clauses.push(`a.status = $${idx}`);
      values.push(filters.status);
      idx++;
    }

    const filterSql = clauses.length > 0 ? ` AND ${clauses.join(' AND ')}` : '';

    const total = await query(
      `SELECT COUNT(*)::int AS total FROM academics_assignments a WHERE a.institution_id = $1${filterSql}`,
      values,
    );

    const rows = await query(
      `SELECT a.*, c.code AS course_code, c.name AS course_name
       FROM academics_assignments a
       LEFT JOIN academics_courses c ON c.id = a.course_id
       WHERE a.institution_id = $1${filterSql}
       ORDER BY a.created_at DESC
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
      `SELECT a.*, c.code AS course_code, c.name AS course_name
       FROM academics_assignments a
       LEFT JOIN academics_courses c ON c.id = a.course_id
       WHERE a.institution_id = $1 AND a.id = $2`,
      [context.institutionId, id],
    );
    if (result.rows.length === 0) {
      throw createError('Assignment not found', 404);
    }
    return result.rows[0];
  },

  async getByCourse(context: AcademicsContext, courseId: string) {
    const result = await query(
      `SELECT a.*, c.code AS course_code, c.name AS course_name
       FROM academics_assignments a
       LEFT JOIN academics_courses c ON c.id = a.course_id
       WHERE a.institution_id = $1 AND a.course_id = $2
       ORDER BY a.due_date ASC NULLS LAST`,
      [context.institutionId, courseId],
    );
    return result.rows;
  },

  async update(context: AcademicsContext, id: string, payload: JsonMap, userId: string) {
    const result = await query(
      `UPDATE academics_assignments
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           due_date = COALESCE($3, due_date),
           max_score = COALESCE($4, max_score),
           status = COALESCE($5, status),
           updated_by = $6,
           updated_at = NOW()
       WHERE institution_id = $7 AND id = $8
       RETURNING *`,
      [
        payload.title ?? null,
        payload.description ?? null,
        payload.due_date ?? null,
        payload.max_score ?? null,
        payload.status ?? null,
        userId,
        context.institutionId,
        id,
      ],
    );
    if (result.rows.length === 0) {
      throw createError('Assignment not found', 404);
    }
    return result.rows[0];
  },

  async delete(context: AcademicsContext, id: string) {
    const result = await query(
      `DELETE FROM academics_assignments WHERE institution_id = $1 AND id = $2 RETURNING id`,
      [context.institutionId, id],
    );
    if (result.rows.length === 0) {
      throw createError('Assignment not found', 404);
    }
  },

  // ==================== SUBMISSIONS ====================
  async submit(context: AcademicsContext, assignmentId: string, studentId: string, payload: JsonMap) {
    // Upsert submission
    const result = await query(
      `INSERT INTO academics_assignment_submissions (
        institution_id, assignment_id, student_id, student_name, content, file_url, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (assignment_id, student_id) DO UPDATE SET
        content = EXCLUDED.content,
        file_url = EXCLUDED.file_url,
        status = EXCLUDED.status,
        updated_at = NOW()
      RETURNING *`,
      [
        context.institutionId,
        assignmentId,
        studentId,
        payload.student_name ?? null,
        payload.content ?? null,
        payload.file_url ?? null,
        payload.status ?? 'submitted',
      ],
    );
    return result.rows[0];
  },

  async getSubmissions(context: AcademicsContext, assignmentId: string, filters: JsonMap) {
    const pageInfo = pagination(filters.page, filters.limit);
    const clauses: string[] = ['institution_id = $1', 'assignment_id = $2'];
    const values: unknown[] = [context.institutionId, assignmentId];
    let idx = 3;

    if (filters.status) {
      clauses.push(`status = $${idx}`);
      values.push(filters.status);
      idx++;
    }

    const filterSql = ` AND ${clauses.join(' AND ')}`;

    const total = await query(
      `SELECT COUNT(*)::int AS total FROM academics_assignment_submissions WHERE ${clauses.join(' AND ')}`,
      values,
    );

    const rows = await query(
      `SELECT *
       FROM academics_assignment_submissions
       WHERE ${clauses.join(' AND ')}
       ORDER BY submitted_at DESC
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
};

export default AssignmentModel;
