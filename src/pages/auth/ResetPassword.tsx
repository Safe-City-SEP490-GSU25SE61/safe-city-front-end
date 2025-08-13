import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const location = useLocation();
  const email = location.state?.email || '';
  const navigate = useNavigate();
  const logo = 'assets/Logo.png'; // Adjust the path as necessary
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      alert('Mật khẩu không khớp!');
      return;
    }
    // Handle password reset logic here
    alert(`Mật khẩu mới cho ${email} đã được đặt lại!`);
    navigate('/login');
    // Redirect to login or another page if needed
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img className="mx-auto h-115 w-auto" src={logo} alt="Safecity Logo" />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Đặt lại mật khẩu
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Nhập mật khẩu mới cho email: <b>{email}</b>
        </p>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm border border-gray-300 rounded-lg shadow-md p-8 bg-white">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
              Mật khẩu mới
            </label>
            <div className="mt-2">
              <input
                type="password"
                name="password"
                id="password"
                required
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border-2 border-gray-300"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
              />
            </div>
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm/6 font-medium text-gray-900">
              Xác nhận mật khẩu
            </label>
            <div className="mt-2">
              <input
                type="password"
                name="confirm"
                id="confirm"
                required
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border-2 border-gray-300"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Xác nhận mật khẩu mới"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500"
            >
              Đặt lại mật khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
