import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import FilterBar from '../../components/common/FilterBar';
import { Eye, UserRound, Plus } from 'lucide-react';
import { PaginationComponent } from '../../components/common/Pagination';
import UserDetail from '../../components/admin/UserDetail';
import { getUsers, getUserById } from '../../services/api/account';
import CreateAccountForm from '../../components/admin/CreateAccountForm';
import NotificationBar from '../../components/common/NotificationBar';

// Define a type for the user object for better type safety
interface User {
  id: string;
  name: string;
  createdDate: string;
  phone: string;
  role: string;
  address: string;
  status: 'active' | 'inactive';
}

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    role: '',
    dateFrom: '',
    dateTo: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetail, setUserDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      const mappedUsers = (res.data || []).map((u: any) => ({
        id: u.id,
        name: u.fullName,
        createdDate: u.dateOfBirth ? new Date(u.dateOfBirth).toLocaleDateString('vi-VN') : '',
        phone: u.phone,
        role: u.roleName,
        address: u.email,
        status: u.status && u.status.toLowerCase() === 'active' ? 'active' : 'inactive',
      }));
      setUsers(mappedUsers);
    } catch (error) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);

    const matchesStatus = !filters.status || user.status === filters.status;
    const matchesRole = !filters.role || user.role === filters.role;

    // Date filtering
    let matchesDate = true;
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom.split('/').reverse().join('-'));
      const userDate = new Date(user.createdDate.split('/').reverse().join('-'));
      matchesDate = matchesDate && userDate >= from;
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo.split('/').reverse().join('-'));
      const userDate = new Date(user.createdDate.split('/').reverse().join('-'));
      matchesDate = matchesDate && userDate <= to;
    }

    return matchesSearch && matchesStatus && matchesRole && matchesDate;
  });

  // Calculate paginated users
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filterOptions = {
    status: [
      { label: 'Hoạt động', value: 'active' },
      { label: 'Không hoạt động', value: 'inactive' }
    ],
    role: [
      { label: 'Người dân', value: 'citizen' },
      { label: 'Quản trị viên', value: 'admin' }
    ]
  };
  const handleViewUser = async (user: User) => {
    setLoadingDetail(true);
    setSelectedUser(user);
    try {
      const res = await getUserById(user.id);
      setUserDetail(res.data);
    } catch (e) {
      setUserDetail(null);
    }
    setLoadingDetail(false);
  };

  return (
    <>
      <NotificationBar
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification(n => ({ ...n, show: false }))}
      />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
            <div className="mb-6">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Xem danh sách tài khoản
                  </h1>
                  <p className="text-gray-600">
                    Danh sách các tài khoản có trong hệ thống
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5" />
                  Tạo tài khoản cán bộ
                </button>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
              <FilterBar
                searchPlaceholder="Tìm kiếm thông tin báo cáo"
                onSearch={setSearchTerm}
                onFilterChange={(filters) => setFilters(filters as any)}
                filterOptions={filterOptions}
                showExport={true}
                onExport={() => console.log('Export clicked')}
              />
            </div>
           
          </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="text-center py-12">
                  <UserRound className="w-16 h-16 text-gray-400 mx-auto mb-4" />                
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Đang tải danh sách người dùng...</h3>
                  <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                        
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên tài khoản</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày sinh nhật</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chức vụ</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.createdDate}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.phone}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.role}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                              {user.address}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  user.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {user.status === 'active'
                                  ? 'Hoạt động'
                                  : 'Không hoạt động'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex gap-2">
                                <button
                                  className="text-gray-400 hover:text-gray-600 transition-colors"
                                  onClick={() => handleViewUser(user)}
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Không tìm thấy dữ liệu phù hợp</p>
                    </div>
                  )}
                  {/* Pagination */}
                  {filteredUsers.length > 0 && (
                    <div className="flex justify-center">
                      <PaginationComponent
                        totalItems={filteredUsers.length}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
            {selectedUser && (
              <UserDetail
                user={userDetail}
                loading={loadingDetail}
                onClose={() => {
                  setSelectedUser(null);
                  setUserDetail(null);
                }}
              />
            )}
            <CreateAccountForm
              visible={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onSuccess={() => {
                setShowCreateModal(false);
                fetchUsers();
                setNotification({
                  show: true,
                  message: "Tạo tài khoản thành công!",
                  type: "success",
                });
              }}
            />
          </main>
        </div>
      </div>
    </>
  );
};

export default UserManagement;
