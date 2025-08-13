import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OtpPage = () => {
  const [otp, setOtp] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Get email from state if passed via navigation
  const email = location.state?.email || '';
  const logo = 'assets/Logo.png'; // Adjust the path as necessary
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle OTP verification logic here
    alert(`OTP entered: ${otp} for email: ${email}`);
    // On success, redirect to reset password or dashboard
    navigate('/reset-password', { state: { email } });
  };

  // Handle resend OTP
  const handleResend = () => {
    // Call resend OTP API here
    setResendDisabled(true);
    setResendTimer(30); // 30 seconds cooldown
    // Example: alert('OTP resent to ' + email);
  };

  // Countdown timer for resend
  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendDisabled && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    } else if (resendTimer === 0) {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [resendDisabled, resendTimer]);

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img className="mx-auto h-115 w-auto" src={logo} alt="Safecity Logo" />
        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
          Nhập mã OTP
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Vui lòng nhập mã OTP đã được gửi tới email: <b>{email}</b>
        </p>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm border border-gray-300 rounded-lg shadow-md p-8 bg-white">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-900">
              Mã OTP
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="otp"
                id="otp"
                required
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 border-2 border-gray-300"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="Nhập mã OTP"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Xác nhận
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm/6 text-gray-500">
          {resendDisabled ? (
            <>Gửi lại mã OTP sau {resendTimer}s</>
          ) : (
            <button
              onClick={handleResend}
              className="font-semibold text-indigo-600 hover:text-indigo-500"
              disabled={resendDisabled}
              type="button"
            >
              Gửi lại mã OTP
            </button>
          )}
        </p>
      </div>
    </div>
  );
};

export default OtpPage;
