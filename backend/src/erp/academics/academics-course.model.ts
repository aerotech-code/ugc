import { query } from '../../db/postgres.js';
import { createError } from '../../middleware/error.middleware.js';
import type { AcademicsContext } from './academics-context.middleware.js';

type JsonMap = Record<string, any>;

const pagination = (page?: unknown, limit?: unknown) => {
  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
  return { page: pageNum, limit: limitNum, offset: (pageNum - 1) * limitNum };
};

const buildFilters = (startIndex: number, filters: Array<{ enabled: boolean; sql: string; value: unknown }>) => {
  const clauses: string[] = [];
  const values: unknown[] = [];
  let index = startIndex;

  for (const filter of filters) {
    if (!filter.enabled) {
      continue;
    }
    clauses.push(filter.sql.replace('?', `$${index}`));
    values.push(filter.value);
    index += 1;
  }

  return {
    sql: clauses.length > 0 ? ` AND ${clauses.join(' AND ')}` : '',
    values,
  };
};

const CourseModel = {
  async create(context: AcademicsContext, payload: JsonMap, userId: string) {
    const result = await query(
      `INSERT INTO academics_courses (
        institution_id, code, name, description, department, credits, duration, level, status, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)
      RETURNING *`,
      [
        context.institutionId,
        payload.code,
        payload.name,
        payload.description ?? null,
        payload.department ?? null,
        payload.credits ?? null,
        payload.duration ?? null,
        payload.level ?? null,
        payload.status ?? 'active',
        userId,
      ],
    );
    return result.rows[0];
  },

  async list(context: AcademicsContext, filters: JsonMap) {
    const pageInfo = pagination(filters.page, filters.limit);
    const dynamic = buildFilters(2, [
      { enabled: Boolean(filters.status), sql: 'status = ?', value: filters.status },
      { enabled: Boolean(filters.department), sql: 'department = ?', value: filters.department },
      { enabled: Boolean(filters.level), sql: 'level = ?', value: filters.level },
      { enabled: Boolean(filters.search), sql: '(name ILIKE ? OR code ILIKE ?)', value: `%${String(filters.search ?? '')}%` },
    ]);

    // For the ILIKE search, we need the value twice — handle it specially
    let filterSql = dynamic.sql;
    let filterValues = dynamic.values;

    // If search is enabled, the last filter has two placeholders but only one value.
    // We need to duplicate the search value and fix the placeholder.
    if (filters.search) {
      const searchValue = `%${String(filters.search)}%`;
      // Remove the last value (already added by buildFilters) and re-add with proper SQL
      filterValues = filterValues.slice(0, -1);
      const baseIdx = 2 + filterValues.length;
      const searchClause = `(name ILIKE $${baseIdx} OR code ILIKE $${baseIdx + 1})`;

      // Rebuild the sql
      const otherClauses = dynamic.sql.replace(/ AND \(name ILIKE.*?\)/, '');
      filterSql = otherClauses + ` AND ${searchClause}`;
      filterValues.push(searchValue, searchValue);
    }

    const paramOffset = 2 + filterValues.length;

    const total = await query(
      `SELECT COUNT(*)::int AS total
       FROM academics_courses
       WHERE institution_id = $1${filterSql}`,
      [context.institutionId, ...filterValues],
    );

    const rows = await query(
      `SELECT *
       FROM academics_courses
       WHERE institution_id = $1${filterSql}
       ORDER BY created_at DESC
       LIMIT $${paramOffset} OFFSET $${paramOffset + 1}`,
      [context.institutionId, ...filterValues, pageInfo.limit, pageInfo.offset],
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
      `SELECT * FROM academics_courses WHERE institution_id = $1 AND id = $2`,
      [context.institutionId, id],
    );
    if (result.rows.length === 0) {
      throw createError('Course not found', 404);
    }
    return result.rows[0];
  },

  async update(context: AcademicsContext, id: string, payload: JsonMap, userId: string) {
    const result = await query(
      `UPDATE academics_courses
       SET code = COALESCE($1, code),
           name = COALESCE($2, name),
           description = COALESCE($3, description),
           department = COALESCE($4, department),
           credits = COALESCE($5, credits),
           duration = COALESCE($6, duration),
           level = COALESCE($7, level),
           status = COALESCE($8, status),
           updated_by = $9,
           updated_at = NOW()
       WHERE institution_id = $10 AND id = $11
       RETURNING *`,
      [
        payload.code ?? null,
        payload.name ?? null,
        payload.description ?? null,
        payload.department ?? null,
        payload.credits ?? null,
        payload.duration ?? null,
        payload.level ?? null,
        payload.status ?? null,
        userId,
        context.institutionId,
        id,
      ],
    );
    if (result.rows.length === 0) {
      throw createError('Course not found', 404);
    }
    return result.rows[0];
  },

  async delete(context: AcademicsContext, id: string) {
    const result = await query(
      `DELETE FROM academics_courses WHERE institution_id = $1 AND id = $2 RETURNING id`,
      [context.institutionId, id],
    );
    if (result.rows.length === 0) {
      throw createError('Course not found', 404);
    }
  },
};

export default CourseModel;
