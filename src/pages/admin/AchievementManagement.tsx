import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, Eye, Trophy, Calendar, Star, Users, X, Package, Medal } from 'lucide-react';
import SideBar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import FilterBar from '../../components/common/FilterBar';
import { getAllAchievementConfigs, createAchievementConfig, updateAchievementConfig, deleteAchievementConfig } from '../../services/api/achievement';
import NotificationBar from '../../components/common/NotificationBar';

const AchievementDetailModal = ({ details, onClose, onSave }: { details: { data: any, mode: 'view' | 'edit' | 'add' }, onClose: () => void, onSave: (data: any) => Promise<void> }) => {
  const [isEditing, setIsEditing] = useState(details.mode === 'edit' || details.mode === 'add');
  const [formData, setFormData] = useState(details.data);

  useEffect(() => {
    setIsEditing(details.mode === 'edit' || details.mode === 'add');
    setFormData({
      ...details.data,
      benefits: Array.isArray(details.data.benefits) ? details.data.benefits.join(', ') : (details.data.benefits || ''),
    });
  }, [details]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    onSave(formData);
  };

  const handleCancel = () => {
    if (details.mode === 'add') {
      onClose();
    } else {
      setIsEditing(false);
      setFormData({
        ...details.data,
        benefits: Array.isArray(details.data.benefits) ? details.data.benefits.join(', ') : (details.data.benefits || ''),
      });
    }
  };

  const formatDisplayDate = (date: string | Date | undefined) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return date.toString();
    }
    return dateObj.toLocaleString('vi-VN');
  };

  const getHeaderGradient = (points: number) => {
    if (points >= 10000) return 'from-purple-400 to-purple-800'; // Hero
    if (points >= 5000) return 'from-blue-200 to-blue-800';      // Platinum
    if (points >= 2000) return 'from-yellow-200 to-yellow-800';   // Gold
    if (points >= 1000) return 'from-gray-200 to-gray-800';      // Silver
    if (points >= 500) return 'from-yellow-300 to-yellow-800';     // Bronze
    return 'from-gray-100 to-gray-800';                          // Newbie
  };
 

  const statusInfo = details.data.status === 'active' 
    ? { text: 'Hoạt động', className: 'bg-green-500/20 text-green-500' }
    : { text: 'Tạm dừng', className: 'bg-red-500/20 text-red-500' };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-gray-100 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col transform animate-in zoom-in-95 duration-300">
        <div className={`bg-gradient-to-br ${getHeaderGradient(formData.points)} text-white p-6 rounded-t-2xl`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {details.mode === 'add' ? 'Thêm thành tích mới' : 'Chi tiết thành tích'}
                </h2>
                <p className="text-sm text-white/80">
                  {isEditing ? 'Chỉnh sửa thông tin thành tích' : 'Xem thông tin chi tiết thành tích'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold">{isEditing ? formData.name : details.data.name}</h3>
                <p className="text-white/80 max-w-lg mb-4">{isEditing ? formData.description : details.data.description}</p>
                {!isEditing && details.mode !== 'add' && (
                  <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${statusInfo.className}`}>
                    {statusInfo.text}
                  </span>
                )}
              </div>
              <div className="text-left sm:text-right">
                <p className="text-4xl font-bold">
                  {isEditing ? formData.points : details.data.points}
                  <span className="text-3xl font-medium text-white/80"> điểm</span>
                </p>
                {details.mode !== 'add' && (
                  <p className="text-sm text-white/80 mt-4">ID: #{details.data.id}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tên thành tích</label>
              {isEditing ? (
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500" />
              ) : (
                <p className="w-full bg-white p-3 rounded-lg border min-h-[48px]">{formData.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Điểm tối thiểu</label>
              {isEditing ? (
                <input type="number" name="points" value={formData.points} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500" />
              ) : (
                <p className="w-full bg-white p-3 rounded-lg border min-h-[48px]">{formData.points}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả</label>
              {isEditing ? (
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:ring-2 focus:ring-blue-500" />
              ) : (
                <p className="w-full bg-white p-3 rounded-lg border min-h-[84px]">{formData.description}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quyền lợi (cách nhau bằng dấu phẩy)</label>
              {isEditing ? (
                <textarea name="benefits" value={formData.benefits} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:ring-2 focus:ring-blue-500" />
              ) : (
                <p className="w-full bg-white p-3 rounded-lg border min-h-[84px]">{Array.isArray(formData.benefits) ? formData.benefits.join(', ') : formData.benefits}</p>
              )}
            </div>
            {details.mode !== 'add' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày tạo</label>
                  <p className="w-full bg-white p-3 rounded-lg border min-h-[48px]">{formatDisplayDate(formData.createdDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cập nhật lần cuối</label>
                  <p className="w-full bg-white p-3 rounded-lg border min-h-[48px]">{formatDisplayDate(formData.lastUpdated)}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="px-8 py-4 bg-white border-t rounded-b-2xl mt-auto flex justify-end gap-3">
          {isEditing ? (
            <>
              <button onClick={handleCancel} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Hủy</button>
              <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                {details.mode === 'add' ? 'Tạo mới' : 'Lưu thay đổi'}
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Chỉnh sửa</button>
          )}
        </div>
      </div>
    </div>
  );
};
const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  type = "danger"
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "⚠️",
          bgColor: "bg-red-600",
          buttonColor: "bg-red-600 hover:bg-red-700"
        };
      case "warning":
        return {
          icon: "⚠️",
          bgColor: "bg-yellow-600",
          buttonColor: "bg-yellow-600 hover:bg-yellow-700"
        };
      default:
        return {
          icon: "ℹ️",
          bgColor: "bg-blue-600",
          buttonColor: "bg-blue-600 hover:bg-blue-700"
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className={`${styles.bgColor} p-6 text-white rounded-t-2xl`}>
          <div className="flex items-center gap-3">
            <div className="text-2xl">{styles.icon}</div>
            <h3 className="text-xl font-bold">{title}</h3>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-6">{message}</p>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-6 py-2.5 text-white rounded-lg text-sm font-medium transition ${styles.buttonColor}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AchievementManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAchievement, setSelectedAchievement] = useState<{ data: any, mode: 'view' | 'edit' | 'add' } | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info"; show: boolean; }>({ message: "", type: "info", show: false });
  const [confirmationModal, setConfirmationModal] = useState<{ isOpen: boolean; achievementId: string | null; }>({ isOpen: false, achievementId: null });

  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getCategoryFromPoints = (points: number) => {
    if (points >= 10000) return 'hero';
    if (points >= 5000) return 'platinum';
    if (points >= 2000) return 'gold';
    if (points >= 1000) return 'silver';
    if (points >= 500) return 'bronze';
    return 'newbie';
  };

  const formatApiAchievement = (item: any) => ({
    id: item.id.toString(),
    name: item.name,
    description: item.description,
    points: item.minPoint,
    category: getCategoryFromPoints(item.minPoint),
    requirements: [`Tích lũy ${item.minPoint} điểm`],
    benefits: item.benefit ? item.benefit.split(',').map((s: string) => s.trim()) : [],
    status: 'active',
    earnedBy: item.earnedBy || 0,
    createdDate: item.createAt,
    lastUpdated: item.lastUpdated,
  });

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const response = await getAllAchievementConfigs();
        const achievementsList = response.data || (Array.isArray(response) ? response : []);

        if (achievementsList.length > 0) {
          const formattedAchievements = achievementsList.map(formatApiAchievement);
          setAchievements(formattedAchievements);
        } else {
          setAchievements([]);
        }
      } catch (error) {
        console.error('Failed to fetch achievements:', error);
        setAchievements([]);
        setNotification({ message: "Không thể tải danh sách thành tích.", type: "error", show: true });
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const categories = [
    { value: 'all', label: 'Tất cả' },
    { value: 'newbie', label: 'Newbie' },
    { value: 'bronze', label: 'Đồng' },
    { value: 'silver', label: 'Bạc' },
    { value: 'gold', label: 'Vàng' },
    { value: 'platinum', label: 'Bạch kim' },
    { value: 'hero', label: 'Hero of the Street' }
  ];

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      newbie: 'bg-gray-100 text-gray-800',
      bronze: 'bg-yellow-300 text-yellow-800',
      silver: 'bg-gray-200 text-gray-800',
      gold: 'bg-yellow-200 text-yellow-800',
      platinum: 'bg-gray-200 text-blue-800',
      hero: 'bg-purple-400 text-purple-800'
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

  const emptyAchievement = {
    name: '',
    description: '',
    points: 0,
    benefits: '',
    createdDate: new Date(),
  };

  const handleAddNewAchievement = () => {
    setSelectedAchievement({ data: emptyAchievement, mode: 'add' });
  };

  const handleSaveAchievement = async (formData: any) => {
    if (!selectedAchievement) return;
    const isAdding = selectedAchievement.mode === 'add';

    const apiData = {
      name: formData.name,
      description: formData.description,
      minPoint: Number(formData.points),
      benefit: formData.benefits,
    };

    try {
      if (isAdding) {
        const response = await createAchievementConfig(apiData);
        if(response.data){
            const newAchievement = formatApiAchievement(response.data);
            setAchievements([...achievements, newAchievement]);
            setNotification({ message: "Tạo thành tích mới thành công!", type: "success", show: true });
        }
      } else {
        const response = await updateAchievementConfig(selectedAchievement.data.id, apiData);
        if(response.data){
            const updatedAchievement = formatApiAchievement(response.data);
            setAchievements(achievements.map(a => a.id === updatedAchievement.id ? updatedAchievement : a));
            setNotification({ message: "Cập nhật thành tích thành công!", type: "success", show: true });
        }
      }
      setSelectedAchievement(null);
    } catch (error) {
      console.error("Failed to save achievement:", error);
      setNotification({ message: "Lỗi khi lưu thành tích.", type: "error", show: true });
    }
  };

  const handleDeleteAchievement = async (achievementId: string) => {
    try {
      await deleteAchievementConfig(achievementId);
      setAchievements(achievements.filter(a => a.id !== achievementId));
      setNotification({ message: "Xóa thành tích thành công!", type: "success", show: true });
    } catch (error) {
      console.error("Failed to delete achievement:", error);
      setNotification({ message: "Lỗi khi xóa thành tích.", type: "error", show: true });
    }
  };

  const openDeleteConfirmation = (achievementId: string) => {
    setConfirmationModal({ isOpen: true, achievementId });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({ isOpen: false, achievementId: null });
  };

  const confirmDelete = () => {
    if (confirmationModal.achievementId) {
      handleDeleteAchievement(confirmationModal.achievementId);
    }
    closeConfirmationModal();
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <NotificationBar
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={() => setNotification(n => ({ ...n, show: false }))}
        duration={3000}
      />
      <SideBar />

      <div className="flex-1 flex flex-col min-h-screen">
        <Header />

        <div className="flex-1 p-4 sm:p-6">
          <div className="max-w-8xl mx-auto">
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
                  onClick={handleAddNewAchievement}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5" />
                  Thêm thành tích mới
                </button>
              </div>

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

            {loading ? (
                <div className="text-center py-12">
                <Medal className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Đang tải thành tích...</h3>
                <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAchievements.map((achievement) => (
                  <div key={achievement.id} className={"overflow-hidden rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"}>
                    <div className={`${getCategoryColor(achievement.category)} p-6`}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold mb-2">{achievement.name}</h3>
                          <p className="text-gray-900 text-sm">{achievement.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(achievement.category)}`}>
                          {categories.find(c => c.value === achievement.category)?.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between"> 
                        <div>
                          <span className="text-2xl font-bold">{achievement.points}</span>
                          <span className="text-gray-900 text-sm"> điểm</span>
                        </div>
                        <div className="text-right">
                          <p className="text-blue-100 text-xs">Người đạt được</p>
                          <p className="text-xl font-bold">{achievement.earnedBy}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Yêu cầu:</h4>
                        <ul className="space-y-1">
                          {achievement.requirements.map((requirement: string, index: number) => (
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
                          {achievement.benefits.map((benefit: string, index: number) => (
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

                      <div className="flex gap-2">
                        <button onClick={() => setSelectedAchievement({ data: achievement, mode: 'view' })} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                          <Eye className="w-4 h-4" />
                          Xem
                        </button>
                        <button onClick={() => setSelectedAchievement({ data: achievement, mode: 'edit' })} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors">
                          <Edit2 className="w-4 h-4" />
                          Sửa
                        </button>
                        <button onClick={() => openDeleteConfirmation(achievement.id)} className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredAchievements.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy thành tích</h3>
                <p className="text-gray-600">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {selectedAchievement && (
        <AchievementDetailModal
          details={selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
          onSave={handleSaveAchievement}
        />
      )}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa thành tích này không? Hành động này không thể hoàn tác."
      />
    </div>
  );
};

export default AchievementManagement;
