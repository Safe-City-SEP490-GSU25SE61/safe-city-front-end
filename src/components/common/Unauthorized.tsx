import React from "react";
import { useNavigate } from "react-router-dom";
import { ROLES, getDashboardUrl, type UserRole } from "../../utils/roleHelpers";
import { jwtDecode } from "jwt-decode";

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  // Get role from localStorage (adjust if you use context or Redux)
  const decoded: any = jwtDecode(localStorage.getItem("accessToken") || "");
  const role = decoded.role;
  // Use custom path for admin, getDashboardUrl for officer, fallback to "/login"
  const redirectPath =
    role === ROLES.ADMIN
      ? "/user-management"
      : role === ROLES.OFFICER
      ? getDashboardUrl(role)
      : "/login";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <div className="text-6xl font-bold text-red-500 mb-4">403</div>
        <h1 className="text-2xl font-semibold mb-2">Không có quyền truy cập</h1>
        <p className="text-gray-600 mb-6">
          Xin lỗi, bạn không có quyền truy cập vào trang này.
        </p>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => navigate(redirectPath)}
        >
          Quay về trang phù hợp
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
