import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import NotificationBar from '../../components/common/NotificationBar';
import { getBlogsByAuthorId, approveBlog, type Blog } from '../../services/api/blog';
import { Loader2, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

// Re-using BlogCard component from BlogView.tsx for consistency
const BlogCard = ({ blog, onClick, onApprove, isApproving }: { 
  blog: any; // Using 'any' for flexibility with the transformed data
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

const UserBlogDetailPage: React.FC = () => {
  const { authorId } = useParams<{ authorId: string }>();
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState<any[]>([]);
  const [authorName, setAuthorName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingBlogs, setApprovingBlogs] = useState<Set<string | number>>(new Set());

  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  const fetchBlogs = useCallback(async () => {
    if (!authorId) {
      setError('ID tác giả không hợp lệ');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching blogs for authorId:', authorId);
      
      const response = await getBlogsByAuthorId(authorId);
      console.log('API Response:', response);
      
      const responseData = response?.data || [];

      if (responseData.length > 0) {
        setAuthorName(responseData[0].authorName || 'Không rõ');
      } else {
        setAuthorName('Không rõ');
      }

      const formattedBlogs = responseData.map((blog: Blog) => ({
        id: blog.id,
        title: blog.title || 'Không có tiêu đề',
        description: blog.description || (blog.content ? (blog.content.length > 100 ? `${blog.content.substring(0, 100)}...` : blog.content) : ''),
        author: blog.authorName || 'Người dùng ẩn danh',
        date: blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('vi-VN') : 'Chưa có ngày',
        category: blog.type === 'news' ? 'Tin tức' : blog.type === 'guide' ? 'Hướng dẫn' : 'Thông báo',
        categoryColor: 'bg-blue-100 text-blue-800',
        isApproved: blog.isApproved || false,
        isVisible: blog.isVisible || false,
        pinned: blog.pinned || false,
      }));

      console.log('Formatted blogs:', formattedBlogs);
      setBlogs(formattedBlogs);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError('Không thể tải danh sách bài viết. Vui lòng thử lại sau.');
      setNotification({ show: true, message: 'Có lỗi xảy ra khi tải danh sách bài viết', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [authorId]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleApprove = useCallback(async (id: string | number) => {
    try {
      setApprovingBlogs(prev => new Set(prev).add(id));
      
      const currentBlog = blogs.find(blog => blog.id === id);
      if (!currentBlog) return;
      
      const newApprovalStatus = !currentBlog.isApproved;
      
      await approveBlog(id.toString(), newApprovalStatus, currentBlog.pinned);
      
      setBlogs(prevBlogs => 
        prevBlogs.map(blog => 
          blog.id === id ? { ...blog, isApproved: newApprovalStatus } : blog
        )
      );
      
      setNotification({
        show: true,
        message: newApprovalStatus ? 'Bài viết đã được duyệt thành công!' : 'Bài viết đã được bỏ duyệt thành công!',
        type: 'success',
      });
    } catch (error) {
      console.error('Error updating blog approval status:', error);
      setNotification({
        show: true,
        message: 'Có lỗi xảy ra khi thay đổi trạng thái duyệt bài viết.',
        type: 'error',
      });
    } finally {
      setApprovingBlogs(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [blogs]);

  const handleBlogClick = useCallback((blogId: string | number) => {
    navigate(`/officer/blog-detail/${blogId}`);
  }, [navigate]);

  const handleGoBack = () => {
    navigate(-1);
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
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Bài viết của tác giả</h1>
                {authorName && <p className='text-gray-600'>Tác giả: {authorName}</p>}
              </div>
              <button
                onClick={handleGoBack}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2">Đang tải bài viết...</span>
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">
                <p>{error}</p>
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                Không có bài viết nào được tìm thấy.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                  <BlogCard 
                    key={blog.id} 
                    blog={blog} 
                    onApprove={handleApprove}
                    onClick={() => handleBlogClick(blog.id)}
                    isApproving={approvingBlogs.has(blog.id)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default UserBlogDetailPage;