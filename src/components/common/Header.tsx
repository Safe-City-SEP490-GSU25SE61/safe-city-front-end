import React, { useState } from 'react';
import { Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/api/auth';
import { clearTokens } from '../../utils/auth';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await logout({ refreshToken });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      clearTokens();
      navigate('/login');
    }
  };

  return (
    <header className="px-6 py-4">
      <div className="flex items-center justify-end space-x-4">
        {/* Notification Bell */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          {/* Optional notification dot */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* Profile Image */}
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
              <img
                src="https://th.bing.com/th/id/OIP.Ys4EwBzRHsMocY-f7WuiKQHaHa?w=180&h=181&c=7&r=0&o=7&dpr=1.1&pid=1.7&rm=3"
                alt="Tom Cook"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Name and Dropdown Arrow */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">QUANLK</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">QUANLK</p>
                <p className="text-xs text-gray-500">admin@example.com</p>
              </div>
              
              <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => navigate('/user-profile')}>
                <User className="w-4 h-4 mr-3" />
                Profile
              </button>
              
              <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => navigate('/user-profile')}>
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </button>
              
              <hr className="my-1" />
              
              <button
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;