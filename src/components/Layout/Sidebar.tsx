import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  CheckSquare, 
  BarChart3, 
  BookOpen,
  Shield,
  Settings,
  HelpCircle,
  Eye,
  Bot
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { APP_CONSTANTS } from '../../utils/constants';

const navigation = [
  {
    name: 'Dashboard',
    href: APP_CONSTANTS.ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    name: 'Upload Document',
    href: APP_CONSTANTS.ROUTES.DOCUMENT_UPLOAD,
    icon: Upload,
  },
  {
    name: 'Check Requirements',
    href: APP_CONSTANTS.ROUTES.REQUIREMENTS_CHECKLIST,
    icon: CheckSquare,
  },
  {
    name: 'Review Suggestions',
    href: APP_CONSTANTS.ROUTES.REVIEW_SUGGESTIONS,
    icon: Eye,
  },
  {
    name: 'Ask AI',
    href: '/ask-ai',
    icon: Bot,
  },
  {
    name: 'Your QC Report',
    href: APP_CONSTANTS.ROUTES.COMPLIANCE_REPORT,
    icon: BarChart3,
  },
  {
    name: 'Report Library',
    href: APP_CONSTANTS.ROUTES.REPORT_LIBRARY,
    icon: BookOpen,
  },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-screen">
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <Shield className="h-8 w-8 text-blue-600 mr-3" />
        <span className="text-xl font-semibold text-gray-900">QC Reporter</span>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="border-t border-gray-200 p-4 space-y-1">
        <Link
          to="/settings"
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50"
        >
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </Link>
        <Link
          to="/help"
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50"
        >
          <HelpCircle className="mr-3 h-5 w-5" />
          Help & Support
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;