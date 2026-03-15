CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS fees_payroll_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  employee_id UUID NOT NULL,
  employee_name VARCHAR(255),
  department_id UUID,
  month VARCHAR(7) NOT NULL,
  gross_salary NUMERIC(12, 2) NOT NULL DEFAULT 0,
  deductions JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_deductions NUMERIC(12, 2) NOT NULL DEFAULT 0,
  net_salary NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid')),
  processed_date DATE,
  remarks TEXT,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (institution_id, academic_year, employee_id, month)
);

CREATE TABLE IF NOT EXISTS fees_scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(30) NOT NULL CHECK (category IN ('merit', 'need-based', 'sports', 'govt')),
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_value NUMERIC(12, 2) NOT NULL,
  eligibility_criteria TEXT,
  max_beneficiaries INTEGER,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fees_fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  course_id UUID NOT NULL,
  batch_id UUID,
  course_name VARCHAR(255),
  academic_year VARCHAR(20) NOT NULL,
  total_fees NUMERIC(12, 2) NOT NULL DEFAULT 0,
  effective_date DATE,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (institution_id, course_id, batch_id, academic_year)
);

CREATE TABLE IF NOT EXISTS fees_fee_structure_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_structure_id UUID NOT NULL REFERENCES fees_fee_structures(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  mandatory BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fees_fee_structure_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_structure_id UUID NOT NULL REFERENCES fees_fee_structures(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  due_date DATE NOT NULL,
  percentage NUMERIC(6, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fees_scholarship_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  student_id UUID NOT NULL,
  student_name VARCHAR(255),
  scholarship_id UUID NOT NULL REFERENCES fees_scholarships(id),
  academic_year VARCHAR(20) NOT NULL,
  approved_by UUID,
  remarks TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  revoke_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fees_payment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  student_id UUID NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  gateway VARCHAR(50) NOT NULL,
  callback_url TEXT,
  payment_url TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'completed', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fees_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  student_id UUID NOT NULL,
  student_name VARCHAR(255),
  fee_structure_id UUID REFERENCES fees_fee_structures(id),
  installment_id UUID,
  amount NUMERIC(12, 2) NOT NULL,
  payment_mode VARCHAR(20) NOT NULL CHECK (payment_mode IN ('online', 'offline', 'cheque', 'dd')),
  payment_gateway VARCHAR(50),
  transaction_ref VARCHAR(255) UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'pending', 'failed')),
  remarks TEXT,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fees_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  payment_id UUID NOT NULL UNIQUE REFERENCES fees_payments(id) ON DELETE CASCADE,
  receipt_number VARCHAR(50) NOT NULL UNIQUE,
  student_id UUID NOT NULL,
  student_name VARCHAR(255),
  amount NUMERIC(12, 2) NOT NULL,
  payment_mode VARCHAR(20) NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  cancellation_reason TEXT,
  cancelled_by UUID
);

CREATE TABLE IF NOT EXISTS fees_receipt_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES fees_receipts(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  action_by VARCHAR(255) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fees_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  student_id UUID NOT NULL,
  student_name VARCHAR(255),
  payment_id UUID REFERENCES fees_payments(id),
  amount NUMERIC(12, 2) NOT NULL,
  reason TEXT NOT NULL,
  bank_account JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processed', 'rejected')),
  approved_by UUID,
  rejected_by UUID,
  processed_by UUID,
  remarks TEXT,
  rejection_reason TEXT,
  transaction_ref VARCHAR(255),
  processed_date DATE,
  requested_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fees_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  academic_year VARCHAR(20),
  student_id UUID,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  type VARCHAR(30) NOT NULL,
  amount NUMERIC(12, 2),
  reference VARCHAR(255),
  performed_by VARCHAR(255) NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fees_payroll_institution_year ON fees_payroll_records(institution_id, academic_year);
CREATE INDEX IF NOT EXISTS idx_fees_payroll_status ON fees_payroll_records(status);
CREATE INDEX IF NOT EXISTS idx_fees_scholarships_category ON fees_scholarships(category);
CREATE INDEX IF NOT EXISTS idx_fees_structures_filter ON fees_fee_structures(institution_id, academic_year, course_id, batch_id);
CREATE INDEX IF NOT EXISTS idx_fees_awards_student ON fees_scholarship_awards(student_id, academic_year, status);
CREATE INDEX IF NOT EXISTS idx_fees_payments_student ON fees_payments(student_id, academic_year, status);
CREATE INDEX IF NOT EXISTS idx_fees_receipts_student ON fees_receipts(student_id, issued_at);
CREATE INDEX IF NOT EXISTS idx_fees_refunds_status ON fees_refunds(status, requested_on);
CREATE INDEX IF NOT EXISTS idx_fees_history_lookup ON fees_history(institution_id, student_id, type, created_at);
