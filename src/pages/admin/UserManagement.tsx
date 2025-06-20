import React, { useState } from 'react';
import Sidebar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import FilterBar from '../../components/common/FilterBar';
import { Eye } from 'lucide-react';
import { PaginationComponent } from '../../components/common/Pagination';
import UserDetailModal from './UserDetail';

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

  // Sample data
  const [users, setUsers] = useState<User[]>([
    {
      id: '#H001',
      name: 'Nguyen Van A',
      createdDate: '15/4/2025',
      phone: '0962710373',
      role: 'Người dân',
      address: '27 Đinh Tiên Hoàng Phường 1 Quận Bình Thạnh',
      status: 'active'
    },
    {
      id: '#H002',
      name: 'Tran Thi B',
      createdDate: '20/4/2025',
      phone: '0987654321',
      role: 'Quản trị viên',
      address: '123 Nguyen Hue Street District 1',
      status: 'inactive'
    },
    {
      id: '#H001',
      name: 'Nguyen Van A',
      createdDate: '15/4/2025',
      phone: '0962710373',
      role: 'Người dân',
      address: '27 Đinh Tiên Hoàng Phường 1 Quận Bình Thạnh',
      status: 'active'
    },
    {
      id: '#H002',
      name: 'Tran Thi B',
      createdDate: '20/4/2025',
      phone: '0987654321',
      role: 'Quản trị viên',
      address: '123 Nguyen Hue Street District 1',
      status: 'inactive'
    }, {
      id: '#H001',
      name: 'Nguyen Van A',
      createdDate: '15/4/2025',
      phone: '0962710373',
      role: 'Người dân',
      address: '27 Đinh Tiên Hoàng Phường 1 Quận Bình Thạnh',
      status: 'active'
    },
    {
      id: '#H002',
      name: 'Tran Thi B',
      createdDate: '20/4/2025',
      phone: '0987654321',
      role: 'Quản trị viên',
      address: '123 Nguyen Hue Street District 1',
      status: 'inactive'
    }, {
      id: '#H001',
      name: 'Nguyen Van A',
      createdDate: '15/4/2025',
      phone: '0962710373',
      role: 'Người dân',
      address: '27 Đinh Tiên Hoàng Phường 1 Quận Bình Thạnh',
      status: 'active'
    },
    {
      id: '#H002',
      name: 'Tran Thi B',
      createdDate: '20/4/2025',
      phone: '0987654321',
      role: 'Quản trị viên',
      address: '123 Nguyen Hue Street District 1',
      status: 'inactive'
    }, {
      id: '#H001',
      name: 'Nguyen Van A',
      createdDate: '15/4/2025',
      phone: '0962710373',
      role: 'Người dân',
      address: '27 Đinh Tiên Hoàng Phường 1 Quận Bình Thạnh',
      status: 'active'
    },
    {
      id: '#H002',
      name: 'Tran Thi B',
      createdDate: '20/4/2025',
      phone: '0987654321',
      role: 'Quản trị viên',
      address: '123 Nguyen Hue Street District 1',
      status: 'inactive'
    }, {
      id: '#H001',
      name: 'Nguyen Van A',
      createdDate: '15/4/2025',
      phone: '0962710373',
      role: 'Người dân',
      address: '27 Đinh Tiên Hoàng Phường 1 Quận Bình Thạnh',
      status: 'active'
    },
    {
      id: '#H002',
      name: 'Tran Thi B',
      createdDate: '20/4/2025',
      phone: '0987654321',
      role: 'Quản trị viên',
      address: '123 Nguyen Hue Street District 1',
      status: 'inactive'
    }, {
      id: '#H001',
      name: 'Nguyen Van A',
      createdDate: '15/4/2025',
      phone: '0962710373',
      role: 'Người dân',
      address: '27 Đinh Tiên Hoàng Phường 1 Quận Bình Thạnh',
      status: 'active'
    },
    {
      id: '#H002',
      name: 'Tran Thi B',
      createdDate: '20/4/2025',
      phone: '0987654321',
      role: 'Quản trị viên',
      address: '123 Nguyen Hue Street District 1',
      status: 'inactive'
    }, {
      id: '#H001',
      name: 'Nguyen Van A',
      createdDate: '15/4/2025',
      phone: '0962710373',
      role: 'Người dân',
      address: '27 Đinh Tiên Hoàng Phường 1 Quận Bình Thạnh',
      status: 'active'
    },
    {
      id: '#H002',
      name: 'Tran Thi B',
      createdDate: '20/4/2025',
      phone: '0987654321',
      role: 'Quản trị viên',
      address: '123 Nguyen Hue Street District 1',
      status: 'inactive'
    },
    {
      id: '#H003',
      name: 'Le Van C',
      createdDate: '22/4/2025',
      phone: '0912345678',
      role: 'Người dân',
      address: '456 Le Loi Street District 3',
      status: 'active'
    }
  ]);

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Xem danh sách tài khoản
              </h1>
              <p className="text-gray-600">
                Danh sách các tài khoản có trong hệ thống
              </p>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên tài khoản</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chức vụ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa điểm thường trú</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.id}
                      </td>
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
                            onClick={() => setSelectedUser(user)}
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
          </div>
          {selectedUser && (
            <UserDetailModal onClose={() => setSelectedUser(null)} />
          )}
        </main>
      </div>
    </div>
  );
};

export default UserManagement;
