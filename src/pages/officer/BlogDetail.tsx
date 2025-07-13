import React from 'react';
import Sidebar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import { Eye, ThumbsUp, MessageCircle, User, Calendar, Pencil, EyeOff, CheckCircle, Flag, Bold, Italic, UnderlineIcon, Strikethrough, Eraser, Heading1, Heading2, Heading3, Heading4, Heading5, List, ListOrdered, Minus, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';

const blog = {
  id: 1,
  image: 'https://placehold.co/600x400?text=SafeCity+Blog',
  title: 'SafeCity: Giải pháp an toàn cho thành phố thông minh',
  description: 'SafeCity là nền tảng công nghệ giúp nâng cao an ninh, an toàn cho cộng đồng đô thị hiện đại.',
  content: `
    <h2>Giới thiệu</h2>
    <p>Hệ thống quản lý mới được thiết kế để giúp các cán bộ quản lý công việc một cách hiệu quả và khoa học hơn.</p>

    <h2>Các tính năng chính</h2>
    <ul>
      <li>Quản lý tài liệu điện tử</li>
      <li>Theo dõi tiến độ công việc</li>
      <li>Báo cáo tự động</li>
      <li>Tích hợp với các hệ thống khác</li>
    </ul>

    <h2>Hướng dẫn sử dụng</h2>
    <p>Để bắt đầu sử dụng hệ thống, vui lòng làm theo các bước sau:</p>
    <ol>
      <li>Đăng nhập vào hệ thống bằng tài khoản được cấp</li>
      <li>Cập nhật thông tin cá nhân</li>
      <li>Tham gia các khóa đào tạo cơ bản</li>
      <li>Bắt đầu sử dụng các tính năng chính</li>
    </ol>

    <h2>Lưu ý quan trọng</h2>
    <p>Trong quá trình sử dụng, nếu gặp bất kỳ khó khăn nào, vui lòng liên hệ với bộ phận hỗ trợ kỹ thuật để được trợ giúp kịp thời.</p>
  `,
  category: 'Tin tức',
  categoryColor: 'bg-blue-100 text-blue-800',
  status: 'Đã xuất bản',
  statusColor: 'bg-green-100 text-green-800',
  author: 'SafeCity Team',
  date: '01/06/2024',
  lastEditDate: '05/06/2024',
  views: 2024,
  likes: 123,
  comments: 8,
  report: 10,
};

// Define the info table data dynamically
const getBlogInfo = (
  blog: any,
  blogStatus: string,
  handleToggleBlogStatus: () => void,
  handleViewReport: () => void // <-- add this parameter
) => [
  {
    label: 'Lượt xem',
    value: blog.views,
    icon: <Eye className="w-5 h-5" />,
  },
  {
    label: 'Lượt thích',
    value: blog.likes,
    icon: <ThumbsUp className="w-5 h-5" />,
  },
  {
    label: 'Bình luận',
    value: blog.comments,
    icon: <MessageCircle className="w-5 h-5" />,
  },
  {
    label: 'Tác giả',
    value: blog.author,
    icon: <User className="w-5 h-5" />,
  },
  {
    label: 'Ngày đăng',
    value: blog.date,
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    label: 'Chỉnh sửa lần cuối',
    value: blog.lastEditDate,
    icon: <Pencil className="w-5 h-5" />,
  },
  {
    label: 'Báo cáo',
    value: (
      <div className="flex items-center gap-2">
        {blog.report}
        <button
          onClick={handleViewReport}
          className="ml-2 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition"
        >
          Xem
        </button>
      </div>
    ),
    icon: <Flag className="w-5 h-5" />,
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
            <EyeOff className="w-4 h-4" /> Ẩn bài viết
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

const initialComments = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    time: '2 giờ trước',
    content: 'Bài viết rất hữu ích, cảm ơn tác giả!',
    color: 'bg-blue-100 text-blue-700',
    hidden: false,
    report: 2,
  },
  {
    id: 2,
    name: 'Trần Thị B',
    time: '1 giờ trước',
    content: 'Mong sẽ có thêm nhiều bài viết như thế này.',
    color: 'bg-pink-100 text-pink-700',
    hidden: false,
    report: 0,
  },
];

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

const BlogDetailPage: React.FC = () => {
  const [comments, setComments] = React.useState(initialComments);
  const [blogStatus, setBlogStatus] = React.useState(blog.status);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editableContent, setEditableContent] = React.useState(blog.content);
  const [editableTitle, setEditableTitle] = React.useState(blog.title);
  const [editableDescription, setEditableDescription] = React.useState(blog.description);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5] } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: editableContent,
    editorProps: {
      attributes: {
        class: 'min-h-[350px] outline-none px-4 py-2 bg-gray-50 border border-gray-200 rounded-b-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition',
        placeholder: 'Viết ở đây',
      },
    },
  });

  // Hide a comment
  const handleHideComment = (id: number) => {
    setComments(comments =>
      comments.map(c => (c.id === id ? { ...c, hidden: true } : c))
    );
  };

  // Toggle blog status
  const handleToggleBlogStatus = () => {
    setBlogStatus(status =>
      status === 'Đã xuất bản' ? 'Đã ẩn' : 'Đã xuất bản'
    );
  };

  const handleViewReport = () => {
    // Replace this with your actual logic (e.g., open modal, navigate, etc.)
    alert('Xem chi tiết báo cáo!');
  };

  const blogInfo = getBlogInfo(blog, blogStatus, handleToggleBlogStatus, handleViewReport);

  return (
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
                    {editableTitle}
                  </h1>
                )}
              </div>
              {/* Blog Description */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${blog.categoryColor}`}>{blog.category}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${blogStatus === 'Đã xuất bản' ? blog.statusColor : 'bg-gray-200 text-gray-500'}`}>{blogStatus}</span>
              </div>
              <img src={blog.image} alt={editableTitle} className="w-full h-64 object-cover rounded-xl mb-4 shadow-sm border border-gray-200" />
              {/* Description: editable in edit mode */}
              <div className="text-gray-600 text-base mb-4">
                {isEditing ? (
                  <textarea
                    value={editableDescription}
                    onChange={e => setEditableDescription(e.target.value)}
                    className="w-full border border-blue-200 bg-blue-50 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 transition placeholder-gray-400 shadow-sm"
                    maxLength={500}
                    placeholder="Nhập mô tả bài viết..."
                    rows={3}
                  />
                ) : (
                  editableDescription
                )}
              </div>
              {/* Blog Content Editor/View */}
              <div className={isEditing ? "bg-white border border-blue-200 rounded-2xl shadow-lg p-6 mb-6 transition-all" : "text-gray-800 text-base mb-6 prose prose-blue max-w-none"}>
                {isEditing ? (
                  <>
                    <MenuBar editor={editor} />
                    <EditorContent editor={editor} className="editor-content w-full h-full min-h-[350px] outline-none mt-4" />
                  </>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: editableContent }} />
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
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 transition"
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
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold shadow hover:bg-gray-300 focus:ring-2 focus:ring-gray-300 transition"
                  >
                    Hủy
                  </button>
                </div>
              )}
              {/* Edit Button - only in view mode */}
              {!isEditing && (
                <div className="flex justify-end mb-6">
                  <button onClick={() => setIsEditing(true)} className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-300 transition">
                    Chỉnh sửa
                  </button>
                </div>
              )}
              {/* Comment Section */}
              <section className="bg-white rounded-xl shadow p-6 mb-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Bình luận
                </h2>
                {/* List of comments */}
                <ul className="space-y-6 mb-6">
                  {comments.map((c, idx) => (
                    <li
                      key={c.id}
                      className={`${idx !== 0 ? 'border-t pt-6' : ''} flex gap-3 items-start ${
                        c.hidden ? 'opacity-50 bg-gray-50' : ''
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${c.color}`}
                      >
                        {c.name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{c.name}</span>
                          <span className="text-xs text-gray-400">{c.time}</span>
                          {typeof c.report === 'number' && c.report > 0 && (
                            <span className="ml-2 px-2 py-0.5 rounded bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-1">
                              <Flag className="w-3 h-3" /> {c.report}
                            </span>
                          )}
                          {c.hidden && (
                            <span className="ml-2 px-2 py-0.5 rounded bg-red-100 text-red-600 text-xs font-semibold">
                              Đã ẩn
                            </span>
                          )}
                        </div>
                        <div className="text-gray-700 text-sm mt-1 line-clamp-4">
                          {c.content}
                        </div>
                      </div>
                      {/* Officer hide/unhide button */}
                      {c.hidden ? (
                        <button
                          onClick={() =>
                            setComments((prev) =>
                              prev.map((com) =>
                                com.id === c.id ? { ...com, hidden: false } : com
                              )
                            )
                          }
                          className="ml-2 text-xs text-green-600 hover:underline flex items-center gap-1"
                          title="Hiện bình luận"
                        >
                          <Eye className="w-4 h-4" /> Hiện
                        </button>
                      ) : (
                        <button
                          onClick={() => handleHideComment(c.id)}
                          className="ml-2 text-xs text-red-500 hover:underline flex items-center gap-1"
                          title="Ẩn bình luận"
                        >
                          <EyeOff className="w-4 h-4" /> Ẩn
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                {/* Redesigned Add comment form */}
                <form className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 shadow-inner">
                  {/* Avatar (replace with user avatar if available) */}
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-base">
                    A
                  </div>
                  <textarea
                    id="comment"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none min-h-[40px] text-sm"
                    rows={1}
                    placeholder="Viết bình luận của bạn..."
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-1"
                    style={{ minHeight: 40 }}
                  >
                    <MessageCircle className="w-4 h-4" /> Gửi
                  </button>
                </form>
              </section>
            </div>
            
            <aside className="w-full lg:w-1/3 flex-shrink-0">
              <div className="bg-white rounded-xl shadow p-6 mb-6 lg:sticky lg:top-6">
                <h2 className="text-lg font-semibold mb-4">Thông tin bài viết</h2>
                <ul className="space-y-3">
                  {blogInfo.map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {item.icon} {item.label}
                      </span>
                      <span className="font-bold">{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BlogDetailPage;
