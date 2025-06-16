import React, { useState } from 'react';
import { 
  Shield, 
  BarChart3, 
  FileText, 
  Calendar, 
  Bell, 
  Settings, 
  DollarSign, 
  User, 
  ChevronDown,
  ChevronUp,
  Pencil,
  ListCheck,
  ClipboardPen,
  Menu,
  Box,
  MapPinned,
  Medal,
  UserRoundPlus
} from 'lucide-react';
import logo from '../../../public/assets/logo.png';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { icon: BarChart3, text: 'Bảng thống kê', to: '/dashboard', active: false },

    // admin
    { icon: User, text: 'Quản lý tài khoản', to: '/user-management', active: false }, 
    { icon: Box, text: 'Quản lý gói đăng ký', to: '/package-management', active: false },
    { icon: MapPinned, text: 'Quản lý quận huyện', to: '/district-management', active: false },
    { icon: UserRoundPlus, text: 'Thêm công an vào phường', to: '/add-police-to-ward', active: false },
    { icon: Medal, text: 'Quản lý danh hiệu', to: '/achievement-management', active: false },
    //officer
    
    // { icon: FileText, text: 'Đơn tố cáo', to: '/complaints', active: false },

    
  ];

  const settingsItems = [
    { icon: Pencil, text: 'Tạo Blog', active: false },
    { icon: ListCheck, text: 'Quản lý Blog', active: false },
  ];

  return (
    <>
      {/* Hamburger for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded shadow"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="w-6 h-6 text-blue-800" />
      </button>

      {/* Sidebar */}
      <div
        className={`
          bg-white shadow-lg flex flex-col
          w-64 
          fixed top-0 left-0 z-40 transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:static md:translate-x-0 md:block
        `}
      >
        {/* Close button for mobile */}
        <button
          className="md:hidden absolute top-4 right-4 z-50 text-gray-500"
          onClick={() => setSidebarOpen(false)}
        >
          ✕
        </button>
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-lg flex items-center justify-center">
            <img className="mx-auto h-15 w-15" src={logo} alt="Safecity Logo" />
            </div>
            <span className="font-semibold text-blue-800 text-lg">SafeCity</span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => navigate(item.to)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.text}</span>
              </button>
            ))}
          </nav>

          {/* Settings Section */}
          <div className="mt-4 px-3">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="w-full flex items-center justify-between space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <ClipboardPen className="w-5 h-5" />
                <span>Blog</span>
              </div>
              {isSettingsOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {/* Settings Submenu */}
            {isSettingsOpen && (
              <div className="ml-6 mt-1 space-y-1">
                {settingsItems.map((item, index) => (
                  <button
                    key={index}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;