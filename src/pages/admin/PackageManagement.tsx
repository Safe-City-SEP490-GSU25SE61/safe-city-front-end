import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, Eye, Package, Calendar, DollarSign, Users, X } from 'lucide-react';
import SideBar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import FilterBar from '../../components/common/FilterBar';
import { getAllPackages, updatePackageById, createPackage, deletePackageById, getPackageChangeHistory } from '../../services/api/package';
import NotificationBar from '../../components/common/NotificationBar';

const FIELD_LABELS: Record<string, string> = {
  name: "Tên gói",
  description: "Mô tả",
  price: "Giá",
  durationDays: "Thời hạn (ngày)",
  isActive: "Trạng thái",
  color: "Màu sắc",
  // Add more as needed
};

const ChangeDetailModal = ({
  entry,
  onClose,
  fieldLabels,
  formatPrice,
  formatDuration,
  formatDisplayDate,
}: {
  entry: any;
  onClose: () => void;
  fieldLabels: Record<string, string>;
  formatPrice: (n: number) => string;
  formatDuration: (n: number) => string;
  formatDisplayDate: (d: any) => string;
}) => {
  if (!entry) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between bg-blue-600 p-5">
          <span className="text-xl font-bold text-white">Chi tiết thay đổi</span>
          <button
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <span className="font-medium text-gray-600">Thời gian thay đổi:</span>{" "}
            {formatDisplayDate(entry.changedAt)}
          </div>
          <div>
            <span className="font-medium text-gray-600">Hiệu lực từ:</span>{" "}
            {formatDisplayDate(entry.effectiveStart)}
          </div>
          <div>
            <span className="font-medium text-gray-600">Hiệu lực đến:</span>{" "}
            {entry.effectiveEnd ? formatDisplayDate(entry.effectiveEnd) : "Hiện tại"}
          </div>
          <div>
            <span className="font-medium text-gray-600">Người thay đổi:</span>{" "}
            {entry.changedBy || "Không rõ"}
          </div>
          <div className="mt-4">
            <span className="font-medium text-gray-600">Các trường đã thay đổi:</span>
            <ul className="mt-2 space-y-2">
              {entry.changes.map((change: any, idx: number) => (
                <li key={idx} className="p-2 rounded bg-gray-50 border">
                  <div>
                    <span className="font-semibold text-blue-700">
                      {fieldLabels[change.fieldName] || change.fieldDisplayName || change.fieldName}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-gray-500 line-through">
                      {change.fieldName === "Price"
                        ? formatPrice(Number(change.oldValue))
                        : change.oldValue?.toString()}
                    </span>
                    <span className="mx-1 text-gray-400">→</span>
                    <span className="text-green-700 font-semibold">
                      {change.fieldName === "Price"
                        ? formatPrice(Number(change.newValue))
                        : change.newValue?.toString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {entry.packageSnapshot && (
            <div className="mt-4 border-t pt-4">
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Thông tin gói tại thời điểm thay đổi</h4>
              <div className="space-y-1">
                <div><span className="font-medium text-gray-600">Tên gói:</span> {entry.packageSnapshot.name}</div>
                <div><span className="font-medium text-gray-600">Mô tả:</span> {entry.packageSnapshot.description}</div>
                <div><span className="font-medium text-gray-600">Thời hạn:</span> {entry.packageSnapshot.durationDays} ngày</div>
                <div>
                  <span className="font-medium text-gray-600">Trạng thái:</span>
                  {entry.packageSnapshot.isActive ? (
                    <span className="ml-2 text-green-600 font-semibold">Hoạt động</span>
                  ) : (
                    <span className="ml-2 text-red-600 font-semibold">Tạm dừng</span>
                  )}
                </div>
              </div>
            </div>
          )}
          <button
            className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const PackageDetailModal = ({ details, onClose, onSave }: { details: { data: any, mode: 'view' | 'edit' | 'add' }, onClose: () => void, onSave: (data: any) => Promise<void> }) => {
  const [isEditing, setIsEditing] = useState(details.mode === 'edit' || details.mode === 'add');
  const [formData, setFormData] = useState(details.data);
  const [selectedHistory, setSelectedHistory] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedChangeEntry, setSelectedChangeEntry] = useState<any | null>(null);

  useEffect(() => {
    setIsEditing(details.mode === 'edit' || details.mode === 'add');
    setFormData(details.data);

    // Fetch history if not adding a new package
    if (details.mode !== 'add' && details.data.id) {
      setLoadingHistory(true);
      getPackageChangeHistory(details.data.id)
        .then(setHistory)
        .catch(() => setHistory([]))
        .finally(() => setLoadingHistory(false));
    } else {
      setHistory([]);
    }
  }, [details]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData({ ...formData, [name]: checked });
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = () => {
    onSave(formData);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDuration = (days: number) => {
    if (days >= 36500) {
      return 'Vĩnh viễn';
    }
    return `${days} ngày`;
  };

  const formatDisplayDate = (date: string | Date | undefined) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return date.toString();
    }
    return dateObj.toLocaleString('vi-VN');
  };

  const onViewHistoryDetail = (entry: any) => {
    setSelectedHistory(entry);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header with solid blue background */}
        <div
          className="p-8 text-white relative overflow-hidden"
          style={{ backgroundColor: formData.color || "#2563eb" }}
        >
          <div className="absolute inset-0 bg-black opacity-10 pb-10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    {details.mode === 'add'
                      ? 'Thêm gói dịch vụ mới'
                      : isEditing
                        ? 'Chỉnh sửa gói dịch vụ'
                        : 'Chi tiết gói dịch vụ'}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {details.mode === 'add'
                      ? 'Nhập thông tin để tạo gói dịch vụ mới'
                      : isEditing
                        ? 'Cập nhật thông tin gói dịch vụ'
                        : 'Xem thông tin chi tiết gói dịch vụ'}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Package Preview Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">{formData.name}</h3>
                  <p className="text-blue-100 text-sm line-clamp-2">{formData.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{formatPrice(formData.price)}</div>
                  <div className="text-blue-100 text-sm">/{formatDuration(formData.durationDays)}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  formData.isActive 
                    ? 'bg-green-500/20 text-green-100 border border-green-300/30' 
                    : 'bg-gray-500/20 text-gray-100 border border-gray-300/30'
                }`}>
                  {formData.isActive ? '🟢 Hoạt động' : '🔴 Tạm dừng'}
                </span>
                <div className="text-blue-100 text-sm">
                  ID: #{formData.id}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 pt-2 sm:pt-4 space-y-6 bg-white min-h-0"
        style={{ maxHeight: '45vh', overflowY: 'auto' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Details */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tên gói</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  />
                ) : (
                  <div className="text-lg font-medium text-gray-900 bg-gray-50 p-3 rounded-lg">{formData.name}</div>
                )}
              </div>
              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả</label>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none"
                  />
                ) : (
                  <div className="text-gray-700 bg-gray-50 p-3 rounded-lg">{formData.description}</div>
                )}
              </div>
              {/* Color */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Màu sắc</label>
                {isEditing ? (
                  <input
                    type="color"
                    name="color"
                    value={formData.color || "#000000"}
                    onChange={handleChange}
                    className="w-16 h-10 p-1 border border-gray-300 rounded-lg"
                    style={{ background: "none" }}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-6 h-6 rounded-full border"
                      style={{ backgroundColor: formData.color || "#000" }}
                    />
                    <span className="text-gray-700">{formData.color || "Không có màu"}</span>
                  </div>
                )}
              </div>
              {/* Status */}
             
            </div>
            {/* Right: Meta Info */}
            <div className="space-y-4">
              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Giá (VND)</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  />
                ) : (
                  <div className="text-lg font-medium text-gray-900 bg-gray-50 p-3 rounded-lg">{formatPrice(formData.price)}</div>
                )}
              </div>
              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Thời hạn (ngày)</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="durationDays"
                    value={formData.durationDays}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  />
                ) : (
                  <div className="text-lg font-medium text-gray-900 bg-gray-50 p-3 rounded-lg">{formatDuration(formData.durationDays)}</div>
                )}
              </div>
              {/* Created/Updated */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tạo lúc</label>
                  <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{formatDisplayDate(formData.createAt)}</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Cập nhật</label>
                  <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{formatDisplayDate(formData.lastUpdated)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="my-8 border-t border-gray-200" />

  

          {/* Change History Section */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold mb-2">Lịch sử thay đổi gói</h4>
            {loadingHistory ? (
              <div>Đang tải lịch sử...</div>
            ) : history.length === 0 ? (
              <div className="text-gray-500">Chưa có lịch sử thay đổi</div>
            ) : (
              <div
                className="overflow-x-auto rounded-lg border border-gray-200 bg-white"
                style={{ maxHeight: '30vh', overflowY: 'auto' }}
              >
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100 sticky top-0 z-10">
                      <th className="px-4 py-2 text-left">Thời gian thay đổi</th>
                      <th className="px-4 py-2 text-left">Hiệu lực từ</th>
                      <th className="px-4 py-2 text-left">Hiệu lực đến</th>
                     
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((entry, idx) => (
                      <tr
                        key={idx}
                        className="border-t cursor-pointer hover:bg-blue-50 transition"
                        onClick={() => setSelectedChangeEntry(entry)}
                      >
                        <td className="px-4 py-2">{formatDisplayDate(entry.changedAt)}</td>
                        <td className="px-4 py-2">{formatDisplayDate(entry.effectiveStart)}</td>
                        <td className="px-4 py-2">{entry.effectiveEnd ? formatDisplayDate(entry.effectiveEnd) : 'Hiện tại'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 rounded-b-3xl flex justify-end gap-3 border-t">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                {details.mode === 'add' ? 'Tạo mới' : 'Lưu thay đổi'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Chỉnh sửa
            </button>
          )}
        </div>
      </div>
      {selectedChangeEntry && (
        <ChangeDetailModal
          entry={selectedChangeEntry}
          onClose={() => setSelectedChangeEntry(null)}
          fieldLabels={FIELD_LABELS}
          formatPrice={formatPrice}
          formatDuration={formatDuration}
          formatDisplayDate={formatDisplayDate}
        />
      )}
    </div>
  );
};

// Add this new confirmation modal component
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

const PackageManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{ data: any, mode: 'view' | 'edit' | 'add' } | null>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info"; show: boolean; }>({ message: "", type: "info", show: false });
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    packageId: string | null;
  }>({
    isOpen: false,
    packageId: null
  });
  const [loading, setLoading] = useState(true);
  const [selectedHistory, setSelectedHistory] = useState<any | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        let data = await getAllPackages();
        if (Array.isArray(data)) {
          setPackages(data);
        }
      } catch (error) {
        console.error('Failed to fetch packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Filter packages based on search and category
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = (pkg.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (pkg.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (String(pkg.id) || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDuration = (days: number) => {
    if (days >= 36500) { // More than 100 years, consider it permanent
      return 'Vĩnh viễn';
    }
    return `${days} ngày`;
  };

  const formatDisplayDate = (date: string | Date | undefined) => {
    if (!date) return 'N/A';
    // Check if it's already a Date object or a string that can be parsed
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return date.toString(); // Fallback to original string if invalid
    }
    return dateObj.toLocaleString();
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (filters: Record<string, string>) => {
    //setSelectedCategory(filters.category || 'all');
  };

  const emptyPackage = {
    name: '',
    description: '',
    price: 0,
    durationDays: 30,
    isActive: true,
    createAt: new Date(),
    lastUpdated: new Date(),
    id: '', // id will be set by backend
    color: "#000000", // default color
  };

  const handleAddNewPackage = () => {
    setSelectedPackage({ data: emptyPackage, mode: 'add' });
  };

  const handleSavePackage = async (updatedPackageData: any) => {
    if (!selectedPackage) return;

    try {
      if (selectedPackage.mode === 'add') {
        // Call your create API
        const responseData = await createPackage({
          name: updatedPackageData.name,
          description: updatedPackageData.description,
          price: Number(updatedPackageData.price),
          durationDays: Number(updatedPackageData.durationDays),
          isActive: updatedPackageData.isActive,
          color: updatedPackageData.color,
        });
        setPackages([...packages, responseData.data]);
        setNotification({ message: "Tạo gói mới thành công!", type: "success", show: true });
      } else {
        const dataToUpdate = {
          name: updatedPackageData.name,
          description: updatedPackageData.description,
          price: Number(updatedPackageData.price),
          durationDays: Number(updatedPackageData.durationDays),
          isActive: updatedPackageData.isActive,
          color: updatedPackageData.color,
        };

        const responseData = await updatePackageById(selectedPackage.data.id.toString(), dataToUpdate);

        setPackages(packages.map(p => {
          if (p.id === selectedPackage.data.id) {
            return { ...updatedPackageData, lastUpdated: responseData.lastUpdated };
          }
          return p;
        }));
      }
      setSelectedPackage(null);
    } catch (error) {
      console.error("Failed to update package:", error);
      setNotification({ message: "Lỗi khi lưu gói.", type: "error", show: true });
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    try {
      // Call the existing delete API - backend will handle status change instead of actual deletion
      await deletePackageById(packageId);

      // Update the local state to reflect the status change
      setPackages(packages.map(p => {
        if (p.id === packageId) {
          return { ...p, isActive: false };
        }
        return p;
      }));

      setNotification({ message: "Tạm dừng gói dịch vụ thành công!", type: "success", show: true });
    } catch (error) {
      console.error("Failed to deactivate package:", error);
      setNotification({ message: "Lỗi khi tạm dừng gói dịch vụ.", type: "error", show: true });
    }
  };

  const openDeleteConfirmation = (packageId: string) => {
    setConfirmationModal({
      isOpen: true,
      packageId
    });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      packageId: null
    });
  };

  const confirmDelete = () => {
    if (confirmationModal.packageId) {
      handleDeletePackage(confirmationModal.packageId);
    }
  };

  const onViewHistoryDetail = (entry: any) => {
    setSelectedHistory(entry);
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
                Xem danh sách các gói dịch vụ
              </h1>
              <p className="text-gray-600">
                Danh sách các gói dịch vụ có trong hệ thống
              </p>
            </div>
            
            <button
              onClick={handleAddNewPackage}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              Thêm gói mới
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <FilterBar
              searchPlaceholder="Tìm kiếm gói dịch vụ..."
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              filterOptions={{}}
            />
          </div>
        </div>

        

        {/* Packages Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Đang tải gói dịch vụ...</h3>
            <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPackages.map((pkg: any) => (
                <div key={pkg.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
                  {/* Package Header */}
                  <div
                    className="p-6 text-white"
                    style={{ backgroundColor: pkg.color || "#2563eb" }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                        <p className="text-blue-100 text-sm">{pkg.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold">{formatPrice(pkg.price)}</span>
                        <span className="text-blue-100 text-sm">/{formatDuration(pkg.durationDays)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Package Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>Tạo: {formatDisplayDate(pkg.createAt)}</p>
                        <p>Cập nhật: {formatDisplayDate(pkg.lastUpdated)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(pkg.isActive)}`}>
                        {pkg.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedPackage({ data: pkg, mode: 'view' })} 
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Xem
                      </button>
                      <button 
                        onClick={() => setSelectedPackage({ data: pkg, mode: 'edit' })} 
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Sửa
                      </button>
                      <button 
                        onClick={() => openDeleteConfirmation(pkg.id)}
                        className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                        title="Tạm dừng gói dịch vụ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredPackages.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy gói dịch vụ</h3>
                <p className="text-gray-600">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </div>
    {selectedPackage && (
      <PackageDetailModal
        details={selectedPackage}
        onClose={() => setSelectedPackage(null)}
        onSave={handleSavePackage}
      />
    )}
    {/* Add the confirmation modal */}
    <ConfirmationModal
      isOpen={confirmationModal.isOpen}
      onClose={closeConfirmationModal}
      onConfirm={confirmDelete}
      title="Tạm dừng gói dịch vụ"
      message="Bạn có chắc chắn muốn tạm dừng gói dịch vụ này? Gói dịch vụ sẽ không còn hoạt động sau khi tạm dừng."
      confirmText="Tạm dừng"
      cancelText="Hủy"
      type="danger"
    />
  </div>
);
};

export default PackageManagement;