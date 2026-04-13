import { query } from '../../../db/postgres.js';
import { ApiError } from '../../../utils/apiError.js';

export interface StudentAdmission {
  id: string;
  student_name: string;
  dob: string;
  email: string;
  course: string;
  academic_year: string;
  status: 'pending' | 'admitted' | 'rejected';
  documents?: string[];
  created_at: Date;
}

export const StudentAdmissionModel = {
  async createAdmission(data: Omit<StudentAdmission, 'id' | 'status' | 'created_at'>): Promise<StudentAdmission> {
    const documentsJson = JSON.stringify(data.documents || []);
    const result = await query(
      `INSERT INTO student_admissions (student_name, dob, email, course, academic_year, documents, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING id, student_name, CAST(dob AS TEXT), email, course, academic_year, status, created_at`,
      [data.student_name, data.dob, data.email, data.course, data.academic_year, documentsJson]
    );
    return result.rows[0];
  },

  async getAllAdmissions(): Promise<StudentAdmission[]> {
    const result = await query(
      'SELECT id, student_name, CAST(dob AS TEXT), email, course, academic_year, status, created_at FROM student_admissions ORDER BY created_at DESC'
    );
    return result.rows;
  },

  async getAdmissionById(id: string): Promise<StudentAdmission> {
    const result = await query(
      'SELECT id, student_name, CAST(dob AS TEXT), email, course, academic_year, status, created_at FROM student_admissions WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Admission record not found');
    }
    return result.rows[0];
  },

  async updateAdmission(id: string, updates: Partial<Omit<StudentAdmission, 'id' | 'created_at'>>): Promise<StudentAdmission> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        if (key === 'documents') {
          fields.push(`${key} = $${paramCount++}`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${key} = $${paramCount++}`);
          values.push(value);
        }
      }
    }

    if (fields.length === 0) {
      throw new ApiError(400, 'No updates provided');
    }

    values.push(id);
    const result = await query(
      `UPDATE student_admissions SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING id, student_name, CAST(dob AS TEXT), email, course, academic_year, status, created_at`,
      values
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Admission record not found');
    }
    return result.rows[0];
  },

  async deleteAdmission(id: string): Promise<void> {
    const result = await query(
      'DELETE FROM student_admissions WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Admission record not found');
    }
  }
};

export default StudentAdmissionModel;
