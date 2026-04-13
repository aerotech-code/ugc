import { query } from '../../../db/postgres.js';
import { createError } from '../../../middleware/error.middleware.js';
import type { AcademicsContext } from '../core/academics-context.middleware.js';

type JsonMap = Record<string, any>;

const toNumber = (value: unknown, fieldName: string): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(parsed)) {
    throw createError(`${fieldName} must be a valid number`, 400);
  }
  return parsed;
};

const ExamModel = {
  async createInternalExam(context: AcademicsContext, payload: JsonMap, userId: string) {
    const result = await query(
      `INSERT INTO academics_internal_exams (institution_id, academic_year, semester_id, course_id, name, max_marks, passing_marks, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8) RETURNING *`,
      [context.institutionId, context.academicYear, payload.semester_id, payload.course_id, payload.name, toNumber(payload.max_marks, 'Max marks'), toNumber(payload.passing_marks, 'Passing marks'), userId]
    );
    return result.rows[0];
  },

  async listInternalExams(context: AcademicsContext) {
    const result = await query(`SELECT * FROM academics_internal_exams WHERE institution_id = $1 AND academic_year = $2 ORDER BY created_at DESC`, [context.institutionId, context.academicYear]);
    return result.rows;
  },

  async getInternalExam(context: AcademicsContext, id: string) {
    const result = await query(`SELECT * FROM academics_internal_exams WHERE institution_id = $1 AND id = $2`, [context.institutionId, id]);
    if (result.rowCount === 0) throw createError('Internal exam not found', 404);
    return result.rows[0];
  },

  async updateInternalExam(context: AcademicsContext, id: string, payload: JsonMap, userId: string) {
    const result = await query(
      `UPDATE academics_internal_exams SET name = COALESCE($1, name), max_marks = COALESCE($2, max_marks), passing_marks = COALESCE($3, passing_marks), updated_by = $4, updated_at = NOW()
       WHERE institution_id = $5 AND id = $6 RETURNING *`,
      [payload.name ?? null, payload.max_marks ? toNumber(payload.max_marks, 'Max marks') : null, payload.passing_marks ? toNumber(payload.passing_marks, 'Passing marks') : null, userId, context.institutionId, id]
    );
    if (result.rowCount === 0) throw createError('Internal exam not found', 404);
    return result.rows[0];
  },

  async enterInternalMarks(context: AcademicsContext, id: string, payload: JsonMap, userId: string) {
    const result = await query(
      `INSERT INTO academics_internal_marks (internal_exam_id, student_id, marks, entered_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (internal_exam_id, student_id) DO UPDATE SET marks = EXCLUDED.marks, entered_by = EXCLUDED.entered_by
       RETURNING *`,
      [id, payload.student_id, toNumber(payload.marks, 'Marks'), userId]
    );
    return result.rows[0];
  },

  async createFinalExam(context: AcademicsContext, payload: JsonMap, userId: string) {
    const result = await query(
      `INSERT INTO academics_final_exams (institution_id, academic_year, semester_id, course_id, name, exam_date, max_marks, passing_marks, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9) RETURNING *`,
      [context.institutionId, context.academicYear, payload.semester_id, payload.course_id, payload.name, payload.exam_date ?? null, toNumber(payload.max_marks, 'Max marks'), toNumber(payload.passing_marks, 'Passing marks'), userId]
    );
    return result.rows[0];
  },

  async listFinalExams(context: AcademicsContext) {
    const result = await query(`SELECT * FROM academics_final_exams WHERE institution_id = $1 AND academic_year = $2 ORDER BY created_at DESC`, [context.institutionId, context.academicYear]);
    return result.rows;
  },

  async getFinalExam(context: AcademicsContext, id: string) {
    const result = await query(`SELECT * FROM academics_final_exams WHERE institution_id = $1 AND id = $2`, [context.institutionId, id]);
    if (result.rowCount === 0) throw createError('Final exam not found', 404);
    return result.rows[0];
  },

  async updateFinalExam(context: AcademicsContext, id: string, payload: JsonMap, userId: string) {
    const result = await query(
      `UPDATE academics_final_exams SET name = COALESCE($1, name), exam_date = COALESCE($2, exam_date), max_marks = COALESCE($3, max_marks), passing_marks = COALESCE($4, passing_marks), updated_by = $5, updated_at = NOW()
       WHERE institution_id = $6 AND id = $7 RETURNING *`,
      [payload.name ?? null, payload.exam_date ?? null, payload.max_marks ? toNumber(payload.max_marks, 'Max marks') : null, payload.passing_marks ? toNumber(payload.passing_marks, 'Passing marks') : null, userId, context.institutionId, id]
    );
    if (result.rowCount === 0) throw createError('Final exam not found', 404);
    return result.rows[0];
  },

  async enterFinalMarks(context: AcademicsContext, id: string, payload: JsonMap, userId: string) {
    const result = await query(
      `INSERT INTO academics_final_marks (final_exam_id, student_id, marks, entered_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (final_exam_id, student_id) DO UPDATE SET marks = EXCLUDED.marks, entered_by = EXCLUDED.entered_by
       RETURNING *`,
      [id, payload.student_id, toNumber(payload.marks, 'Marks'), userId]
    );
    return result.rows[0];
  },

  async processResults(context: AcademicsContext, payload: JsonMap) {
    const result = await query(
      `INSERT INTO academics_exam_results (institution_id, academic_year, semester_id, student_id, status)
       VALUES ($1, $2, $3, $4, 'processing')
       ON CONFLICT (institution_id, academic_year, semester_id, student_id) DO UPDATE SET status = 'processing', updated_at = NOW()
       RETURNING *`,
      [context.institutionId, context.academicYear, payload.semester_id, payload.student_id]
    );
    return result.rows[0];
  },

  async listResults(context: AcademicsContext) {
    const result = await query(`SELECT * FROM academics_exam_results WHERE institution_id = $1 AND academic_year = $2 ORDER BY updated_at DESC`, [context.institutionId, context.academicYear]);
    return result.rows;
  },

  async getStudentResults(context: AcademicsContext, studentId: string) {
    const result = await query(`SELECT * FROM academics_exam_results WHERE institution_id = $1 AND student_id = $2`, [context.institutionId, studentId]);
    return result.rows;
  },

  async getSemesterResults(context: AcademicsContext, semesterId: string) {
    const result = await query(`SELECT * FROM academics_exam_results WHERE institution_id = $1 AND semester_id = $2`, [context.institutionId, semesterId]);
    return result.rows;
  },

  async publishResult(context: AcademicsContext, id: string, payload: JsonMap) {
    const result = await query(
      `UPDATE academics_exam_results SET status = 'published', published_at = NOW(), total_marks = $1, grade = $2, updated_at = NOW()
       WHERE institution_id = $3 AND id = $4 RETURNING *`,
      [payload.total_marks ? toNumber(payload.total_marks, 'Total marks') : null, payload.grade ?? null, context.institutionId, id]
    );
    if (result.rowCount === 0) throw createError('Result not found', 404);
    return result.rows[0];
  },

  async requestTranscription(context: AcademicsContext, payload: JsonMap) {
    const result = await query(
      `INSERT INTO academics_transcriptions (institution_id, student_id) VALUES ($1, $2) RETURNING *`,
      [context.institutionId, payload.student_id]
    );
    return result.rows[0];
  },

  async listTranscriptions(context: AcademicsContext) {
    const result = await query(`SELECT * FROM academics_transcriptions WHERE institution_id = $1 ORDER BY requested_on DESC`, [context.institutionId]);
    return result.rows;
  },

  async getStudentTranscriptions(context: AcademicsContext, studentId: string) {
    const result = await query(`SELECT * FROM academics_transcriptions WHERE institution_id = $1 AND student_id = $2 ORDER BY requested_on DESC`, [context.institutionId, studentId]);
    return result.rows;
  },

  async approveTranscription(context: AcademicsContext, id: string, userId: string) {
    const result = await query(
      `UPDATE academics_transcriptions SET status = 'approved', approved_on = NOW(), approved_by = $1 WHERE institution_id = $2 AND id = $3 RETURNING *`,
      [userId, context.institutionId, id]
    );
    if (result.rowCount === 0) throw createError('Transcription request not found', 404);
    return result.rows[0];
  },

  async registerBackExam(context: AcademicsContext, payload: JsonMap) {
    const result = await query(
      `INSERT INTO academics_back_exams (institution_id, academic_year, semester_id, student_id, course_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [context.institutionId, context.academicYear, payload.semester_id, payload.student_id, payload.course_id]
    );
    return result.rows[0];
  },

  async listBackExams(context: AcademicsContext) {
    const result = await query(`SELECT * FROM academics_back_exams WHERE institution_id = $1 AND academic_year = $2 ORDER BY created_at DESC`, [context.institutionId, context.academicYear]);
    return result.rows;
  },

  async getStudentBackExams(context: AcademicsContext, studentId: string) {
    const result = await query(`SELECT * FROM academics_back_exams WHERE institution_id = $1 AND student_id = $2`, [context.institutionId, studentId]);
    return result.rows;
  },

  async updateBackExamStatus(context: AcademicsContext, id: string, payload: JsonMap) {
    const result = await query(
      `UPDATE academics_back_exams SET status = $1, updated_at = NOW() WHERE institution_id = $2 AND id = $3 RETURNING *`,
      [payload.status, context.institutionId, id]
    );
    if (result.rowCount === 0) throw createError('Back exam not found', 404);
    return result.rows[0];
  },

  async enterBackExamMarks(context: AcademicsContext, id: string, payload: JsonMap, userId: string) {
    const result = await query(
      `INSERT INTO academics_back_marks (back_exam_id, marks, entered_by) VALUES ($1, $2, $3) RETURNING *`,
      [id, toNumber(payload.marks, 'Marks'), userId]
    );
    return result.rows[0];
  }
};

export default ExamModel;
