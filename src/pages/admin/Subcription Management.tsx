import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import FilterBar from '../../components/common/FilterBar';
import { DollarSign, Package, Calendar, Tag } from 'lucide-react';
import { PaginationComponent } from '../../components/common/Pagination';
import { getSubscriptionsHistory } from '../../services/api/subcription';
import NotificationBar from '../../components/common/NotificationBar';

// Define a type for the subscription object for better type safety
interface Subscription {
  orderCode: string;
  amount: number;
  quantity: number;
  paymentMethod: string;
  status: 'Pending' | 'Success' | 'Failed';
  paidAt: string;
  packageName: string;
  userFullName: string;
  userEmail: string;
}

const SubscriptionManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    packageName: '',
    dateFrom: '',
    dateTo: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await getSubscriptionsHistory();
      const mappedSubscriptions = (res.data || []).map((s: any) => ({
        orderCode: s.orderCode,
        amount: s.amount,
        quantity: s.quantity,
        paymentMethod: s.paymentMethod,
        status: s.status,
        paidAt: s.paidAt && s.paidAt !== 'Pending' ? new Date(s.paidAt).toLocaleString('vi-VN') : 'Chưa thanh toán',
        packageName: s.packageName,
        userFullName: s.userFullName,
        userEmail: s.userEmail,
      }));
      setSubscriptions(mappedSubscriptions);
    } catch (error) {
      console.error("Failed to fetch subscription history:", error);
      setNotification({
        show: true,
        message: "Không thể tải lịch sử giao dịch.",
        type: "error",
      });
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Filter subscriptions based on search term and filters
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.userFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filters.status || sub.status === filters.status;
    const matchesPackage = !filters.packageName || sub.packageName === filters.packageName;

    // Date filtering
    let matchesDate = true;
    if (filters.dateFrom && sub.paidAt !== 'Chưa thanh toán') {
        try {
            const from = new Date(filters.dateFrom.split('/').reverse().join('-'));
            const subDateParts = sub.paidAt.split(' ')[1];
            if(subDateParts) {
                const subDate = new Date(subDateParts.split('/').reverse().join('-'));
                if(!isNaN(from.getTime()) && !isNaN(subDate.getTime())){
                    matchesDate = matchesDate && subDate >= from;
                }
            }
        } catch (e) { console.error('Date parsing error:', e) }
    }
    if (filters.dateTo && sub.paidAt !== 'Chưa thanh toán') {
        try {
            const to = new Date(filters.dateTo.split('/').reverse().join('-'));
            const subDateParts = sub.paidAt.split(' ')[1];
            if(subDateParts) {
                const subDate = new Date(subDateParts.split('/').reverse().join('-'));
                if(!isNaN(to.getTime()) && !isNaN(subDate.getTime())){
                    matchesDate = matchesDate && subDate <= to;
                }
            }
        } catch (e) { console.error('Date parsing error:', e) }
    }

    return matchesSearch && matchesStatus && matchesPackage && matchesDate;
  });

  // Calculate paginated subscriptions
  const paginatedSubscriptions = filteredSubscriptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filterOptions = {
    status: [
      { value: 'Success', label: 'Thành công' },
      { value: 'Pending', label: 'Đang chờ' },
      { value: 'Failed', label: 'Thất bại' },
    ],
    packageName: [
        { value: 'Siêu Bảo Vệ', label: 'Siêu Bảo Vệ' },
        // Add other packages if they exist
    ]
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'Success':
        return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Thành công</span>;
      case 'Pending':
        return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Đang chờ</span>;
      case 'Failed':
        return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Thất bại</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">{status}</span>;
    }
  };

  return (
    <>
      <NotificationBar
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      <div className="flex min-h-screen ">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">

          <div className="mb-6">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Quản lý Giao dịch
                </h1>
                <p className="text-gray-600">
                  Xem lịch sử giao dịch và quản lý giao dịch của người dùng.
                </p>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
              <FilterBar
                onSearch={setSearchTerm}
                onFilterChange={(newFilters) => setFilters(prev => ({...prev, ...newFilters}))}
                filterOptions={filterOptions} 
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn hàng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người dùng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gói</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày thanh toán</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">Đang tải giao dịch</td>
                    </tr>
                  ) : paginatedSubscriptions.length > 0 ? (
                    paginatedSubscriptions.map(sub => (
                      <tr key={sub.orderCode}>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                                <Tag className="w-4 h-4 mr-2 text-gray-500" />
                                {sub.orderCode}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{sub.userFullName}</div>
                          <div className="text-sm text-gray-500">{sub.userEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center">
                                <Package className="w-4 h-4 mr-2 text-blue-500" />
                                {sub.packageName}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-green-600 font-semibold flex items-center">
                                <DollarSign className="w-4 h-4 mr-1" />
                                {sub.amount.toLocaleString('vi-VN')} VND
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusChip(sub.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                {sub.paidAt}
                            </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-4">Không có dữ liệu.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filteredSubscriptions.length > itemsPerPage && (
              <PaginationComponent
                currentPage={currentPage}
                totalItems={filteredSubscriptions.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
          </main>
        </div>
        
      </div>
    </>
  );
};

export default SubscriptionManagement;
                     
