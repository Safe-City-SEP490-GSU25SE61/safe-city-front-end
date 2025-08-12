import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Calendar, User, AlertTriangle, FileText, Phone, Clock, Shield, Camera, Video, MessageSquare, Activity, Play, Eye, Send } from 'lucide-react';
import { createIncidentNote, updateIncidentStatus, transferIncident } from '../../services/api/incident'; // 1. Import the API function
import NotificationBar from '../common/NotificationBar'; // Add this import
import { getAllWards } from '../../services/api/ward'; // Import at the top
import goongjs from '@goongmaps/goong-js';
import '@goongmaps/goong-js/dist/goong-js.css';

interface IncidentDetailProps {
  incident: any;
  loading: boolean;
  onClose: () => void;
}

// Helper to decode JWT and get officer name
function getOfficerNameFromToken() {
  const token = localStorage.getItem('accessToken');
  if (!token) return 'Sĩ quan';
  try {
    // Properly decode base64url and handle UTF-8
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return payload.name || payload.username || 'Sĩ quan';
  } catch {
    return 'Sĩ quan';
  }
}

const IncidentDetail: React.FC<IncidentDetailProps> = ({ incident, loading, onClose }) => {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  // Remove officerName state
  // const [officerName, setOfficerName] = useState('');
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [localUpdates, setLocalUpdates] = useState(incident?.updates || []);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [localStatus, setLocalStatus] = useState(incident.status);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'info' as 'success' | 'error' | 'info'
  });
  const [districts, setDistricts] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<number>();
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [transferNote, setTransferNote] = useState<string>('');
  const [showTransferNote, setShowTransferNote] = useState(false);
  const [loadingTransfer, setLoadingTransfer] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const inlineMapRef = useRef<HTMLDivElement>(null); // New ref for inline map

  // Helper to show notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ show: true, message, type });
  };

  // Helper to get all image evidence
  const imageEvidence = (incident?.evidence || []).filter((item: any) => item.type === 'image');

  const openMediaModal = (media: any) => {
    setSelectedMedia(media);
    setShowMediaModal(true);
    if (media.type === 'image') {
      const idx = imageEvidence.findIndex((img: any) => img.url === media.url);
      setCurrentImageIndex(idx >= 0 ? idx : 0);
    }
  };

  // Add a helper for status update
  const handleStatusChange = async (newStatus: string, message = '') => {
    try {
      await updateIncidentStatus(incident.id, { status: newStatus, message });
      setLocalStatus(newStatus);
      showNotification('Cập nhật trạng thái thành công!', 'success');
    } catch (e) {
      showNotification('Không thể cập nhật trạng thái. Vui lòng thử lại!', 'error');
    }
  };


  // Fetch districts automatically when status is 'verified'
  useEffect(() => {
    if (localStatus === 'verified' && districts.length === 0) {
      setLoadingDistricts(true);
      getAllWards()
        .then(data => setDistricts(data))
        .catch(() => showNotification('Không thể tải danh sách phường/xã.', 'error'))
        .finally(() => setLoadingDistricts(false));
    }
  }, [localStatus, districts.length]);

  useEffect(() => {
    if (inlineMapRef.current && incident.lat && incident.lng) {
      goongjs.accessToken = 'VScS4DXaVgUaCjtOp6Vp2AAYlfcJVOIZ2JVjvAnL';
      // Clean up previous map instance if any
      if (inlineMapRef.current.childNodes.length > 0) {
        inlineMapRef.current.innerHTML = '';
      }
      const map = new goongjs.Map({
        container: inlineMapRef.current,
        style: 'https://tiles.goong.io/assets/goong_map_web.json',
        center: [parseFloat(incident.lng), parseFloat(incident.lat)],
        zoom: 16,
      });
      new goongjs.Marker()
        .setLngLat([parseFloat(incident.lng), parseFloat(incident.lat)])
        .addTo(map);
      return () => map.remove();
    }
  }, [incident.lat, incident.lng]);

  useEffect(() => {
    if (showMapModal && mapContainerRef.current && incident.lat && incident.lng) {
      goongjs.accessToken = 'VScS4DXaVgUaCjtOp6Vp2AAYlfcJVOIZ2JVjvAnL';
      // Clean up previous map instance if any
      if (mapContainerRef.current.childNodes.length > 0) {
        mapContainerRef.current.innerHTML = '';
      }
      const map = new goongjs.Map({
        container: mapContainerRef.current,
        style: 'https://tiles.goong.io/assets/goong_map_web.json',
        center: [parseFloat(incident.lng), parseFloat(incident.lat)],
        zoom: 16,
      });
      new goongjs.Marker()
        .setLngLat([parseFloat(incident.lng), parseFloat(incident.lat)])
        .addTo(map);
      return () => map.remove();
    }
  }, [showMapModal, incident.lat, incident.lng]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-gray-700 font-medium text-center">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!incident) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg';
      case 'verified': return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg';
      case 'solved': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg';
      case 'cancelled': return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white shadow-lg';
      case 'closed': return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-lg';
      case 'malicious': return 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg';
      default: return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-lg';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'verified': return 'Đã xác minh';
      case 'solved': return 'Đã giải quyết';
      case 'cancelled': return 'Đã hủy';
      case 'closed': return 'Đã đóng';
      case 'malicious': return 'Sai phạm';
      default: return 'Chờ xác nhận';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertTriangle className="w-4 h-4" />;
      case 'verified': return <Shield className="w-4 h-4" />;
      case 'solved': return <Activity className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      case 'closed': return <X className="w-4 h-4" />;
      case 'malicious': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleAddNote = async () => {
    if (newNote.trim()) {
      const officerName = getOfficerNameFromToken();
      const newUpdate = {
        officer: officerName,
        date: new Date().toLocaleDateString('vi-VN'),
        action: newNote.trim()
      };
      try {
        await createIncidentNote(incident.id, { content: newNote.trim() });
        setLocalUpdates([newUpdate, ...localUpdates]);
        setNewNote('');
        setShowNoteModal(false);
        showNotification('Đã thêm ghi chú thành công!', 'success');
      } catch (error) {
        showNotification('Không thể thêm ghi chú. Vui lòng thử lại!', 'error');
      }
    }
  };

  const handleContactReporter = () => {
    showNotification(`Đang gọi ${incident.reporter}...`, 'info');
  };

  const handleTransferIncident = async () => {
    if (!transferNote.trim()) {
      showNotification('Vui lòng nhập lý do chuyển phường/xã!', 'error');
      return;
    }

    setLoadingTransfer(true);
    try {
      await transferIncident(incident.id, {
        newDistrictId: selectedDistrict,
        note: transferNote.trim()
      });
      showNotification('Đã chuyển báo cáo thành công!', 'success');
      setTransferNote('');
      setShowTransferNote(false);
      setSelectedDistrict(0);
      onClose();
    } catch (error: any) {
      showNotification(error.response.data.message, 'error');
    } finally {
      setLoadingTransfer(false);
    }
  };

  return (
    <>
      {/* Notification Bar */}
      <NotificationBar
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="relative bg-blue-600 text-white p-8 rounded-t-3xl">
            <div className="absolute top-0 left-0 w-full h-full bg-black/10 rounded-t-3xl"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-bold">{incident.title}</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-white/90">
                    <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                      <MapPin className="w-4 h-4" />
                      {incident.location}
                    </span>
                    <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                      <Calendar className="w-4 h-4" />
                      {incident.reportedDate}
                    </span>
                    <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                      <User className="w-4 h-4" />
                      {incident.reporter}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 hover:scale-110"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Basic Information */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <FileText className="w-6 h-6 text-gray-600" />
                    <h3 className="text-xl font-bold text-gray-900">Thông tin cơ bản</h3>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Mô tả</label>
                      <p className="mt-2 text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
                        {incident.description}
                      </p>
                    </div>
                    {/* Improved Lat/Lng display in Vietnamese */}
                    {incident.lat && incident.lng && (
                      <div className="mt-2">
                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Tọa độ</label>
                        <div className="flex items-center gap-4 mt-1 bg-blue-50 p-3 rounded-xl border border-blue-200">
                          <span className="flex items-center gap-1 text-blue-800 font-semibold">
                            <MapPin className="w-4 h-4" />
                            Vĩ độ: <span className="font-mono">{incident.lat}</span>
                          </span>
                          <span className="flex items-center gap-1 text-blue-800 font-semibold">
                            <MapPin className="w-4 h-4" />
                            Kinh độ: <span className="font-mono">{incident.lng}</span>
                          </span>
                        </div>
                        <div
                          ref={inlineMapRef}
                          style={{ height: 220, width: '100%', borderRadius: '12px', overflow: 'hidden', marginTop: 12 }}
                          className="shadow border border-blue-200"
                        />
                        <button
                          type="button"
                          className="mt-2 text-blue-600 underline text-xs hover:text-blue-800"
                          onClick={() => setShowMapModal(true)}
                          title="Xem bản đồ lớn"
                        >
                          Xem bản đồ lớn
                        </button>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Danh mục</label>
                        <p className="mt-2 text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-200">
                          {incident.category}
                        </p>
                      </div>
                      {incident.subCategory && (
                        <div>
                          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Danh mục phụ</label>
                          <p className="mt-2 text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-200">
                            {incident.subCategory}
                          </p>
                        </div>
                      )}
                    </div>
                    {incident.priorityLevel && (
                      <div className="mt-4">
                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Mức độ ưu tiên</label>
                        <div className="mt-2">
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                            incident.priorityLevel === 'High' ? 'bg-red-100 text-red-800' :
                            incident.priorityLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            incident.priorityLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                            incident.priorityLevel === 'Low' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            <AlertTriangle className="w-4 h-4" />

                            {incident.priorityLevel === 'High' ? 'Cao' :
                            incident.priorityLevel === 'Critical' ? 'Khẩn cấp' :
                            incident.priorityLevel === 'Medium' ? 'Trung bình' :
                            incident.priorityLevel === 'Low' ? 'Thấp' :
                            incident.priorityLevel}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Evidence */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <Camera className="w-6 h-6 text-gray-600" />
                    <h3 className="text-xl font-bold text-gray-900">Bằng chứng</h3>
                  </div>
                  {(!incident.evidence || incident.evidence.length === 0) ? (
                    <div className="text-gray-500 text-center py-8">
                      Không có bằng chứng
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {incident.evidence.map((item: any, index: number) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {item.type === 'image' ? (
                                <Camera className="w-5 h-5 text-gray-600" />
                              ) : (
                                <Video className="w-5 h-5 text-gray-600" />
                              )}
                              <span className="text-sm font-semibold text-gray-900">
                                {item.type === 'image' ? 'Hình ảnh' : 'Video'}
                              </span>
                            </div>
                            <button
                              onClick={() => openMediaModal(item)}
                              className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors duration-200"
                            >
                              {item.type === 'image' ? (
                                <Eye className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Play className="w-4 h-4 text-blue-600" />
                              )}
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Status Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-6 h-6 text-gray-600" />
                    <h4 className="font-bold text-gray-900">Trạng thái hiện tại</h4>
                  </div>
                  <div className="text-center">
                    <span className={`inline-flex items-center gap-2 px-4 py-3 rounded-full text-sm font-semibold ${getStatusColor(localStatus)}`}>
                      {getStatusIcon(localStatus)}
                      {getStatusText(localStatus)}
                    </span>
                    {incident.verifiedByName && (
                      <div className="flex items-center gap-2 mt-2">
                        <span>Đã xác minh bởi:</span>
                        <span className="text-sm text-gray-600">
                          {incident.verifiedByName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4">Hành động nhanh</h4>
                  <div className="space-y-3">
                    {/* Thêm ghi chú: always available */}
                    <button 
                      onClick={() => setShowNoteModal(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Thêm ghi chú
                    </button>

                    {/* Liên hệ báo cáo: always available if not anonymous */}
                    {incident.reporter?.toLowerCase() !== 'anonymous' && (
                      <button 
                        onClick={handleContactReporter}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        Liên hệ báo cáo
                      </button>
                    )}

                    {/* Pending: Xác minh, Đóng, Đánh dấu sai phạm */}
                    {localStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange('verified')}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <Shield className="w-4 h-4" />
                          Xác minh
                        </button>
                        <button
                          onClick={() => handleStatusChange('closed')}
                          className="w-full bg-slate-600 hover:bg-slate-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Đóng
                        </button>
                        <button
                          onClick={() => handleStatusChange('malicious')}
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          Đánh dấu sai phạm
                        </button>
                      </>
                    )}

                    {/* Verified: Giải quyết */}
                    {localStatus === 'verified' && (
                      <>
                        <button
                          onClick={() => handleStatusChange('solved')}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <Activity className="w-4 h-4" />
                          Giải quyết
                        </button>
                        <div className="mt-4">
                          <label className="block text-sm font-semibold mb-2">Chuyển đến phường/xã khác</label>
                          {loadingDistricts ? (
                            <div className="text-gray-500">Đang tải danh sách phường/xã...</div>
                          ) : (
                            <>
                              <select
                                className="w-full mt-2 p-2 border rounded"
                                value={selectedDistrict}
                                onChange={e => setSelectedDistrict(Number(e.target.value))}
                              >
                                <option value="">Chọn phường/xã</option>
                                {districts.map((d: any) => (
                                  <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                              </select>
                              {selectedDistrict && (
                                <div className="mt-3">
                                  {!showTransferNote ? (
                                    <button
                                      onClick={() => setShowTransferNote(true)}
                                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                      </svg>
                                      Chuyển phường/xã
                                    </button>
                                  ) : (
                                    <div className="space-y-3">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Lý do chuyển phường/xã *
                                        </label>
                                        <textarea
                                          value={transferNote}
                                          onChange={(e) => setTransferNote(e.target.value)}
                                          placeholder="Nhập lý do chuyển báo cáo đến phường/xã khác..."
                                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                          rows={3}
                                        />
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={handleTransferIncident}
                                          disabled={loadingTransfer || !transferNote.trim()}
                                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                                        >
                                          {loadingTransfer ? (
                                            <>
                                              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                              </svg>
                                              Đang chuyển...
                                            </>
                                          ) : (
                                            <>
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                              </svg>
                                              Xác nhận chuyển
                                            </>
                                          )}
                                        </button>
                                        <button
                                          onClick={() => {
                                            setShowTransferNote(false);
                                            setTransferNote('');
                                          }}
                                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                        >
                                          Hủy
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Updates */}
            {localUpdates.length > 0 && (
              <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="w-6 h-6 text-gray-600" />
                  <h3 className="text-xl font-bold text-gray-900">Ghi chú nội bộ</h3>
                </div>
                <div className="space-y-4">
                  {localUpdates.map((update: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start gap-4">
                        <Clock className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-semibold text-gray-900 bg-purple-50 px-2 py-1 rounded-full">
                              {update.officer}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {update.date}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{update.action}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Thêm ghi chú</h3>
              <button
                onClick={() => setShowNoteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Nhập ghi chú của bạn..."
              className="w-full h-32 p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowNoteModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                Hủy
              </button>
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Viewer Modal */}
      {showMediaModal && selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            {/* Close Button */}
            <button
              onClick={() => setShowMediaModal(false)}
              className="absolute top-4 right-4 z-20 p-2 bg-gray-200/90 hover:bg-gray-300 rounded-xl transition-all duration-200 hover:scale-110"
              aria-label="Đóng"
            >
              <X className="w-6 h-6 text-gray-900" />
            </button>
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                {selectedMedia.type === 'image' ? (
                  <Camera className="w-6 h-6 text-blue-500" />
                ) : (
                  <Video className="w-6 h-6 text-blue-500" />
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedMedia.type === 'image' ? 'Hình ảnh' : 'Video'} - {selectedMedia.description}
                </h3>
              </div>
              <div className="p-4 flex flex-col items-center justify-center min-h-[300px] bg-gray-100">
                {selectedMedia.type === 'image' ? (
                  <>
                    <img
                      src={imageEvidence[currentImageIndex]?.url}
                      alt={imageEvidence[currentImageIndex]?.description}
                      className="max-h-[400px] max-w-full mx-auto rounded-lg shadow"
                    />
                    <p className="text-gray-600 mt-4">{imageEvidence[currentImageIndex]?.description}</p>
                    {imageEvidence.length > 1 && (
                      <div className="flex gap-4 mt-4 items-center">
                        <button
                          onClick={() => setCurrentImageIndex((prev) => (prev - 1 + imageEvidence.length) % imageEvidence.length)}
                          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-gray-700">
                          {currentImageIndex + 1} / {imageEvidence.length}
                        </span>
                        <button
                          onClick={() => setCurrentImageIndex((prev) => (prev + 1) % imageEvidence.length)}
                          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <video
                    src={selectedMedia.url}
                    controls
                    className="max-h-[400px] max-w-full mx-auto rounded-lg shadow"
                  />
                )}
                {selectedMedia.type !== 'image' && (
                  <p className="text-gray-600 mt-4">{selectedMedia.description}</p>
                )}
              </div>
              {/* Footer */}
              <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      Bằng chứng đã được xác minh
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      ID: {selectedMedia.type === 'image' ? imageEvidence[currentImageIndex]?.url?.slice(-8) : Math.random().toString(36).substr(2, 8).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Thay đổi trạng thái</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { value: 'pending', label: 'Chờ xác nhận' },
                { value: 'investigating', label: 'Đang điều tra' },
                { value: 'overdue', label: 'Quá hạn' },
                { value: 'closed', label: 'Đã đóng' },
                { value: 'completed', label: 'Hoàn thành' },
                { value: 'public', label: 'Đã công khai' },
                { value: 'cancelled', label: 'Đã hủy' }
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => {
                    setLocalStatus(status.value);
                    setShowStatusModal(false);
                  }}
                  className={`w-full py-2 px-4 rounded-xl font-semibold transition-colors duration-200 ${localStatus === status.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-blue-100'}`}
                >
                 
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showMapModal && incident.lat && incident.lng && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-2xl shadow-2xl p-4 relative max-w-2xl w-full">
            <button
              onClick={() => setShowMapModal(false)}
              className="absolute top-2 right-2 p-2 bg-gray-200 hover:bg-gray-300 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold mb-2">Vị trí trên bản đồ</h3>
            <div
              ref={mapContainerRef}
              style={{ height: 400, width: '100%', borderRadius: '12px', overflow: 'hidden' }}
            />
          </div>
        </div>
      )}

      {/* Notification Bar */}
      <NotificationBar
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ show: false, message: '', type: 'info' })}
      />
    </>
  )
}

export default IncidentDetail;
