import React, { useState } from 'react';
import Sidebar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import FilterBar from '../../components/common/FilterBar';
import { Eye } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    role: '',
    dateFrom: '',
    dateTo: ''
  });

  // Sample data
  const [users, setUsers] = useState([
    {
      id: '#H001',
      name: 'Nguyen Van A',
      createdDate: '15/4/2025',
      phone: '0962710373',
      role: 'citizen',
      address: '27 Đinh Tiên Hoàng Phường 1 Quận Bình Thạnh',
      status: 'active'
    },
    {
      id: '#H002',
      name: 'Tran Thi B',
      createdDate: '20/4/2025',
      phone: '0987654321',
      role: 'admin',
      address: '123 Nguyen Hue Street District 1',
      status: 'inactive'
    },
    {
      id: '#H003',
      name: 'Le Van C',
      createdDate: '22/4/2025',
      phone: '0912345678',
      role: 'citizen',
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

    return matchesSearch && matchesStatus && matchesRole;
  });

  const toggleUserStatus = (id: string) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === id
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
          : user
      )
    );
  };

  const filterOptions = {
    status: [
      { label: 'Hoạt động', value: 'active' },
      { label: 'Không hoạt động', value: 'inactive' }
    ],
    role: [
      { label: 'Citizen', value: 'citizen' },
      { label: 'Admin', value: 'admin' }
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
            
            {/* Replace the old search and filter with the new FilterBar component */}
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
                  {filteredUsers.map((user) => (
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
                        <button
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium focus:outline-none ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                          onClick={() => toggleUserStatus(user.id)}
                        >
                          {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex justify-center items-center">
                          <button className="text-gray-400 hover:text-gray-600 transition-colors">
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserManagement;
