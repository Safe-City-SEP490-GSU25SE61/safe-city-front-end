import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Plus, Eye} from 'lucide-react';
import SideBar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import FilterBar from '../../components/common/FilterBar';
import WardDetail from '../../components/admin/WardDetail';
import NotificationBar from '../../components/common/NotificationBar';
import { PaginationComponent } from '../../components/common/Pagination';
import { getAllWards, getWardById, updateWardById, createWard } from '../../services/api/ward';

// Only keep Ward interface
interface Ward {
  id: number;
  name: string;
  code: string;
  population: number;
  area: string;
  status: string;
  districtName?: string;
  districtCode?: string;
  incidents: number;
  dangerLevel: number;
  dangerLevelLabel: string;
  lastUpdated:  string | Date
  notes?: string;
  coordinates?: string;
  createAt?: string | Date;
  districtId?: number;
}

interface WardFormData {
  name: string;
  notes: string;
  coordinates: string;
  districtId: string;
  status: string;
}

interface FormErrors {
  name?: string;
  districtId?: string;
}

const DistrictManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [showAddWardModal, setShowAddWardModal] = useState(false);
  const [loading, setLoading] = useState(true);
  // Pagination
  const [currentWardPage, setCurrentWardPage] = useState(1);
  const itemsPerPage = 10;

  // Notification
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
    show: boolean;
  }>({ message: "", type: "info", show: false });

  const [wardFormData, setWardFormData] = useState<WardFormData>({
    name: '',
    notes: '',
    coordinates: '',
    districtId: '',
    status: 'active'
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const formatDisplayDate = (date: string | Date | undefined) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return date.toString();
    }
    return dateObj.toLocaleString();
  };

  const getDangerLevelLabel = (level: number) => {
    if (level >= 7) return 'Cao';
    if (level >= 4) return 'Trung bình';
    return 'Thấp';
  };

  const handleWardViewDetails = async (wardId: number) => {
    const wardFromList = wards.find(w => w.id === wardId);
    setSelectedWard(wardFromList || null);
    setIsDetailLoading(true);
    try {
      const detailedData = await getWardById(wardId.toString());
      if (detailedData) {
        const detailedWard: Ward = {
          id: detailedData.id,
          name: detailedData.name,
          code: detailedData.code,
          population: detailedData.population || 0,
          area: detailedData.area || "N/A",
          status: detailedData.isActive ? "hoạt động" : "tạm dừng",
          districtName: detailedData.district?.name,
          districtCode: detailedData.district?.code,
          incidents: detailedData.totalReportedIncidents ?? 0,
          dangerLevel: detailedData.dangerLevel ?? 0,
          dangerLevelLabel: getDangerLevelLabel(detailedData.dangerLevel ?? 0),
          lastUpdated: detailedData.lastUpdated,
          notes: detailedData.note,
          coordinates: detailedData.polygonData,
          createAt: detailedData.createAt,
          districtId: detailedData.district?.id,
        };
        setSelectedWard(detailedWard);
      }
    } catch (err) {
      console.error("Failed to fetch ward details:", err);
      setNotification({
        message: "Lỗi khi tải chi tiết phường. Vui lòng thử lại.",
        type: "error",
        show: true,
      });
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Add ward function with notification
  const handleAddWard = async () => {
    const errors: FormErrors = {};
    if (!wardFormData.name.trim()) errors.name = 'Tên phường là bắt buộc';
    if (!wardFormData.districtId) errors.districtId = 'Vui lòng chọn quận';

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        const wardData = {
          name: wardFormData.name.trim(),
          note: wardFormData.notes.trim(),
          polygonData: wardFormData.coordinates.trim(),
          districtId: parseInt(wardFormData.districtId)
        };

        const response = await createWard(wardData);

        if (response && response.data) {
          const newWardData = response.data;
          const formattedNewWard: Ward = {
            id: newWardData.id,
            name: newWardData.name,
            code: newWardData.code,
            population: newWardData.population || 0,
            area: newWardData.area || 'N/A',
            status: newWardData.isActive ? 'hoạt động' : 'tạm dừng',
            districtName: newWardData.district?.name,
            districtCode: newWardData.district?.code,
            incidents: newWardData.totalReportedIncidents ?? 0,
            dangerLevel: newWardData.dangerLevel ?? 0,
            dangerLevelLabel: getDangerLevelLabel(newWardData.dangerLevel ?? 0),
            lastUpdated: newWardData.lastUpdated,
            notes: newWardData.note,
            coordinates: newWardData.polygonData,
            createAt: newWardData.createAt,
            districtId: newWardData.district?.id,
          };
          setWards(prevWards => [...prevWards, formattedNewWard]);

          setWardFormData({ name: '', notes: '', coordinates: '', districtId: '', status: 'active' });
          setFormErrors({});
          setShowAddWardModal(false);

          setNotification({ message: "Thêm phường thành công!", type: "success", show: true });
        }
      } catch (error) {
        console.error("Failed to create ward:", error);
        setNotification({ message: "Lỗi khi thêm phường. Vui lòng thử lại.", type: "error", show: true });
      }
    }
  };

  const filteredWards = useMemo(() => {
    return wards.filter(ward =>
      ward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ward.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ward.districtName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [wards, searchTerm]);

  const WardRow: React.FC<{ ward: Ward }> = ({ ward }) => {
    const dangerLevelColor = (level: number) => {
      if (level >= 7) return 'bg-red-100 text-red-800';
      if (level >= 4) return 'bg-yellow-100 text-yellow-800';
      return 'bg-green-100 text-green-800';
    };

    const statusColor = (status: string) => {
      if (status.toLowerCase() === 'hoạt động') return 'text-green-600';
      if (status.toLowerCase() === 'tạm dừng') return 'text-blue-600';
      return 'text-gray-600';
    };

    return (
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div>
              <div className="text-sm font-medium text-gray-900">{ward.name}</div>
              <div className="text-sm text-gray-500">ID: {ward.id}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
          {ward.incidents}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${dangerLevelColor(ward.dangerLevel)}`}>
            {ward.dangerLevel}/10 - {ward.dangerLevelLabel}
          </span>
        </td>
        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${statusColor(ward.status)}`}>
          {ward.status}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDisplayDate(ward.lastUpdated) }</td>
        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
          <button
            onClick={() => handleWardViewDetails(ward.id)}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mx-auto">
            <Eye className="h-4 w-4" />
            Chi tiết
          </button>
        </td>
      </tr>
    );
  };

  const handleSaveWard = async (updatedWardData: any) => {
    if (!selectedWard) return;

    try {
      await updateWardById(selectedWard.id.toString(), updatedWardData);

      // Optimistically update the local state
      const updatedWards = wards.map(w =>
        w.id === selectedWard.id ? { ...w, ...updatedWardData } : w
      );
      setWards(updatedWards);
      setSelectedWard(null); // Close modal on success

      setNotification({
        message: "Cập nhật phường thành công!",
        type: "success",
        show: true,
      });

    } catch (error) {
      console.error("Failed to update ward:", error);
      setNotification({
        message: (error as Error).message || "Lỗi khi cập nhật phường. Vui lòng thử lại.",
        type: "error",
        show: true,
      });
    }
  };

  useEffect(() => {
    const fetchAndSetWards = async () => {
      try {
        setLoading(true);
        const apiData = await getAllWards();
        if (apiData && Array.isArray(apiData)) {
          const formattedWards: Ward[] = apiData.map((w: any) => ({
            id: w.id,
            name: w.name,
            code: w.code,
            population: w.population || 0,
            area: w.area || 'N/A',
            status: w.isActive ? 'hoạt động' : 'tạm dừng',
            districtName: w.district?.name,
            districtCode: w.district?.code,
            incidents: w.totalReportedIncidents ?? 0,
            dangerLevel: w.dangerLevel ?? 0,
            dangerLevelLabel: getDangerLevelLabel(w.dangerLevel ?? 0),
            lastUpdated: w.lastUpdated,
            districtId: w.district?.id,
          }));
          setWards(formattedWards);
        } else {
          console.error("Fetched ward data is not in the expected format:", apiData);
          setNotification({
            message: "Không tìm thấy dữ liệu phường.",
            type: "info",
            show: true,
          });
        }
      } catch (err) {
        console.error('Error fetching wards:', err);
        setNotification({
          message: "Lỗi khi tải danh sách phường. Vui lòng thử lại.",
          type: "error",
          show: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAndSetWards();
  }, []);

  // Paginated data
  const paginatedWards = useMemo(() => {
    const startIndex = (currentWardPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredWards.slice(startIndex, endIndex);
  }, [filteredWards, currentWardPage]);

  useEffect(() => {
    setCurrentWardPage(1);
  }, [searchTerm]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Notification Bar */}
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
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Quản lý phường/xã
                  </h1>
                  <p className="text-gray-600">
                    Danh sách các phường/xã trong hệ thống
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    onClick={() => setShowAddWardModal(true)}
                  >
                    <Plus className="w-5 h-5" />
                    Thêm phường mới
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Bar section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
              <FilterBar
                searchPlaceholder="Tìm kiếm phường..."
                onSearch={setSearchTerm}
                showExport={false}
              />
            </div>

            {/* Content */}
            {loading ? (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Đang tải phường...</h3>
                <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Khu vực
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số sự cố
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mức độ nguy hiểm
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cập nhật cuối
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedWards.map(ward => (
                        <WardRow key={ward.id} ward={ward} />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination for Wards */}
                {filteredWards.length > 0 && (
                  <div className="flex justify-center">
                    <PaginationComponent
                      totalItems={filteredWards.length}
                      itemsPerPage={itemsPerPage}
                      currentPage={currentWardPage}
                      onPageChange={setCurrentWardPage}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Ward Modal */}
      {showAddWardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-4 rounded-t-lg flex justify-between items-center">
              <h2 className="text-xl font-bold">Thêm Phường Mới</h2>
              <button onClick={() => setShowAddWardModal(false)} className="text-white hover:text-gray-200 p-2 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); handleAddWard(); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên phường *</label>
                <input
                  className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-400 focus:outline-none ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Nhập tên phường"
                  value={wardFormData.name}
                  onChange={e => setWardFormData({...wardFormData, name: e.target.value})}
                />
                {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
                  placeholder="Thêm ghi chú cho phường"
                  rows={3}
                  value={wardFormData.notes}
                  onChange={(e) => setWardFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dữ liệu Polygon (GeoJSON)</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400 focus:outline-none font-mono text-xs"
                  placeholder="[[[106.70, 10.77], ...]]"
                  rows={4}
                  value={wardFormData.coordinates}
                  onChange={(e) => setWardFormData(prev => ({ ...prev, coordinates: e.target.value }))}
                />
              </div>
            </form>
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex gap-2 justify-end">
              <button
                className="px-6 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setShowAddWardModal(false)}
              >
                Hủy
              </button>
              <button onClick={handleAddWard} className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Ward Detail Modal */}
      {(selectedWard || isDetailLoading) && (
        <WardDetail
          ward={selectedWard ? {
            id: selectedWard.id,
            name: selectedWard.name,
            status: selectedWard.status,
            level: selectedWard.dangerLevel,
            totalIncidents: selectedWard.incidents,
            creationDate: formatDisplayDate(selectedWard.createAt),
            lastUpdate: formatDisplayDate(selectedWard.lastUpdated),
            notes: selectedWard.notes || `Phường ${selectedWard.name} thuộc ${selectedWard.districtName || 'Quận chưa xác định'}`,
            coordinates: selectedWard.coordinates || "Chưa có dữ liệu tọa độ",
            district: selectedWard.districtName || 'Chưa xác định',
            districtId: selectedWard.districtId
          } : null}
          districts={[]} // Pass an empty array for now, as districts are not fetched here
          loading={isDetailLoading}
          onClose={() => setSelectedWard(null)}
          onSave={handleSaveWard}
        />
      )}
    </div>
  );
};

export default DistrictManagement;