import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import NotificationBar from '../../components/common/NotificationBar';
import FilterBar from '../../components/common/FilterBar';
import { CheckCircle2, Loader2, MessageSquare, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getBlogByOfficer } from '../../services/api/blog';

// BlogCard component to display individual blog post
const BlogCard = ({ blog, onClick, onApprove }: { 
  blog: Blog; 
  onClick: () => void; 
  onApprove: (id: string | number) => void;
}) => (
  <div
    className="bg-white rounded-xl shadow border border-gray-200 flex flex-col h-full cursor-pointer hover:shadow-lg transition"
    onClick={(e) => {
  e.stopPropagation();
  onClick();
}}
  >
    <div className="flex-1 flex flex-col p-4">
      <h2 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">{blog.title}</h2>
      <p className="text-gray-600 text-sm mb-3 line-clamp-3">{blog.description}</p>
      
      <div className="mt-auto">
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-2 py-1 rounded text-xs font-medium ${blog.categoryColor}`}>
          {blog.category}
        </span>
        {blog.pinned && (
          <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
            Đã ghim
          </span>
        )}
      </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <span>👤 {blog.author}</span>
          <span>•</span>
          <span>{blog.date}</span>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          
          {blog.status === 'Bản nháp' && (
            <button
              className="text-green-600 hover:text-green-800 flex items-center gap-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onApprove(blog.id);
              }}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Duyệt</span>
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

interface Blog {
  id: number | string;
  image?: string;
  title: string;
  content: string;
  type: string;
  authorName: string;
  createdAt: string;
  pinned: boolean;
  communeName: string;
  totalLike: number;
  totalComment: number;
  // For display purposes
  description: string;
  author: string;
  date: string;
  category: string;
  categoryColor: string;
  status: string;
  statusColor: string;
  views: number;
}

const BlogView: React.FC = () => {
  // State for blogs, loading, and error
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  // Filter options for blogs
  const filterOptions = {
    category: [
      { label: 'Tất cả', value: '' },
      { label: 'Tin tức', value: 'news' },
      { label: 'Hướng dẫn', value: 'guide' },
      { label: 'Thông báo', value: 'announcement' }
    ]
  };

  const navigate = useNavigate();

  const handleBlogClick = useCallback((blogId: string | number) => {
    navigate(`/officer/blog-detail/${blogId}`);
  }, [navigate]);
  const officerDistrict = "Quận 1"; // This would come from user context in a real app

  // Handle blog approval
  const handleApprove = useCallback((id: string | number) => {
    // In a real app, you would make an API call here to update the blog status
    setBlogs(prevBlogs => 
      prevBlogs.map(blog => 
        blog.id === id ? { ...blog, status: 'Đã đăng', statusColor: 'bg-green-100 text-green-800' } : blog
      )
    );
    
    setNotification({
      show: true,
      message: 'Bài viết đã được duyệt thành công!',
      type: 'success',
    });
  }, []);

  // Fetch blogs when component mounts
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching blogs...');
        const response = await getBlogByOfficer();
        console.log('API Response:', response);
        
        // Check if response is an array or has a data property
        const responseData = Array.isArray(response) ? response : 
                           (response && Array.isArray(response.data)) ? response.data : [];
        
        console.log('Formatted blogs data:', responseData);
        
        if (responseData.length === 0) {
          console.warn('No blogs found in the response');
        }
        
        // Transform the API response to match our Blog interface
        const formattedBlogs = responseData.map((blog: any) => {
          // Ensure we have required fields with fallbacks
          const blogData = {
            id: blog.id || 'unknown-id',
            title: blog.title || 'Không có tiêu đề',
            content: blog.content || '',
            type: blog.type || 'news',
            authorName: blog.authorName || 'Người dùng ẩn danh',
            createdAt: blog.createdAt || new Date().toISOString(),
            pinned: blog.pinned || false,
            communeName: blog.communeName || 'Chưa xác định',
            totalLike: blog.totalLike || 0,
            totalComment: blog.totalComment || 0,
            // Add derived fields
            description: blog.content ? 
              (blog.content.length > 100 ? `${blog.content.substring(0, 100)}...` : blog.content) : '',
            author: blog.authorName || 'Người dùng ẩn danh',
            date: blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('vi-VN') : 'Chưa có ngày',
            image: blog.image || '/default-blog.jpg',
            category: blog.type === 'news' ? 'Tin tức' : 
                     blog.type === 'guide' ? 'Hướng dẫn' : 'Thông báo',
            categoryColor: 'bg-blue-100 text-blue-800',
            status: 'Đã đăng',
            statusColor: 'bg-green-100 text-green-800',
            views: Math.floor(Math.random() * 1000)
          };
          
          console.log('Processed blog:', blogData);
          return blogData;
        });
        
        setBlogs(formattedBlogs);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Không thể tải danh sách bài viết. Vui lòng thử lại sau.');
        setNotification({
          show: true,
          message: 'Có lỗi xảy ra khi tải danh sách bài viết',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

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
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                <span className="ml-2">Đang tải bài viết...</span>
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">
                <p>{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                Không có bài viết nào được tìm thấy.
              </div>
            ) : (
              <div className="space-y-8">
                {/* Pinned Posts Section */}
                {blogs.some(blog => blog.pinned) && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Bài viết đã ghim</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {blogs
                        .filter(blog => blog.pinned)
                        .map((blog: Blog) => (
                          <BlogCard 
                            key={blog.id} 
                            blog={blog} 
                            onApprove={handleApprove}
                            onClick={() => handleBlogClick(blog.id)}
                          />
                        ))}
                    </div>
                  </div>
                )}
                
                {/* Regular Posts Section */}
                <div>
                  {blogs.some(blog => blog.pinned) && (
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Tất cả bài viết</h2>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs
                      .filter(blog => !blog.pinned)
                      .map((blog: Blog) => (
                        <BlogCard 
                          key={blog.id} 
                          blog={blog} 
                          onApprove={handleApprove}
                          onClick={() => handleBlogClick(blog.id)}
                        />
                      ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default BlogView;
