import { create } from 'zustand';
import { apiCall } from '@/lib/api';

export interface ERPModule {
  id: string;
  moduleCode: string;
  moduleName: string;
  description: string;
  version: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ERPAccount {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  balance: number;
  currency: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ERPInventory {
  id: string;
  sku: string;
  productName: string;
  quantity: number;
  reorderLevel: number;
  unitPrice: number;
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
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  status: string;
  dueDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ERPStore {
  // Modules
  modules: ERPModule[];
  loadingModules: boolean;
  fetchModules: () => Promise<void>;
  createModule: (data: Omit<ERPModule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateModule: (id: string, data: Partial<ERPModule>) => Promise<void>;

  // Accounts
  accounts: ERPAccount[];
  loadingAccounts: boolean;
  fetchAccounts: () => Promise<void>;
  createAccount: (data: Omit<ERPAccount, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAccount: (id: string, data: Partial<ERPAccount>) => Promise<void>;

  // Inventory
  inventory: ERPInventory[];
  loadingInventory: boolean;
  fetchInventory: (lowStock?: boolean) => Promise<void>;
  createInventory: (data: Omit<ERPInventory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateInventoryQuantity: (id: string, quantity: number) => Promise<void>;

  // Employees
  employees: ERPEmployee[];
  loadingEmployees: boolean;
  fetchEmployees: (department?: string) => Promise<void>;
  createEmployee: (data: Omit<ERPEmployee, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEmployeeStatus: (id: string, status: boolean) => Promise<void>;

  // Procurement
  procurement: ERPProcurement[];
  loadingProcurement: boolean;
  fetchProcurement: (status?: string) => Promise<void>;
  createProcurement: (data: Omit<ERPProcurement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProcurementStatus: (id: string, status: string) => Promise<void>;

  // General
  error: string | null;
  clearError: () => void;
}

export const useERPStore = create<ERPStore>((set, get) => ({
  // Initial state
  modules: [],
  loadingModules: false,
  accounts: [],
  loadingAccounts: false,
  inventory: [],
  loadingInventory: false,
  employees: [],
  loadingEmployees: false,
  procurement: [],
  loadingProcurement: false,
  error: null,

  // Modules
  fetchModules: async () => {
    set({ loadingModules: true, error: null });
    try {
      const result = await apiCall<ERPModule[]>('GET', '/erp/modules');
      set({ modules: (result.data as ERPModule[]) || [], loadingModules: false });
    } catch (error) {
      set({ error: (error as Error).message, loadingModules: false });
    }
  },

  createModule: async (data) => {
    try {
      const result = await apiCall<ERPModule>('POST', '/erp/modules', data);
      const modules = get().modules;
      set({ modules: [...modules, (result.data as ERPModule)] });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateModule: async (id, data) => {
    try {
      const result = await apiCall<ERPModule>('PUT', `/erp/modules/${id}`, data);
      const modules = get().modules.map(m => m.id === id ? (result.data as ERPModule) : m);
      set({ modules });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // Accounts
  fetchAccounts: async () => {
    set({ loadingAccounts: true, error: null });
    try {
      const result = await apiCall<ERPAccount[]>('GET', '/erp/accounts');
      set({ accounts: (result.data as ERPAccount[]) || [], loadingAccounts: false });
    } catch (error) {
      set({ error: (error as Error).message, loadingAccounts: false });
    }
  },

  createAccount: async (data) => {
    try {
      const result = await apiCall<ERPAccount>('POST', '/erp/accounts', data);
      const accounts = get().accounts;
      set({ accounts: [...accounts, (result.data as ERPAccount)] });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateAccount: async (id, data) => {
    try {
      const result = await apiCall<ERPAccount>('PATCH', `/erp/accounts/${id}`, data);
      const accounts = get().accounts.map(a => a.id === id ? (result.data as ERPAccount) : a);
      set({ accounts });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // Inventory
  fetchInventory: async (lowStock = false) => {
    set({ loadingInventory: true, error: null });
    try {
      const url = `/erp/inventory${lowStock ? '?lowStock=true' : ''}`;
      const result = await apiCall<ERPInventory[]>('GET', url);
      set({ inventory: (result.data as ERPInventory[]) || [], loadingInventory: false });
    } catch (error) {
      set({ error: (error as Error).message, loadingInventory: false });
    }
  },

  createInventory: async (data) => {
    try {
      const result = await apiCall<ERPInventory>('POST', '/erp/inventory', data);
      const inventory = get().inventory;
      set({ inventory: [...inventory, (result.data as ERPInventory)] });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateInventoryQuantity: async (id, quantity) => {
    try {
      const result = await apiCall<ERPInventory>('PATCH', `/erp/inventory/${id}/quantity`, { quantity });
      const inventory = get().inventory.map(i => i.id === id ? (result.data as ERPInventory) : i);
      set({ inventory });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // Employees
  fetchEmployees: async (department) => {
    set({ loadingEmployees: true, error: null });
    try {
      const url = `/erp/employees${department ? `?department=${department}` : ''}`;
      const result = await apiCall<ERPEmployee[]>('GET', url);
      set({ employees: (result.data as ERPEmployee[]) || [], loadingEmployees: false });
    } catch (error) {
      set({ error: (error as Error).message, loadingEmployees: false });
    }
  },

  createEmployee: async (data) => {
    try {
      const result = await apiCall<ERPEmployee>('POST', '/erp/employees', data);
      const employees = get().employees;
      set({ employees: [...employees, (result.data as ERPEmployee)] });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateEmployeeStatus: async (id, status) => {
    try {
      const result = await apiCall<ERPEmployee>('PATCH', `/erp/employees/${id}/status`, { status });
      const employees = get().employees.map(e => e.id === id ? (result.data as ERPEmployee) : e);
      set({ employees });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // Procurement
  fetchProcurement: async (status) => {
    set({ loadingProcurement: true, error: null });
    try {
      const url = `/erp/procurement${status ? `?status=${status}` : ''}`;
      const result = await apiCall<ERPProcurement[]>('GET', url);
      set({ procurement: (result.data as ERPProcurement[]) || [], loadingProcurement: false });
    } catch (error) {
      set({ error: (error as Error).message, loadingProcurement: false });
    }
  },

  createProcurement: async (data) => {
    try {
      const result = await apiCall<ERPProcurement>('POST', '/erp/procurement', data);
      const procurement = get().procurement;
      set({ procurement: [...procurement, (result.data as ERPProcurement)] });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateProcurementStatus: async (id, status) => {
    try {
      const result = await apiCall<ERPProcurement>('PATCH', `/erp/procurement/${id}/status`, { status });
      const procurement = get().procurement.map(p => p.id === id ? (result.data as ERPProcurement) : p);
      set({ procurement });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // General
  clearError: () => set({ error: null }),
}));
