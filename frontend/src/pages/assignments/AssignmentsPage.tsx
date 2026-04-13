import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAssignmentsStore, useAuthStore } from '@/stores';
import { formatDate } from '@/lib/utils';

export function AssignmentsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { assignments, submissions } = useAssignmentsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';

  // Get submitted assignment IDs
  const submittedAssignmentIds = submissions.map(s => s.assignmentId);

  // Filter assignments
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.course?.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isSubmitted = submittedAssignmentIds.includes(assignment.id);
    const hasGrade = submissions.find(s => s.assignmentId === assignment.id)?.grade;
    
    let matchesStatus = true;
    if (statusFilter === 'pending') matchesStatus = !isSubmitted;
    else if (statusFilter === 'submitted') matchesStatus = isSubmitted && !hasGrade;
    else if (statusFilter === 'graded') matchesStatus = !!hasGrade;
    
    return matchesSearch && matchesStatus;
  });

  // Sort by due date
  const sortedAssignments = filteredAssignments.sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  // Separate into upcoming and past
  const now = new Date();
  const upcomingAssignments = sortedAssignments.filter(a => new Date(a.dueDate) >= now);
  const pastAssignments = sortedAssignments.filter(a => new Date(a.dueDate) < now);

  const getAssignmentStatus = (assignmentId: string) => {
    const submission = submissions.find(s => s.assignmentId === assignmentId);
    if (submission?.grade) return 'graded';
    if (submission) return 'submitted';
    return 'pending';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-edu-blue-900">Assignments</h1>
          <p className="text-edu-blue-600 mt-1">
            View and manage your course assignments.
          </p>
        </div>
        {isTeacherOrAdmin && (
          <Button className="bg-edu-blue-600 hover:bg-edu-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Assignment
          </Button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-edu-blue-400" />
          <Input
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-edu-blue-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-edu-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-edu-blue-500 bg-white text-edu-blue-900"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="graded">Graded</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastAssignments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <div className="space-y-3">
            {upcomingAssignments.map((assignment) => {
              const status = getAssignmentStatus(assignment.id);
              const daysUntil = Math.ceil((new Date(assignment.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const isUrgent = daysUntil <= 2 && status === 'pending';

              return (
                <Card
                  key={assignment.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/assignments/${assignment.id}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          status === 'graded' ? 'bg-edu-green-100' :
                          status === 'submitted' ? 'bg-edu-blue-100' :
                          isUrgent ? 'bg-edu-rose-100' : 'bg-edu-amber-100'
                        }`}>
                          {status === 'graded' ? (
                            <CheckCircle className="w-6 h-6 text-edu-green-600" />
                          ) : status === 'submitted' ? (
                            <Clock className="w-6 h-6 text-edu-blue-600" />
                          ) : isUrgent ? (
                            <AlertCircle className="w-6 h-6 text-edu-rose-600" />
                          ) : (
                            <ClipboardList className="w-6 h-6 text-edu-amber-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-edu-blue-900">{assignment.title}</h3>
                          <p className="text-sm text-edu-blue-600">{assignment.course?.title}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              Due {formatDate(assignment.dueDate)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {assignment.maxPoints} points
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {assignment.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {status === 'graded' && (
                          <Badge className="bg-edu-green-100 text-edu-green-700 hover:bg-edu-green-100">
                            Graded
                          </Badge>
                        )}
                        {status === 'submitted' && (
                          <Badge className="bg-edu-blue-100 text-edu-blue-700 hover:bg-edu-blue-100">
                            Submitted
                          </Badge>
                        )}
                        {isUrgent && status === 'pending' && (
                          <Badge className="bg-edu-rose-100 text-edu-rose-700 hover:bg-edu-rose-100">
                            {daysUntil === 0 ? 'Due Today' : 'Due Tomorrow'}
                          </Badge>
                        )}
                        <ChevronRight className="w-5 h-5 text-edu-blue-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {upcomingAssignments.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-edu-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-edu-green-500" />
                </div>
                <h3 className="text-lg font-medium text-edu-green-900 mb-1">No upcoming assignments</h3>
                <p className="text-edu-green-600">You're all caught up!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <div className="space-y-3">
            {pastAssignments.map((assignment) => {
              const status = getAssignmentStatus(assignment.id);
              const submission = submissions.find(s => s.assignmentId === assignment.id);

              return (
                <Card
                  key={assignment.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/assignments/${assignment.id}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          status === 'graded' ? 'bg-edu-green-100' :
                          status === 'submitted' ? 'bg-edu-blue-100' :
                          'bg-edu-rose-100'
                        }`}>
                          {status === 'graded' ? (
                            <CheckCircle className="w-6 h-6 text-edu-green-600" />
                          ) : status === 'submitted' ? (
                            <Clock className="w-6 h-6 text-edu-blue-600" />
                          ) : (
                            <AlertCircle className="w-6 h-6 text-edu-rose-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-edu-blue-900">{assignment.title}</h3>
                          <p className="text-sm text-edu-blue-600">{assignment.course?.title}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1 text-xs text-edu-blue-600">
                              <Calendar className="w-3 h-3" />
                              Due {formatDate(assignment.dueDate)}
                            </span>
                            <span className="text-xs text-edu-blue-600">
                              {assignment.maxPoints} points
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {status === 'graded' && submission?.grade && (
                          <div className="text-right bg-edu-green-100 px-3 py-1 rounded">
                            <span className="text-lg font-bold text-edu-green-600">
                              {submission.grade.letterGrade}
                            </span>
                            <p className="text-xs text-edu-green-700">
                              {submission.grade.points}/{submission.grade.maxPoints}
                            </p>
                          </div>
                        )}
                        {status === 'pending' && (
                          <Badge className="bg-edu-rose-100 text-edu-rose-700 hover:bg-edu-rose-100">Missing</Badge>
                        )}
                        <ChevronRight className="w-5 h-5 text-edu-blue-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {pastAssignments.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-edu-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-8 h-8 text-edu-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-edu-blue-900 mb-1">No past assignments</h3>
                <p className="text-edu-blue-600">Your assignment history will appear here</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
