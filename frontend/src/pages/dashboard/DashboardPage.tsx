import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ClipboardList,
  FileText,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuthStore, useDashboardStore, useCoursesStore, useAssignmentsStore } from '@/stores';
import { formatRelativeTime, calculateLetterGrade } from '@/lib/utils';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { stats, fetchStats, fetchNotifications } = useDashboardStore();
  const { myCourses } = useCoursesStore();
  const { assignments, submissions } = useAssignmentsStore();

  useEffect(() => {
    if (user) {
      fetchStats(user.id);
      fetchNotifications(user.id);
    }
  }, [user, fetchStats, fetchNotifications]);

  // Get upcoming assignments
  const upcomingAssignments = assignments
    .filter(a => new Date(a.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  // Get recent grades
  const recentGrades = submissions
    .filter(s => s.grade)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-edu-blue-900">
            Welcome back, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-edu-blue-600 mt-1">
            Here's what's happening in your academic journey today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-edu-blue-50 to-edu-green-50 border border-edu-blue-200 rounded-lg">
            <Sparkles className="w-4 h-4 text-edu-blue-600" />
            <span className="text-sm font-medium text-edu-blue-700">AERO AI Active</span>
          </div>
          <Button onClick={() => navigate('/notes/new')}>
            <FileText className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-edu-blue-600">Enrolled Courses</p>
                <p className="text-3xl font-bold text-edu-blue-900 mt-1">{myCourses.length}</p>
              </div>
              <div className="w-12 h-12 bg-edu-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-edu-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-edu-green-600 font-medium">Active</span>
              <span className="text-edu-blue-300 mx-2">•</span>
              <span className="text-edu-blue-500">Spring 2024</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-edu-amber-600">Active Assignments</p>
                <p className="text-3xl font-bold text-edu-amber-900 mt-1">{upcomingAssignments.length}</p>
              </div>
              <div className="w-12 h-12 bg-edu-amber-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-edu-amber-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-edu-amber-600 font-medium">{upcomingAssignments.filter(a => {
                const daysUntil = Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return daysUntil <= 3;
              }).length} due soon</span>
              <span className="text-edu-blue-300 mx-2">•</span>
              <span className="text-edu-blue-500">Check deadlines</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-edu-green-600">Average Grade</p>
                <p className="text-3xl font-bold text-edu-green-900 mt-1">
                  {recentGrades.length > 0
                    ? Math.round(recentGrades.reduce((acc, s) => acc + (s.grade?.percentage || 0), 0) / recentGrades.length)
                    : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-edu-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-edu-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-edu-green-600 font-medium">
                {recentGrades.length > 0 ? calculateLetterGrade(recentGrades[0].grade?.percentage || 0) : 'N/A'}
              </span>
              <span className="text-edu-blue-300 mx-2">•</span>
              <span className="text-edu-blue-500">Latest grade</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-edu-purple-600">Notes Created</p>
                <p className="text-3xl font-bold text-edu-purple-900 mt-1">{stats?.notesCreated || 0}</p>
              </div>
              <div className="w-12 h-12 bg-edu-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-edu-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-edu-purple-600 font-medium">AI Powered</span>
              <span className="text-edu-blue-300 mx-2">•</span>
              <span className="text-edu-blue-500">With summaries</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Courses */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-edu-blue-900">My Courses</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/courses')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myCourses.slice(0, 3).map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center gap-4 p-4 bg-edu-blue-50 hover:bg-edu-blue-100 transition-colors cursor-pointer rounded-lg"
                  onClick={() => navigate(`/courses/${enrollment.courseId}`)}
                >
                  <div className="w-12 h-12 bg-edu-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-edu-blue-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-edu-blue-900 truncate">{enrollment.course.title}</h3>
                    <p className="text-sm text-edu-blue-600">{enrollment.course.code} • {enrollment.course.credits} credits</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-edu-blue-900">{enrollment.progress}%</span>
                    </div>
                    <Progress value={enrollment.progress} className="w-24 h-2" />
                  </div>
                </div>
              ))}
              {myCourses.length === 0 && (
                <div className="text-center py-8 text-edu-blue-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No courses enrolled yet</p>
                  <Button variant="outline" className="mt-3" onClick={() => navigate('/courses')}>
                    Browse Courses
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-edu-blue-900">Upcoming Deadlines</CardTitle>
            <Calendar className="w-5 h-5 text-edu-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAssignments.map((assignment) => {
                const daysUntil = Math.ceil((new Date(assignment.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysUntil <= 2;
                
                return (
                  <div
                    key={assignment.id}
                    className="flex items-start gap-3 p-3 border border-edu-blue-100 rounded-lg hover:bg-edu-blue-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/assignments/${assignment.id}`)}
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${isUrgent ? 'bg-edu-rose-500' : 'bg-edu-blue-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-edu-blue-900 text-sm truncate">{assignment.title}</p>
                      <p className="text-xs text-edu-blue-600">{assignment.course?.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-edu-blue-400" />
                        <span className={`text-xs ${isUrgent ? 'text-edu-rose-600 font-medium' : 'text-edu-blue-600'}`}>
                          {daysUntil === 0 ? 'Due today' : daysUntil === 1 ? 'Due tomorrow' : `${daysUntil} days left`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {upcomingAssignments.length === 0 && (
                <div className="text-center py-8 text-edu-blue-500">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming deadlines!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Grades */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-edu-blue-900">Recent Grades</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/assignments')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentGrades.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 bg-edu-blue-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      (submission.grade?.percentage || 0) >= 90 ? 'bg-edu-green-100' :
                      (submission.grade?.percentage || 0) >= 80 ? 'bg-edu-blue-100' :
                      (submission.grade?.percentage || 0) >= 70 ? 'bg-edu-amber-100' : 'bg-edu-rose-100'
                    }`}>
                      <span className={`text-lg font-bold ${
                        (submission.grade?.percentage || 0) >= 90 ? 'text-edu-green-600' :
                        (submission.grade?.percentage || 0) >= 80 ? 'text-edu-blue-600' :
                        (submission.grade?.percentage || 0) >= 70 ? 'text-edu-amber-600' : 'text-edu-rose-600'
                      }`}>
                        {submission.grade?.letterGrade}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-edu-blue-900">{submission.assignmentId}</h3>
                      <p className="text-sm text-edu-blue-600">
                        Graded {formatRelativeTime(submission.grade?.gradedAt || new Date())}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-edu-blue-900">
                      {submission.grade?.points}/{submission.grade?.maxPoints}
                    </p>
                    <p className="text-sm text-edu-blue-600">{submission.grade?.percentage}%</p>
                  </div>
                </div>
              ))}
              {recentGrades.length === 0 && (
                <div className="text-center py-8 text-edu-blue-500">
                  <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No grades yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-edu-blue-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-edu-blue-50 hover:text-edu-blue-700"
                onClick={() => navigate('/notes/new')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Create Note
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-edu-blue-50 hover:text-edu-blue-700"
                onClick={() => navigate('/courses')}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Browse Courses
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-edu-blue-50 hover:text-edu-blue-700"
                onClick={() => navigate('/sandbox')}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Open Sandbox
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-edu-blue-50 hover:text-edu-blue-700"
                onClick={() => navigate('/textbooks')}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                AI Textbook Q&A
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
