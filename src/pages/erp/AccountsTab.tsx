import { useEffect, useState } from 'react';
import { useERPStore, type ERPAccount } from '@/stores/erpStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AccountsTab() {
  const { accounts, loadingAccounts, fetchAccounts, createAccount } = useERPStore();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    accountCode: '',
    accountName: '',
    accountType: 'Asset',
    balance: 0,
    currency: 'USD',
  });

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleSubmit = async () => {
    await createAccount({
      ...formData,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as ERPAccount);
    setFormData({ accountCode: '', accountName: '', accountType: 'Asset', balance: 0, currency: 'USD' });
    setIsOpen(false);
  };

  const accountTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-edu-purple-600">
          <CardHeader className="pb-2">
            <CardDescription className="text-edu-gray-600">Total Balance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-edu-purple-900">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-edu-blue-600">
          <CardHeader className="pb-2">
            <CardDescription className="text-edu-gray-600">Active Accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-edu-blue-900">{accounts.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-edu-green-600">
          <CardHeader className="pb-2">
            <CardDescription className="text-edu-gray-600">Assets</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-edu-green-900">
              ${accounts.filter(a => a.accountType === 'Asset').reduce((sum, a) => sum + a.balance, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-edu-rose-600">
          <CardHeader className="pb-2">
            <CardDescription className="text-edu-gray-600">Liabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-edu-rose-900">
              ${accounts.filter(a => a.accountType === 'Liability').reduce((sum, a) => sum + a.balance, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Header with Add Button */}
      <div className="flex justify-between items-center pt-4 border-t border-edu-purple-200">
        <div>
          <h2 className="text-2xl font-bold text-edu-purple-900">General Ledger Accounts</h2>
          <p className="text-edu-gray-600 mt-1">Manage your chart of accounts</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-edu-purple-600 hover:bg-edu-purple-700">
              <Plus className="h-4 w-4" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Create Account</DialogTitle>
              <DialogDescription>Add a new general ledger account</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-edu-purple-900 font-semibold">Account Code</Label>
                <Input
                  value={formData.accountCode}
                  onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
                  placeholder="e.g., 1000"
                  className="mt-1 border-edu-purple-300"
                />
              </div>
              <div>
                <Label className="text-edu-purple-900 font-semibold">Account Name</Label>
                <Input
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  placeholder="e.g., Cash"
                  className="mt-1 border-edu-purple-300"
                />
              </div>
              <div>
                <Label className="text-edu-purple-900 font-semibold">Account Type</Label>
                <Select value={formData.accountType} onValueChange={(val) => setFormData({ ...formData, accountType: val })}>
                  <SelectTrigger className="border-edu-purple-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-edu-purple-900 font-semibold">Initial Balance</Label>
                <Input
                  type="number"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  className="mt-1 border-edu-purple-300"
                />
              </div>
              <Button onClick={handleSubmit} className="w-full bg-edu-purple-600 hover:bg-edu-purple-700">
                Create Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Accounts Table */}
      {loadingAccounts ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          </CardContent>
        </Card>
      ) : accounts.length === 0 ? (
        <Card className="border-edu-purple-200 bg-edu-purple-50">
          <CardContent className="pt-8 text-center">
            <p className="text-edu-gray-600">No accounts found. Create one to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-edu-purple-200">
                    <TableHead className="text-edu-purple-900 font-bold">Code</TableHead>
                    <TableHead className="text-edu-purple-900 font-bold">Name</TableHead>
                    <TableHead className="text-edu-purple-900 font-bold">Type</TableHead>
                    <TableHead className="text-edu-purple-900 font-bold text-right">Balance</TableHead>
                    <TableHead className="text-edu-purple-900 font-bold">Currency</TableHead>
                    <TableHead className="text-edu-purple-900 font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map(account => (
                    <TableRow key={account.id} className="border-edu-purple-100 hover:bg-edu-purple-50">
                      <TableCell className="font-mono font-bold text-edu-purple-600">{account.accountCode}</TableCell>
                      <TableCell className="font-semibold text-edu-gray-900">{account.accountName}</TableCell>
                      <TableCell>
                        <span className="text-xs px-2 py-1 rounded-full bg-edu-blue-100 text-edu-blue-700 font-semibold">
                          {account.accountType}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        <span className={account.balance >= 0 ? 'text-edu-green-700' : 'text-edu-rose-700'}>
                          ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono">{account.currency}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${account.active ? 'bg-edu-green-100 text-edu-green-700' : 'bg-edu-gray-100 text-edu-gray-700'}`}>
                          {account.active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
