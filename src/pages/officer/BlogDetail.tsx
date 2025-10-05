import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import NotificationBar from '../../components/common/NotificationBar';
import { Eye, ThumbsUp, MessageCircle, User, Calendar, Pencil, EyeOff, CheckCircle, Flag, Bold, Italic, UnderlineIcon, Strikethrough, Eraser, Heading1, Heading2, Heading3, Heading4, Heading5, List, ListOrdered, Minus, AlignLeft, AlignCenter, AlignRight, Loader2, ArrowLeft, ChevronLeft, ChevronRight, Play, Pause, Bot, Shield, Heart, AlertTriangle, CheckCircle2, XCircle, Clock, Sparkles, Brain, Zap } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { getBlogByIdOfficer, approveBlog, visibilityBlog, type Blog } from '../../services/api/blog';
import { getCommentByBlogId, createComment, type CommentCreateData } from '../../services/api/comment';

// Comment interface
interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt?: string;
  blogId: string;
  accountId: string;
}

// Function to highlight violations in content
const highlightViolations = (content: string, violations: string[]): string => {
  if (!violations || violations.length === 0) {
    return content;
  }

  let highlightedContent = content;
  
  violations.forEach(violation => {
    if (violation && violation.trim()) {
      // Create a case-insensitive regex to find the violation text
      const regex = new RegExp(`(${violation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      highlightedContent = highlightedContent.replace(regex, 
        '<span class="violation-highlight" style="background-color: #fef2f2; color: #dc2626; padding: 2px 4px; border-radius: 4px; border: 1px solid #fecaca; font-weight: 600;">$1</span>'
      );
    }
  });
  
  return highlightedContent;
};

// Enhanced utility function to parse Quill Delta JSON content and convert to HTML
const parseJsonContent = (jsonContent: string, violations?: string[]): string => {
  try {
    // Check if content is already HTML
    if (jsonContent && !jsonContent.trim().startsWith('[{') && !jsonContent.trim().startsWith('{')) {
      return jsonContent;
    }

    // Try to parse as JSON
    const parsed = JSON.parse(jsonContent);
    
    // Handle Quill Delta format with ops array
    if (parsed && parsed.ops && Array.isArray(parsed.ops)) {
      let html = '';
      let currentParagraph = '';
      
      parsed.ops.forEach((op: any) => {
        if (op.insert) {
          let content = op.insert;
          
          // Handle string content
          if (typeof content === 'string') {
            // Apply formatting based on attributes
            if (op.attributes) {
              if (op.attributes.bold) {
                content = `<strong>${content}</strong>`;
              }
              if (op.attributes.italic) {
                content = `<em>${content}</em>`;
              }
              if (op.attributes.underline) {
                content = `<u>${content}</u>`;
              }
              if (op.attributes.strike) {
                content = `<s>${content}</s>`;
              }
              if (op.attributes.code) {
                content = `<code>${content}</code>`;
              }
              if (op.attributes.link) {
                content = `<a href="${op.attributes.link}" target="_blank">${content}</a>`;
              }
              // Handle headers
              if (op.attributes.header) {
                const level = op.attributes.header;
                content = `<h${level}>${content}</h${level}>`;
              }
              // Handle text alignment
              if (op.attributes.align) {
                content = `<div style="text-align: ${op.attributes.align}">${content}</div>`;
              }
            }
            
            // Handle line breaks and paragraphs
            if (content.includes('\n')) {
              const lines = content.split('\n');
              lines.forEach((line: string, index: number) => {
                if (line.trim()) {
                  currentParagraph += line;
                }
                if (index < lines.length - 1) {
                  if (currentParagraph.trim()) {
                    html += `<p>${currentParagraph}</p>`;
                    currentParagraph = '';
                  } else {
                    html += '<br>';
                  }
                }
              });
              if (lines[lines.length - 1].trim()) {
                currentParagraph += lines[lines.length - 1];
              }
            } else {
              currentParagraph += content;
            }
          }
          // Handle embeds (images, videos, etc.)
          else if (typeof content === 'object') {
            if (content.image) {
              html += `<img src="${content.image}" alt="Image" style="max-width: 100%; height: auto;" />`;
            }
            if (content.video) {
              html += `<video controls style="max-width: 100%; height: auto;"><source src="${content.video}" /></video>`;
            }
          }
        }
      });
      
      // Add any remaining content as a paragraph
      if (currentParagraph.trim()) {
        html += `<p>${currentParagraph}</p>`;
      }
      
      const finalHtml = html || '<p>Không có nội dung</p>';
      return violations && violations.length > 0 ? highlightViolations(finalHtml, violations) : finalHtml;
    }
    
    // Handle legacy array format (old implementation)
    if (Array.isArray(parsed)) {
      const legacyHtml = parsed.map(block => {
        if (block.insert && typeof block.insert === 'string') {
          let content = block.insert;
          
          // Apply formatting based on attributes
          if (block.attributes) {
            if (block.attributes.bold) {
              content = `<strong>${content}</strong>`;
            }
            if (block.attributes.italic) {
              content = `<em>${content}</em>`;
            }
            if (block.attributes.underline) {
              content = `<u>${content}</u>`;
            }
            if (block.attributes.font === 'serif') {
              content = `<span style="font-family: serif;">${content}</span>`;
            }
          }
          
          // Handle line breaks
          if (content === '\n') {
            return '<br>';
          }
          
          return content;
        }
        return '';
      }).join('');
      
      return violations && violations.length > 0 ? highlightViolations(legacyHtml, violations) : legacyHtml;
    }
    
    // If it's a single object, try to extract text
    if (typeof parsed === 'object' && parsed.insert) {
      const singleContent = parsed.insert;
      return violations && violations.length > 0 ? highlightViolations(singleContent, violations) : singleContent;
    }
    
    // Fallback: return original content
    const fallbackContent = jsonContent;
    return violations && violations.length > 0 ? highlightViolations(fallbackContent, violations) : fallbackContent;
  } catch (error) {
    
    // If parsing fails, try to extract readable text from the JSON string
    try {
      // Extract text between quotes that looks like content
      const textMatches = jsonContent.match(/"insert":"([^"]*)"/g);
      if (textMatches) {
        const extractedText = textMatches
          .map(match => {
            const text = match.replace('"insert":"', '').replace('"', '');
            return text === '\\n' ? '<br>' : text;
          })
          .join('')
          .replace(/\\n/g, '<br>');
        
        return violations && violations.length > 0 ? highlightViolations(extractedText, violations) : extractedText;
      }
    } catch (e) {
      console.error('Error extracting text from JSON:', e);
    }
    
    // Final fallback: return original content
    const finalFallback = jsonContent || '<p>Không có nội dung</p>';
    return violations && violations.length > 0 ? highlightViolations(finalFallback, violations) : finalFallback;
  }
};



// Define the info table data dynamically
const getBlogInfo = (
  blog: Blog,
  navigate: ReturnType<typeof useNavigate>,
  blogStatus: string,
  handleToggleBlogStatus: () => void,
  handleViewReport: () => void,
  handleTogglePinStatus: () => void,
  handleToggleVisibility: () => void
) => {
  const infoItems = [
    {
      label: 'Lượt xem',
      value: blog.viewCount || 0,
      icon: <Eye className="w-4 h-4 text-gray-500" />,
    },
    {
      label: 'Lượt thích',
      value: blog.likeCount || 0,
      icon: <ThumbsUp className="w-4 h-4 text-gray-500" />,
    },
    {
      label: 'Bình luận',
      value: blog.commentCount || 0,
      icon: <MessageCircle className="w-4 h-4 text-gray-500" />,
    },
    {
      label: 'Tác giả',
      value: (
        <button
          onClick={() => blog.authorId && navigate(`/officer/user-blog-detail/${blog.authorId}`)}
          className="text-blue-600 hover:underline disabled:text-gray-500 disabled:no-underline disabled:cursor-not-allowed"
          disabled={!blog.authorId}
        >
          {blog.authorName || 'Chưa có tác giả'}
        </button>
      ),
      icon: <User className="w-4 h-4 text-gray-500" />,
    },
    {
      label: 'Ngày đăng',
      value: blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('vi-VN') : 'Chưa có ngày',
      icon: <Calendar className="w-4 h-4 text-gray-500" />,
    },
    {
      label: 'Chỉnh sửa lần cuối',
      value: blog.updatedAt ? new Date(blog.updatedAt).toLocaleDateString('vi-VN') : 'Chưa có ngày',
      icon: <Pencil className="w-4 h-4 text-gray-500" />,
    },
    {
      label: 'Báo cáo',
      value: (
        <div className="flex items-center gap-2">
          {blog.reportCount || 0}
          <button
            onClick={handleViewReport}
            className="ml-2 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition"
          >
            Xem
          </button>
        </div>
      ),
      icon: <Flag className="w-4 h-4 text-gray-500" />,
    },
    {
      label: '',
      value: (
        <button
          onClick={handleToggleBlogStatus}
          className={`flex items-center gap-2 px-4 py-2 rounded font-semibold transition text-sm
            ${blogStatus === 'Đã xuất bản'
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
        >
          {blogStatus === 'Đã xuất bản' ? (
            <>
              <EyeOff className="w-4 h-4" /> Không duyệt bài viết
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" /> Duyệt bài viết
            </>
          )}
        </button>
      ),
      icon: null,
    },
  ];

  if (blog.isApproved) {
    infoItems.push(
      {
        label: '',
        value: (
          <button
            onClick={handleTogglePinStatus}
            className={`flex items-center gap-2 px-4 py-2 rounded font-semibold transition text-sm
              ${
                blog.pinned
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
          >
            {blog.pinned ? (
              <>
                <Minus className="w-4 h-4" /> Bỏ ghim
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" /> Ghim
              </>
            )}
          </button>
        ),
        icon: null,
      },
      {
        label: '',
        value: (
          <button
            onClick={handleToggleVisibility}
            className={`flex items-center gap-2 px-4 py-2 rounded font-semibold transition text-sm
              ${
                blog.isVisible
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
          >
            {blog.isVisible ? (
              <>
                <EyeOff className="w-4 h-4" /> Ẩn
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" /> Hiện
              </>
            )}
          </button>
        ),
        icon: null,
      }
    );
  }

  return infoItems;
};



const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;
  const btnBase = 'p-2 rounded hover:bg-gray-100 focus:bg-gray-200 transition flex items-center justify-center';
  const btnActive = 'bg-blue-100 text-blue-600';
  return (
    <div className="sticky top-0 z-10 flex flex-wrap gap-1 border-b px-2 py-1 bg-white rounded-t shadow-sm">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`${btnBase} ${editor.isActive('bold') ? btnActive : ''}`} title="Bold"><Bold size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`${btnBase} ${editor.isActive('italic') ? btnActive : ''}`} title="Italic"><Italic size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`${btnBase} ${editor.isActive('underline') ? btnActive : ''}`} title="Underline"><UnderlineIcon size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={`${btnBase} ${editor.isActive('strike') ? btnActive : ''}`} title="Strikethrough"><Strikethrough size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().unsetAllMarks().run()} className={btnBase} title="Clear formatting"><Eraser size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} className={`${btnBase} ${editor.isActive('paragraph') ? btnActive : ''}`} title="Paragraph">P</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`${btnBase} ${editor.isActive('heading', { level: 1 }) ? btnActive : ''}`} title="Heading 1"><Heading1 size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`${btnBase} ${editor.isActive('heading', { level: 2 }) ? btnActive : ''}`} title="Heading 2"><Heading2 size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`${btnBase} ${editor.isActive('heading', { level: 3 }) ? btnActive : ''}`} title="Heading 3"><Heading3 size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} className={`${btnBase} ${editor.isActive('heading', { level: 4 }) ? btnActive : ''}`} title="Heading 4"><Heading4 size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()} className={`${btnBase} ${editor.isActive('heading', { level: 5 }) ? btnActive : ''}`} title="Heading 5"><Heading5 size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${btnBase} ${editor.isActive('bulletList') ? btnActive : ''}`} title="Bullet List"><List size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${btnBase} ${editor.isActive('orderedList') ? btnActive : ''}`} title="Ordered List"><ListOrdered size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btnBase} title="Horizontal Rule"><Minus size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`${btnBase} ${editor.isActive({ textAlign: 'left' }) ? btnActive : ''}`} title="Align Left"><AlignLeft size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`${btnBase} ${editor.isActive({ textAlign: 'center' }) ? btnActive : ''}`} title="Align Center"><AlignCenter size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`${btnBase} ${editor.isActive({ textAlign: 'right' }) ? btnActive : ''}`} title="Align Right"><AlignRight size={16} /></button>
    </div>
  );
};

