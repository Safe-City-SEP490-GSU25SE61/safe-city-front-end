import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./pages/auth/Login";
import ForgotPassword from './pages/auth/ForgotPassword';
import './index.css';
import Register from './pages/auth/Register';
import OtpPage from './pages/auth/OtpPage';
import ResetPassword from './pages/auth/ResetPassword';
import UserManagement from './pages/admin/UserManagement';
import UserProfile from './pages/common/UserProfile';
import PackageManagement from './pages/admin/PackageManagement';
import DistrictManagement from './pages/admin/DistrictManagement';
import AchievementManagement from './pages/admin/AchievementManagement';
import AddOfficerWardPage from './pages/admin/AddOfficerWardPage';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* common */}
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* admin */}
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/package-management" element={<PackageManagement />} />
        <Route path="/district-management" element={<DistrictManagement />} />
        <Route path="/add-police-to-ward" element={<AddOfficerWardPage />} />
        <Route path="/achievement-management" element={<AchievementManagement />} />
      </Routes>
    </Router>
  );
};

export default App;
