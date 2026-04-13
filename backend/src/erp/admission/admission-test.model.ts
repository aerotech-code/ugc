import { query } from '../../db/postgres.js';
import { createError } from '../../middleware/error.middleware.js';
import type { AdmissionContext } from './admission-context.middleware.js';

type JsonMap = Record<string, any>;

const AdmissionTestModel = {
  async schedule(context: AdmissionContext, payload: JsonMap, userId: string) {
    const result = await query(
      `INSERT INTO admission_entrance_tests (
        institution_id, test_name, test_date, venue, max_score, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        context.institutionId,
        payload.testName,
        new Date(payload.testDate),
        payload.venue ?? null,
        payload.maxScore ?? null,
        userId,
      ],
    );
    return result.rows[0];
  },

  async getSchedule(context: AdmissionContext) {
    const rows = await query(
      `SELECT *
       FROM admission_entrance_tests
       WHERE institution_id = $1 AND test_date > NOW()
       ORDER BY test_date ASC`,
      [context.institutionId],
    );

    return {
      data: rows.rows,
    };
  },

  async register(context: AdmissionContext, payload: JsonMap) {
    // Determine admit card url implicitly or expect it to be generated later.
    const result = await query(
      `INSERT INTO admission_test_registrations (
        institution_id, application_id, test_id, admit_card_url
      ) VALUES ($1, $2, $3, $4)
      ON CONFLICT (application_id, test_id) DO NOTHING
      RETURNING *`,
      [
        context.institutionId,
        payload.applicationId,
        payload.testId,
        payload.admitCardUrl ?? null,
      ],
    );
    if (!result.rows[0]) {
      throw createError('Already registered or invalid data', 400);
    }
    return result.rows[0];
  },

  async getAdmitCard(context: AdmissionContext, appId: string) {
    const result = await query(
      `SELECT r.admit_card_url, t.test_name, t.test_date, t.venue
       FROM admission_test_registrations r
       JOIN admission_entrance_tests t ON r.test_id = t.id
       WHERE r.institution_id = $1 AND r.application_id = $2
       ORDER BY t.test_date DESC
       LIMIT 1`,
      [context.institutionId, appId],
    );
    if (result.rows.length === 0) {
      throw createError('Admit card not found', 404);
    }
    return result.rows[0];
  },

  async uploadResults(context: AdmissionContext, payload: JsonMap) {
    const result = await query(
      `UPDATE admission_test_registrations
       SET score = $1,
           result_status = $2,
           updated_at = NOW()
       WHERE institution_id = $3 AND application_id = $4 AND test_id = $5
       RETURNING *`,
      [
        payload.score,
        payload.resultStatus ?? 'pending',
        context.institutionId,
        payload.applicationId,
        payload.testId,
      ],
    );
    if (result.rows.length === 0) {
      throw createError('Registration not found', 404);
    }
    return result.rows[0];
  },

  async getScore(context: AdmissionContext, appId: string) {
    const result = await query(
      `SELECT r.score, r.result_status, t.test_name, t.max_score
       FROM admission_test_registrations r
       JOIN admission_entrance_tests t ON r.test_id = t.id
       WHERE r.institution_id = $1 AND r.application_id = $2 AND r.score IS NOT NULL
       ORDER BY t.test_date DESC`,
      [context.institutionId, appId],
    );
    return { data: result.rows };
  },
};

export default AdmissionTestModel;