// MediaSlider Component for handling images and videos
interface MediaSliderProps {
  mediaUrls: string[];
  alt: string;
}

const MediaSlider: React.FC<MediaSliderProps> = ({ mediaUrls, alt }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Helper function to determine if URL is a video
  const isVideo = (url: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext)) || 
           lowerUrl.includes('video') || 
           lowerUrl.includes('.mp4');
  };

  // Navigation functions
  const goToPrevious = () => {
    setCurrentIndex(prev => prev === 0 ? mediaUrls.length - 1 : prev - 1);
    setIsVideoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex(prev => prev === mediaUrls.length - 1 ? 0 : prev + 1);
    setIsVideoPlaying(false);
  };

  // Handle video play/pause
  const toggleVideoPlay = (videoElement: HTMLVideoElement) => {
    if (isVideoPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
    setIsVideoPlaying(!isVideoPlaying);
  };

  if (!mediaUrls || mediaUrls.length === 0) {
    return null;
  }

  const currentMedia = mediaUrls[currentIndex];
  const isCurrentVideo = isVideo(currentMedia);

  return (
    <div className="relative w-full h-64 mb-4 rounded-xl overflow-hidden shadow-sm border border-gray-200">
      {/* Media Display */}
      {isCurrentVideo ? (
        <div className="relative w-full h-full">
          <video
            src={currentMedia}
            className="w-full h-full object-cover"
            controls={false}
            onLoadedData={() => console.log('Video loaded:', currentMedia)}
            onError={() => console.error('Video failed to load:', currentMedia)}
            onClick={(e) => toggleVideoPlay(e.currentTarget)}
          />
          {/* Video Play/Pause Overlay */}
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 cursor-pointer"
            onClick={(e) => {
              const video = e.currentTarget.previousElementSibling as HTMLVideoElement;
              toggleVideoPlay(video);
            }}
          >
            <div className="bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition-all">
              {isVideoPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </div>
          </div>
        </div>
      ) : (
        <img
          src={currentMedia}
          alt={`${alt} ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          onLoad={() => console.log('Image loaded:', currentMedia)}
          onError={(e) => {
            console.error('Image failed to load:', currentMedia);
            e.currentTarget.style.display = 'none';
          }}
        />
      )}

      {/* Navigation Arrows - Only show if more than 1 media */}
      {mediaUrls.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all"
            aria-label="Previous media"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all"
            aria-label="Next media"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Media Counter - Only show if more than 1 media */}
      {mediaUrls.length > 1 && (
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
          {currentIndex + 1} / {mediaUrls.length}
        </div>
      )}

      {/* Media Type Indicator */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
        {isCurrentVideo ? 'Video' : 'Hình ảnh'}
      </div>

      {/* Dots Indicator - Only show if more than 1 media */}
      {mediaUrls.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {mediaUrls.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsVideoPlaying(false);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
              aria-label={`Go to media ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const BlogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State management
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [blogStatus, setBlogStatus] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [editableTitle, setEditableTitle] = useState('');
  const [editableDescription, setEditableDescription] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  // Fetch blog data when component mounts or ID changes
  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) {
        setError('ID bài viết không hợp lệ');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching blog with ID:', id);
        
        const response = await getBlogByIdOfficer(id);
        console.log('Blog API Response:', response);
        
        if (response) {
         
          setBlog(response.data);
          // Set blog status based on API response or default
          setBlogStatus(response.data.isApproved ? 'Đã xuất bản' : 'Chưa xuất bản'); 
          setEditableContent(response.data.content || '');
          setEditableTitle(response.data.title || '');
          
          setEditableDescription(response.data.content || ''); // Use content as description if no separate description
        } else {
          setError('Không tìm thấy bài viết');
        }
      } catch (err) {
       
        setError('Không thể tải bài viết. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };
    const fetchComments = async () => {
      if (!id) return;
      
      try {
       
        console.log('Fetching comments with blog ID:', id);
        
        const response = await getCommentByBlogId(id);
        console.log('Comment API Response:', response);
        
        if (response) {
          console.log('Setting comments data:', response);
          setComments(response.data || response || []);
        } else {
          setComments([]);
        }
      } catch (err) {
       
        setComments([]);
      } finally {
        
      }
    };

    fetchBlog();
    fetchComments();
  }, [id]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5] } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: parseJsonContent(editableContent),
    editorProps: {
      attributes: {
        class: 'min-h-[350px] outline-none px-4 py-2 bg-gray-50 border border-gray-200 rounded-b-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition placeholder-gray-400 shadow-sm',
        placeholder: 'Viết ở đây',
      },
    },
  });

  // Update editor content when blog data changes
  useEffect(() => {
    if (editor && blog?.content) {
      editor.commands.setContent(parseJsonContent(blog.content));
    }
  }, [editor, blog?.content]);

  // Toggle blog status (approve/reject)
  const handleToggleBlogStatus = async () => {
    if (!blog || !id) return;

    try {
      const newApprovalStatus = !blog.isApproved;
      await approveBlog(id, newApprovalStatus, blog.pinned);

      if (newApprovalStatus) {
        // If approving, also set visibility to true
        await visibilityBlog(id, true);
        setBlog(prev => (prev ? { ...prev, isApproved: newApprovalStatus, isVisible: true } : null));
        setBlogStatus('Đã xuất bản');
      } else {
        setBlog(prev => (prev ? { ...prev, isApproved: newApprovalStatus } : null));
        setBlogStatus('Chưa xuất bản');
      }

      setNotification({
        show: true,
        message: newApprovalStatus
          ? 'Bài viết đã được duyệt thành công và hiển thị!'
          : 'Bài viết đã được gỡ duyệt thành công!',
        type: 'success',
      });
    } catch (error) {
      console.error('Error toggling blog status:', error);
      setNotification({
        show: true,
        message: 'Có lỗi xảy ra khi thay đổi trạng thái duyệt bài viết',
        type: 'error',
      });
    }
  };

  const handleViewReport = () => {
    // Replace this with your actual logic (e.g., open modal, navigate, etc.)
    alert('Xem chi tiết báo cáo!');
  };

  // Handle pin/unpin blog
  const handleToggleVisibility = async () => {
    if (!blog || !id) return;

    try {
      const newVisibleStatus = !blog.isVisible;
      await visibilityBlog(id, newVisibleStatus);
      setBlog(prev => (prev ? { ...prev, isVisible: newVisibleStatus } : null));

      setNotification({
        show: true,
        message: newVisibleStatus
          ? 'Bài viết đã được hiển thị thành công!'
          : 'Bài viết đã được ẩn thành công!',
        type: 'success',
      });
    } catch (error) {
      console.error('Error toggling visibility status:', error);
      setNotification({
        show: true,
        message: 'Có lỗi xảy ra khi thay đổi trạng thái hiển thị bài viết',
        type: 'error',
      });
    }
  };

  const handleTogglePinStatus = async () => {
    if (!blog || !id) return;

    try {
      const newPinnedStatus = !blog.pinned;
      // Ensure only the pinned status is sent
      await approveBlog(id, blog.isApproved, newPinnedStatus);
      setBlog(prev => (prev ? { ...prev, pinned: newPinnedStatus } : null));

      // Show success notification
      setNotification({
        show: true,
        message: newPinnedStatus
          ? 'Bài viết đã được ghim thành công!'
          : 'Bài viết đã được bỏ ghim thành công!',
        type: 'success',
      });
    } catch (error) {
      console.error('Error toggling pin status:', error);
      setNotification({
        show: true,
        message: 'Có lỗi xảy ra khi thay đổi trạng thái ghim bài viết',
        type: 'error',
      });
    }
  };

  // Handle back navigation
  const handleGoBack = () => {
    navigate('/officer/blog-view');
  };

  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim() || !id) {
      return;
    }

    // Store original comment text for error recovery
    const originalCommentText = commentText.trim();
    
    try {
      setIsSubmittingComment(true);
      
      const commentData: CommentCreateData = {
        content: originalCommentText,
        blogId: id
      };

      // Optimistic update - add comment immediately to UI
      
      
      // Add the new comment to the beginning of the list
      
      
      // Clear the comment input immediately
      setCommentText('');

      // Create the comment via API
      await createComment(commentData);
      
      // Refresh comments to get the actual comment from server
      const commentsResponse = await getCommentByBlogId(id);
      console.log('Comments refresh response:', commentsResponse);
      if (commentsResponse) {
        setComments(commentsResponse.data || commentsResponse || []);
      }
      
    } catch (error) {
      console.error('Error creating comment:', error);
      
      // Remove the temporary comment if API call failed
      setComments(prevComments => 
        prevComments.filter(comment => !comment.id.startsWith('temp-'))
      );
      
      // Restore the comment text so user can try again
      setCommentText(originalCommentText);
      
      // You might want to show a toast notification here
      alert('Lỗi khi gửi bình luận. Vui lòng thử lại.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Đang tải bài viết...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !blog) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-red-800 mb-2">Lỗi</h2>
                <p className="text-red-600 mb-4">{error || 'Không tìm thấy bài viết'}</p>
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại danh sách
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const blogInfo = getBlogInfo(blog, navigate, blogStatus, handleToggleBlogStatus, handleViewReport, handleTogglePinStatus, handleToggleVisibility);

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
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Blog Content */}
            <div className="flex-1 mb-6">
              {/* Editing Mode Banner */}
              {isEditing && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm animate-fade-in">Đang chỉnh sửa</span>
                </div>
              )}
              {/* Blog Title */}
              <div className={isEditing ? "mb-4" : "mb-2"}>
                {isEditing ? (
                  <input
                    type="text"
                    value={editableTitle}
                    onChange={e => setEditableTitle(e.target.value)}
                    className="text-3xl font-bold text-gray-900 w-full border border-blue-200 bg-blue-50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300 transition placeholder-gray-400 shadow-sm"
                    maxLength={200}
                    placeholder="Nhập tiêu đề bài viết..."
                    autoFocus
                  />
                ) : (
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {editableTitle || blog?.title || 'Không có tiêu đề'}
                  </h1>
                )}
              </div>
              {/* Blog Description */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  blog?.type === 'news' ? 'bg-blue-100 text-blue-800' :
                  blog?.type === 'guide' ? 'bg-green-100 text-green-800' :
                  blog?.type === 'announcement' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {blog?.type === 'news' ? 'Tin tức' :
                   blog?.type === 'guide' ? 'Hướng dẫn' :
                   blog?.type === 'announcement' ? 'Thông báo' :
                   blog?.type || 'Tin tức'}
                  
                </span>
                {blog?.pinned && (
                    <span className="ml-2 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Ghim</span>
                  )}
                  {blog?.isVisible && (
                    <span className="ml-2 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Hiển thị</span>
                  )}
                <span className={`px-2 py-1 rounded text-xs font-medium ${blogStatus === 'Đã xuất bản' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-500'}`}>{blogStatus}</span>
              </div>
              {/* Media Slider for images and videos */}
              {(() => {
                // Debug: Log blog data to console
                console.log('Blog data for media:', {
                  mediaUrls: blog?.mediaUrls,
                  thumbnail: blog?.thumbnail,
                  hasMediaUrls: blog?.mediaUrls && blog.mediaUrls.length > 0,
                  hasThumbnail: !!blog?.thumbnail
                });
                return null;
              })()}
              {((blog?.mediaUrls && blog.mediaUrls.length > 0) || blog?.thumbnail) && (
                <MediaSlider 
                  mediaUrls={blog?.mediaUrls || (blog?.thumbnail ? [blog.thumbnail] : [])} 
                  alt={editableTitle || blog?.title || 'Blog media'}
                />
              )}
              {/* Blog Content Editor/View */}
              <div className={isEditing ? "bg-white border border-blue-200 rounded-2xl shadow-lg p-6 mb-6 transition-all" : "text-gray-800 text-base mb-6 prose prose-blue max-w-none"}>
                {isEditing ? (
                  <>
                    <MenuBar editor={editor} />
                    <EditorContent editor={editor} className="editor-content w-full h-full min-h-[350px] outline-none mt-4" />
                  </>
                ) : (
                  <div dangerouslySetInnerHTML={{ 
                    __html: (() => {
                      // Extract violations from blog moderation data
                      let violations: string[] = [];
                      if (blog?.blogModeration?.violationsJson) {
                        try {
                          const violationsData = typeof blog.blogModeration.violationsJson === 'string' 
                            ? JSON.parse(blog.blogModeration.violationsJson)
                            : blog.blogModeration.violationsJson;
                          
                          if (Array.isArray(violationsData)) {
                            violations = violationsData.filter(v => typeof v === 'string' && v.trim());
                          } else if (typeof violationsData === 'object') {
                            Object.values(violationsData).forEach((value: any) => {
                              if (typeof value === 'string' && value.trim()) {
                                violations.push(value);
                              }
                            });
                          }
                        } catch (error) {
                          console.error('Error parsing violations for highlighting:', error);
                        }
                      }
                      
                      return parseJsonContent(
                        editableContent || blog?.content || '<p>Không có nội dung</p>',
                        violations
                      );
                    })()
                  }} />
                )}
              </div>
              {/* Action Buttons - only in edit mode */}
              {isEditing && (
                <div className="flex justify-end gap-3 mb-8">
                  <button
                    onClick={() => {
                      setEditableContent(editor?.getHTML() || '');
                      // Add this line to save the description:
                      // (If you want to persist to backend, add API call here)
                      setIsEditing(false);
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => {
                      editor?.commands.setContent(editableContent);
                      // Reset description to previous value on cancel:
                      setEditableDescription(editableDescription);
                      setIsEditing(false);
                    }}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold shadow hover:bg-gray-300 transition"
                  >
                    Hủy
                  </button>
                </div>
              )}
              {/* Edit Button - only in view mode */}
              {/* {!isEditing && (
                <div className="flex justify-end mb-6">
                  <button onClick={() => setIsEditing(true)} className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-300 transition">
                    Chỉnh sửa
                  </button>
                </div>
              )} */}
              {/* Comment Section */}
              <section className="bg-white rounded-xl shadow p-6 mb-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Bình luận
                </h2>
                {/* List of comments */}
                <ul className={`space-y-6 mb-6 ${comments.length > 5 ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
                  {comments.map((c, idx) => (
                    <li
                      key={c.id}
                      className={`${idx !== 0 ? 'border-t pt-6' : ''} flex gap-3 items-start`}
                    >
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg`}
                      >
                        {c.authorName[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{c.authorName}</span>
                          <span className="text-xs text-gray-400">{c.createdAt}</span>
                        </div>
                        <div className="text-gray-700 text-sm mt-1 line-clamp-4">
                          {c.content}
                        </div>
                      </div>
                     
                    </li>
                  ))}
                </ul>
                {/* Redesigned Add comment form */}
                <form onSubmit={handleCommentSubmit} className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 shadow-inner">
               
                  <textarea
                    id="comment"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none min-h-[40px] text-sm"
                    rows={1}
                    placeholder="Viết bình luận của bạn..."
                    disabled={isSubmittingComment}
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !commentText.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ minHeight: 40 }}
                  >
                    {isSubmittingComment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MessageCircle className="w-4 h-4" />
                    )}
                    {isSubmittingComment ? 'Đang gửi...' : 'Gửi'}
                  </button>
                </form>
              </section>
            </div>
            
            <aside className="w-full lg:w-1/3 flex-shrink-0">
              {/* Blog Information */}
              <div className="bg-white rounded-xl shadow p-6 mb-6 lg:top-6">
                <h2 className="text-lg font-semibold mb-4">Thông tin bài viết</h2>
                <ul className="space-y-3">
                  {blogInfo.map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm">
                        {item.icon} {item.label}
                      </span>
                      <span className="text-sm font-bold">{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI Blog Moderation Box */}
              {blog.blogModeration && (
                <div className="bg-white rounded-xl shadow p-6 mb-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-blue-600" />
                    <span>AI Kiểm duyệt bài viết</span>
                    <div className="ml-auto flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      <Brain className="w-3 h-3" />
                      <span>Tự động</span>
                    </div>
                  </h2>
                  
                  <div className="space-y-4">
                    {/* AI Analysis Results */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-600" />
                        Kết quả phân tích
                      </h3>
                      
                      <ul className="space-y-3">
                        <li className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm">
                            <Shield className="w-4 h-4 text-gray-500" />
                            Trạng thái kiểm duyệt
                          </span>
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            blog.blogModeration.isApproved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {blog.blogModeration.isApproved ? (
                              <><CheckCircle2 className="w-3 h-3" /> Đã duyệt</>
                            ) : (
                              <><Clock className="w-3 h-3" /> Chờ duyệt</>
                            )}
                          </span>
                        </li>

                        <li className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm">
                            <Heart className="w-4 h-4 text-gray-500" />
                            Ngôn từ lịch sự
                          </span>
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            blog.blogModeration.politeness 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {blog.blogModeration.politeness ? (
                              <><CheckCircle2 className="w-3 h-3" /> Lịch sự</>
                            ) : (
                              <><XCircle className="w-3 h-3" /> Không lịch sự</>
                            )}
                          </span>
                        </li>

                        <li className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm">
                            <Shield className="w-4 h-4 text-gray-500" />
                            Thông tin sai lệch / xuyên tạc
                          </span>
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            blog.blogModeration.nonToxic 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {blog.blogModeration.nonToxic ? (
                              <><AlertTriangle className="w-3 h-3" /> Có thể sai lệch</>
                             
                            ) : (
                              <><CheckCircle2 className="w-3 h-3" /> An toàn</>
                            )}
                          </span>
                        </li>

                        <li className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm">
                            <Sparkles className="w-4 h-4 text-gray-500" />
                            Ý nghĩa tích cực
                          </span>
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            blog.blogModeration.positiveMeaning 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {blog.blogModeration.positiveMeaning ? (
                              <><CheckCircle2 className="w-3 h-3" /> Tích cực</>
                            ) : (
                              <><XCircle className="w-3 h-3" /> Tiêu cực</>
                            )}
                          </span>
                        </li>

                        <li className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="w-4 h-4 text-gray-500" />
                            Đúng chủ đề
                          </span>
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            !blog.blogModeration.typeRequirement 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {!blog.blogModeration.typeRequirement ? (
                              <><AlertTriangle className="w-3 h-3" /> Cần sửa lại theo chủ đề</>
                            ) : (
                              <><CheckCircle2 className="w-3 h-3" /> Đạt yêu cầu</>
                            )}
                          </span>
                        </li>

                        <li className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-500" />
                            Thời gian phân tích
                          </span>
                          <span className="text-sm font-bold">
                            {new Date(blog.blogModeration.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* AI Reasoning */}
                    {blog.blogModeration.reasoning && (
                      <div className="border-t pt-4">
                        <h3 className="text-sm font-medium text-gray-800 mb-2 flex items-center gap-2">
                          <Brain className="w-4 h-4 text-blue-600" />
                          Lý do kiểm duyệt
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700 italic">
                            "{blog.blogModeration.reasoning}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* AI Detected Violations */}
                    {blog.blogModeration.violationsJson && (
                      <div className="border-t pt-4">
                        <h3 className="text-sm font-medium text-gray-800 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          Vi phạm được phát hiện
                        </h3>
                        <div className="space-y-2">
                          {(() => {
                            try {
                              // Parse the JSON if it's a string, or use directly if it's already an object
                              const violationsData = typeof blog.blogModeration.violationsJson === 'string' 
                                ? JSON.parse(blog.blogModeration.violationsJson)
                                : blog.blogModeration.violationsJson;
                              
                              // Extract violation phrases
                              const violations = [];
                              if (Array.isArray(violationsData)) {
                                violations.push(...violationsData);
                              } else if (typeof violationsData === 'object') {
                                // Extract values from object that contain violation text
                                Object.values(violationsData).forEach((value: any) => {
                                  if (typeof value === 'string' && value.trim()) {
                                    violations.push(value);
                                  }
                                });
                              }
                              
                              return violations.length > 0 ? violations.map((violation: string, index: number) => (
                                <div key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg">
                                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-red-800">{violation}</span>
                                </div>
                              )) : (
                                <div className="flex items-center gap-2 text-gray-500 p-2 bg-gray-50 rounded-lg">
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                  <span className="text-sm">Không có vi phạm cụ thể</span>
                                </div>
                              );
                            } catch (error) {
                              console.error('Error parsing violations JSON:', error);
                              return (
                                <div className="flex items-center gap-2 text-gray-500 p-2 bg-gray-50 rounded-lg">
                                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                                  <span className="text-sm">Không thể hiển thị thông tin vi phạm</span>
                                </div>
                              );
                            }
                          })()} 
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </main>
      </div>
      </div>
    </>
  );
};

export default BlogDetailPage;