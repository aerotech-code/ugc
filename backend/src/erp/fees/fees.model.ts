import { randomUUID } from 'crypto';
import { getClient, query } from '../../db/postgres.js';
import { createError } from '../../middleware/error.middleware.js';
import type { FeesContext as FeeContext } from './fees-context.middleware.js';

type Row = Record<string, any>;
type JsonMap = Record<string, any>;

const toNumber = (value: unknown, fieldName: string): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(parsed)) {
    throw createError(`${fieldName} must be a valid number`, 400);
  }
  return parsed;
};

const pagination = (page?: unknown, limit?: unknown) => {
  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.max(Number(limit) || 20, 1);
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

const deductionTotal = (items: Array<{ amount: number }> = []): number =>
  items.reduce((sum, item) => sum + toNumber(item.amount, 'Deduction amount'), 0);

const nextReceiptNumber = (): string => `RCPT-${new Date().getUTCFullYear()}-${String(Date.now()).slice(-6)}`;

const addHistory = async (
  context: FeeContext,
  entityType: string,
  entityId: string,
  type: string,
  performedBy: string,
  details: JsonMap,
  studentId?: string,
  amount?: number,
  reference?: string,
): Promise<void> => {
  await query(
    `INSERT INTO fees_history (
      institution_id, academic_year, student_id, entity_type, entity_id, type, amount, reference, performed_by, details
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      context.institutionId,
      context.academicYear,
      studentId ?? null,
      entityType,
      entityId,
      type,
      amount ?? null,
      reference ?? null,
      performedBy,
      JSON.stringify(details),
    ],
  );
};

const getFeeStructureDetails = async (id: string): Promise<Row> => {
  const structure = await query('SELECT * FROM fees_fee_structures WHERE id = $1', [id]);
  if (structure.rows.length === 0) {
    throw createError('Fee structure not found', 404);
  }

  const components = await query(
    `SELECT id, name, amount, mandatory
     FROM fees_fee_structure_components
     WHERE fee_structure_id = $1
     ORDER BY sort_order, created_at`,
    [id],
  );
  const installments = await query(
    `SELECT id, name, due_date, percentage
     FROM fees_fee_structure_installments
     WHERE fee_structure_id = $1
     ORDER BY due_date`,
    [id],
  );

  return {
    ...structure.rows[0],
    components: components.rows,
    installments: installments.rows,
  };
};

const FeesModel = {
  async listPayroll(context: FeeContext, filters: JsonMap) {
    const pageInfo = pagination(filters.page, filters.limit);
    const dynamic = buildFilters(3, [
      { enabled: Boolean(filters.department_id), sql: 'department_id = ?', value: filters.department_id },
      { enabled: Boolean(filters.month), sql: 'month = ?', value: filters.month },
      { enabled: Boolean(filters.status), sql: 'status = ?', value: filters.status },
    ]);

    const total = await query(
      `SELECT COUNT(*)::int AS total
       FROM fees_payroll_records
       WHERE institution_id = $1 AND academic_year = $2${dynamic.sql}`,
      [context.institutionId, context.academicYear, ...dynamic.values],
    );

    const rows = await query(
      `SELECT id, employee_id, employee_name, month, gross_salary, total_deductions AS deductions,
              net_salary, status, processed_date
       FROM fees_payroll_records
       WHERE institution_id = $1 AND academic_year = $2${dynamic.sql}
       ORDER BY month DESC, created_at DESC
       LIMIT $${dynamic.values.length + 3} OFFSET $${dynamic.values.length + 4}`,
      [context.institutionId, context.academicYear, ...dynamic.values, pageInfo.limit, pageInfo.offset],
    );

    return { data: rows.rows, total: total.rows[0]?.total ?? 0, page: pageInfo.page };
  },

  async getPayroll(context: FeeContext, id: string) {
    const result = await query(
      `SELECT id, employee_id, employee_name, month, gross_salary, deductions AS salary_components,
              deductions AS deduction_components, total_deductions, net_salary, status, processed_date, remarks
       FROM fees_payroll_records
       WHERE institution_id = $1 AND academic_year = $2 AND id = $3`,
      [context.institutionId, context.academicYear, id],
    );
    if (result.rows.length === 0) {
      throw createError('Payroll record not found', 404);
    }
    return result.rows[0];
  },

  async createPayroll(context: FeeContext, payload: JsonMap, userId: string) {
    const deductions = Array.isArray(payload.deductions) ? payload.deductions : [];
    const grossSalary = toNumber(payload.gross_salary, 'Gross salary');
    const totalDeductions = deductionTotal(deductions);
    const result = await query(
      `INSERT INTO fees_payroll_records (
        institution_id, academic_year, employee_id, employee_name, department_id, month, gross_salary,
        deductions, total_deductions, net_salary, status, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', $11, $11)
      RETURNING id, status`,
      [
        context.institutionId,
        String(payload.academic_year ?? context.academicYear),
        payload.employee_id,
        payload.employee_name ?? null,
        payload.department_id ?? null,
        payload.month,
        grossSalary,
        JSON.stringify(deductions),
        totalDeductions,
        grossSalary - totalDeductions,
        userId,
      ],
    );

    await addHistory(context, 'payroll', result.rows[0].id, 'payment', userId, {
      action: 'payroll_created',
      employee_id: payload.employee_id,
      month: payload.month,
    });

    return result.rows[0];
  },
  async updatePayroll(context: FeeContext, id: string, payload: JsonMap, userId: string) {
    const existing = await FeesModel.getPayroll(context, id);
    const deductions = Array.isArray(payload.deductions) ? payload.deductions : existing.salary_components ?? [];
    const grossSalary = payload.gross_salary !== undefined ? toNumber(payload.gross_salary, 'Gross salary') : toNumber(existing.gross_salary, 'Gross salary');
    const totalDeductions = deductionTotal(deductions);

    const result = await query(
      `UPDATE fees_payroll_records
       SET gross_salary = $1,
           deductions = $2,
           total_deductions = $3,
           net_salary = $4,
           remarks = $5,
           updated_by = $6,
           updated_at = NOW()
       WHERE institution_id = $7 AND academic_year = $8 AND id = $9`,
      [grossSalary, JSON.stringify(deductions), totalDeductions, grossSalary - totalDeductions, payload.remarks ?? existing.remarks ?? null, userId, context.institutionId, context.academicYear, id],
    );

    if (result.rowCount === 0) {
      throw createError('Payroll record not found', 404);
    }

    await addHistory(context, 'payroll', id, 'payment', userId, { action: 'payroll_updated' });
  },

  async deletePayroll(context: FeeContext, id: string, userId: string) {
    const result = await query(
      `DELETE FROM fees_payroll_records
       WHERE institution_id = $1 AND academic_year = $2 AND id = $3 AND status = 'pending'
       RETURNING id`,
      [context.institutionId, context.academicYear, id],
    );
    if (result.rows.length === 0) {
      throw createError('Payroll record not found or cannot be deleted', 422);
    }
    await addHistory(context, 'payroll', id, 'payment', userId, { action: 'payroll_deleted' });
  },

  async listScholarships(context: FeeContext, filters: JsonMap) {
    const dynamic = buildFilters(2, [
      { enabled: filters.active_only === 'true', sql: 'active = ?', value: true },
      { enabled: Boolean(filters.category), sql: 'category = ?', value: filters.category },
    ]);
    const result = await query(
      `SELECT id, name, category, discount_type, discount_value, eligibility_criteria, max_beneficiaries, active
       FROM fees_scholarships
       WHERE institution_id = $1${dynamic.sql}
       ORDER BY name`,
      [context.institutionId, ...dynamic.values],
    );
    return result.rows;
  },

  async createScholarship(context: FeeContext, payload: JsonMap, userId: string) {
    const result = await query(
      `INSERT INTO fees_scholarships (
        institution_id, name, category, discount_type, discount_value, eligibility_criteria,
        max_beneficiaries, active, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
      RETURNING id`,
      [
        context.institutionId,
        payload.name,
        payload.category,
        payload.discount_type,
        toNumber(payload.discount_value, 'Discount value'),
        payload.eligibility_criteria ?? null,
        payload.max_beneficiaries ?? null,
        payload.active ?? true,
        userId,
      ],
    );
    return result.rows[0];
  },

  async updateScholarship(context: FeeContext, id: string, payload: JsonMap, userId: string) {
    const result = await query(
      `UPDATE fees_scholarships
       SET discount_value = COALESCE($1, discount_value),
           max_beneficiaries = COALESCE($2, max_beneficiaries),
           eligibility_criteria = COALESCE($3, eligibility_criteria),
           active = COALESCE($4, active),
           updated_by = $5,
           updated_at = NOW()
       WHERE institution_id = $6 AND id = $7`,
      [payload.discount_value !== undefined ? toNumber(payload.discount_value, 'Discount value') : null, payload.max_beneficiaries ?? null, payload.eligibility_criteria ?? null, payload.active ?? null, userId, context.institutionId, id],
    );
    if (result.rowCount === 0) {
      throw createError('Scholarship not found', 404);
    }
  },

  async deactivateScholarship(context: FeeContext, id: string, userId: string) {
    const result = await query(
      `UPDATE fees_scholarships
       SET active = false, updated_by = $1, updated_at = NOW()
       WHERE institution_id = $2 AND id = $3`,
      [userId, context.institutionId, id],
    );
    if (result.rowCount === 0) {
      throw createError('Scholarship not found', 404);
    }
  },

  async listFeeStructures(context: FeeContext, filters: JsonMap) {
    const dynamic = buildFilters(3, [
      { enabled: Boolean(filters.course_id), sql: 'course_id = ?', value: filters.course_id },
      { enabled: Boolean(filters.batch_id), sql: 'batch_id = ?', value: filters.batch_id },
      { enabled: Boolean(filters.academic_year), sql: 'academic_year = ?', value: filters.academic_year },
    ]);
    const result = await query(
      `SELECT id
       FROM fees_fee_structures
       WHERE institution_id = $1 AND academic_year = $2${dynamic.sql}
       ORDER BY created_at DESC`,
      [context.institutionId, context.academicYear, ...dynamic.values],
    );
    return Promise.all(result.rows.map((row) => getFeeStructureDetails(row.id)));
  },

  async createFeeStructure(context: FeeContext, payload: JsonMap, userId: string) {
    const components = Array.isArray(payload.components) ? payload.components : [];
    const installments = Array.isArray(payload.installments) ? payload.installments : [];
    const totalFees = components.reduce((sum: number, item: Row) => sum + toNumber(item.amount, 'Component amount'), 0);
    const client = await getClient();

    try {
      await client.query('BEGIN');
      const structure = await client.query(
        `INSERT INTO fees_fee_structures (
          institution_id, course_id, batch_id, course_name, academic_year, total_fees, created_by, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
        RETURNING id, total_fees`,
        [context.institutionId, payload.course_id, payload.batch_id ?? null, payload.course_name ?? null, payload.academic_year ?? context.academicYear, totalFees, userId],
      );

      const feeStructureId = structure.rows[0].id;
      for (const [index, component] of components.entries()) {
        await client.query(
          `INSERT INTO fees_fee_structure_components (fee_structure_id, name, amount, mandatory, sort_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [feeStructureId, component.name, toNumber(component.amount, 'Component amount'), component.mandatory ?? true, index],
        );
      }

      for (const installment of installments) {
        await client.query(
          `INSERT INTO fees_fee_structure_installments (fee_structure_id, name, due_date, percentage)
           VALUES ($1, $2, $3, $4)`,
          [feeStructureId, installment.name, installment.due_date, toNumber(installment.percentage, 'Installment percentage')],
        );
      }

      await client.query('COMMIT');
      return structure.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
  async updateFeeStructure(context: FeeContext, id: string, payload: JsonMap, userId: string) {
    const components = Array.isArray(payload.components) ? payload.components : [];
    const installments = Array.isArray(payload.installments) ? payload.installments : [];
    const totalFees = components.reduce((sum: number, item: Row) => sum + toNumber(item.amount, 'Component amount'), 0);
    const client = await getClient();

    try {
      await client.query('BEGIN');
      const updateResult = await client.query(
        `UPDATE fees_fee_structures
         SET total_fees = CASE WHEN $1 > 0 THEN $1 ELSE total_fees END,
             effective_date = COALESCE($2, effective_date),
             updated_by = $3,
             updated_at = NOW()
         WHERE institution_id = $4 AND academic_year = $5 AND id = $6`,
        [totalFees, payload.effective_date ?? null, userId, context.institutionId, context.academicYear, id],
      );
      if (updateResult.rowCount === 0) {
        throw createError('Fee structure not found', 404);
      }

      if (components.length > 0) {
        await client.query('DELETE FROM fees_fee_structure_components WHERE fee_structure_id = $1', [id]);
        for (const [index, component] of components.entries()) {
          await client.query(
            `INSERT INTO fees_fee_structure_components (fee_structure_id, name, amount, mandatory, sort_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [id, component.name, toNumber(component.amount, 'Component amount'), component.mandatory ?? true, index],
          );
        }
      }

      if (installments.length > 0) {
        await client.query('DELETE FROM fees_fee_structure_installments WHERE fee_structure_id = $1', [id]);
        for (const installment of installments) {
          await client.query(
            `INSERT INTO fees_fee_structure_installments (fee_structure_id, name, due_date, percentage)
             VALUES ($1, $2, $3, $4)`,
            [id, installment.name, installment.due_date, toNumber(installment.percentage, 'Installment percentage')],
          );
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getStudentFee(context: FeeContext, feeStructureId: string, studentId: string) {
    const structure = await getFeeStructureDetails(feeStructureId);
    const components = Array.isArray(structure.components) ? structure.components : [];
    const grossFees = components.reduce((sum: number, item: Row) => sum + toNumber(item.amount, 'Component amount'), 0);

    const awards = await query(
      `SELECT s.discount_type, s.discount_value
       FROM fees_scholarship_awards a
       JOIN fees_scholarships s ON s.id = a.scholarship_id
       WHERE a.institution_id = $1 AND a.student_id = $2 AND a.academic_year = $3 AND a.status = 'active' AND s.active = true`,
      [context.institutionId, studentId, context.academicYear],
    );

    const scholarshipDiscount = awards.rows.reduce((sum: number, row: Row) => {
      const value = toNumber(row.discount_value, 'Discount value');
      return sum + (row.discount_type === 'percentage' ? (grossFees * value) / 100 : value);
    }, 0);

    return {
      gross_fees: grossFees,
      scholarship_discount: scholarshipDiscount,
      concession: 0,
      net_payable: Math.max(grossFees - scholarshipDiscount, 0),
    };
  },

  async processPayment(context: FeeContext, payload: JsonMap, userId: string) {
    const summary = await FeesModel.getStudentFee(context, String(payload.fee_structure_id), String(payload.student_id));
    const amount = toNumber(payload.amount, 'Amount');
    const balanceDue = Math.max(toNumber(summary.net_payable, 'Net payable') - amount, 0);
    const client = await getClient();

    try {
      await client.query('BEGIN');
      const payment = await client.query(
        `INSERT INTO fees_payments (
          institution_id, academic_year, student_id, student_name, fee_structure_id, installment_id, amount,
          payment_mode, payment_gateway, transaction_ref, status, remarks, processed_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'success', $11, $12)
        RETURNING id, transaction_ref`,
        [
          context.institutionId,
          context.academicYear,
          payload.student_id,
          payload.student_name ?? null,
          payload.fee_structure_id,
          payload.installment_id ?? null,
          amount,
          payload.payment_mode,
          payload.payment_gateway ?? null,
          payload.transaction_ref ?? `TXN-${Date.now()}`,
          payload.remarks ?? null,
          userId,
        ],
      );

      const receipt = await client.query(
        `INSERT INTO fees_receipts (
          institution_id, payment_id, receipt_number, student_id, student_name, amount, payment_mode
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, receipt_number`,
        [context.institutionId, payment.rows[0].id, nextReceiptNumber(), payload.student_id, payload.student_name ?? null, amount, payload.payment_mode],
      );

      await client.query(
        `INSERT INTO fees_receipt_history (receipt_id, action, action_by, metadata)
         VALUES ($1, 'created', $2, $3)`,
        [receipt.rows[0].id, userId, JSON.stringify({ payment_id: payment.rows[0].id })],
      );

      await client.query(
        `INSERT INTO fees_history (
          institution_id, academic_year, student_id, entity_type, entity_id, type, amount, reference, performed_by, details
        ) VALUES ($1, $2, $3, 'payment', $4, 'payment', $5, $6, $7, $8)`,
        [context.institutionId, context.academicYear, payload.student_id, payment.rows[0].id, amount, receipt.rows[0].receipt_number, userId, JSON.stringify({ payment_mode: payload.payment_mode })],
      );

      await client.query('COMMIT');

      return {
        payment_id: payment.rows[0].id,
        receipt_id: receipt.rows[0].id,
        transaction_ref: payment.rows[0].transaction_ref,
        amount_paid: amount,
        balance_due: balanceDue,
        receipt_number: receipt.rows[0].receipt_number,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async listPayments(context: FeeContext, filters: JsonMap) {
    const dynamic = buildFilters(3, [
      { enabled: Boolean(filters.student_id), sql: 'student_id = ?', value: filters.student_id },
      { enabled: Boolean(filters.status), sql: 'status = ?', value: filters.status },
      { enabled: Boolean(filters.from_date), sql: 'payment_date::date >= ?', value: filters.from_date },
      { enabled: Boolean(filters.to_date), sql: 'payment_date::date <= ?', value: filters.to_date },
      { enabled: Boolean(filters.payment_mode), sql: 'payment_mode = ?', value: filters.payment_mode },
    ]);
    const result = await query(
      `SELECT *
       FROM fees_payments
       WHERE institution_id = $1 AND academic_year = $2${dynamic.sql}
       ORDER BY payment_date DESC`,
      [context.institutionId, context.academicYear, ...dynamic.values],
    );
    const totalAmount = result.rows.reduce((sum: number, row: Row) => sum + toNumber(row.amount, 'Amount'), 0);
    return { data: result.rows, total_amount: totalAmount, count: result.rows.length };
  },

  async getPayment(context: FeeContext, id: string) {
    const result = await query(
      `SELECT *
       FROM fees_payments
       WHERE institution_id = $1 AND academic_year = $2 AND id = $3`,
      [context.institutionId, context.academicYear, id],
    );
    if (result.rows.length === 0) {
      throw createError('Payment not found', 404);
    }
    return result.rows[0];
  },

  async initiatePayment(context: FeeContext, payload: JsonMap) {
    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const url = `https://payments.example.com/${encodeURIComponent(String(payload.gateway))}/checkout/${sessionId}`;
    await query(
      `INSERT INTO fees_payment_sessions (id, institution_id, student_id, amount, gateway, callback_url, payment_url, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [sessionId, context.institutionId, payload.student_id, toNumber(payload.amount, 'Amount'), payload.gateway, payload.callback_url ?? null, url, expiresAt],
    );
    return { session_id: sessionId, payment_url: url, expires_at: expiresAt };
  },
  async handleWebhook(payload: JsonMap) {
    const context: FeeContext = {
      institutionId: String(payload.institution_id ?? '00000000-0000-0000-0000-000000000000'),
      academicYear: String(payload.academic_year ?? ''),
    };
    await addHistory(context, 'payment_webhook', randomUUID(), 'payment', 'gateway', payload, payload.student_id ? String(payload.student_id) : undefined);
  },

  async listReceipts(context: FeeContext, filters: JsonMap) {
    const dynamic = buildFilters(2, [
      { enabled: Boolean(filters.student_id), sql: 'student_id = ?', value: filters.student_id },
      { enabled: Boolean(filters.from_date), sql: 'issued_at::date >= ?', value: filters.from_date },
      { enabled: Boolean(filters.to_date), sql: 'issued_at::date <= ?', value: filters.to_date },
      { enabled: Boolean(filters.receipt_no), sql: 'receipt_number ILIKE ?', value: `%${String(filters.receipt_no)}%` },
    ]);
    const result = await query(
      `SELECT id AS receipt_id, receipt_number, student_name, amount, issued_at::date AS date, payment_mode
       FROM fees_receipts
       WHERE institution_id = $1${dynamic.sql}
       ORDER BY issued_at DESC`,
      [context.institutionId, ...dynamic.values],
    );
    return result.rows;
  },

  async getReceipt(context: FeeContext, id: string) {
    const receipt = await query(
      `SELECT r.id AS receipt_id, r.receipt_number, r.student_id, r.student_name, r.amount, r.payment_mode,
              r.issued_at, r.status, p.id AS payment_id, p.transaction_ref, p.remarks, p.fee_structure_id
       FROM fees_receipts r
       JOIN fees_payments p ON p.id = r.payment_id
       WHERE r.institution_id = $1 AND r.id = $2`,
      [context.institutionId, id],
    );
    if (receipt.rows.length === 0) {
      throw createError('Receipt not found', 404);
    }

    const row = receipt.rows[0];
    const components = row.fee_structure_id
      ? await query(
          `SELECT name, amount, mandatory
           FROM fees_fee_structure_components
           WHERE fee_structure_id = $1
           ORDER BY sort_order, created_at`,
          [row.fee_structure_id],
        )
      : { rows: [] };

    return {
      ...row,
      student: { id: row.student_id, name: row.student_name },
      fee_components: components.rows,
      payment_details: {
        payment_id: row.payment_id,
        transaction_ref: row.transaction_ref,
        remarks: row.remarks,
      },
    };
  },

  async addReceiptHistory(receiptId: string, action: string, actionBy: string, metadata: JsonMap) {
    await query(
      `INSERT INTO fees_receipt_history (receipt_id, action, action_by, metadata)
       VALUES ($1, $2, $3, $4)`,
      [receiptId, action, actionBy, JSON.stringify(metadata)],
    );
  },

  async getReceiptHistory(receiptId: string) {
    const result = await query(
      `SELECT action, created_at AS timestamp, action_by AS by, metadata
       FROM fees_receipt_history
       WHERE receipt_id = $1
       ORDER BY created_at ASC`,
      [receiptId],
    );
    return result.rows;
  },

  async cancelReceipt(context: FeeContext, id: string, payload: JsonMap) {
    const cancellationRef = randomUUID();
    const result = await query(
      `UPDATE fees_receipts
       SET status = 'cancelled', cancellation_reason = $1, cancelled_by = $2
       WHERE institution_id = $3 AND id = $4
       RETURNING id`,
      [payload.reason, payload.cancelled_by, context.institutionId, id],
    );
    if (result.rows.length === 0) {
      throw createError('Receipt not found', 404);
    }

    await FeesModel.addReceiptHistory(id, 'cancelled', String(payload.cancelled_by), { reason: payload.reason, cancellation_ref: cancellationRef });
    await addHistory(context, 'receipt', id, 'cancellation', String(payload.cancelled_by), { reason: payload.reason }, undefined, undefined, cancellationRef);
    return { cancellation_ref: cancellationRef };
  },

  async listHistory(context: FeeContext, filters: JsonMap) {
    const pageInfo = pagination(filters.page, filters.limit);
    const dynamic = buildFilters(3, [
      { enabled: Boolean(filters.student_id), sql: 'student_id = ?', value: filters.student_id },
      { enabled: Boolean(filters.type), sql: 'type = ?', value: filters.type },
      { enabled: Boolean(filters.from_date), sql: 'created_at::date >= ?', value: filters.from_date },
      { enabled: Boolean(filters.to_date), sql: 'created_at::date <= ?', value: filters.to_date },
      { enabled: Boolean(filters.academic_year), sql: 'academic_year = ?', value: filters.academic_year },
    ]);

    const total = await query(
      `SELECT COUNT(*)::int AS total
       FROM fees_history
       WHERE institution_id = $1 AND academic_year = $2${dynamic.sql}`,
      [context.institutionId, context.academicYear, ...dynamic.values],
    );

    const rows = await query(
      `SELECT id, type, amount, created_at::date AS date, student_id, reference, performed_by
       FROM fees_history
       WHERE institution_id = $1 AND academic_year = $2${dynamic.sql}
       ORDER BY created_at DESC
       LIMIT $${dynamic.values.length + 3} OFFSET $${dynamic.values.length + 4}`,
      [context.institutionId, context.academicYear, ...dynamic.values, pageInfo.limit, pageInfo.offset],
    );

    return { data: rows.rows, total: total.rows[0]?.total ?? 0, page: pageInfo.page };
  },

  async getStudentHistory(context: FeeContext, studentId: string, academicYear?: string) {
    const year = academicYear ?? context.academicYear;
    const transactions = await query(
      `SELECT type, amount, reference, created_at AS date, performed_by
       FROM fees_history
       WHERE institution_id = $1 AND student_id = $2 AND academic_year = $3
       ORDER BY created_at DESC`,
      [context.institutionId, studentId, year],
    );
    const scholarships = await query(
      `SELECT a.id, s.name AS scholarship_name, s.discount_type, s.discount_value, a.status
       FROM fees_scholarship_awards a
       JOIN fees_scholarships s ON s.id = a.scholarship_id
       WHERE a.institution_id = $1 AND a.student_id = $2 AND a.academic_year = $3`,
      [context.institutionId, studentId, year],
    );
    const totalPaid = transactions.rows.filter((row: Row) => row.type === 'payment').reduce((sum: number, row: Row) => sum + toNumber(row.amount, 'Amount'), 0);
    const totalRefund = transactions.rows.filter((row: Row) => row.type === 'refund').reduce((sum: number, row: Row) => sum + toNumber(row.amount, 'Amount'), 0);
    return {
      student: { id: studentId, name: null },
      total_paid: totalPaid,
      total_due: Math.max(totalRefund - totalPaid, 0),
      transactions: transactions.rows,
      scholarships_applied: scholarships.rows,
    };
  },

  async exportHistory(context: FeeContext, filters: JsonMap) {
    const result = await FeesModel.listHistory(context, { ...filters, page: 1, limit: 10000 });
    const rows = Array.isArray(result.data) ? result.data : [];
    const header = 'id,type,amount,date,student_id,reference,performed_by';
    const lines = rows.map((row: Row) =>
      [row.id, row.type, row.amount, row.date, row.student_id, row.reference, row.performed_by]
        .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
        .join(','),
    );
    return [header, ...lines].join('\n');
  },
  async listScholarshipAwards(context: FeeContext, filters: JsonMap) {
    const dynamic = buildFilters(2, [
      { enabled: Boolean(filters.student_id), sql: 'a.student_id = ?', value: filters.student_id },
      { enabled: Boolean(filters.scholarship_id), sql: 'a.scholarship_id = ?', value: filters.scholarship_id },
      { enabled: Boolean(filters.academic_year), sql: 'a.academic_year = ?', value: filters.academic_year },
      { enabled: Boolean(filters.status), sql: 'a.status = ?', value: filters.status },
    ]);
    const result = await query(
      `SELECT a.id AS award_id, a.student_id, a.student_name, s.name AS scholarship_name,
              CASE WHEN s.discount_type = 'percentage' THEN COALESCE(fs.total_fees, 0) * s.discount_value / 100 ELSE s.discount_value END AS discount_amount,
              a.academic_year, a.status
       FROM fees_scholarship_awards a
       JOIN fees_scholarships s ON s.id = a.scholarship_id
       LEFT JOIN fees_fee_structures fs ON fs.institution_id = a.institution_id AND fs.academic_year = a.academic_year
       WHERE a.institution_id = $1${dynamic.sql}
       ORDER BY a.created_at DESC`,
      [context.institutionId, ...dynamic.values],
    );
    return result.rows;
  },

  async createScholarshipAward(context: FeeContext, payload: JsonMap) {
    const result = await query(
      `INSERT INTO fees_scholarship_awards (
        institution_id, student_id, student_name, scholarship_id, academic_year, approved_by, remarks
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id AS award_id`,
      [context.institutionId, payload.student_id, payload.student_name ?? null, payload.scholarship_id, payload.academic_year ?? context.academicYear, payload.approved_by ?? null, payload.remarks ?? null],
    );
    return result.rows[0];
  },

  async updateScholarshipAward(context: FeeContext, id: string, payload: JsonMap) {
    const result = await query(
      `UPDATE fees_scholarship_awards
       SET status = COALESCE($1, status),
           revoke_reason = COALESCE($2, revoke_reason),
           updated_at = NOW()
       WHERE institution_id = $3 AND id = $4`,
      [payload.status ?? null, payload.revoke_reason ?? null, context.institutionId, id],
    );
    if (result.rowCount === 0) {
      throw createError('Scholarship award not found', 404);
    }
  },

  async getScholarshipAwardsByStudent(context: FeeContext, studentId: string) {
    const result = await query(
      `SELECT a.id AS award_id, a.student_id, a.student_name, s.name AS scholarship_name, a.academic_year, a.status
       FROM fees_scholarship_awards a
       JOIN fees_scholarships s ON s.id = a.scholarship_id
       WHERE a.institution_id = $1 AND a.student_id = $2
       ORDER BY a.created_at DESC`,
      [context.institutionId, studentId],
    );
    return result.rows;
  },

  async listRefunds(context: FeeContext, filters: JsonMap) {
    const dynamic = buildFilters(3, [
      { enabled: Boolean(filters.student_id), sql: 'student_id = ?', value: filters.student_id },
      { enabled: Boolean(filters.status), sql: 'status = ?', value: filters.status },
      { enabled: Boolean(filters.from_date), sql: 'requested_on >= ?', value: filters.from_date },
      { enabled: Boolean(filters.to_date), sql: 'requested_on <= ?', value: filters.to_date },
    ]);
    const result = await query(
      `SELECT id AS refund_id, student_id, student_name, amount, reason, status, requested_on
       FROM fees_refunds
       WHERE institution_id = $1 AND academic_year = $2${dynamic.sql}
       ORDER BY requested_on DESC, created_at DESC`,
      [context.institutionId, context.academicYear, ...dynamic.values],
    );
    return result.rows;
  },

  async createRefund(context: FeeContext, payload: JsonMap) {
    const payment = await FeesModel.getPayment(context, String(payload.payment_id));
    if (toNumber(payload.amount, 'Amount') > toNumber(payment.amount, 'Amount')) {
      throw createError('Refund amount cannot exceed paid amount', 422);
    }

    const result = await query(
      `INSERT INTO fees_refunds (
        institution_id, academic_year, student_id, student_name, payment_id, amount, reason, bank_account
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id AS refund_id, status`,
      [context.institutionId, context.academicYear, payload.student_id, payload.student_name ?? payment.student_name ?? null, payload.payment_id, toNumber(payload.amount, 'Amount'), payload.reason, JSON.stringify(payload.bank_account ?? {})],
    );
    return result.rows[0];
  },

  async getRefund(context: FeeContext, id: string) {
    const result = await query(
      `SELECT id AS refund_id, student_id, student_name, payment_id, amount, reason, bank_account,
              status, remarks, rejection_reason, transaction_ref, processed_date, requested_on
       FROM fees_refunds
       WHERE institution_id = $1 AND academic_year = $2 AND id = $3`,
      [context.institutionId, context.academicYear, id],
    );
    if (result.rows.length === 0) {
      throw createError('Refund not found', 404);
    }
    return result.rows[0];
  },

  async approveRefund(context: FeeContext, id: string, payload: JsonMap) {
    const result = await query(
      `UPDATE fees_refunds
       SET status = 'approved', approved_by = $1, remarks = $2, updated_at = NOW()
       WHERE institution_id = $3 AND academic_year = $4 AND id = $5
       RETURNING id AS refund_id, status`,
      [payload.approved_by, payload.remarks ?? null, context.institutionId, context.academicYear, id],
    );
    if (result.rows.length === 0) {
      throw createError('Refund not found', 404);
    }
    return result.rows[0];
  },

  async rejectRefund(context: FeeContext, id: string, payload: JsonMap) {
    const result = await query(
      `UPDATE fees_refunds
       SET status = 'rejected', rejected_by = $1, rejection_reason = $2, updated_at = NOW()
       WHERE institution_id = $3 AND academic_year = $4 AND id = $5`,
      [payload.rejected_by, payload.reason, context.institutionId, context.academicYear, id],
    );
    if (result.rowCount === 0) {
      throw createError('Refund not found', 404);
    }
  },

  async processRefund(context: FeeContext, id: string, payload: JsonMap) {
    const refund = await FeesModel.getRefund(context, id);
    const result = await query(
      `UPDATE fees_refunds
       SET status = 'processed',
           processed_by = $1,
           transaction_ref = $2,
           processed_date = $3,
           updated_at = NOW()
       WHERE institution_id = $4 AND academic_year = $5 AND id = $6
       RETURNING transaction_ref`,
      [payload.processed_by, payload.transaction_ref, payload.processed_date, context.institutionId, context.academicYear, id],
    );
    if (result.rows.length === 0) {
      throw createError('Refund not found', 404);
    }

    await addHistory(context, 'refund', id, 'refund', String(payload.processed_by), { payment_id: refund.payment_id }, String(refund.student_id), toNumber(refund.amount, 'Amount'), String(payload.transaction_ref));
    return result.rows[0];
  },
};

export default FeesModel;
