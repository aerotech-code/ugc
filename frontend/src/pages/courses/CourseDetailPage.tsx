import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  FileText,
  ClipboardList,
  Calendar,
  Download,
  MoreVertical,
  Edit3,
  Trash2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCoursesStore, useAssignmentsStore, useAuthStore } from '@/stores';
import { formatDate, formatFileSize } from '@/lib/utils';

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { courses, myCourses, fetchCourse, currentCourse } = useCoursesStore();
  const { assignments } = useAssignmentsStore();

  const [isLoading, setIsLoading] = useState(true);

  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';

  // Get course data
  const course = currentCourse || courses.find(c => c.id === id);
  const enrollment = myCourses.find(e => e.courseId === id);

  // Get course assignments
  const courseAssignments = assignments.filter(a => a.courseId === id);

  useEffect(() => {
    if (id) {
      fetchCourse(id).then(() => setIsLoading(false));
    }
  }, [id, fetchCourse]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Course Not Found</h2>
        <p className="text-gray-500 mb-4">The course you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/courses')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/courses')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
              <Badge variant="secondary">{course.code}</Badge>
            </div>
            <p className="text-gray-500">{course.department} • {course.credits} Credits</p>
          </div>
        </div>

        {isTeacherOrAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Course
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Course
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Course Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Enrolled</p>
              <p className="text-lg font-semibold">{course.enrolledStudents}/{course.maxStudents}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Assignments</p>
              <p className="text-lg font-semibold">{courseAssignments.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Materials</p>
              <p className="text-lg font-semibold">{course.materials.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress (for enrolled students) */}
      {enrollment && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Your Progress</h3>
              <span className="text-2xl font-bold text-blue-600">{enrollment.progress}%</span>
            </div>
            <Progress value={enrollment.progress} className="h-3" />
            <p className="text-sm text-gray-500 mt-3">
              Keep going! You're making great progress in this course.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About This Course</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{course.description}</p>
            </CardContent>
          </Card>

          {/* Syllabus */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Syllabus</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{course.syllabus}</p>
            </CardContent>
          </Card>

          {/* Instructor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Instructor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <img
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  className="w-12 h-12 rounded-full bg-gray-100"
                />
                <div>
                  <p className="font-medium text-gray-900">{course.instructor.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{course.instructor.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Course Materials</CardTitle>
              {isTeacherOrAdmin && (
                <Button size="sm">
                  Upload Material
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {course.materials.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No materials uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {course.materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{material.title}</p>
                          <p className="text-xs text-gray-500">
                            {material.type.toUpperCase()} • {formatFileSize(material.size || 0)}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Assignments</CardTitle>
              {isTeacherOrAdmin && (
                <Button size="sm">
                  Create Assignment
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {courseAssignments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No assignments yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {courseAssignments.map((assignment) => {
                    const isOverdue = new Date(assignment.dueDate) < new Date();
                    
                    return (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => navigate(`/assignments/${assignment.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isOverdue ? 'bg-red-100' : 'bg-blue-100'
                          }`}>
                            <ClipboardList className={`w-5 h-5 ${isOverdue ? 'text-red-600' : 'text-blue-600'}`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{assignment.title}</p>
                            <p className="text-xs text-gray-500">
                              Due {formatDate(assignment.dueDate)} • {assignment.maxPoints} points
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isOverdue && (
                            <Badge variant="destructive">Overdue</Badge>
                          )}
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Class Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {course.schedule.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No schedule available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {course.schedule.map((session, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{session.day}</p>
                          <Badge variant="secondary" className="text-xs">
                            {session.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {session.startTime} - {session.endTime}
                        </p>
                        <p className="text-sm text-gray-500">Room: {session.room}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
