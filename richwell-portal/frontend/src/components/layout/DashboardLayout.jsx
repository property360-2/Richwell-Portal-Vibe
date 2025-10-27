
// frontend/src/components/layout/DashboardLayout.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Menu,
  X,
  LogOut,
  User,
  Settings,
  Home,
  BookOpen,
  Users,
  FileText,
  BarChart3,
  Calendar,
  BookMarked,
  UserPlus
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Navigation items based on role
  const getNavItems = () => {
    const role = user?.role;
    
    const navItems = {
      student: [
        { icon: Home, label: 'Dashboard', path: '/student/dashboard' },
        { icon: BookOpen, label: 'Enrollment', path: '/student/enrollment' },
        { icon: FileText, label: 'Grades', path: '/student/grades' },
        { icon: BarChart3, label: 'GPA Summary', path: '/student/gpa' }
      ],
      professor: [
        { icon: Home, label: 'Dashboard', path: '/professor/dashboard' },
        { icon: Users, label: 'My Sections', path: '/professor/sections' },
        { icon: FileText, label: 'Grade Entry', path: '/professor/grades' },
        { icon: BarChart3, label: 'Analytics', path: '/professor/analytics' }
      ],
      registrar: [
        { icon: Home, label: 'Dashboard', path: '/registrar/dashboard' },
        { icon: Users, label: 'Students', path: '/registrar/students' },
        { icon: BookMarked, label: 'Programs', path: '/registrar/programs' },
        { icon: BookOpen, label: 'Subjects', path: '/registrar/subjects' },
        { icon: Users, label: 'Sections', path: '/registrar/sections' },
        { icon: Calendar, label: 'Academic Terms', path: '/registrar/terms' },
        { icon: FileText, label: 'Grades Approval', path: '/registrar/grades' },
        { icon: BarChart3, label: 'Reports', path: '/registrar/reports' }
      ],
      admission: [
        { icon: Home, label: 'Dashboard', path: '/admission/dashboard' },
        { icon: Users, label: 'Applicants', path: '/admission/applicants' },
        { icon: UserPlus, label: 'Student Onboarding', path: '/admission/onboarding' },
        { icon: BookOpen, label: 'Enrollment', path: '/student/enrollment' },
        { icon: BarChart3, label: 'Analytics', path: '/admission/analytics' }
      ],
      dean: [
        { icon: Home, label: 'Dashboard', path: '/dean/dashboard' },
        { icon: BookMarked, label: 'Programs', path: '/dean/programs' },
        { icon: BookOpen, label: 'Subjects', path: '/dean/subjects' },
        { icon: Users, label: 'Sections', path: '/dean/sections' },
        { icon: Calendar, label: 'Academic Terms', path: '/dean/terms' },
        { icon: Users, label: 'Professors', path: '/dean/professors' },
        { icon: BarChart3, label: 'Reports', path: '/dean/reports' }
      ]
    };

    return navItems[role] || [];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md fixed w-full z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Menu Toggle & Logo */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-600 hover:text-gray-900 p-2"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏫</span>
                <span className="font-bold text-xl text-gray-900">
                  Richwell Portal
                </span>
              </div>
            </div>

            {/* Right: User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="text-right">
                  <p className="font-semibold text-sm text-gray-900">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-600 capitalize">
                    {user?.role}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-20">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.email}
                      </p>
                      {user?.student && (
                        <p className="text-xs text-gray-600">
                          ID: {user.student.studentNo}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/settings');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Settings size={16} />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-full bg-white shadow-lg transition-all duration-300 z-10 ${
          sidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={index}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-20 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;