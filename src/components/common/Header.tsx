import { useState } from 'react';
import { ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/api/auth';
import { clearTokens, getUserName } from '../../utils/auth';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
 
  const navigate = useNavigate();
  
  // Get user name from JWT token
  const userName = getUserName() || 'User';

  
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
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >

            {/* Name and Dropdown Arrow */}
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-700"> Chào mừng,</p>
              <span className="text-sm font-medium text-gray-700">{userName}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
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