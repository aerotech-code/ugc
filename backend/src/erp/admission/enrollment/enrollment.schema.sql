CREATE TABLE IF NOT EXISTS enrollment_confirmations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL UNIQUE,
    enrollment_id VARCHAR(50) UNIQUE,
    student_name VARCHAR(255) NOT NULL,
    course VARCHAR(255) NOT NULL,
    academic_year VARCHAR(50) NOT NULL,
    fee_amount NUMERIC(12, 2) NOT NULL,
    fee_proof_url TEXT,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'initiated', 'paid', 'failed')),
    payment_reference VARCHAR(255),
    payment_gateway_txn_id VARCHAR(255),
    enrollment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (enrollment_status IN ('pending', 'approved', 'rejected')),
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fee_payment_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES enrollment_confirmations(id) ON DELETE CASCADE,
    receipt_number VARCHAR(100) NOT NULL UNIQUE,
    amount NUMERIC(12, 2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payment_mode VARCHAR(100),
    transaction_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
