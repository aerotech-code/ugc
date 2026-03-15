import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Filter,
  Clock,
  Users,
  ChevronRight,
  Plus,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useCoursesStore, useAuthStore } from '@/stores';
import { cn } from '@/lib/utils';

export function CoursesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { courses, myCourses, enrollStudent } = useCoursesStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';

  // Get unique departments
  const departments = Array.from(new Set(courses.map(c => c.department)));

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDepartment === 'all' || course.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  // Get enrolled course IDs
  const enrolledCourseIds = myCourses.map(e => e.courseId);

  const handleEnroll = async (courseId: string) => {
    if (!user) return;
    
    try {
      await enrollStudent(courseId, user.id);
      // Show success toast
    } catch {
      // Show error toast
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-edu-green-900">My Courses</h1>
          <p className="text-edu-green-600 mt-1">
            Browse and manage your course enrollments.
          </p>
        </div>
        {isTeacherOrAdmin && (
          <Button className="bg-edu-green-600 hover:bg-edu-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-edu-green-400" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-edu-green-400" />
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 border border-edu-green-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-edu-green-500"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="enrolled" className="w-full">
        <TabsList>
          <TabsTrigger value="enrolled">My Enrollments ({myCourses.length})</TabsTrigger>
          <TabsTrigger value="browse">Browse All ({filteredCourses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled" className="mt-6">
          {myCourses.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-edu-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-edu-green-500" />
              </div>
              <h3 className="text-lg font-medium text-edu-green-900 mb-1">No enrollments yet</h3>
              <p className="text-edu-green-600 mb-4">Browse available courses and start learning</p>
              <Button onClick={() => document.querySelector('[value="browse"]')?.dispatchEvent(new Event('click'))}>
                Browse Courses
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {myCourses.map((enrollment) => (
                <Card
                  key={enrollment.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/courses/${enrollment.courseId}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-edu-green-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-edu-green-600" />
                      </div>
                      <Badge variant="secondary">{enrollment.course.code}</Badge>
                    </div>

                    <h3 className="font-semibold text-edu-green-900 mb-1">{enrollment.course.title}</h3>
                    <p className="text-sm text-edu-green-600 mb-4">{enrollment.course.department}</p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-edu-green-600">Progress</span>
                        <span className="font-medium text-edu-green-900">{enrollment.progress}%</span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />

                      <div className="flex items-center gap-4 text-xs text-edu-green-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {enrollment.course.credits} credits
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {enrollment.course.enrolledStudents}/{enrollment.course.maxStudents} students
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-edu-green-100 flex items-center justify-between">
                      <span className={cn(
                        'text-xs font-medium px-2 py-1 rounded-full',
                        enrollment.status === 'active' && 'bg-edu-green-100 text-edu-green-700',
                        enrollment.status === 'completed' && 'bg-edu-blue-100 text-edu-blue-700',
                        enrollment.status === 'dropped' && 'bg-edu-rose-100 text-edu-rose-700',
                      )}>
                        {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                      </span>
                      <Button variant="ghost" size="sm" className="h-8">
                        View Details
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="browse" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCourses.map((course) => {
              const isEnrolled = enrolledCourseIds.includes(course.id);
              const isFull = course.enrolledStudents >= course.maxStudents;

              return (
                <Card key={course.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-edu-green-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-edu-green-600" />
                      </div>
                      <Badge variant="secondary">{course.code}</Badge>
                    </div>

                    <h3 className="font-semibold text-edu-green-900 mb-1">{course.title}</h3>
                    <p className="text-sm text-edu-green-600 mb-2 line-clamp-2">{course.description}</p>
                    <p className="text-xs text-edu-green-500 mb-4">{course.department}</p>

                    <div className="flex items-center gap-4 text-xs text-edu-green-600 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.credits} credits
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {course.enrolledStudents}/{course.maxStudents} students
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isEnrolled ? (
                        <Button
                          className="flex-1 bg-edu-green-600 hover:bg-edu-green-700"
                          onClick={() => navigate(`/courses/${course.id}`)}
                        >
                          Continue Learning
                        </Button>
                      ) : (
                        <Button
                          className="flex-1 bg-edu-green-600 hover:bg-edu-green-700 disabled:opacity-50"
                          disabled={isFull}
                          onClick={() => handleEnroll(course.id)}
                        >
                          {isFull ? 'Course Full' : 'Enroll Now'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-edu-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-edu-green-500" />
              </div>
              <h3 className="text-lg font-medium text-edu-green-900 mb-1">No courses found</h3>
              <p className="text-edu-green-600">Try adjusting your search or filters</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
