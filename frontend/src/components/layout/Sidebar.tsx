import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  ClipboardList,
  HelpCircle,
  Library,
  Code,
  Settings,
  User,
  Sparkles,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Aeronaut Notes', path: '/notes', icon: FileText, badge: 'AI' },
  { label: 'My Courses', path: '/courses', icon: BookOpen },
  { label: 'Assignments', path: '/assignments', icon: ClipboardList },
  { label: 'Lab Quizzes', path: '/quizzes', icon: HelpCircle },
  { label: 'Digital Textbooks', path: '/textbooks', icon: Library, badge: 'AI' },
  { label: 'Virtual Sandbox', path: '/sandbox', icon: Code },
  { label: 'ERP System', path: '/erp', icon: Briefcase },
  { label: 'Institute Management', path: '/institute', icon: LayoutDashboard },
];

const secondaryNavItems: NavItem[] = [
  { label: 'Profile', path: '/profile', icon: User },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar() {
  const { user } = useAuthStore();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-edu-blue-50 to-white border-r border-edu-blue-200 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-edu-blue-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-edu-blue-600 to-edu-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-edu-blue-900 leading-tight">Campus Grid</h1>
            <p className="text-xs text-edu-blue-600">Unified Platform</p>
          </div>
        </div>
      </div>

      {/* AERO AI Badge */}
      <div className="px-4 py-3">
        <div className="bg-gradient-to-r from-edu-purple-50 to-edu-blue-50 border border-edu-purple-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-edu-purple-500 to-edu-blue-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-edu-purple-700">AERO AI</p>
              <p className="text-[10px] text-edu-purple-600">Powered Assistant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-edu-blue-400 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-edu-blue-100 text-edu-blue-700'
                    : 'text-edu-blue-700 hover:bg-edu-blue-50 hover:text-edu-blue-900'
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-edu-purple-100 text-edu-purple-700 rounded">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        <div className="mt-8 space-y-1">
          <p className="px-3 text-xs font-semibold text-edu-blue-400 uppercase tracking-wider mb-2">
            Account
          </p>
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-edu-blue-100 text-edu-blue-700'
                    : 'text-edu-blue-700 hover:bg-edu-blue-50 hover:text-edu-blue-900'
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-edu-blue-200">
        <div className="flex items-center gap-3">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-10 h-10 rounded-full bg-edu-blue-100"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-edu-blue-900 truncate">{user?.name}</p>
            <p className="text-xs text-edu-blue-600 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
