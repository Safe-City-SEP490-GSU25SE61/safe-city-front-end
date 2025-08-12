import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { Image as ImageIcon, Edit2, FileText, X } from 'lucide-react';

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
  const [imageName, setImageName] = useState('');
  const [blogBrief, setBlogBrief] = useState('');
  const [blogType, setBlogType] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [wards, setWards] = useState<any[]>([]);
  const [wardsLoading, setWardsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  
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

  // Fetch wards on component mount
  useEffect(() => {
    const fetchWards = async () => {
      try {
        setWardsLoading(true);
        const wardsData = await getAllWards();
        setWards(wardsData || []);
      } catch (error) {
        console.error('Error fetching wards:', error);
        setWards([]);
      } finally {
        setWardsLoading(false);
      }
    };

    fetchWards();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    for (let i = 0; i < files.length && images.length + newFiles.length < 3; i++) {
      newFiles.push(files[i]);
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

  const handleRemoveImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get content from Quill editor
    const quillContent = quillInstance.current?.getContents();
    const quillText = quillInstance.current?.getText();
    
    // Title validation
    if (!title.trim()) {
      alert('Tiêu đề là bắt buộc.');
      return;
    }
    if (title.trim().length < 5) {
      alert('Tiêu đề phải có ít nhất 5 ký tự.');
      return;
    }
    if (title.trim().length > 100) {
      alert('Tiêu đề không được dài quá 100 ký tự.');
      return;
    }

    // Content validation
    if (!quillText?.trim()) {
      alert('Nội dung là bắt buộc.');
      return;
    }
    if (quillText.trim().length < 5) {
      alert('Nội dung phải có ít nhất 5 ký tự.');
      return;
    }
    if (quillText.trim().length > 8000) {
      alert('Nội dung không được dài quá 8000 ký tự.');
      return;
    }

    if (!blogType) {
      alert('Vui lòng chọn loại bài viết');
      return;
    }

    if (!selectedWard) {
      alert('Vui lòng chọn phường/xã');
      return;
    }

    setIsLoading(true);
    
    try {
      // Get content from Quill
      let deltaContent;
      if (quillInstance.current) {
        deltaContent = quillInstance.current.getContents();
      } else {
        deltaContent = quillContent;
      }

      // Sanitize content by removing unwanted styling attributes
      const sanitizedContent = sanitizeDeltaContent(deltaContent);
      var content = JSON.stringify(sanitizedContent);
      
      const blogData: BlogCreateOfficerData = {
        title: title.trim(),
        content: content,
        type: blogType,
        communeId: parseInt(selectedWard),
        mediaFiles: images.length > 0 ? images : undefined,
      };
      
      await createBlogOfficer(blogData);
      
      setShowSuccess(true);
      
      // Reset form after successful creation
      setTimeout(() => {
        navigate('/officer/blog-view');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating blog:', error);
      alert('Có lỗi xảy ra khi tạo blog. Vui lòng thử lại.');
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
                      <option value="Events">Sự kiện</option>
                      <option value="Alert">Cảnh báo</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phường/Xã</label>
                    <select
                      value={selectedWard}
                      onChange={e => setSelectedWard(e.target.value)}
                      className="w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
                      disabled={wardsLoading}
                    >
                      <option value="">Chọn phường/xã</option>
                      {wards.map((ward) => (
                        <option key={ward.id} value={ward.id}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
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
                      <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" id="blog-image-upload" disabled={images.length >= 3} />
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
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default CreateBlogPage;
