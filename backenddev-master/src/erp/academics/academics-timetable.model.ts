import { query } from '../../db/postgres.js';
import { createError } from '../../middleware/error.middleware.js';
import type { AcademicsContext } from './academics-context.middleware.js';

type JsonMap = Record<string, any>;

const pagination = (page?: unknown, limit?: unknown) => {
  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
  return { page: pageNum, limit: limitNum, offset: (pageNum - 1) * limitNum };
};

const TimetableModel = {
  async create(context: AcademicsContext, payload: JsonMap, userId: string) {
    const result = await query(
      `INSERT INTO academics_timetables (
        institution_id, semester_id, department_id, name, schedule, status, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
      RETURNING *`,
      [
        context.institutionId,
        payload.semester_id ?? null,
        payload.department_id ?? null,
        payload.name,
        JSON.stringify(payload.schedule ?? []),
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

    if (filters.semester_id) {
      clauses.push(`semester_id = $${idx}`);
      values.push(filters.semester_id);
      idx++;
    }
    if (filters.department_id) {
      clauses.push(`department_id = $${idx}`);
      values.push(filters.department_id);
      idx++;
    }
    if (filters.status) {
      clauses.push(`status = $${idx}`);
      values.push(filters.status);
      idx++;
    }

    const filterSql = clauses.length > 0 ? ` AND ${clauses.join(' AND ')}` : '';

    const total = await query(
      `SELECT COUNT(*)::int AS total FROM academics_timetables WHERE institution_id = $1${filterSql}`,
      values,
    );

    const rows = await query(
      `SELECT *
       FROM academics_timetables
       WHERE institution_id = $1${filterSql}
       ORDER BY created_at DESC
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

  async getBySemester(context: AcademicsContext, semesterId: string) {
    const result = await query(
      `SELECT * FROM academics_timetables
       WHERE institution_id = $1 AND semester_id = $2
       ORDER BY created_at DESC`,
      [context.institutionId, semesterId],
    );
    return result.rows; // Many timetables can exist per semester
  },

  async getByDepartment(context: AcademicsContext, deptId: string) {
    const result = await query(
      `SELECT * FROM academics_timetables
       WHERE institution_id = $1 AND department_id = $2
       ORDER BY created_at DESC`,
      [context.institutionId, deptId],
    );
    return result.rows;
  },

  async update(context: AcademicsContext, id: string, payload: JsonMap, userId: string) {
    const result = await query(
      `UPDATE academics_timetables
       SET semester_id = COALESCE($1, semester_id),
           department_id = COALESCE($2, department_id),
           name = COALESCE($3, name),
           schedule = COALESCE($4, schedule),
           status = COALESCE($5, status),
           updated_by = $6,
           updated_at = NOW()
       WHERE institution_id = $7 AND id = $8
       RETURNING *`,
      [
        payload.semester_id ?? null,
        payload.department_id ?? null,
        payload.name ?? null,
        payload.schedule ? JSON.stringify(payload.schedule) : null,
        payload.status ?? null,
        userId,
        context.institutionId,
        id,
      ],
    );
    if (result.rows.length === 0) {
      throw createError('Timetable not found', 404);
    }
    return result.rows[0];
  },

  async delete(context: AcademicsContext, id: string) {
    const result = await query(
      `DELETE FROM academics_timetables WHERE institution_id = $1 AND id = $2 RETURNING id`,
      [context.institutionId, id],
    );
    if (result.rows.length === 0) {
      throw createError('Timetable not found', 404);
    }
  },
};

export default TimetableModel;
