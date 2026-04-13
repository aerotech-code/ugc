import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, Sparkles, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/stores';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  // Quick login buttons for demo
  const quickLogin = (userEmail: string, userRole: UserRole) => {
    setEmail(userEmail);
    setPassword(userRole === 'student' ? 'student123' : userRole === 'teacher' ? 'teacher123' : 'admin123');
    setRole(userRole);
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo & Branding */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-edu-blue-600 to-edu-purple-600 rounded-2xl mb-4 shadow-lg shadow-edu-blue-200">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-edu-blue-900 mb-1">Welcome to Campus Grid</h1>
        <p className="text-edu-blue-600">Unified Campus Management Platform</p>
        <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-edu-purple-50 border border-edu-purple-100 rounded-full">
          <Sparkles className="w-3 h-3 text-edu-purple-600" />
          <span className="text-xs font-medium text-edu-purple-700">Powered by AERO AI</span>
        </div>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-edu-blue-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-edu-blue-400" />
              <Input
                id="email"
                type="email"
                placeholder="you@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-edu-blue-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-edu-blue-400 hover:text-edu-blue-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Login As</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                Remember me
              </Label>
            </div>
            <button type="button" className="text-sm text-edu-blue-600 hover:text-edu-blue-700">
              Forgot password?
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-edu-rose-50 border border-edu-rose-100 rounded-lg text-sm text-edu-rose-600">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-edu-blue-600 to-edu-purple-600 hover:from-edu-blue-700 hover:to-edu-purple-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Demo Quick Login */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center mb-3">Quick Demo Login</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickLogin('student@campus.edu', 'student')}
              className={cn(
                'px-3 py-2 text-xs font-medium rounded-lg border transition-colors',
                role === 'student' && email === 'student@campus.edu'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              )}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => quickLogin('teacher@campus.edu', 'teacher')}
              className={cn(
                'px-3 py-2 text-xs font-medium rounded-lg border transition-colors',
                role === 'teacher' && email === 'teacher@campus.edu'
                  ? 'bg-purple-50 border-purple-200 text-purple-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              )}
            >
              Teacher
            </button>
            <button
              type="button"
              onClick={() => quickLogin('admin@campus.edu', 'admin')}
              className={cn(
                'px-3 py-2 text-xs font-medium rounded-lg border transition-colors',
                role === 'admin' && email === 'admin@campus.edu'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              )}
            >
              Admin
            </button>
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-2">
            Password: student123 / teacher123 / admin123
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{' '}
        <button className="text-blue-600 hover:text-blue-700 font-medium">
          Contact Administrator
        </button>
      </p>
    </div>
  );
}
