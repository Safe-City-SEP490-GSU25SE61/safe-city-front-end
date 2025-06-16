import React, { useState } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, Eye, Trophy, Calendar, Star, Users } from 'lucide-react';
import SideBar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import FilterBar from '../../components/common/FilterBar';

const AchievementManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);

  // Modal state and form state
  const [modalForm, setModalForm] = useState({
    name: '',
    description: '',
    min_point: '',
    benefit: ''
  });

  // Sample achievements data
  const [achievements] = useState([
    {
      id: 'ACH001',
      name: 'Thành viên đồng',
      description: 'Đạt được khi tích lũy 500 điểm',
      category: 'milestone',
      points: 500,
      requirements: ['Tích lũy 500 điểm'],
      benefits: [
        'Mở khóa tính năng báo cáo nâng cao',
        'Nhận badge thành viên đồng',
        'Ưu tiên hiển thị bài viết cơ bản'
      ],
      status: 'active',
      earnedBy: 120,
      createdDate: '2025-01-15'
    },
    {
      id: 'ACH002',
      name: 'Thành viên bạc',
      description: 'Đạt được khi tích lũy 1000 điểm',
      category: 'milestone',
      points: 1000,
      requirements: ['Tích lũy 1000 điểm'],
      benefits: [
        'Mở khóa tính năng viết bài',
        'Nhận badge thành viên bạc',
        'Ưu tiên hiển thị bài viết và báo cáo',
        'Nhận thông báo sớm về sự kiện'
      ],
      status: 'active',
      earnedBy: 45,
      createdDate: '2025-01-20'
    },
    {
      id: 'ACH003',
      name: 'Thành viên vàng',
      description: 'Đạt được khi tích lũy 2000 điểm',
      category: 'milestone',
      points: 2000,
      requirements: ['Tích lũy 2000 điểm'],
      benefits: [
        'Mở khóa tất cả tính năng',
        'Nhận badge thành viên vàng',
        'Ưu tiên cao nhất trong hiển thị',
        'Nhận thông báo đặc biệt',
        'Được mời tham gia sự kiện đặc biệt'
      ],
      status: 'active',
      earnedBy: 15,
      createdDate: '2025-01-05'
    }
  ]);

  const categories = [
    { value: 'all', label: 'Tất cả' },
    { value: 'milestone', label: 'Mốc điểm' }
  ];

  // Filter achievements based on search and category
  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      milestone: 'bg-blue-100 text-blue-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (filters: Record<string, string>) => {
    setSelectedCategory(filters.category || 'all');
  };

  const handleModalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setModalForm({ ...modalForm, [e.target.name]: e.target.value });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalForm({ name: '', description: '', min_point: '', benefit: '' });
  };

  const handleModalSave = () => {
    // Here you would handle saving the achievement (API or state update)
    setIsModalOpen(false);
    setModalForm({ name: '', description: '', min_point: '', benefit: '' });
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Sidebar */}
      <SideBar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="max-w-8xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Quản lý thành tích
                  </h1>
                  <p className="text-gray-600">
                    Danh sách các thành tích có trong hệ thống
                  </p>
                </div>
                
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5" />
                  Thêm thành tích mới
                </button>
              </div>

              {/* Modal Popup */}
              {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-lg relative">
                    <h2 className="text-xl font-bold mb-6">Thêm/Chỉnh sửa thành tích</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên thành tích</label>
                        <input
                          type="text"
                          name="name"
                          value={modalForm.name}
                          onChange={handleModalChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea
                          name="description"
                          value={modalForm.description}
                          onChange={handleModalChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Điểm tối thiểu</label>
                        <input
                          type="number"
                          name="min_point"
                          value={modalForm.min_point}
                          onChange={handleModalChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quyền lợi</label>
                        <textarea
                          name="benefit"
                          value={modalForm.benefit}
                          onChange={handleModalChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={handleModalClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleModalSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Search and Filter Bar */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <FilterBar
                  searchPlaceholder="Tìm kiếm thành tích..."
                  onSearch={handleSearch}
                  onFilterChange={handleFilterChange}
                  filterOptions={{
                    category: categories
                  }}
                />
              </div>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAchievements.map((achievement) => (
                <div key={achievement.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
                  {/* Achievement Header */}
                  <div className="bg-blue-600 p-6 text-white">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{achievement.name}</h3>
                        <p className="text-blue-100 text-sm">{achievement.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(achievement.category)}`}>
                        {categories.find(c => c.value === achievement.category)?.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold">{achievement.points}</span>
                        <span className="text-blue-100 text-sm"> điểm</span>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-100 text-xs">Người đạt được</p>
                        <p className="text-xl font-bold">{achievement.earnedBy}</p>
                      </div>
                    </div>
                  </div>

                  {/* Achievement Content */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Yêu cầu:</h4>
                      <ul className="space-y-1">
                        {achievement.requirements.map((requirement, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                            {requirement}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Quyền lợi:</h4>
                      <ul className="space-y-1">
                        {achievement.benefits.map((benefit, index) => (
                          <li key={index} className="text-sm text-green-600 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">
                        Tạo: {new Date(achievement.createdDate).toLocaleDateString('vi-VN')}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(achievement.status)}`}>
                        {achievement.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                        <Eye className="w-4 h-4" />
                        Xem
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors">
                        <Edit2 className="w-4 h-4" />
                        Sửa
                      </button>
                      <button className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredAchievements.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy thành tích</h3>
                <p className="text-gray-600">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementManagement;
