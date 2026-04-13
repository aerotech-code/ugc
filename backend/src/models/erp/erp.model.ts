import { query } from '../../db/postgres.js';
import { ApiError } from '../../utils/apiError.js';

export interface ERPModule {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ERPAccount {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  balance: number;
  currency: string;
  departmentId?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ERPInventory {
  id: string;
  sku: string;
  productName: string;
  category: string;
  quantity: number;
  reorderLevel: number;
  unitCost: number;
  lastRestockDate: Date;
  warehouseLocation: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ERPEmployee {
  id: string;
  userId: string;
  employeeCode: string;
  department: string;
  designation: string;
  salary: number;
  status: 'active' | 'inactive' | 'on_leave';
  joiningDate: Date;
  manager?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ERPProcurement {
  id: string;
  vendorId: string;
  vendorName: string;
  poNumber: string;
  orderDate: Date;
  dueDate: Date;
  totalAmount: number;
  status: 'draft' | 'pending' | 'approved' | 'received' | 'cancelled';
  items: ProcurementItem[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcurementItem {
  itemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// ERP Module Operations
export const ERPModel = {
  // Modules
  async createModule(name: string, description: string, version: string): Promise<ERPModule> {
    const result = await query(
      `INSERT INTO erp_modules (name, description, version, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [name, description, version, 'active']
    );
    return result.rows[0];
  },

  async getModule(id: string): Promise<ERPModule> {
    const result = await query(
      'SELECT * FROM erp_modules WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      throw new ApiError(404, 'ERP Module not found');
    }
    return result.rows[0];
  },

  async getAllModules(): Promise<ERPModule[]> {
    const result = await query('SELECT * FROM erp_modules WHERE status = $1 ORDER BY name', ['active']);
    return result.rows;
  },

  async updateModule(id: string, updates: Partial<ERPModule>): Promise<ERPModule> {
    const fields: string[] = [];
    const values: (string | number | boolean)[] = [];
    let paramCount = 1;

    if (updates.name) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.description) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }
    if (updates.status) {
      fields.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE erp_modules SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'ERP Module not found');
    }
    return result.rows[0];
  },

  // Accounts
  async createAccount(
    accountCode: string,
    accountName: string,
    accountType: string,
    currency: string,
    departmentId?: string
  ): Promise<ERPAccount> {
    const result = await query(
      `INSERT INTO erp_accounts (account_code, account_name, account_type, balance, currency, department_id, active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [accountCode, accountName, accountType, 0, currency, departmentId || null, true]
    );
    return result.rows[0];
  },

  async getAccount(id: string): Promise<ERPAccount> {
    const result = await query(
      'SELECT * FROM erp_accounts WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Account not found');
    }
    return result.rows[0];
  },

  async getAccountsByType(accountType: string): Promise<ERPAccount[]> {
    const result = await query(
      'SELECT * FROM erp_accounts WHERE account_type = $1 AND active = true ORDER BY account_name',
      [accountType]
    );
    return result.rows;
  },

  async updateAccountBalance(id: string, amount: number): Promise<ERPAccount> {
    const result = await query(
      `UPDATE erp_accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [amount, id]
    );
    return result.rows[0];
  },

  // Inventory
  async createInventory(
    sku: string,
    productName: string,
    category: string,
    quantity: number,
    reorderLevel: number,
    unitCost: number,
    warehouseLocation: string
  ): Promise<ERPInventory> {
    const result = await query(
      `INSERT INTO erp_inventory (sku, product_name, category, quantity, reorder_level, unit_cost, warehouse_location, active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [sku, productName, category, quantity, reorderLevel, unitCost, warehouseLocation, true]
    );
    return result.rows[0];
  },

  async getInventoryBySKU(sku: string): Promise<ERPInventory> {
    const result = await query(
      'SELECT * FROM erp_inventory WHERE sku = $1',
      [sku]
    );
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Product not found');
    }
    return result.rows[0];
  },

  async getLowStockItems(): Promise<ERPInventory[]> {
    const result = await query(
      'SELECT * FROM erp_inventory WHERE quantity <= reorder_level AND active = true ORDER BY product_name'
    );
    return result.rows;
  },

  async updateInventoryQuantity(id: string, quantity: number): Promise<ERPInventory> {
    const result = await query(
      `UPDATE erp_inventory SET quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [quantity, id]
    );
    return result.rows[0];
  },

  // Employees
  async createEmployee(
    userId: string,
    employeeCode: string,
    department: string,
    designation: string,
    salary: number,
    joiningDate: Date,
    manager?: string
  ): Promise<ERPEmployee> {
    const result = await query(
      `INSERT INTO erp_employees (user_id, employee_code, department, designation, salary, joining_date, manager, status, active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [userId, employeeCode, department, designation, salary, joiningDate, manager || null, 'active', true]
    );
    return result.rows[0];
  },

  async getEmployeeByCode(employeeCode: string): Promise<ERPEmployee> {
    const result = await query(
      'SELECT * FROM erp_employees WHERE employee_code = $1',
      [employeeCode]
    );
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Employee not found');
    }
    return result.rows[0];
  },

  async getEmployeesByDepartment(department: string): Promise<ERPEmployee[]> {
    const result = await query(
      'SELECT * FROM erp_employees WHERE department = $1 AND status = $2 AND active = true ORDER BY designation',
      [department, 'active']
    );
    return result.rows;
  },

  async updateEmployeeStatus(id: string, status: string): Promise<ERPEmployee> {
    const result = await query(
      `UPDATE erp_employees SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  },

  // Procurement
  async createProcurement(
    vendorId: string,
    vendorName: string,
    poNumber: string,
    dueDate: Date,
    items: ProcurementItem[],
    notes?: string
  ): Promise<ERPProcurement> {
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    const result = await query(
      `INSERT INTO erp_procurement (vendor_id, vendor_name, po_number, order_date, due_date, total_amount, status, notes, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [vendorId, vendorName, poNumber, dueDate, totalAmount, 'draft', notes || null]
    );

    return result.rows[0] as ERPProcurement;
  },

  async getProcurementByPO(poNumber: string): Promise<ERPProcurement> {
    const result = await query(
      'SELECT * FROM erp_procurement WHERE po_number = $1',
      [poNumber]
    );
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Purchase order not found');
    }
    return result.rows[0];
  },

  async getProcurementByStatus(status: string): Promise<ERPProcurement[]> {
    const result = await query(
      'SELECT * FROM erp_procurement WHERE status = $1 ORDER BY order_date DESC',
      [status]
    );
    return result.rows;
  },

  async updateProcurementStatus(id: string, status: string): Promise<ERPProcurement> {
    const result = await query(
      `UPDATE erp_procurement SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  },
};

export default ERPModel;
