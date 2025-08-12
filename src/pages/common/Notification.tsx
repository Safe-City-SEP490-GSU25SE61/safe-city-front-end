import { useState } from 'react';
import Sidebar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import FilterBar from '../../components/common/FilterBar';
import { PaginationComponent } from '../../components/common/Pagination';
import { Bell, CheckCircle } from 'lucide-react';

const notifications = [
    { id: 1, text: 'Báo cáo mới đã được gửi để xem xét.', time: '2 phút trước', read: false },
    { id: 2, text: 'Cảnh báo khẩn cấp được kích hoạt ở Quận 5.', time: '15 phút trước', read: false },
    { id: 3, text: 'Người dùng Nguyễn Văn A đã cập nhật hồ sơ của mình.', time: '3 giờ trước', read: true },
    { id: 4, text: 'Báo cáo về ổ gà trên đường ABC đã được giải quyết.', time: '1 ngày trước', read: true },
    { id: 5, text: 'Báo cáo mới đã được gửi để xem xét.', time: '2 phút trước', read: false },
    { id: 6, text: 'Cảnh báo khẩn cấp được kích hoạt ở Quận 5.', time: '15 phút trước', read: false },
    { id: 7, text: 'Người dùng Nguyễn Văn A đã cập nhật hồ sơ của mình.', time: '3 giờ trước', read: true },
    { id: 8, text: 'Báo cáo về ổ gà trên đường ABC đã được giải quyết.', time: '1 ngày trước', read: true },
    { id: 9, text: 'Báo cáo mới đã được gửi để xem xét.', time: '2 phút trước', read: false },
    { id: 10, text: 'Cảnh báo khẩn cấp được kích hoạt ở Quận 5.', time: '15 phút trước', read: false },
    { id: 11, text: 'Người dùng Nguyễn Văn A đã cập nhật hồ sơ của mình.', time: '3 giờ trước', read: true },
    { id: 12, text: 'Báo cáo về ổ gà trên đường ABC đã được giải quyết.', time: '1 ngày trước', read: true },
];

const NotificationPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRead, setFilterRead] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [notiList, setNotiList] = useState(notifications);
  const itemsPerPage = 8;

  // Filter and search logic
  const filteredNotifications = notiList.filter((n) => {
    const matchesSearch = n.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRead = filterRead === '' || (filterRead === 'read' ? n.read : !n.read);
    return matchesSearch && matchesRead;
  });

  // Pagination logic
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Filter options
  const filterOptions = {
    read: [
      { label: 'Tất cả', value: '' },
      { label: 'Chưa đọc', value: 'unread' },
      { label: 'Đã đọc', value: 'read' },
    ],
  };

  // Mark as read handler
  const markAsRead = (id: number) => {
    setNotiList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Tất cả thông báo
            </h1>
            <p className="text-gray-600 mb-4">
              Danh sách các thông báo mới nhất của bạn
            </p>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
              <FilterBar
                searchPlaceholder="Tìm kiếm thông báo"
                onSearch={setSearchTerm}
                onFilterChange={(filters) => setFilterRead(filters.read)}
                filterOptions={filterOptions}
                showExport={false}
              />
            </div>
          </div>

          {/* Notification Cards */}
          <div className="grid grid-cols-1 gap-4">
            {paginatedNotifications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Không có thông báo nào phù hợp</p>
              </div>
            ) : (
              paginatedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-center p-5 rounded-xl shadow border transition-all duration-200 cursor-pointer group
                    ${!notification.read
                      ? 'bg-gradient-to-r from-blue-50 via-white to-white border-blue-200'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                    }
                    hover:scale-[1.01] hover:shadow-lg`}
                  tabIndex={0}
                  role="button"
                  aria-pressed={!notification.read}
                >
                  <div className="flex-shrink-0">
                    {!notification.read ? (
                      <Bell className="w-7 h-7 text-blue-500 animate-bounce-slow group-hover:animate-none" />
                    ) : (
                      <CheckCircle className="w-7 h-7 text-gray-400" />
                    )}
                  </div>
                  <div className="ml-4 flex-grow">
                    <p className={`text-base ${!notification.read ? 'font-semibold text-blue-900' : 'text-gray-800'}`}>
                      {notification.text}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      className="ml-4 px-3 py-1 text-xs rounded-lg bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition"
                    >
                      Đánh dấu là đã đọc
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {filteredNotifications.length > itemsPerPage && (
            <div className="flex justify-center mt-8">
              <PaginationComponent
                totalItems={filteredNotifications.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default NotificationPage;
