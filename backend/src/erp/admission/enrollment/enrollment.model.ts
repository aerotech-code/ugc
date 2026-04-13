import { query } from '../../../db/postgres.js';
import { ApiError } from '../../../utils/apiError.js';

// ===================== Interfaces =====================

export interface EnrollmentConfirmation {
  id: string;
  app_id: string;
  enrollment_id?: string;
  student_name: string;
  course: string;
  academic_year: string;
  fee_amount: number;
  fee_proof_url?: string;
  payment_status: 'pending' | 'initiated' | 'paid' | 'failed';
  payment_reference?: string;
  payment_gateway_txn_id?: string;
  enrollment_status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface FeePaymentReceipt {
  id: string;
  enrollment_id: string;
  receipt_number: string;
  amount: number;
  payment_date: Date;
  payment_mode?: string;
  transaction_id?: string;
  created_at: Date;
}

// ===================== Model =====================

export const EnrollmentModel = {

  // POST /api/admissions/enrollment/confirm
  async confirmEnrollment(data: {
    app_id: string;
    student_name: string;
    course: string;
    academic_year: string;
    fee_amount: number;
    fee_proof_url?: string;
    payment_reference?: string;
  }): Promise<EnrollmentConfirmation> {
    // Generate a unique enrollment ID like ENR-2024-XXXXX
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const enrollmentId = `ENR-${year}-${randomSuffix}`;

    const result = await query(
      `INSERT INTO enrollment_confirmations
         (app_id, enrollment_id, student_name, course, academic_year, fee_amount, fee_proof_url, payment_status, payment_reference, enrollment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'initiated', $8, 'pending')
       RETURNING *`,
      [
        data.app_id,
        enrollmentId,
        data.student_name,
        data.course,
        data.academic_year,
        data.fee_amount,
        data.fee_proof_url || null,
        data.payment_reference || null,
      ]
    );
    return result.rows[0];
  },

  // GET /api/admissions/enrollment/:appId
  async getEnrollmentByAppId(appId: string): Promise<EnrollmentConfirmation> {
    const result = await query(
      `SELECT * FROM enrollment_confirmations WHERE app_id = $1`,
      [appId]
    );
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Enrollment record not found for this application');
    }
    return result.rows[0];
  },

  // PUT /api/admissions/enrollment/:appId/approve
  async approveEnrollment(appId: string, approvedBy: string): Promise<EnrollmentConfirmation> {
    const result = await query(
      `UPDATE enrollment_confirmations
       SET enrollment_status = 'approved', approved_by = $2, approved_at = NOW(), updated_at = NOW()
       WHERE app_id = $1
       RETURNING *`,
      [appId, approvedBy]
    );
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Enrollment record not found');
    }
    return result.rows[0];
  },

  // POST /api/admissions/enrollment/fees/pay
  async initiateFeesPayment(data: {
    app_id: string;
    payment_gateway_txn_id: string;
    payment_mode?: string;
  }): Promise<{ enrollment: EnrollmentConfirmation; receipt: FeePaymentReceipt }> {
    // Update payment status to initiated
    const enrollmentResult = await query(
      `UPDATE enrollment_confirmations
       SET payment_status = 'paid', payment_gateway_txn_id = $2, updated_at = NOW()
       WHERE app_id = $1
       RETURNING *`,
      [data.app_id, data.payment_gateway_txn_id]
    );

    if (enrollmentResult.rows.length === 0) {
      throw new ApiError(404, 'Enrollment record not found for this application');
    }

    const enrollment: EnrollmentConfirmation = enrollmentResult.rows[0];

    // Generate fee receipt
    const receiptNumber = `RCPT-${Date.now()}`;
    const receiptResult = await query(
      `INSERT INTO fee_payment_receipts (enrollment_id, receipt_number, amount, payment_mode, transaction_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        enrollment.id,
        receiptNumber,
        enrollment.fee_amount,
        data.payment_mode || 'online',
        data.payment_gateway_txn_id,
      ]
    );

    return {
      enrollment,
      receipt: receiptResult.rows[0],
    };
  },

  // GET /api/admissions/enrollment/:appId/receipt
  async getFeeReceipt(appId: string): Promise<FeePaymentReceipt & { enrollment_details: Partial<EnrollmentConfirmation> }> {
    const result = await query(
      `SELECT r.*, ec.student_name, ec.course, ec.academic_year, ec.enrollment_id, ec.payment_status
       FROM fee_payment_receipts r
       JOIN enrollment_confirmations ec ON r.enrollment_id = ec.id
       WHERE ec.app_id = $1
       ORDER BY r.created_at DESC
       LIMIT 1`,
      [appId]
    );
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Fee receipt not found. Payment may not have been completed.');
    }
    const row = result.rows[0];
    return {
      id: row.id,
      enrollment_id: row.enrollment_id,
      receipt_number: row.receipt_number,
      amount: row.amount,
      payment_date: row.payment_date,
      payment_mode: row.payment_mode,
      transaction_id: row.transaction_id,
      created_at: row.created_at,
      enrollment_details: {
        student_name: row.student_name,
        course: row.course,
        academic_year: row.academic_year,
        enrollment_id: row.enrollment_id,
        payment_status: row.payment_status,
      },
    };
  },

  // GET /api/admissions/enrollment/:appId/id-card  (returns enrollment card data)
  async getIdCard(appId: string): Promise<{
    enrollment_id: string;
    student_name: string;
    course: string;
    academic_year: string;
    enrollment_status: string;
    payment_status: string;
    issued_at: Date;
  }> {
    const result = await query(
      `SELECT enrollment_id, student_name, course, academic_year, enrollment_status, payment_status, approved_at
       FROM enrollment_confirmations
       WHERE app_id = $1`,
      [appId]
    );
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Enrollment record not found');
    }
    const row = result.rows[0];
    if (row.enrollment_status !== 'approved') {
      throw new ApiError(403, 'ID card is only available after enrollment is approved');
    }
    return {
      enrollment_id: row.enrollment_id,
      student_name: row.student_name,
      course: row.course,
      academic_year: row.academic_year,
      enrollment_status: row.enrollment_status,
      payment_status: row.payment_status,
      issued_at: row.approved_at,
    };
  },
};

export default EnrollmentModel;
