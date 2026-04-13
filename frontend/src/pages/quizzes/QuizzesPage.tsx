import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  Search,
  Clock,
  PlayCircle,
  BarChart3,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PageSkeleton } from '@/components/common/Skeletons';
import { useAssignmentsStore, useAuthStore } from '@/stores';

export function QuizzesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { quizzes, quizAttempts, isLoading } = useAssignmentsStore();
  const [searchQuery, setSearchQuery] = useState('');

  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';

  // Filter quizzes
  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quiz.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by date
  const sortedQuizzes = filteredQuizzes.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getQuizStats = (quizId: string) => {
    const attempts = quizAttempts.filter(a => a.quizId === quizId);
    const completed = attempts.filter(a => a.submittedAt).length;
    const avgScore = attempts.length > 0
      ? Math.round(
          attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length
        )
      : 0;

    return { total: attempts.length, completed, avgScore };
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-edu-amber-900">Quizzes</h1>
          <p className="text-edu-amber-600 mt-1">Take quizzes and track your progress</p>
        </div>
        {isTeacherOrAdmin && (
          <Button
            onClick={() => navigate('/quizzes/new')}
            className="bg-edu-amber-600 hover:bg-edu-amber-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Quiz
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-edu-amber-400" />
        <Input
          placeholder="Search quizzes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quizzes Grid */}
      {sortedQuizzes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-edu-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-edu-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-edu-amber-900 mb-1">No quizzes available</h3>
          <p className="text-edu-amber-600 mb-6">Check back soon for new quizzes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sortedQuizzes.map((quiz) => {
            const stats = getQuizStats(quiz.id);
            const canAttempt = !quizAttempts.some(a => a.quizId === quiz.id && !a.submittedAt);

            return (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-edu-amber-900">{quiz.title}</CardTitle>
                      <p className="text-sm text-edu-amber-600 mt-1">{quiz.description}</p>
                    </div>
                    <Badge className="ml-2 bg-edu-amber-100 text-edu-amber-700">
                      {quiz.questions?.length || 0} Q's
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Quiz Details */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-edu-amber-600 mb-1">Time Limit</p>
                      <div className="flex items-center gap-1 text-sm font-medium text-edu-amber-900">
                        <Clock className="w-3 h-3" />
                        {quiz.timeLimit || 'No limit'}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-edu-amber-600 mb-1">Attempts</p>
                      <p className="text-sm font-medium text-edu-amber-900">{stats.total}</p>
                    </div>
                    <div>
                      <p className="text-xs text-edu-amber-600 mb-1">Avg Score</p>
                      <p className="text-sm font-medium text-edu-amber-900">{stats.avgScore}%</p>
                    </div>
                  </div>

                  {/* Progress */}
                  {!isTeacherOrAdmin && stats.total > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-edu-amber-700">Progress</p>
                        <p className="text-xs font-medium text-edu-amber-900">
                          {stats.completed} / {stats.total} completed
                        </p>
                      </div>
                      <Progress value={(stats.completed / stats.total) * 100} />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {isTeacherOrAdmin ? (
                      <>
                        <Button
                          onClick={() => navigate(`/quizzes/${quiz.id}`)}
                          variant="outline"
                          className="flex-1 border-edu-amber-200 text-edu-amber-600 hover:bg-edu-amber-50"
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          View Results
                        </Button>
                        <Button
                          onClick={() => navigate(`/quizzes/${quiz.id}/edit`)}
                          className="flex-1 bg-edu-amber-600 hover:bg-edu-amber-700"
                        >
                          Edit
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => navigate(`/quizzes/${quiz.id}`)}
                        disabled={!canAttempt}
                        className="flex-1 bg-edu-green-600 hover:bg-edu-green-700 disabled:bg-edu-gray-300"
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        {quizAttempts.some(a => a.quizId === quiz.id && a.submittedAt)
                          ? 'Retake'
                          : 'Start'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
