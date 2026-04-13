import { useState } from 'react';
import {
  User,
  Mail,
  GraduationCap,
  Calendar,
  Award,
  BookOpen,
  TrendingUp,
  Edit3,
  Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore, useCoursesStore, useAssignmentsStore } from '@/stores';
import { formatDate, calculateGPA, getInitials } from '@/lib/utils';

export function ProfilePage() {
  const { user } = useAuthStore();
  const { myCourses } = useCoursesStore();
  const { submissions } = useAssignmentsStore();
  const [isEditing, setIsEditing] = useState(false);

  // Calculate stats
  const completedCourses = myCourses.filter(c => c.status === 'completed').length;
  const gradedSubmissions = submissions.filter(s => s.grade);
  const averageGrade = gradedSubmissions.length > 0
    ? gradedSubmissions.reduce((acc, s) => acc + (s.grade?.percentage || 0), 0) / gradedSubmissions.length
    : 0;
  const gpa = calculateGPA(gradedSubmissions.map(s => ({
    points: s.grade?.points || 0,
    maxPoints: s.grade?.maxPoints || 100,
  })));

  // Mock skills data
  const skills = [
    { name: 'Python Programming', level: 85, category: 'Technical' },
    { name: 'Data Analysis', level: 70, category: 'Technical' },
    { name: 'Machine Learning', level: 60, category: 'Technical' },
    { name: 'Communication', level: 90, category: 'Soft Skills' },
    { name: 'Problem Solving', level: 80, category: 'Soft Skills' },
  ];

  // Mock achievements
  const achievements = [
    { title: 'Dean\'s List', date: 'Fall 2023', description: 'Achieved GPA of 3.8 or higher' },
    { title: 'Perfect Attendance', date: 'Spring 2024', description: '100% attendance in all courses' },
    { title: 'Hackathon Winner', date: 'Jan 2024', description: 'First place in campus hackathon' },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-edu-blue-600 to-edu-purple-600 text-white">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-edu-blue-600">{getInitials(user?.name || '')}</span>
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <p className="text-edu-blue-100">{user?.email}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                <Badge className="bg-edu-blue-600/50 text-white border-0">
                  <GraduationCap className="w-3 h-3 mr-1" />
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}
                </Badge>
                <Badge className="bg-white/20 text-white border-0">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Computer Science
                </Badge>
                <Badge className="bg-white/20 text-white border-0">
                  <Calendar className="w-3 h-3 mr-1" />
                  Class of 2025
                </Badge>
              </div>
            </div>
            <Button
              variant="secondary"
              className="bg-white/20 text-white hover:bg-white/30 border-0 hover:bg-edu-blue-700/40"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-edu-blue-600">{myCourses.length}</p>
            <p className="text-sm text-edu-blue-500">Courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-edu-green-600">{completedCourses}</p>
            <p className="text-sm text-edu-green-500">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-edu-purple-600">{Math.round(averageGrade)}%</p>
            <p className="text-sm text-edu-purple-500">Avg. Grade</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-edu-amber-600">{gpa}</p>
            <p className="text-sm text-edu-amber-500">GPA</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-edu-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-edu-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-edu-blue-500">Full Name</p>
                    <p className="font-medium text-edu-blue-900">{user?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-edu-green-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-edu-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-edu-green-500">Email</p>
                    <p className="font-medium text-edu-green-900">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-edu-purple-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-edu-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-edu-purple-500">Role</p>
                    <p className="font-medium capitalize text-edu-purple-900">{user?.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-edu-amber-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-edu-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-edu-amber-500">Member Since</p>
                    <p className="font-medium text-edu-amber-900">{user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {gradedSubmissions.slice(0, 3).map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-3 bg-edu-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        (submission.grade?.percentage || 0) >= 90 ? 'bg-edu-green-100' :
                        (submission.grade?.percentage || 0) >= 80 ? 'bg-edu-blue-100' :
                        'bg-edu-amber-100'
                      }`}>
                        <TrendingUp className={`w-5 h-5 ${
                          (submission.grade?.percentage || 0) >= 90 ? 'text-edu-green-600' :
                          (submission.grade?.percentage || 0) >= 80 ? 'text-edu-blue-600' :
                          'text-edu-amber-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-edu-blue-900">Assignment Graded</p>
                        <p className="text-xs text-edu-blue-600">{formatDate(submission.submittedAt)}</p>
                      </div>
                    </div>
                    <Badge className={(submission.grade?.percentage || 0) >= 90 ? 'bg-edu-green-100 text-edu-green-700' : 'bg-edu-blue-100 text-edu-blue-700'}>
                      {submission.grade?.letterGrade}
                    </Badge>
                  </div>
                ))}
                {gradedSubmissions.length === 0 && (
                  <p className="text-center text-edu-blue-600 py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skills & Competencies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{skill.name}</span>
                        <Badge variant="secondary" className="text-xs">{skill.category}</Badge>
                      </div>
                      <span className="text-sm text-gray-500">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <Card key={index}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-edu-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-edu-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-edu-amber-900">{achievement.title}</h3>
                      <p className="text-sm text-edu-amber-600">{achievement.date}</p>
                      <p className="text-sm text-edu-amber-700 mt-1">{achievement.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
