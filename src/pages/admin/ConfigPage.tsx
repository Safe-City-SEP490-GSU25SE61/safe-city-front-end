import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import { Settings, Edit, Save, X, Plus, Trash2, Loader2 } from 'lucide-react';
import { PaginationComponent } from '../../components/common/Pagination';
import { getConfig, updateConfig, createConfig, deleteConfig } from '../../services/api/congfig';
import NotificationBar from '../../components/common/NotificationBar';

// Define NotificationType locally as it's not exported from the component
export type NotificationType = "success" | "error" | "info";

// Type for a single configuration item
interface ConfigItem {
  id: string;
  key: string;
  value: string;
  description: string;
  category: string;
}

const ConfigPage: React.FC = () => {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingConfig, setEditingConfig] = useState<ConfigItem | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newConfig, setNewConfig] = useState({ key: '', value: '', description: '', category: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<ConfigItem | null>(null);
  const itemsPerPage = 5;

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const data = await getConfig();
      // API might return { items: [...] } or just [...] 
      setConfigs(Array.isArray(data) ? data : data.items || []);
      setError(null);
    } catch (err) {
      setError('Không thể tải cấu hình. Vui lòng thử lại.');
      setNotification({ message: 'Không thể tải cấu hình. Vui lòng thử lại.', type: 'error' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const paginatedConfigs = useMemo(() => {
    return configs.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [configs, currentPage]);

  const handleEdit = (config: ConfigItem) => {
    setEditingConfig({ ...config });
  };

  const handleCancel = () => {
    setEditingConfig(null);
  };

  const handleSave = async () => {
    if (editingConfig) {
      setIsSubmitting(true);
      try {
        await updateConfig(editingConfig);
        setNotification({ message: 'Cập nhật cấu hình thành công!', type: 'success' });
        fetchConfigs(); // Refresh data
        handleCancel();
      } catch (err) {
        setNotification({ message: 'Cập nhật thất bại. Vui lòng thử lại.', type: 'error' });
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const openDeleteModal = (config: ConfigItem) => {
    setConfigToDelete(config);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setConfigToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (configToDelete) {
      setIsSubmitting(true);
      try {
        await deleteConfig(configToDelete.id);
        setNotification({ message: 'Xóa cấu hình thành công!', type: 'success' });
        fetchConfigs();
        closeDeleteModal();
      } catch (err) {
        setNotification({ message: 'Xóa thất bại. Vui lòng thử lại.', type: 'error' });
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createConfig(newConfig);
      setNotification({ message: 'Tạo cấu hình mới thành công!', type: 'success' });
      setCreateModalOpen(false);
      setNewConfig({ key: '', value: '', description: '', category: '' });
      fetchConfigs();
    } catch (err) {
      setNotification({ message: 'Tạo mới thất bại. Vui lòng thử lại.', type: 'error' });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Settings className="w-8 h-8" />
                  Cấu hình hệ thống
                </h1>
                <p className="text-gray-600">
                  Quản lý và cập nhật các cài đặt và tham số của ứng dụng.
                </p>
              </div>
              <button 
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Tạo mới
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Giá trị</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-gray-200">
                  {paginatedConfigs.map((config) => (
                    <tr key={config.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {editingConfig?.id === config.id ? (
                          <input
                            type="text"
                            value={editingConfig.key}
                            onChange={(e) => setEditingConfig({ ...editingConfig, key: e.target.value })}
                            className="w-full bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 py-0.5" />
                        ) : (
                          config.key
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        {editingConfig?.id === config.id ? (
                          <input
                            type="text"
                            value={editingConfig.value}
                            onChange={(e) => setEditingConfig({ ...editingConfig, value: e.target.value })}
                            className="w-full bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded py-0.5 text-center" />
                        ) : (
                          <span className='font-semibold'>{config.value}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {editingConfig?.id === config.id ? (
                          <input
                            type="text"
                            value={editingConfig.description}
                            onChange={(e) => setEditingConfig({ ...editingConfig, description: e.target.value })}
                            className="w-full bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 py-0.5" />
                        ) : (
                          config.description
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingConfig?.id === config.id ? (
                          <input
                            type="text"
                            value={editingConfig.category}
                            onChange={(e) => setEditingConfig({ ...editingConfig, category: e.target.value })}
                            className="w-full bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 py-0.5" />
                        ) : (
                          config.category
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingConfig?.id === config.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={handleSave} disabled={isSubmitting} className="text-green-600 hover:text-green-800 disabled:opacity-50">
                              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            </button>
                            <button onClick={handleCancel} className="text-red-600 hover:text-red-800"><X className="w-5 h-5" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-3">
                            <button onClick={() => handleEdit(config)} className="text-gray-400 hover:text-gray-600"><Edit className="w-5 h-5" /></button>
                            <button onClick={() => openDeleteModal(config)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loading && (
                <div className="flex justify-center items-center p-6">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="ml-2">Đang tải dữ liệu...</p>
                </div>
              )}
              {!loading && error && (
                  <div className="text-center p-6 text-red-600">{error}</div>
              )}
              {!loading && !error && configs.length === 0 && (
                  <div className="text-center p-6 text-gray-500">Không có dữ liệu cấu hình.</div>
              )}
            </div>

            {configs.length > 0 && (
              <div className="flex justify-center">
                <PaginationComponent
                  totalItems={configs.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Tạo cấu hình mới</h2>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Key (e.g., NEW_FEATURE_FLAG)" 
                  value={newConfig.key} 
                  onChange={(e) => setNewConfig({ ...newConfig, key: e.target.value.toUpperCase() })} 
                  className="w-full p-2 border rounded-md" 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Value" 
                  value={newConfig.value} 
                  onChange={(e) => setNewConfig({ ...newConfig, value: e.target.value })} 
                  className="w-full p-2 border rounded-md" 
                  required 
                />
                <textarea 
                  placeholder="Description" 
                  value={newConfig.description} 
                  onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })} 
                  className="w-full p-2 border rounded-md" 
                  rows={3}
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Category" 
                  value={newConfig.category} 
                  onChange={(e) => setNewConfig({ ...newConfig, category: e.target.value })} 
                  className="w-full p-2 border rounded-md" 
                  required 
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setCreateModalOpen(false)} className="py-2 px-4 bg-gray-200 rounded-md hover:bg-gray-300">Hủy</button>
                <button type="submit" disabled={isSubmitting} className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 
                  {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <NotificationBar
        message={notification?.message || ''}
        type={notification?.type || 'info'}
        show={!!notification}
        onClose={() => setNotification(null)}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-red-600">Xác nhận xóa</h2>
            <p className="mb-6">Bạn có chắc chắn muốn xóa cấu hình <strong>{configToDelete?.key}</strong> không? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-end gap-3">
              <button onClick={closeDeleteModal} disabled={isSubmitting} className="py-2 px-4 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50">Hủy</button>
              <button onClick={handleDeleteConfirm} disabled={isSubmitting} className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300 flex items-center gap-2">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                {isSubmitting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigPage;
