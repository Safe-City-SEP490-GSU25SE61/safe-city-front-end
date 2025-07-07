import React, { useState } from 'react';
import logo from '../../../public/assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../services/api/auth';
import { jwtDecode } from 'jwt-decode';
import { ROLES } from '../../utils/roleHelpers';
import NotificationBar from '../../components/common/NotificationBar';
import bgImage from '../../../public/assets/loginpic.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
    show: boolean;
  }>({ message: "", type: "info", show: false });
  const [formError, setFormError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!email || !password) {
      setFormError("Vui lòng nhập email và mật khẩu.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }

    try {
      const response = await login({ email, password });
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      const decoded: any = jwtDecode(response.data.accessToken);
      const role = decoded.role;

      setNotification({
        message: "Đăng nhập thành công!",
        type: "success",
        show: true,
      });

      setTimeout(() => {
        if (role === ROLES.ADMIN) {
          navigate('/user-management');
        } else if (role === ROLES.OFFICER) {
          navigate('/officer/incident-report');
        } else {
          setNotification({
            message: "Quyền truy cập không hợp lệ",
            type: "error",
            show: true,
          });
        }
      }, 1000);
    } catch (error: any) {
      setFormError(error?.response?.data?.message || "Email hoặc mật khẩu không chính xác");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-[1100px] h-[700px] rounded-3xl overflow-hidden shadow-2xl border border-blue-200 bg-white">
        {/* Left: Background Image */}
        <div
          className="hidden md:block w-1/2 relative bg-cover bg-[position:5%_95%]"
          style={{
            backgroundImage: `url(${bgImage})`,
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        
        </div>

        {/* Right: Login Form */}
        <div className="flex flex-col justify-center w-full md:w-1/2 px-16 py-12 bg-white">
          <NotificationBar
            message={notification.message}
            type={notification.type}
            show={notification.show}
            onClose={() => setNotification(n => ({ ...n, show: false }))}
            duration={3000}
          />
          <div className="mx-auto w-full max-w-md">
            <img className="mx-auto h-24 w-auto" src={logo} alt="Safecity Logo" />
            <h2 className="mt-10 text-center text-3xl font-bold tracking-tight text-gray-900">
              Đăng nhập vào tài khoản
            </h2>
          </div>

          <div className="mt-10 mx-auto w-full max-w-md">
            <form className="space-y-8" action="#" method="POST" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-lg font-medium text-gray-900">Email</label>
                <div className="mt-3">
                  <input
                    type="text"
                    name="email"
                    id="email"
                    autoComplete="email"
                    className="block w-full rounded-lg bg-white px-4 py-3 text-lg text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-lg font-medium text-gray-900">Mật khẩu</label>
                  <div className="text-base">
                    <Link to="/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-500">Quên mật khẩu?</Link>
                  </div>
                </div>
                <div className="mt-3">
                  <input
                    type="password"
                    name="password"
                    id="password"
                    autoComplete="current-password"
                    className="block w-full rounded-lg bg-white px-4 py-3 text-lg text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                  />
                </div>
              </div>
              {formError && (
                <p className="mt-2 text-sm text-red-600">{formError}</p>
              )}
              <div>
                <button type="submit" className="flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-3 text-lg font-semibold text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600">
                  Đăng nhập
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
