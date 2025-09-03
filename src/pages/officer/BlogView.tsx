import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import NotificationBar from '../../components/common/NotificationBar';
import FilterBar from '../../components/common/FilterBar';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getBlogByOfficer, approveBlog } from '../../services/api/blog';

// BlogCard component to display individual blog post
const BlogCard = ({ blog, onClick, onApprove, isApproving }: { 
  blog: Blog; 
  onClick: () => void; 
  onApprove: (id: string | number) => void;
  isApproving?: boolean;
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
        {blog.isApproved && (
          <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
            Đã duyệt
          </span>
        )}
        {blog.isVisible && (
          <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
            Đã hiển thị
          </span>
        )}
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
          
          <button
            className={`flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed ${
              blog.isApproved 
                ? 'text-red-600 hover:text-red-800' 
                : 'text-green-600 hover:text-green-800'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onApprove(blog.id);
            }}
            disabled={isApproving}
          >
            {isApproving ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : blog.isApproved ? (
              <XCircle className="w-3 h-3" />
            ) : (
              <CheckCircle2 className="w-3 h-3" />
            )}
            <span>
              {isApproving 
                ? (blog.isApproved ? 'Đang bỏ duyệt...' : 'Đang duyệt...') 
                : (blog.isApproved ? 'Bỏ duyệt' : 'Duyệt')
              }
            </span>
          </button>
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
  isApproved: boolean;
  isVisible: boolean;
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
  const [approvingBlogs, setApprovingBlogs] = useState<Set<string | number>>(new Set());

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
const [officerCommune, setOfficerCommune] = useState('Đang tải...');

  useEffect(() => {
    const profileData = localStorage.getItem('officerCommune');
    if (profileData) {
      const commune = JSON.parse(profileData);
      // Assuming the district is available at profile.ward.district.name
     
      setOfficerCommune(commune);
    }
  }, []);
  const handleBlogClick = useCallback((blogId: string | number) => {
    navigate(`/officer/blog-detail/${blogId}`);
  }, [navigate]);


  // Handle blog approval/unapproval toggle
  const handleApprove = useCallback(async (id: string | number) => {
    try {
      // Add to approving set
      setApprovingBlogs(prev => new Set(prev).add(id));
      
      // Find the current blog to determine its approval status
      const currentBlog = blogs.find(blog => blog.id === id);
      if (!currentBlog) return;
      
      // Toggle the approval status
      const newApprovalStatus = !currentBlog.isApproved;
      
      // Call API to update the blog approval status
      await approveBlog(id.toString(), newApprovalStatus);
      
      // Update local state to reflect the change
      setBlogs(prevBlogs => 
        prevBlogs.map(blog => 
          blog.id === id ? { ...blog, isApproved: newApprovalStatus } : blog
        )
      );
      
      setNotification({
        show: true,
        message: newApprovalStatus 
          ? 'Bài viết đã được duyệt thành công!' 
          : 'Bài viết đã được bỏ duyệt thành công!',
        type: 'success',
      });
    } catch (error) {
      console.error('Error updating blog approval status:', error);
      setNotification({
        show: true,
        message: 'Có lỗi xảy ra khi thay đổi trạng thái duyệt bài viết. Vui lòng thử lại.',
        type: 'error',
      });
    } finally {
      // Remove from approving set
      setApprovingBlogs(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [blogs]);

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
            isApproved: blog.isApproved || false,
            isVisible: blog.isVisible || false,
            pinned: blog.pinned || false,
            content: blog.content || '',
            type: blog.type || 'news',
            authorName: blog.authorName || 'Người dùng ẩn danh',
            createdAt: blog.createdAt || new Date().toISOString(),
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
                    <span className="text-sm font-medium">Khu vực quản lý: {officerCommune}</span>
                
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
                            isApproving={approvingBlogs.has(blog.id)}
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
                          isApproving={approvingBlogs.has(blog.id)}
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
