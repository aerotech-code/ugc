import { query } from '../../db/postgres.js';
import { createError } from '../../middleware/error.middleware.js';
import type { AdmissionContext } from './admission-context.middleware.js';

type JsonMap = Record<string, any>;

const AdmissionDocumentModel = {
  async upload(context: AdmissionContext, payload: JsonMap, userId: string) {
    const result = await query(
      `INSERT INTO admission_documents (
        institution_id, application_id, document_type, file_url, status, uploaded_by
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        context.institutionId,
        payload.applicationId,
        payload.documentType,
        payload.fileUrl,
        'pending',
        userId,
      ],
    );
    return result.rows[0];
  },

  async getByAppId(context: AdmissionContext, appId: string) {
    const rows = await query(
      `SELECT *
       FROM admission_documents
       WHERE institution_id = $1 AND application_id = $2
       ORDER BY uploaded_at DESC`,
      [context.institutionId, appId],
    );

    return {
      data: rows.rows,
    };
  },

  async getById(context: AdmissionContext, id: string) {
    const result = await query(
      `SELECT * FROM admission_documents WHERE institution_id = $1 AND id = $2`,
      [context.institutionId, id],
    );
    if (result.rows.length === 0) {
      throw createError('Document not found', 404);
    }
    return result.rows[0];
  },

  async getStatus(context: AdmissionContext, id: string) {
    const row = await this.getById(context, id);
    return { status: row.status, rejection_reason: row.rejection_reason, verified_at: row.verified_at };
  },

  async verify(context: AdmissionContext, id: string, userId: string) {
    const result = await query(
      `UPDATE admission_documents
       SET status = 'verified',
           rejection_reason = NULL,
           verified_by = $1,
           verified_at = NOW()
       WHERE institution_id = $2 AND id = $3
       RETURNING *`,
      [userId, context.institutionId, id],
    );
    if (result.rows.length === 0) {
      throw createError('Document not found', 404);
    }
    return result.rows[0];
  },

  async reject(context: AdmissionContext, id: string, reason: string, userId: string) {
    const result = await query(
      `UPDATE admission_documents
       SET status = 'rejected',
           rejection_reason = $1,
           verified_by = $2,
           verified_at = NOW()
       WHERE institution_id = $3 AND id = $4
       RETURNING *`,
      [reason, userId, context.institutionId, id],
    );
    if (result.rows.length === 0) {
      throw createError('Document not found', 404);
    }
    return result.rows[0];
  },

  async delete(context: AdmissionContext, id: string) {
    const result = await query(
      `DELETE FROM admission_documents WHERE institution_id = $1 AND id = $2 RETURNING id`,
      [context.institutionId, id],
    );
    if (result.rows.length === 0) {
      throw createError('Document not found', 404);
    }
  },
};

export default AdmissionDocumentModel;
