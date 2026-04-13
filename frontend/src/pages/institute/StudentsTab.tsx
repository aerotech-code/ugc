// Students Management Tab
// File: src/pages/institute/StudentsTab.tsx

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInstituteStore } from '@/stores/instituteStore';
import { Plus, Search, Download, Filter } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function StudentsTab() {
  const [students, setStudents] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    student_code: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
  });

  const instituteStore = useInstituteStore();

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await instituteStore.getStudents();
        setStudents(response || []);
      } catch (error) {
        console.error('Failed to fetch students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [instituteStore]);

  const handleAddStudent = async () => {
    try {
      await instituteStore.createStudent({
        ...formData,
        user_id: Date.now().toString(),
        enrollment_status: 'active',
        enrollment_date: new Date(),
      });
      setFormData({
        student_code: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
      });
      setIsOpen(false);
      // Refetch students after adding new one
      setLoading(true);
      try {
        const response = await instituteStore.getStudents();
        setStudents(response || []);
      } catch (error) {
        console.error('Failed to fetch students:', error);
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to add student:', error);
    }
  };

  const filteredStudents = students.filter((student) =>
    `${student.first_name} ${student.last_name} ${student.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
          <p className="text-gray-600 mt-1">Manage student records, enrollment, and academic progress</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Enter student details to add them to the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="student_code">Student Code</Label>
                <Input
                  id="student_code"
                  placeholder="STU-001"
                  value={formData.student_code}
                  onChange={(e) => setFormData({ ...formData, student_code: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    placeholder="John"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>
              <Button
                onClick={handleAddStudent}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Add Student
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter and Search */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Button variant="outline" className="ml-4">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" className="ml-2">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active ({filteredStudents.filter(s => s.enrollment_status === 'active').length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({filteredStudents.filter(s => s.enrollment_status === 'inactive').length})</TabsTrigger>
          <TabsTrigger value="graduated">Graduated ({filteredStudents.filter(s => s.enrollment_status === 'graduated').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <StudentsList students={filteredStudents.filter(s => s.enrollment_status === 'active')} loading={loading} />
        </TabsContent>

        <TabsContent value="inactive">
          <StudentsList students={filteredStudents.filter(s => s.enrollment_status === 'inactive')} loading={loading} />
        </TabsContent>

        <TabsContent value="graduated">
          <StudentsList students={filteredStudents.filter(s => s.enrollment_status === 'graduated')} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface StudentsListProps {
  students: Record<string, unknown>[];
  loading: boolean;
}

const StudentsList: React.FC<StudentsListProps> = ({ students, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Loading students...</p>
        </CardContent>
      </Card>
    );
  }

  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">No students found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id as React.Key} className="hover:bg-gray-50">
                <TableCell className="font-medium text-blue-600">{String(student.student_code)}</TableCell>
                <TableCell>{`${String(student.first_name)} ${String(student.last_name)}`}</TableCell>
                <TableCell className="text-sm text-gray-600">{String(student.email)}</TableCell>
                <TableCell>{String(student.phone)}</TableCell>
                <TableCell>
                  <Badge
                    variant={student.enrollment_status === 'active' ? 'default' : 'secondary'}
                    className={student.enrollment_status === 'active' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {String(student.enrollment_status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
