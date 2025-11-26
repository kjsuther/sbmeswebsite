import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Bot, Settings, FolderKanban, LogOut } from 'lucide-react';
import { isAdminAuthenticated, clearAdminSession } from '../lib/adminAuth';

const AdminPortal: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    clearAdminSession();
    navigate('/admin/login');
  };

  const adminSections = [
    {
      title: 'AI Assistant Admin',
      description: 'Manage chatbot content, documents, and knowledge base',
      icon: Bot,
      path: '/admin',
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
    },
    {
      title: 'MES Admin',
      description: 'Manage MES system configuration and settings',
      icon: Settings,
      path: '/mes-admin',
      color: 'bg-mn-primary',
      hoverColor: 'hover:bg-opacity-90',
    },
    {
      title: 'Project Artifacts Admin',
      description: 'Manage project links and reference materials',
      icon: FolderKanban,
      path: '/admin/artifacts',
      color: 'bg-mn-accent-teal',
      hoverColor: 'hover:bg-opacity-90',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-mn-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <Lock className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Admin Portal</h1>
                <p className="text-blue-100 text-lg">Select the admin area you would like to access</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {adminSections.map((section) => (
            <button
              key={section.path}
              onClick={() => navigate(section.path)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-8 text-left group"
            >
              <div className={`${section.color} ${section.hoverColor} w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors`}>
                <section.icon className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-mn-primary transition-colors">
                {section.title}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {section.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
