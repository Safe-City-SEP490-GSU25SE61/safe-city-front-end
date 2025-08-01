import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import TextAlign from '@tiptap/extension-text-align';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered, Code2, AlignLeft, AlignCenter, AlignRight, Eraser, Heading1, Heading2, Heading3, Heading4, Heading5, Minus, Image as ImageIcon, Edit2, FileText, X } from 'lucide-react';
import NotificationBar from '../../components/common/NotificationBar';
import { createBlogOfficer } from '../../services/api/blog';
import type { BlogCreateOfficerData } from '../../services/api/blog';
import { getAllWards } from '../../services/api/ward';


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

  const editor = useEditor({
    extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3, 4, 5] }
        }),
        Underline,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ],
    content: '',
    editorProps: {
      attributes: {
        class: 'min-h-[350px] outline-none px-4 py-2 bg-gray-50 border border-gray-200 rounded-b-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition',
        placeholder: 'Viết ở đây',
      },
    },
  });

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
    
    if (!title.trim() || !editor?.getHTML()?.trim()) {
      alert('Vui lòng nhập tiêu đề và nội dung blog');
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
      const content = editor.getHTML();
      
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
                  <MenuBar editor={editor} />
                  <div className="flex-1 min-h-[420px] overflow-auto">
                    <EditorContent editor={editor} className="editor-content w-full h-full min-h-[420px] outline-none" />
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-gray-400 text-xs">0/2000</span>
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
                          <span className="text-xs text-gray-400 mt-1">Nhấn để tải lên (tối đa 3 ảnh)</span>
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
