import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ClipboardList,
  Clock,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Download,
  Send,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useAssignmentsStore, useAuthStore } from '@/stores';
import { formatDate, formatFileSize } from '@/lib/utils';
import { toast } from 'sonner';

export function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    assignments,
    submissions,
    submitAssignment,
    checkPlagiarism,
    error,
    clearError,
  } = useAssignmentsStore();

  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
  const [plagiarismScore, setPlagiarismScore] = useState<number | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';

  // Get assignment data
  const assignment = assignments.find(a => a.id === id);
  const submission = submissions.find(s => s.assignmentId === id);
  const hasSubmitted = !!submission;
  const isGraded = !!submission?.grade;

  if (!id || !assignment) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Assignment Not Found</h2>
        <p className="text-gray-500 mb-4">The assignment you're looking for doesn't exist.</p>
        <Button 
          onClick={() => navigate('/assignments')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Assignments
        </Button>
      </div>
    );
  }

  const isOverdue = new Date(assignment.dueDate) < new Date();
  const daysUntil = Math.ceil(
    (new Date(assignment.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Prevent duplicates
      const uniqueFiles = newFiles.filter(
        nf => !files.some(f => f.name === nf.name && f.size === nf.size)
      );
      setFiles([...files, ...uniqueFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) {
      toast.error('Please add some content or upload files');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await submitAssignment(id!, content, files);
      
      if (success) {
        toast.success('Assignment submitted successfully!');
        setContent('');
        setFiles([]);
        // Refresh assignments
        setTimeout(() => navigate('/assignments'), 500);
      } else {
        toast.error(error || 'Failed to submit assignment');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
      clearError();
    }
  };

  const handleCheckPlagiarism = async () => {
    if (!submission?.id) return;
    
    setIsCheckingPlagiarism(true);
    try {
      const score = await checkPlagiarism(submission.id);
      if (score !== null) {
        setPlagiarismScore(score);
        toast.success(`Plagiarism check complete: ${score}%`);
      } else {
        toast.error('Failed to check plagiarism');
      }
    } finally {
      setIsCheckingPlagiarism(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/assignments')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
          <p className="text-gray-500 mt-1">{assignment.course.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assignment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                Assignment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{assignment.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Type</p>
                  <Badge className="bg-blue-100 text-blue-700">
                    {assignment.type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Max Points</p>
                  <p className="font-semibold text-gray-900">{assignment.maxPoints}</p>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Due Date</p>
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  isOverdue ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
                }`}>
                  <Clock className={`w-4 h-4 ${isOverdue ? 'text-red-600' : 'text-green-600'}`} />
                  <div>
                    <p className={`font-semibold ${isOverdue ? 'text-red-900' : 'text-green-900'}`}>
                      {formatDate(new Date(assignment.dueDate))}
                    </p>
                    <p className={`text-sm ${isOverdue ? 'text-red-700' : 'text-green-700'}`}>
                      {isOverdue 
                        ? `Overdue by ${Math.abs(daysUntil)} days` 
                        : `${daysUntil} days remaining`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Attachments */}
              {assignment.attachments && assignment.attachments.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Provided Materials</h3>
                  <div className="space-y-2">
                    {assignment.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-blue-600" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{att.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(att.size || 0)}</p>
                        </div>
                        <Download className="w-4 h-4 text-gray-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submission Section */}
          {!isTeacherOrAdmin && !isGraded && !isOverdue && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-green-600" />
                  Submit Your Work
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Your Submission
                  </label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your answer or paste your work here..."
                    className="min-h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Upload Files
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop your files here, or
                    </p>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      size="sm"
                    >
                      Select Files
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>

                {files.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Selected Files ({files.length})
                    </h3>
                    <div className="space-y-2">
                      {files.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFile(idx)}
                            className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <Button
                  onClick={() => setShowConfirmSubmit(true)}
                  disabled={isSubmitting || (!content.trim() && files.length === 0)}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Assignment
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Submission View */}
          {hasSubmitted && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Your Submission
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Submitted On</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(new Date(submission!.submittedAt))}
                  </p>
                </div>

                {submission!.content && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Content</p>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-wrap">{submission!.content}</p>
                    </div>
                  </div>
                )}

                {isGraded && submission!.grade && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-600 mb-1">Grade</p>
                    <p className="text-2xl font-bold text-blue-900 mb-2">
                      {submission!.grade!.points} / {assignment.maxPoints}
                    </p>
                    {submission!.grade.feedback && (
                      <div>
                        <p className="text-sm font-semibold text-blue-900 mb-1">Feedback</p>
                        <p className="text-sm text-blue-700">{submission!.grade.feedback}</p>
                      </div>
                    )}
                  </div>
                )}

                {!isGraded && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700">
                      ⏳ Waiting for teacher feedback...
                    </p>
                  </div>
                )}

                {isTeacherOrAdmin && (
                  <Button
                    onClick={handleCheckPlagiarism}
                    disabled={isCheckingPlagiarism}
                    variant="outline"
                    className="w-full"
                  >
                    {isCheckingPlagiarism ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking Plagiarism...
                      </>
                    ) : (
                      'Check Plagiarism'
                    )}
                  </Button>
                )}

                {plagiarismScore !== null && (
                  <div className={`p-3 rounded-lg ${
                    plagiarismScore > 30 
                      ? 'bg-red-50 border border-red-200' 
                      : plagiarismScore > 10 
                      ? 'bg-amber-50 border border-amber-200'
                      : 'bg-green-50 border border-green-200'
                  }`}>
                    <p className="text-sm font-semibold mb-2">
                      Plagiarism Score: {plagiarismScore}%
                    </p>
                    <Progress 
                      value={plagiarismScore} 
                      className={plagiarismScore > 30 ? 'bg-red-200' : plagiarismScore > 10 ? 'bg-amber-200' : 'bg-green-200'}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Status & Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Submission</p>
                <Badge className={
                  hasSubmitted 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }>
                  {hasSubmitted ? 'Submitted' : 'Not Submitted'}
                </Badge>
              </div>

              {isGraded && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Grade</p>
                  <div className="text-2xl font-bold text-blue-600">
                    {submission!.grade!.points}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Course Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Instructor</p>
                <p className="font-medium text-gray-900">{assignment.course.instructor.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Course Code</p>
                <p className="font-medium text-gray-900">{assignment.course.code}</p>
              </div>
              <div>
                <p className="text-gray-500">Department</p>
                <p className="font-medium text-gray-900">{assignment.course.department}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm Submit Dialog */}
      <ConfirmDialog
        open={showConfirmSubmit}
        title="Submit Assignment?"
        description="Once submitted, you won't be able to edit your submission. Are you sure?"
        confirmText="Submit"
        cancelText="Cancel"
        isLoading={isSubmitting}
        onConfirm={handleSubmit}
        onCancel={() => setShowConfirmSubmit(false)}
      />
    </div>
  );
}
