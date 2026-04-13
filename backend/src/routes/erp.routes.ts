import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { validateRequired, validateUUID } from '../middleware/validation.middleware.js';
import ERPModel from '../models/erp/erp.model.js';
import { ApiResponse } from '../types/index.js';
import type { ERPAccount, ERPInventory, ERPEmployee, ERPProcurement } from '../models/erp/erp.model.js';

const router = Router();

// ==================== MODULES ====================

router.post('/modules', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, description, version } = req.body;
  validateRequired(name, 'Module name');
  validateRequired(version, 'Module version');

  const module = await ERPModel.createModule(name, description || '', version);
  
  res.status(201).json(new ApiResponse(201, module, 'ERP Module created successfully'));
}));

router.get('/modules', asyncHandler(async (req: Request, res: Response) => {
  const modules = await ERPModel.getAllModules();
  res.status(200).json(new ApiResponse(200, modules, 'Modules retrieved successfully'));
}));

router.get('/modules/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  validateUUID(id, 'Module ID');

  const module = await ERPModel.getModule(id);
  res.status(200).json(new ApiResponse(200, module, 'Module retrieved successfully'));
}));

router.put('/modules/:id', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as { id: string };
  validateUUID(id, 'Module ID');

  const updated = await ERPModel.updateModule(id, req.body);
  res.status(200).json(new ApiResponse(200, updated, 'Module updated successfully'));
}));

// ==================== ACCOUNTS ====================

router.post('/accounts', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { accountCode, accountName, accountType, currency, departmentId } = req.body;
  validateRequired(accountCode, 'Account code');
  validateRequired(accountName, 'Account name');
  validateRequired(accountType, 'Account type');
  validateRequired(currency, 'Currency');

  const account = await ERPModel.createAccount(accountCode, accountName, accountType, currency, departmentId);
  res.status(201).json(new ApiResponse(201, account, 'Account created successfully'));
}));

router.get('/accounts', asyncHandler(async (req: Request, res: Response) => {
  const type = req.query.type as string | undefined;

  let accounts: ERPAccount[] = [];
  if (type) {
    accounts = await ERPModel.getAccountsByType(type);
  }

  res.status(200).json(new ApiResponse(200, accounts, 'Accounts retrieved successfully'));
}));

router.get('/accounts/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  validateUUID(id, 'Account ID');

  const account = await ERPModel.getAccount(id);
  res.status(200).json(new ApiResponse(200, account, 'Account retrieved successfully'));
}));

router.patch('/accounts/:id/balance', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const { amount } = req.body;
  validateUUID(id, 'Account ID');
  validateRequired(amount, 'Amount');

  const updated = await ERPModel.updateAccountBalance(id, amount);
  res.status(200).json(new ApiResponse(200, updated, 'Account balance updated successfully'));
}));

// ==================== INVENTORY ====================

router.post('/inventory', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { sku, productName, category, quantity, reorderLevel, unitCost, warehouseLocation } = req.body;
  validateRequired(sku, 'SKU');
  validateRequired(productName, 'Product name');
  validateRequired(category, 'Category');
  validateRequired(quantity, 'Quantity');
  validateRequired(unitCost, 'Unit cost');

  const item = await ERPModel.createInventory(sku, productName, category, quantity, reorderLevel || 10, unitCost, warehouseLocation || '');
  res.status(201).json(new ApiResponse(201, item, 'Inventory item created successfully'));
}));

router.get('/inventory', asyncHandler(async (req: Request, res: Response) => {
  const lowStock = req.query.lowStock === 'true';

  let items: ERPInventory[] = [];
  if (lowStock) {
    items = await ERPModel.getLowStockItems();
  } else {
    items = [];
  }

  res.status(200).json(new ApiResponse(200, items, 'Inventory retrieved successfully'));
}));

router.get('/inventory/:sku', asyncHandler(async (req: Request, res: Response) => {
  const { sku } = req.params as { sku: string };
  const item = await ERPModel.getInventoryBySKU(sku);
  res.status(200).json(new ApiResponse(200, item, 'Inventory item retrieved successfully'));
}));

router.patch('/inventory/:id/quantity', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const { quantity } = req.body;
  validateUUID(id, 'Inventory ID');
  validateRequired(quantity, 'Quantity');

  const updated = await ERPModel.updateInventoryQuantity(id, quantity);
  res.status(200).json(new ApiResponse(200, updated, 'Inventory quantity updated successfully'));
}));

// ==================== EMPLOYEES ====================

router.post('/employees', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId, employeeCode, department, designation, salary, joiningDate, manager } = req.body;
  validateRequired(employeeCode, 'Employee code');
  validateRequired(department, 'Department');
  validateRequired(designation, 'Designation');
  validateRequired(salary, 'Salary');

  const employee = await ERPModel.createEmployee(userId, employeeCode, department, designation, salary, new Date(joiningDate), manager);
  res.status(201).json(new ApiResponse(201, employee, 'Employee created successfully'));
}));

router.get('/employees', asyncHandler(async (req: Request, res: Response) => {
  const department = req.query.department as string;

  let employees: ERPEmployee[] = [];
  if (department) {
    employees = await ERPModel.getEmployeesByDepartment(department);
  } else {
    employees = [];
  }

  res.status(200).json(new ApiResponse(200, employees, 'Employees retrieved successfully'));
}));

router.get('/employees/:code', asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.params as { code: string };
  const employee = await ERPModel.getEmployeeByCode(code);
  res.status(200).json(new ApiResponse(200, employee, 'Employee retrieved successfully'));
}));

router.patch('/employees/:id/status', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const { status } = req.body;
  validateUUID(id, 'Employee ID');
  validateRequired(status, 'Status');

  const updated = await ERPModel.updateEmployeeStatus(id, status);
  res.status(200).json(new ApiResponse(200, updated, 'Employee status updated successfully'));
}));

// ==================== PROCUREMENT ====================

router.post('/procurement', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { vendorId, vendorName, poNumber, dueDate, items, notes } = req.body;
  validateRequired(vendorName, 'Vendor name');
  validateRequired(poNumber, 'PO number');
  validateRequired(items, 'Items');

  const po = await ERPModel.createProcurement(vendorId, vendorName, poNumber, new Date(dueDate), items, notes);
  res.status(201).json(new ApiResponse(201, po, 'Purchase order created successfully'));
}));

router.get('/procurement', asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string;

  let orders: ERPProcurement[] = [];
  if (status) {
    orders = await ERPModel.getProcurementByStatus(status);
  } else {
    orders = [];
  }

  res.status(200).json(new ApiResponse(200, orders, 'Purchase orders retrieved successfully'));
}));

router.get('/procurement/:po', asyncHandler(async (req: Request, res: Response) => {
  const { po } = req.params as { po: string };
  const order = await ERPModel.getProcurementByPO(po);
  res.status(200).json(new ApiResponse(200, order, 'Purchase order retrieved successfully'));
}));

router.patch('/procurement/:id/status', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const { status } = req.body;
  validateUUID(id, 'Order ID');
  validateRequired(status, 'Status');

  const updated = await ERPModel.updateProcurementStatus(id, status);
  res.status(200).json(new ApiResponse(200, updated, 'Purchase order status updated successfully'));
}));

export default router;
