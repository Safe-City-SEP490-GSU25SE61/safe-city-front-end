import { useState, useEffect } from 'react';
import { X, Mail, Phone, MapPin, Calendar, Ban, Trophy, History, User, Shield } from 'lucide-react';
import { deleteUser, getUserHistoryPoint } from '../../services/api/account';

const UserDetailModal = ({
  user,
  loading,
  onClose,
}: {
  user: any;
  loading: boolean;
  onClose: () => void;
}) => {
  // If loading, show a spinner or loading text
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="text-lg font-semibold mb-4">Đang tải thông tin người dùng...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const [activeTab, setActiveTab] = useState('overview');
  const [suspending, setSuspending] = useState(false);
  const [pointHistory, setPointHistory] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (user?.id) {
        setHistoryLoading(true);
        try {
          const historyData = await getUserHistoryPoint(user.id);
          setPointHistory(historyData.data);
        } catch (error) {
          console.error('Failed to fetch point history', error);
        } finally {
          setHistoryLoading(false);
        }
      }
    };

    fetchHistory();
  }, [user?.id]);

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: User },
    { id: 'history', label: 'Lịch sử điểm', icon: History },
  ];

  const handleSuspend = async () => {
    if (!user?.id) return;
    setSuspending(true);
    try {
      await deleteUser(user.id);
      onClose();
    } catch (error) {
      alert('Có lỗi xảy ra khi đình chỉ tài khoản.');
    } finally {
      setSuspending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex items-start space-x-4">
            <img 
              src={user.imageUrl || 'https://randomuser.me/api/portraits/men/32.jpg'} 
              alt={user.fullName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-semibold text-gray-900">{user.fullName}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                  {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">ID: {user.id}</p>
              {user.achievementName && (
                <div className="mt-2">
                  <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800`}>
                      <Trophy className="w-3 h-3" />
                      <span>{user.achievementName}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-6 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{maxHeight: 'calc(90vh - 210px)'}}>
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Thông tin cá nhân</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Số điện thoại:</span>
                    <span className="text-sm font-medium">{user.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Địa chỉ:</span>
                    <span className="text-sm font-medium">{user.address}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Ngày sinh:</span>
                    <span className="text-sm font-medium">
                      {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SafeCity Stats & Subscription */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Hoạt động SafeCity</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-5 h-5 text-purple-600" />
                        <div className="text-xl font-bold text-purple-600">{user.totalPoint}</div>
                      </div>
                      <div className="text-xs text-purple-600 mt-1">Điểm cộng đồng</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-yellow-600" />
                        <div className="text-xl font-bold text-yellow-600">{pointHistory?.currentReputationPoint ?? '...'}</div>
                      </div>
                      <div className="text-xs text-yellow-600 mt-1">Điểm uy tín</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Thông tin gói cước</h3>
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Gói dịch vụ:</span>
                        <span className="text-sm font-medium">{user.currentSubscription?.packageName || 'Không có'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Trạng thái:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isSubscription ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {user.isSubscription ? 'Đang hoạt động' : 'Không hoạt động'}
                        </span>
                      </div>
                      {user.isSubscription && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Thời gian còn lại:</span>
                          <span className="text-sm font-medium">{user.currentSubscription?.remainingTime}</span>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {historyLoading ? (
                <p>Đang tải lịch sử điểm...</p>
              ) : pointHistory && pointHistory.items.length > 0 ? (
                <div 
                  className="space-y-4 pr-2"
                  style={{
                    maxHeight: pointHistory.items.length > 5 ? '400px' : 'none',
                    overflowY: pointHistory.items.length > 5 ? 'auto' : 'visible',
                  }}
                >
                  {pointHistory.items.map((item: any) => (
                    <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{item.source.title || item.note}</p>
                          <p className="text-sm text-gray-500">{item.action} - {new Date(item.createdAt).toLocaleString('vi-VN')}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${item.pointsDelta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {item.pointsDelta >= 0 ? '+' : ''}{item.pointsDelta} điểm
                          </p>
                          <p className={`text-sm ${item.reputationDelta >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>
                              {item.reputationDelta >= 0 ? '+' : ''}{item.reputationDelta} uy tín
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Không có lịch sử điểm.</p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            <button
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              onClick={handleSuspend}
              disabled={suspending}
            >
              <Ban className="w-4 h-4" />
              <span>
                {suspending ? 'Đang đình chỉ...' : 'Đình chỉ tài khoản'}
              </span>
            </button>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;