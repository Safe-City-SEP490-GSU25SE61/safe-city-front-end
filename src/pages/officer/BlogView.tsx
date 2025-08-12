import React, { useState } from 'react';
import Sidebar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import NotificationBar from '../../components/common/NotificationBar';
import FilterBar from '../../components/common/FilterBar';
import { Edit2, Trash2, Eye, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BlogView: React.FC = () => {
  // Mock officer district - in real app this would come from user context/auth
  const officerDistrict = "Quận 1";

  // Example notification state (customize as needed)
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  // Example filter options for blogs (customize as needed)
  const filterOptions = {
    category: [
      { label: 'Tất cả', value: '' },
      { label: 'Tin tức', value: 'news' },
      { label: 'Hướng dẫn', value: 'guide' },
      { label: 'Thông báo', value: 'announcement' }
    ]
  };

  const mockBlogs = [
    {
      id: 1,
      image: 'https://placehold.co/600x400?text=Blog+1',
      title: 'Hướng dẫn sử dụng hệ thống quản lý mới',
      description: 'Tìm hiểu cách sử dụng các tính năng mới trong hệ thống quản lý của chúng tôi một cách hiệu quả...',
      category: 'Hướng dẫn',
      categoryColor: 'bg-blue-100 text-blue-800',
      status: 'Đã xuất bản',
      statusColor: 'bg-green-100 text-green-800',
      author: 'Nguyễn Văn An',
      date: '15/12/2024',
      views: 1250,
    },
    {
      id: 2,
      image: 'https://placehold.co/600x400?text=Blog+2',
      title: 'Cập nhật chính sách bảo mật mới',
      description: 'Những thay đổi quan trọng trong chính sách bảo mật và quyền riêng tư của hệ thống.',
      category: 'Thông báo',
      categoryColor: 'bg-blue-100 text-blue-800',
      status: 'Đã xuất bản',
      statusColor: 'bg-green-100 text-green-800',
      author: 'Trần Thị Bình',
      date: '10/12/2024',
      views: 890,
    },
    {
      id: 3,
      image: 'https://placehold.co/600x400?text=Blog+3',
      title: 'Báo cáo hoạt động tháng 11',
      description: 'Tổng kết các hoạt động và thành tích đạt được trong tháng 11 vừa qua.',
      category: 'Báo cáo',
      categoryColor: 'bg-blue-100 text-blue-800',
      status: 'Bản nháp',
      statusColor: 'bg-yellow-100 text-yellow-800',
      author: 'Lê Minh Châu',
      date: '5/12/2024',
      views: 0,
    },
    // ...add more mock blogs as needed
  ];

  const navigate = useNavigate();

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
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      Quản lý bài viết
                    </h1>
                  </div>
                  <p className="text-gray-600">
                    Danh sách các bài viết, thông báo và tin tức nội bộ
                  </p>
                </div>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
                  onClick={() => navigate('/officer/blog-create')}
                >
                  + Tạo bài viết
                </button>
              </div>      
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <span className="text-sm font-medium">Khu vực quản lý:</span>
                  <span className="text-sm">{officerDistrict}</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Tất cả bài viết hiển thị đều thuộc phạm vi quản lý của bạn
                </p>
              </div>
                <FilterBar
                  searchPlaceholder="Tìm kiếm bài viết"
                  onSearch={() => {}}
                  onFilterChange={() => {}}
                  filterOptions={filterOptions}
                  showExport={false}
                  onExport={() => {}}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockBlogs.map(blog => (
                <div
                  key={blog.id}
                  className="bg-white rounded-xl shadow border border-gray-200 flex flex-col h-full cursor-pointer hover:shadow-lg transition"
                  onClick={() => navigate(`/officer/blog-detail/${blog.id}`)}
                >
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="h-36 w-full object-cover rounded-t-xl"
                  />
                  <div className="flex-1 flex flex-col p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${blog.categoryColor}`}>{blog.category}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${blog.statusColor}`}>{blog.status}</span>
                    </div>
                    <h2 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">{blog.title}</h2>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{blog.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <span>👤 {blog.author}</span>
                      <span>•</span>
                      <span>{blog.date}</span>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <Eye className="w-4 h-4" />
                        <span>{blog.views}</span>
                      </div>
                      <div className="flex gap-2">
                        {blog.status === 'Bản nháp' ? (
                          <button
                            className="text-green-600 hover:text-green-800 flex items-center gap-1"
                            onClick={() => {
                              setNotification({
                                show: true,
                                message: `Bài viết "${blog.title}" đã được duyệt!`,
                                type: "success",
                              });
                              // Here you would update the blog's status in real app
                            }}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Duyệt</span>
                          </button>
                        ) : null}
                        {/* You can keep the delete button for published posts if needed */}
                        {/* {blog.status !== 'Bản nháp' && (
                          <button className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )} */}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default BlogView;
