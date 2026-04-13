// Institute Management Page
// File: src/pages/institute/InstitutePage.tsx

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users2,
  BookOpen,
  GraduationCap,
  DollarSign,
  BookMarked,
  Bus,
  Building2,
  Users
} from 'lucide-react';
const StudentsTab = () => <div className="p-4">Students (Coming Soon)</div>;
const AcademicTab = () => <div className="p-4">Academic Management (Coming Soon)</div>;
const FinanceTab = () => <div className="p-4">Finance Management (Coming Soon)</div>;
const LibraryTab = () => <div className="p-4">Library Management (Coming Soon)</div>;
const StaffTab = () => <div className="p-4">Staff Management (Coming Soon)</div>;
const TransportTab = () => <div className="p-4">Transport Management (Coming Soon)</div>;
const HostelTab = () => <div className="p-4">Hostel Management (Coming Soon)</div>;

const InstitutePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('students');

  const tabs = [
    {
      value: 'students',
      label: 'Students',
      icon: <Users2 className="w-4 h-4" />,
      description: 'Student management, enrollment, attendance'
    },
    {
      value: 'academic',
      label: 'Academic',
      icon: <BookOpen className="w-4 h-4" />,
      description: 'Programs, courses, curriculum, timetable'
    },
    {
      value: 'finance',
      label: 'Finance',
      icon: <DollarSign className="w-4 h-4" />,
      description: 'Fee management, payments, financial reports'
    },
    {
      value: 'library',
      label: 'Library',
      icon: <BookMarked className="w-4 h-4" />,
      description: 'Books, borrowing, members'
    },
    {
      value: 'transport',
      label: 'Transport',
      icon: <Bus className="w-4 h-4" />,
      description: 'Routes, vehicles, drivers'
    },
    {
      value: 'hostel',
      label: 'Hostel',
      icon: <Building2 className="w-4 h-4" />,
      description: 'Hostels, rooms, allocations'
    },
    {
      value: 'staff',
      label: 'Staff',
      icon: <Users className="w-4 h-4" />,
      description: 'Staff management, roles, assignments'
    }
  ];

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Institute Management System</h1>
          </div>
          <p className="text-gray-600">Comprehensive management for all institute operations</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">1,234</div>
              <p className="text-xs text-gray-500 mt-1">↑ 12% from last year</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Staff Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">156</div>
              <p className="text-xs text-gray-500 mt-1">Teachers & Support Staff</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">₹24.5L</div>
              <p className="text-xs text-gray-500 mt-1">Outstanding amount</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Books In Library</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">8,421</div>
              <p className="text-xs text-gray-500 mt-1">7,890 available</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="bg-white">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium transition-colors hover:text-blue-600 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                >
                  {tab.icon}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="students" className="mt-0 p-6">
              <StudentsTab />
            </TabsContent>

            <TabsContent value="academic" className="mt-0 p-6">
              <AcademicTab />
            </TabsContent>

            <TabsContent value="finance" className="mt-0 p-6">
              <FinanceTab />
            </TabsContent>

            <TabsContent value="library" className="mt-0 p-6">
              <LibraryTab />
            </TabsContent>

            <TabsContent value="transport" className="mt-0 p-6">
              <TransportTab />
            </TabsContent>

            <TabsContent value="hostel" className="mt-0 p-6">
              <HostelTab />
            </TabsContent>

            <TabsContent value="staff" className="mt-0 p-6">
              <StaffTab />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default InstitutePage;
