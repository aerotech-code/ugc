import { query } from '../../db/postgres.js';
import { createError } from '../../middleware/error.middleware.js';
import type { AdmissionContext } from './admission-context.middleware.js';

type JsonMap = Record<string, any>;

const pagination = (page?: unknown, limit?: unknown) => {
  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
  return { page: pageNum, limit: limitNum, offset: (pageNum - 1) * limitNum };
};

const AdmissionApplicationModel = {
  async create(context: AdmissionContext, payload: JsonMap, userId: string) {
    const result = await query(
      `INSERT INTO admission_applications (
        institution_id, applicant_name, applicant_email, applicant_phone, course_id, status, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
      RETURNING *`,
      [
        context.institutionId,
        payload.applicantName,
        payload.applicantEmail,
        payload.applicantPhone ?? null,
        payload.courseId ?? null,
        payload.status ?? 'submitted',
        userId,
      ],
    );
    return result.rows[0];
  },

  async list(context: AdmissionContext, filters: JsonMap) {
    const pageInfo = pagination(filters.page, filters.limit);
    let filterSql = '';
    const filterValues: unknown[] = [];
    let paramIndex = 2;

    if (filters.status) {
      filterSql += ` AND status = $${paramIndex++}`;
      filterValues.push(filters.status);
    }

    if (filters.courseId) {
      filterSql += ` AND course_id = $${paramIndex++}`;
      filterValues.push(filters.courseId);
    }

    if (filters.search) {
      filterSql += ` AND (applicant_name ILIKE $${paramIndex} OR applicant_email ILIKE $${paramIndex})`;
      filterValues.push(`%${filters.search}%`);
      paramIndex++;
    }

    const total = await query(
      `SELECT COUNT(*)::int AS total
       FROM admission_applications
       WHERE institution_id = $1${filterSql}`,
      [context.institutionId, ...filterValues],
    );

    const rows = await query(
      `SELECT *
       FROM admission_applications
       WHERE institution_id = $1${filterSql}
       ORDER BY submitted_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [context.institutionId, ...filterValues, pageInfo.limit, pageInfo.offset],
    );

    return {
      data: rows.rows,
      total: total.rows[0]?.total ?? 0,
      page: pageInfo.page,
      limit: pageInfo.limit,
    };
  },

  async getById(context: AdmissionContext, id: string) {
    const result = await query(
      `SELECT * FROM admission_applications WHERE institution_id = $1 AND id = $2`,
      [context.institutionId, id],
    );
    if (result.rows.length === 0) {
      throw createError('Application not found', 404);
    }
    return result.rows[0];
  },

  async getStatus(context: AdmissionContext, id: string) {
    const row = await this.getById(context, id);
    return { status: row.status, submitted_at: row.submitted_at, updated_at: row.updated_at };
  },

  async update(context: AdmissionContext, id: string, payload: JsonMap, userId: string) {
    const result = await query(
      `UPDATE admission_applications
       SET applicant_name = COALESCE($1, applicant_name),
           applicant_email = COALESCE($2, applicant_email),
           applicant_phone = COALESCE($3, applicant_phone),
           course_id = COALESCE($4, course_id),
           status = COALESCE($5, status),
           updated_by = $6,
           updated_at = NOW()
       WHERE institution_id = $7 AND id = $8
       RETURNING *`,
      [
        payload.applicantName ?? null,
        payload.applicantEmail ?? null,
        payload.applicantPhone ?? null,
        payload.courseId ?? null,
        payload.status ?? null,
        userId,
        context.institutionId,
        id,
      ],
    );
    if (result.rows.length === 0) {
      throw createError('Application not found', 404);
    }
    return result.rows[0];
  },

  async delete(context: AdmissionContext, id: string) {
    const result = await query(
      `DELETE FROM admission_applications WHERE institution_id = $1 AND id = $2 RETURNING id`,
      [context.institutionId, id],
    );
    if (result.rows.length === 0) {
      throw createError('Application not found', 404);
    }
  },
};

export default AdmissionApplicationModel;
