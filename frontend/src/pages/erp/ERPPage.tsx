import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useERPStore } from '@/stores/erpStore';

const ModulesTab = () => <div className="p-4">Modules (Coming Soon)</div>;
const AccountsTab = () => <div className="p-4">Accounts (Coming Soon)</div>;
const InventoryTab = () => <div className="p-4">Inventory (Coming Soon)</div>;
const EmployeesTab = () => <div className="p-4">Employees (Coming Soon)</div>;
const ProcurementTab = () => <div className="p-4">Procurement (Coming Soon)</div>;

export default function ERPPage() {
  const [activeTab, setActiveTab] = useState('modules');
  const { error, clearError } = useERPStore();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header */}
      <div className="border-b border-edu-blue-200 pb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-edu-blue-600 to-edu-purple-600 bg-clip-text text-transparent mb-2">
          Enterprise Resource Planning System
        </h1>
        <p className="text-edu-gray-600">Manage modules, accounts, inventory, employees, and procurement</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-edu-rose-300 bg-edu-rose-50">
          <AlertCircle className="h-4 w-4 text-edu-rose-600" />
          <AlertDescription className="text-edu-rose-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-edu-blue-50 p-1">
          <TabsTrigger 
            value="modules"
            className="data-[state=active]:bg-edu-blue-600 data-[state=active]:text-white"
          >
            Modules
          </TabsTrigger>
          <TabsTrigger 
            value="accounts"
            className="data-[state=active]:bg-edu-purple-600 data-[state=active]:text-white"
          >
            Accounts
          </TabsTrigger>
          <TabsTrigger 
            value="inventory"
            className="data-[state=active]:bg-edu-green-600 data-[state=active]:text-white"
          >
            Inventory
          </TabsTrigger>
          <TabsTrigger 
            value="employees"
            className="data-[state=active]:bg-edu-amber-600 data-[state=active]:text-white"
          >
            Employees
          </TabsTrigger>
          <TabsTrigger 
            value="procurement"
            className="data-[state=active]:bg-edu-rose-600 data-[state=active]:text-white"
          >
            Procurement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="mt-8 space-y-6">
          <ModulesTab />
        </TabsContent>

        <TabsContent value="accounts" className="mt-8 space-y-6">
          <AccountsTab />
        </TabsContent>

        <TabsContent value="inventory" className="mt-8 space-y-6">
          <InventoryTab />
        </TabsContent>

        <TabsContent value="employees" className="mt-8 space-y-6">
          <EmployeesTab />
        </TabsContent>

        <TabsContent value="procurement" className="mt-8 space-y-6">
          <ProcurementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
