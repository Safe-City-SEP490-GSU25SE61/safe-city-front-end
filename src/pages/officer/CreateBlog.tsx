import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { Image as ImageIcon, FileText, X, Video, AlertCircle } from 'lucide-react';

// Custom styles for mobile-friendly Quill editor with 15px default font size
const quillStyles = `
  .ql-toolbar {
    border-top: 1px solid #ccc;
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;
    border-radius: 8px 8px 0 0;
  }
  .ql-container {
    border-bottom: 1px solid #ccc;
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;
    border-radius: 0 0 8px 8px;
    font-size: 15px;
  }
  .ql-editor {
    min-height: 300px;
    font-size: 15px;
    line-height: 1.6;
  }
  .ql-editor p {
    font-size: 15px;
  }
  .ql-editor * {
    font-size: inherit;
  }
  .ql-size-15px {
    font-size: 15px;
  }
  .ql-picker.ql-size .ql-picker-label[data-value="15px"]::before,
  .ql-picker.ql-size .ql-picker-item[data-value="15px"]::before {
    content: '15px';
  }
  @media (max-width: 768px) {
    .ql-toolbar {
      padding: 8px;
    }
    .ql-toolbar .ql-formats {
      margin-right: 8px;
    }
    .ql-editor {
      padding: 12px;
      font-size: 15px;
    }
    .ql-editor p {
      font-size: 15px;
    }
  }
`;
import NotificationBar from '../../components/common/NotificationBar';
import SearchableSelect from '../../components/common/SearchableSelect';
import { createBlogOfficer } from '../../services/api/blog';
import type { BlogCreateOfficerData } from '../../services/api/blog';
import { getAllWards } from '../../services/api/ward';

// Function to sanitize Quill Delta content by removing unwanted styling attributes
const sanitizeDeltaContent = (deltaContent: any) => {
  if (!deltaContent || !deltaContent.ops) {
    return deltaContent;
  }

  // Define allowed attributes that we want to keep
  const allowedAttributes = [
    'bold', 'italic', 'underline', 'strike',
    'header', 'list', 'indent', 'align',
    'blockquote', 'code-block'
  ];

  // Process each operation in the Delta
  const sanitizedOps = deltaContent.ops.map((op: any) => {
    if (!op.attributes) {
      return op; // No attributes to sanitize
    }

    // Filter attributes to keep only allowed ones
    const sanitizedAttributes: any = {};
    Object.keys(op.attributes).forEach(key => {
      if (allowedAttributes.includes(key)) {
        sanitizedAttributes[key] = op.attributes[key];
      }
    });

    // Return operation with sanitized attributes
    return {
      insert: op.insert,
      ...(Object.keys(sanitizedAttributes).length > 0 && { attributes: sanitizedAttributes })
    };
  });

  return sanitizedOps;
};

const CreateBlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [imageName, setImageName] = useState('');
  const [videoName, setVideoName] = useState('');
  const [uploadError, setUploadError] = useState<string>('');
  const [blogType, setBlogType] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [wards, setWards] = useState<{label: string, value: string}[]>([]);
  const [wardsLoading, setWardsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ show: false, message: '', type: 'info' });
  
  // Quill editor setup
  const quillRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<Quill | null>(null);

  // Initialize Quill editor
  useEffect(() => {
    // Inject custom styles
    if (!document.getElementById('quill-custom-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'quill-custom-styles';
      styleElement.textContent = quillStyles;
      document.head.appendChild(styleElement);
    }

    if (quillRef.current && !quillInstance.current) {
      // Mobile-optimized toolbar configuration with font size
      const toolbarOptions = [
        ['bold', 'italic', 'underline'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'size': ['12px', '14px', '15px', '16px', '18px', '20px'] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['blockquote'],
        ['clean']
      ];

      quillInstance.current = new Quill(quillRef.current, {
        theme: 'snow',
        placeholder: 'Viết nội dung bài viết của bạn ở đây...',
        formats: ['bold', 'italic', 'underline', 'header', 'list', 'align', 'blockquote', 'size'],
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: {
              // Custom handlers can be added here if needed
            }
          }
        }
      });

      // Set default font size to 15px for new content
      quillInstance.current.format('size', '15px');
      
      // Set default formatting for the entire editor
      quillInstance.current.formatText(0, quillInstance.current.getLength(), {
        'size': '15px'
      });
      
      // Ensure new text has 15px font size by default
      quillInstance.current.on('text-change', (_, __, source) => {
        if (source === 'user') {
          const selection = quillInstance.current?.getSelection();
          if (selection) {
            const format = quillInstance.current?.getFormat(selection.index, selection.length);
            if (!format?.size) {
              quillInstance.current?.formatText(selection.index, selection.length, 'size', '15px');
            }
          }
        }
      });

      // Add text change listener for character count
      quillInstance.current.on('text-change', () => {
        const text = quillInstance.current?.getText() || '';
        setCharacterCount(text.trim().length);
      });
    }

    // Cleanup function
    return () => {
      if (quillInstance.current) {
        // Don't destroy the instance here as it might be needed
      }
    };
  }, []);

  // Cleanup video preview URL on component unmount
  useEffect(() => {
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [videoPreview]);

  // Fetch wards on component mount
  useEffect(() => {
    const fetchWards = async () => {
      try {
        setWardsLoading(true);
        const wardsData = await getAllWards();
        // Map wards to SearchableSelect format
        const mappedWards = (wardsData || []).map((ward: any) => ({
          label: ward.name,
          value: ward.id.toString()
        }));
        setWards(mappedWards);
      } catch (error) {
        console.error('Error fetching wards:', error);
        setWards([]);
      } finally {
        setWardsLoading(false);
      }
    };

    fetchWards();
  }, []);

  // File size validation helper
  const validateFileSize = (file: File, maxSizeMB: number = 50): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    setUploadError('');
    const newFiles: File[] = [];
    const maxImages = 10;
    
    // Check how many more images we can add
    const remainingSlots = maxImages - images.length;
    
    for (let i = 0; i < files.length && newFiles.length < remainingSlots; i++) {
      const file = files[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError(`File "${file.name}" không phải là ảnh hợp lệ.`);
        continue;
      }
      
      // Validate file size (50MB limit)
      if (!validateFileSize(file)) {
        setUploadError(`Ảnh "${file.name}" vượt quá giới hạn 50MB (${formatFileSize(file.size)}).`);
        continue;
      }
      
      newFiles.push(file);
    }
    
    if (newFiles.length === 0) return;
    
    // Show warning if hitting limit
    if (images.length + newFiles.length >= maxImages) {
      setUploadError(`Chỉ có thể tải lên tối đa ${maxImages} ảnh.`);
    }
    
    Promise.all(newFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    })).then(previews => {
      setImages(prev => [...prev, ...newFiles]);
      setImagePreviews(prev => [...prev, ...previews]);
    });
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadError('');
    
    // Validate file type
    if (!file.type.startsWith('video/')) {
      setUploadError(`File "${file.name}" không phải là video hợp lệ.`);
      return;
    }
    
    // Validate file size (50MB limit)
    if (!validateFileSize(file)) {
      setUploadError(`Video "${file.name}" vượt quá giới hạn 50MB (${formatFileSize(file.size)}).`);
      return;
    }
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setVideo(file);
    setVideoPreview(previewUrl);
    setVideoName(file.name);
  };

  const handleRemoveVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideo(null);
    setVideoPreview('');
    setVideoName('');
  };

  const handleRemoveImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
    setUploadError(''); // Clear any upload errors when removing images
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setNotification({
        show: true,
        message: 'Vui lòng nhập tiêu đề',
        type: 'error'
      });
      return;
    }
    
    if (!quillInstance.current) {
      setNotification({
        show: true,
        message: 'Trình soạn thảo chưa sẵn sàng',
        type: 'error'
      });
      return;
    }
    
    const content = quillInstance.current.getContents();
    if (!content || content.ops?.length === 0 || !quillInstance.current.getText().trim()) {
      setNotification({
        show: true,
        message: 'Vui lòng nhập nội dung bài viết',
        type: 'error'
      });
      return;
    }
    
    // Clear any upload errors
    setUploadError('');
    setIsLoading(true);
    
    try {
      // Apply 15px font size to all content before saving
      const currentLength = quillInstance.current.getLength();
      quillInstance.current.formatText(0, currentLength, { 'size': '15px' });
      
      // Get the updated content after formatting
      const formattedContent = quillInstance.current.getContents();
      
      // Sanitize the content to remove unwanted styling
      const sanitizedOps = sanitizeDeltaContent(formattedContent);
      
      // Prepare media URLs array
      const mediaUrls: string[] = [];
      
      // Add image placeholders (in real implementation, these would be uploaded to a server)
      if (images.length > 0) {
        images.forEach((_, index) => {
          mediaUrls.push(`placeholder-image-${index + 1}-url`);
        });
      }
      
      // Add video placeholder if video exists
      if (video) {
        mediaUrls.push('placeholder-video-url');
      }
      
      // Prepare media files array for actual upload
      const mediaFiles: File[] = [];
      
      // Add images to media files
      if (images.length > 0) {
        mediaFiles.push(...images);
      }
      
      // Add video to media files
      if (video) {
        mediaFiles.push(video);
      }
      
      const blogData: BlogCreateOfficerData = {
        title: title.trim(),
        content: JSON.stringify(sanitizedOps),
        type: blogType || '', // Default type for officers
        description: title.trim(),
        status: 'DRAFT',
        isPinned: false,
        tags: selectedWard ? [selectedWard] : undefined,
        mediaFiles: mediaFiles.length > 0 ? mediaFiles : undefined,
        communeId: selectedWard ? parseInt(selectedWard) : undefined
      };
      
      console.log('Submitting blog data:', {
        title: blogData.title,
        type: blogData.type,
        imageCount: images.length,
        hasVideo: !!video,
        videoSize: video ? formatFileSize(video.size) : 'N/A',
        totalMediaFiles: mediaFiles.length,
        mediaFileSizes: mediaFiles.map(f => `${f.name}: ${formatFileSize(f.size)}`)
      });
      
      const response = await createBlogOfficer(blogData);
      console.log('Blog created successfully:', response);
      
      // Show success notification
      setShowSuccess(true);
      
      // Navigate to blog view after a short delay
      setTimeout(() => {
        navigate('/officer/blog-view');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating blog:', error);
      setNotification({
        show: true,
        message: 'Có lỗi xảy ra khi tạo bài viết. Vui lòng thử lại.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NotificationBar
        message="Tạo blog thành công!"
        type="success"
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
      <NotificationBar
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={() => setNotification({ show: false, message: '', type: 'info' })}
      />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Tạo blog</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Main Blog Editor */}
              <div className="lg:col-span-2 flex flex-col gap-8">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6">
                  {/* Quill Editor */}
                  <div className="flex-1 min-h-[420px] overflow-auto">
                    <div ref={quillRef} className="min-h-[420px]" />
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className={`text-xs ${
                      characterCount > 8000 ? 'text-red-500' : 'text-gray-400'
                    }`}>
                      {characterCount}/8000
                    </span>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`px-8 py-2 rounded-full font-semibold shadow transition ${
                        isLoading 
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isLoading ? 'Đang đăng...' : 'Đăng'}
                    </button>
                  </div>
                </form>
              </div>
              {/* Sidebar for meta and image */}
              <div className="flex flex-col gap-8">
                {/* Title & Description Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-5 border border-gray-100">
                  <div className="font-semibold text-lg mb-2">Tiêu đề</div>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Tên tiêu đề"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-100 focus:border-blue-400 placeholder-gray-400 transition mb-2"
                    required
                  />
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loại bài viết</label>
                    <select
                      value={blogType}
                      onChange={e => setBlogType(e.target.value)}
                      className="w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
                    >
                      <option value="">Chọn loại bài viết</option>
                      <option value="Tip">Mẹo an toàn</option>
                      <option value="News">Tin tức</option>
                      <option value="Event">Sự kiện</option>
                      <option value="Alert">Cảnh báo</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <SearchableSelect
                      label="Phường/Xã"
                      options={wards}
                      value={selectedWard}
                      onChange={setSelectedWard}
                      placeholder="Chọn phường/xã"
                      searchPlaceholder="Tìm kiếm phường/xã..."
                      className="mb-2"
                    />
                    {wardsLoading && (
                      <p className="text-sm text-gray-500 mt-1">Đang tải danh sách phường/xã...</p>
                    )}
                  </div>
                </div>
                {/* Image Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-5 border border-gray-100">
                  <div className="font-semibold text-lg mb-2">Ảnh nền</div>
                  <div className="relative w-full">
                    <label htmlFor="blog-image-upload" className="block w-full min-h-[120px] h-36 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center mb-4 shadow-sm cursor-pointer transition hover:border-blue-400">
                      {imagePreviews.length > 0 ? (
                        <div className="flex gap-3 flex-wrap w-full h-full items-center justify-center">
                          {imagePreviews.map((src, idx) => (
                            <div key={idx} className="relative group h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0">
                              <img src={src} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover rounded-xl border border-gray-200" />
                              <button type="button" onClick={e => { e.stopPropagation(); handleRemoveImage(idx); }} className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-red-100 hover:text-red-600 transition opacity-80 group-hover:opacity-100">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-300 flex flex-col items-center">
                          <ImageIcon className="h-12 w-12 mb-2" />
                          <span className="text-base text-gray-400">Chưa có ảnh</span>
                          <span className="text-xs text-gray-400 mt-1">Nhấn để tải lên (tối đa 10 ảnh)</span>
                        </span>
                      )}
                      <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" id="blog-image-upload" disabled={images.length >= 10} />
                    </label>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <FileText className="h-5 w-5" />
                    </span>
                    <input
                      value={imageName}
                      onChange={e => setImageName(e.target.value)}
                      placeholder="Tên ảnh"
                      className="w-full border border-gray-200 bg-gray-50 rounded-full pl-10 pr-3 py-3 text-base focus:ring-2 focus:ring-blue-100 focus:border-blue-400 placeholder-gray-400 transition"
                    />
                  </div>
                </div>
                
                {/* Video Upload Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-5 border border-gray-100">
                  <div className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Video (tùy chọn)
                  </div>
                  <div className="relative w-full">
                    <label htmlFor="blog-video-upload" className="block w-full min-h-[120px] h-36 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center mb-4 shadow-sm cursor-pointer transition hover:border-blue-400">
                      {videoPreview ? (
                        <div className="relative group w-full h-full">
                          <video src={videoPreview} className="h-full w-full object-cover rounded-xl border border-gray-200" controls />
                          <button type="button" onClick={e => { e.stopPropagation(); handleRemoveVideo(); }} className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-red-100 hover:text-red-600 transition opacity-80 group-hover:opacity-100">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-300 flex flex-col items-center">
                          <Video className="h-12 w-12 mb-2" />
                          <span className="text-base text-gray-400">Chưa có video</span>
                          <span className="text-xs text-gray-400 mt-1">Nhấn để tải lên (tối đa 50MB)</span>
                        </span>
                      )}
                      <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" id="blog-video-upload" disabled={!!video} />
                    </label>
                  </div>
                  {video && (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Video className="h-5 w-5" />
                      </span>
                      <input
                        value={videoName}
                        onChange={e => setVideoName(e.target.value)}
                        placeholder="Tên video"
                        className="w-full border border-gray-200 bg-gray-50 rounded-full pl-10 pr-3 py-3 text-base focus:ring-2 focus:ring-blue-100 focus:border-blue-400 placeholder-gray-400 transition"
                      />
                    </div>
                  )}
                </div>
                
                {/* Upload Error Display */}
                {uploadError && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="text-red-700 text-sm">{uploadError}</div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default CreateBlogPage;
