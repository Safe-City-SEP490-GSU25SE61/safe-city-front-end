import React, { useState } from 'react';
import logo from '../../../public/assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../services/api/auth';
import { jwtDecode } from 'jwt-decode';
import { ROLES } from '../../utils/roleHelpers';
import NotificationBar from '../../components/common/NotificationBar';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
    show: boolean;
  }>({ message: "", type: "info", show: false });

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login({ email, password });
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      // Decode the token to get the role
      const decoded: any = jwtDecode(response.data.accessToken);
      const role = decoded.role;

      setNotification({
        message: response.data.message || "Đăng nhập thành công!",
        type: "success",
        show: true,
      });

      // Redirect based on role
      setTimeout(() => {
        if (role === ROLES.ADMIN) {
          navigate('/user-management');
        } else if (role === ROLES.OFFICER) {
          navigate('/package-management');
        } else {
          setNotification({
            message: "Role không hợp lệ",
            type: "error",
            show: true,
          });
        }
      }, 1000); // Give user time to see the notification
    } catch (error: any) {
      setNotification({
        message: error?.response?.data?.message || "Email hoặc mật khẩu không chính xác",
        type: "error",
        show: true,
      });
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <NotificationBar
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={() => setNotification(n => ({ ...n, show: false }))}
        duration={3000}
      />
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img className="mx-auto h-115 w-auto" src={logo} alt="Safecity Logo" />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Đăng nhập vào tài khoản của bạn</h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm border border-gray-300 rounded-lg shadow-md p-8 bg-white">
        <form className="space-y-6" action="#" method="POST" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">Email</label>
            <div className="mt-2">
              <input
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                required
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 border-2 border-gray-300"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">Mật khẩu</label>
              <div className="text-sm">
                <Link to="/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-500">Quên mật khẩu?</Link>
              </div>
            </div>
            <div className="mt-2">
              <input
                type="password"
                name="password"
                id="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 border-2 border-gray-300"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
              />
            </div>
          </div>

          <div>
            <button type="submit" className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Đăng nhập</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
