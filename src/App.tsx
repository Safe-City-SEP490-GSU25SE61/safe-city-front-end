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
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES } from './utils/roleHelpers';
import Unauthorized from './components/common/Unauthorized';
import NotificationPage from './pages/common/Notification';
import IncidentReport from './pages/officer/IncidentReport';
import BlogView from './pages/officer/BlogView';
import BlogDetailPage from './pages/officer/BlogDetail';
import CreateBlogPage from './pages/officer/CreateBlog';
import LiveMap from './pages/officer/LiveMap';

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
        <Route path="/notifications" element={<NotificationPage />} />
        {/* admin */}
        <Route path="/user-management" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.OFFICER]}>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/package-management" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <PackageManagement />
          </ProtectedRoute>
        } />
        <Route path="/district-management" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.OFFICER]}>
            <DistrictManagement />
          </ProtectedRoute>
        } />
        <Route path="/add-police-to-ward" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.OFFICER]}>
            <AddOfficerWardPage />
          </ProtectedRoute>
        } />
        <Route path="/achievement-management" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AchievementManagement />
          </ProtectedRoute>
        } />
        <Route path="/unauthorized" element={<Unauthorized />} />
        {/* officer */}
        <Route path="/officer/incident-report" element={
          <ProtectedRoute allowedRoles={[ROLES.OFFICER]}>
            <IncidentReport />
          </ProtectedRoute>
        } />
        <Route path="/officer/blog-view" element={
          <ProtectedRoute allowedRoles={[ROLES.OFFICER]}>
            <BlogView />
          </ProtectedRoute>
        } />
        <Route path="/officer/blog-detail/:id" element={
          <ProtectedRoute allowedRoles={[ROLES.OFFICER]}>
            <BlogDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/officer/blog-create" element={
          <ProtectedRoute allowedRoles={[ROLES.OFFICER]}>
            <CreateBlogPage />
          </ProtectedRoute>
        } />
        <Route path="/officer/live-map" element={
          <ProtectedRoute allowedRoles={[ROLES.OFFICER]}>
            <LiveMap />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;
