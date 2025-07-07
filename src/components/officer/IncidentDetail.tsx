import React, { useState } from 'react';
import { X, MapPin, Calendar, User, AlertTriangle, FileText, Phone, Clock, Shield, Camera, Video, MessageSquare, Activity, Plus, Play, Eye, Send } from 'lucide-react';

interface IncidentDetailProps {
  incident: any;
  loading: boolean;
  onClose: () => void;
}

const IncidentDetail: React.FC<IncidentDetailProps> = ({ incident, loading, onClose }) => {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [localUpdates, setLocalUpdates] = useState(incident?.updates || []);

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
      case 'investigating': return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg';
      case 'resolved': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg';
      case 'closed': return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-lg';
      default: return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-lg';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertTriangle className="w-4 h-4" />;
      case 'investigating': return <Activity className="w-4 h-4" />;
      case 'resolved': return <Shield className="w-4 h-4" />;
      case 'closed': return <X className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const newUpdate = {
        officer: 'Sĩ quan hiện tại',
        date: new Date().toLocaleDateString('vi-VN'),
        action: newNote.trim()
      };
      setLocalUpdates([newUpdate, ...localUpdates]);
      setNewNote('');
      setShowNoteModal(false);
    }
  };

  const handleViewMedia = (media: any) => {
    setSelectedMedia(media);
    setShowMediaModal(true);
  };

  const handleContactReporter = () => {
    // Simulate calling the reporter
    alert(`Đang gọi ${incident.reporter}...`);
  };

  return (
    <>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Danh mục</label>
                        <p className="mt-2 text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-200">
                          {incident.category}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evidence */}
                {incident.evidence && incident.evidence.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <Camera className="w-6 h-6 text-gray-600" />
                      <h3 className="text-xl font-bold text-gray-900">Bằng chứng</h3>
                    </div>
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
                              onClick={() => handleViewMedia(item)}
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
                  </div>
                )}
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
                    <span className={`inline-flex items-center gap-2 px-4 py-3 rounded-full text-sm font-semibold ${getStatusColor(incident.status)}`}>
                      {getStatusIcon(incident.status)}
                      {incident.status === 'pending' ? 'Chờ xử lý' :
                       incident.status === 'investigating' ? 'Đang điều tra' :
                       incident.status === 'resolved' ? 'Đã giải quyết' : 'Đã đóng'}
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4">Hành động nhanh</h4>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setShowNoteModal(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Thêm ghi chú
                    </button>
                    <button 
                      onClick={handleContactReporter}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Liên hệ báo cáo
                    </button>
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
              <div className="p-4 flex items-center justify-center min-h-[300px] bg-gray-100">
                {selectedMedia.type === 'image' ? (
                  // Replace with <img src={selectedMedia.url} ... /> if you have real images
                  <div className="text-center">
                    <Camera className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Hình ảnh: {selectedMedia.description}</p>
                  
                  </div>
                ) : (
                  // Replace with <video src={selectedMedia.url} controls ... /> if you have real videos
                  <div className="text-center">
                    <Video className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Video: {selectedMedia.description}</p>
                   
                  </div>
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
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      Tải lên: {new Date().toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      ID: {Math.random().toString(36).substr(2, 8).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default IncidentDetail;
