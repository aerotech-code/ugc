import { useEffect, useState } from 'react';
import { useERPStore, type ERPEmployee } from '@/stores/erpStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function EmployeesTab() {
  const { employees, loadingEmployees, fetchEmployees, createEmployee } = useERPStore();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    employeeCode: '',
    department: '',
    designation: '',
    salary: 0,
    joiningDate: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSubmit = async () => {
    await createEmployee({
      ...formData,
      joiningDate: new Date(formData.joiningDate),
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as ERPEmployee);
    setFormData({ userId: '', employeeCode: '', department: '', designation: '', salary: 0, joiningDate: '' });
    setIsOpen(false);
  };

  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'];
  const designations = ['Manager', 'Senior', 'Junior', 'Intern', 'Specialist', 'Lead'];
  const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-edu-amber-600">
          <CardHeader className="pb-2">
            <CardDescription className="text-edu-gray-600">Total Employees</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-edu-amber-900">{employees.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-edu-blue-600">
          <CardHeader className="pb-2">
            <CardDescription className="text-edu-gray-600">Total Salary Cost</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-edu-blue-900">
              ${totalSalary.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-edu-green-600">
          <CardHeader className="pb-2">
            <CardDescription className="text-edu-gray-600">Avg Salary</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-edu-green-900">
              ${employees.length > 0 ? (totalSalary / employees.length).toLocaleString('en-US', { maximumFractionDigits: 0 }) : 0}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-edu-purple-600">
          <CardHeader className="pb-2">
            <CardDescription className="text-edu-gray-600">Active</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-edu-purple-900">
              {employees.filter(e => e.active).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Header with Add Button */}
      <div className="flex justify-between items-center pt-4 border-t border-edu-amber-200">
        <div>
          <h2 className="text-2xl font-bold text-edu-amber-900">Human Resources</h2>
          <p className="text-edu-gray-600 mt-1">Manage employee records and payroll</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-edu-amber-600 hover:bg-edu-amber-700">
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Add Employee</DialogTitle>
              <DialogDescription>Register a new employee in the system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <Label className="text-edu-amber-900 font-semibold">Employee Code</Label>
                <Input
                  value={formData.employeeCode}
                  onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                  placeholder="e.g., EMP001"
                  className="mt-1 border-edu-amber-300"
                />
              </div>
              <div>
                <Label className="text-edu-amber-900 font-semibold">Department</Label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g., Engineering"
                  className="mt-1 border-edu-amber-300"
                  list="departments"
                />
                <datalist id="departments">
                  {departments.map(dept => <option key={dept} value={dept} />)}
                </datalist>
              </div>
              <div>
                <Label className="text-edu-amber-900 font-semibold">Designation</Label>
                <Input
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g., Senior Developer"
                  className="mt-1 border-edu-amber-300"
                  list="designations"
                />
                <datalist id="designations">
                  {designations.map(des => <option key={des} value={des} />)}
                </datalist>
              </div>
              <div>
                <Label className="text-edu-amber-900 font-semibold">Annual Salary</Label>
                <Input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  className="mt-1 border-edu-amber-300"
                />
              </div>
              <div>
                <Label className="text-edu-amber-900 font-semibold">Joining Date</Label>
                <Input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="mt-1 border-edu-amber-300"
                />
              </div>
              <Button onClick={handleSubmit} className="w-full bg-edu-amber-600 hover:bg-edu-amber-700">
                Add Employee
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Employees Table */}
      {loadingEmployees ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          </CardContent>
        </Card>
      ) : employees.length === 0 ? (
        <Card className="border-edu-amber-200 bg-edu-amber-50">
          <CardContent className="pt-8 text-center">
            <Users className="h-12 w-12 text-edu-amber-300 mx-auto mb-3" />
            <p className="text-edu-gray-600">No employees found. Add team members to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-edu-amber-200">
                    <TableHead className="text-edu-amber-900 font-bold">Employee Code</TableHead>
                    <TableHead className="text-edu-amber-900 font-bold">Department</TableHead>
                    <TableHead className="text-edu-amber-900 font-bold">Designation</TableHead>
                    <TableHead className="text-edu-amber-900 font-bold text-right">Salary</TableHead>
                    <TableHead className="text-edu-amber-900 font-bold">Joining Date</TableHead>
                    <TableHead className="text-edu-amber-900 font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map(employee => (
                    <TableRow key={employee.id} className="border-edu-amber-100 hover:bg-edu-amber-50">
                      <TableCell className="font-mono font-bold text-edu-amber-600">{employee.employeeCode}</TableCell>
                      <TableCell className="font-semibold text-edu-gray-900">{employee.department}</TableCell>
                      <TableCell className="text-edu-blue-700">{employee.designation}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-edu-green-700">
                        ${employee.salary.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </TableCell>
                      <TableCell className="text-sm text-edu-gray-600">
                        {new Date(employee.joiningDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${employee.active ? 'bg-edu-green-100 text-edu-green-700' : 'bg-edu-gray-100 text-edu-gray-700'}`}>
                          {employee.active ? 'Active' : 'Inactive'}
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
