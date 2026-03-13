// Staff Management Tab
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const StaffTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-gray-600 mt-1">Manage staff members, roles, and assignments</p>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Staff
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-600">156</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">82</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Administrative</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">48</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Support Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">26</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Staff</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="admin">Administration</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Staff Directory</CardTitle>
              <div className="flex gap-2 mt-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search staff..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Name</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { name: 'Dr. Rajesh Kumar', designation: 'Principal', dept: 'Administration', email: 'rajesh@institute.edu', status: 'Active' },
                      { name: 'Prof. Anjali Singh', designation: 'HOD - CSE', dept: 'Engineering', email: 'anjali@institute.edu', status: 'Active' },
                      { name: 'Mr. Suresh Patel', designation: 'Professor', dept: 'Engineering', email: 'suresh@institute.edu', status: 'Active' },
                      { name: 'Ms. Priya Sharma', designation: 'Assistant Professor', dept: 'Management', email: 'priya@institute.edu', status: 'Active' },
                    ].map((staff, idx) => (
                      <TableRow key={idx} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{staff.name}</TableCell>
                        <TableCell>{staff.designation}</TableCell>
                        <TableCell>{staff.dept}</TableCell>
                        <TableCell className="text-sm text-gray-600">{staff.email}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">{staff.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers">
          <Card>
            <CardHeader>
              <CardTitle>Teaching Staff</CardTitle>
              <div className="flex gap-2 mt-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search teachers..." className="pl-10" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">82 teaching staff members</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle>Administrative Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">48 administrative staff members</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Staff Roles & Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { role: 'Principal', permissions: 'All modules, Complete access' },
                  { role: 'HOD', permissions: 'Department, Academic, Finance modules' },
                  { role: 'Teacher', permissions: 'Student, Attendance, Marks modules' },
                  { role: 'Staff', permissions: 'Library, Transport, Hostel modules' },
                ].map((roleItem, idx) => (
                  <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{roleItem.role}</p>
                        <p className="text-sm text-gray-600">{roleItem.permissions}</p>
                      </div>
                      <Button size="sm" variant="ghost">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffTab;
