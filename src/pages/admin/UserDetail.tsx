import React, { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, Shield, Activity, Edit, Ban, Key, AlertTriangle, FileText, Users, Flag, MessageSquare, Star, Clock, Trophy } from 'lucide-react';

const UserDetailModal = ({ onClose }: { onClose: () => void }) => {
 
  const [activeTab, setActiveTab] = useState('overview');

  // Sample user data for SafeCity platform
  const userData = {
    id: 'USR-001234',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    phone: '0909090909',
    status: 'active', // 'active', 'suspended', 'pending'
    role: 'Công dân đã xác thực',
    joinDate: '2023-03-15',
    lastActive: '2024-06-19 14:32',
    location: 'Quận Hoàn Kiếm, Hà Nội',
    timezone: 'EST (UTC-5)',
    verified: true,
    twoFactor: true,
    subscription: {
      plan: 'SafeCity Pro',
      status: 'active',
      nextBilling: '2024-07-15',
      amount: '465,000₫/tháng'
    },
    paymentHistory: [
      { id: 'GD-004', date: '2024-06-15', package: 'Gói Pro - 1 Tháng', amount: '465,000₫', status: 'Thành công' },
      { id: 'GD-003', date: '2024-05-15', package: 'Gói Pro - 1 Tháng', amount: '465,000₫', status: 'Thành công' },
      { id: 'GD-002', date: '2024-04-15', package: 'Gói Pro - 1 Tháng', amount: '465,000₫', status: 'Thành công' },
      { id: 'GD-001', date: '2024-03-15', package: 'Gói Cơ bản - 1 Tháng', amount: '232,000₫', status: 'Thành công' },
    ],
    stats: {
      totalLogins: 1247,
      failedLogins: 3,
      sessionsToday: 2,
      escortSessions: 42,
      blogPosts: 8,
      incidentReports: 3,
      communityPoints: 1250
    },
    virtualEscort: {
      totalSessions: 42,
      avgSessionTime: '25 phút',
      favoriteRoutes: ['Công viên Trung tâm đến Mall', 'Đại học về Nhà', 'Tuyến đường Chợ đêm'],
      safetyIncidents: 0,
      lastUsed: '2024-06-18 22:30'
    },
    blogActivity: {
      totalPosts: 8,
      totalViews: 2450,
      totalLikes: 189,
      categories: ['Mẹo an toàn', 'Sự kiện cộng đồng', 'Đánh giá địa phương'],
      lastPost: '2024-06-17 16:45',
      mostPopularPost: 'Mẹo an toàn ban đêm cho khu vực trung tâm'
    },
    incidentReports: [
      { 
        id: 'SC-001', 
        type: 'Hoạt động đáng ngờ', 
        location: 'Đường Oak & Đại lộ 5', 
        date: '2024-06-15 20:30',
        status: 'Đã giải quyết',
        priority: 'Trung bình'
      },
      { 
        id: 'SC-002', 
        type: 'Đèn đường hỏng', 
        location: 'Đại lộ Park', 
        date: '2024-05-22 19:15',
        status: 'Đã sửa',
        priority: 'Thấp'
      },
      { 
        id: 'SC-003', 
        type: 'Quấy rối', 
        location: 'Trạm xe buýt #47', 
        date: '2024-04-10 18:45',
        status: 'Đang xem xét',
        priority: 'Cao'
      }
    ],
    recentActivity: [
      { action: 'Phiên Hộ tống ảo', detail: 'Tuyến đường từ Trung tâm về Nhà', time: '2024-06-19 22:30', location: 'Quận Trung tâm' },
      { action: 'Đăng bài viết Blog', detail: '"Sự kiện an toàn mùa hè tại SafeCity"', time: '2024-06-18 16:45', location: 'Nhà' },
      { action: 'Gửi báo cáo sự cố', detail: 'Đèn đường hỏng trên đường Oak', time: '2024-06-17 20:15', location: 'Đường Oak' },
      { action: 'Tham gia sự kiện cộng đồng', detail: 'Buổi họp giám sát khu phố', time: '2024-06-16 19:00', location: 'Trung tâm cộng đồng' }
    ]
  };

  const achievements = [
    { id: 'ACH000', name: 'Newbie', category: 'newbie', points: 0 },
    { id: 'ACH001', name: 'Thành viên đồng', category: 'bronze', points: 500 },
    { id: 'ACH002', name: 'Thành viên bạc', category: 'silver', points: 1000 },
    { id: 'ACH003', name: 'Thành viên vàng', category: 'gold', points: 2000 },
    { id: 'ACH004', name: 'Thành viên bạch kim', category: 'platinum', points: 5000 },
    { id: 'ACH005', name: 'Hero of the Street', category: 'hero', points: 10000 }
  ];

  const getUserAchievement = (points: number) => {
    const sortedAchievements = [...achievements].sort((a, b) => b.points - a.points);
    return sortedAchievements.find(a => points >= a.points);
  };

  const userAchievement = getUserAchievement(userData.stats.communityPoints);

  const getAchievementBadgeColor = (category: string) => {
    switch (category) {
      case 'newbie': return 'bg-gray-100 text-gray-800';
      case 'bronze': return 'bg-yellow-200 text-yellow-800';
      case 'silver': return 'bg-gray-200 text-gray-700';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'platinum': return 'bg-blue-100 text-blue-800';
      case 'hero': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'đã giải quyết': case 'đã sửa': case 'thành công': return 'bg-green-100 text-green-800';
      case 'đang xem xét': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'cao': return 'bg-red-100 text-red-800';
      case 'trung bình': return 'bg-yellow-100 text-yellow-800';
      case 'thấp': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: User },
    { id: 'escort', label: 'Hộ tống ảo', icon: Users },
    { id: 'blog', label: 'Hoạt động Blog', icon: FileText },
    { id: 'incidents', label: 'Báo cáo sự cố', icon: Flag },
    { id: 'activity', label: 'Hoạt động gần đây', icon: Activity },
    { id: 'billing', label: 'Thanh toán', icon: Clock }
  ];



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex items-start space-x-4">
            <img 
              src={userData.avatar} 
              alt={userData.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-semibold text-gray-900">{userData.name}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(userData.status)}`}>
                  {userData.status === 'active' ? 'Hoạt động' : userData.status === 'suspended' ? 'Đã đình chỉ' : 'Chờ xử lý'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">ID: {userData.id} • Công dân SafeCity</p>
              {userAchievement && (
                <div className="mt-2">
                  <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium ${getAchievementBadgeColor(userAchievement.category)}`}>
                      <Trophy className="w-3 h-3" />
                      <span>{userAchievement.name}</span>
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
                    <span className="text-sm font-medium">{userData.email}</span>
                    {userData.verified && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Đã xác thực</span>}
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Số điện thoại:</span>
                    <span className="text-sm font-medium">{userData.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Địa chỉ:</span>
                    <span className="text-sm font-medium">{userData.location}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Ngày tham gia:</span>
                    <span className="text-sm font-medium">{userData.joinDate}</span>
                  </div>
                </div>
              </div>

              {/* SafeCity Stats */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Hoạt động SafeCity</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{userData.stats.escortSessions}</div>
                    <div className="text-xs text-blue-600">Số lần hộ tống</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{userData.stats.blogPosts}</div>
                    <div className="text-xs text-green-600">Bài viết Blog</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-xl font-bold text-red-600">{userData.stats.incidentReports}</div>
                    <div className="text-xs text-red-600">Báo cáo sự cố</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">{userData.stats.communityPoints}</div>
                    <div className="text-xs text-purple-600">Điểm cộng đồng</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'escort' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Sử dụng Hộ tống ảo</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-gray-600">Tổng số phiên</span>
                      <span className="text-sm font-bold text-blue-600">{userData.virtualEscort.totalSessions}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-gray-600">Thời gian trung bình</span>
                      <span className="text-sm font-bold text-green-600">{userData.virtualEscort.avgSessionTime}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-sm text-gray-600">Sự cố an toàn</span>
                      <span className="text-sm font-bold text-red-600">{userData.virtualEscort.safetyIncidents}</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Lần cuối sử dụng: </span>
                      <span className="text-sm font-medium">{userData.virtualEscort.lastUsed}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Tuyến đường yêu thích</h3>
                  <div className="space-y-2">
                    {userData.virtualEscort.favoriteRoutes.map((route, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">{route}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'blog' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thống kê Blog</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-gray-600">Tổng số bài viết</span>
                      <span className="text-sm font-bold text-blue-600">{userData.blogActivity.totalPosts}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-gray-600">Tổng lượt xem</span>
                      <span className="text-sm font-bold text-green-600">{userData.blogActivity.totalViews}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm text-gray-600">Tổng lượt thích</span>
                      <span className="text-sm font-bold text-purple-600">{userData.blogActivity.totalLikes}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Danh mục nội dung</h3>
                  <div className="space-y-2">
                    {userData.blogActivity.categories.map((category, index) => (
                      <div key={index} className="p-2 bg-gray-100 rounded text-sm text-center">
                        {category}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <div className="text-xs text-gray-600">Bài viết phổ biến nhất:</div>
                    <div className="text-sm font-medium text-yellow-800">{userData.blogActivity.mostPopularPost}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Các báo cáo sự cố đã gửi</h3>
              <div className="space-y-3">
                {userData.incidentReports.map((incident) => (
                  <div key={incident.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Flag className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-sm">{incident.type}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(incident.priority)}`}>
                            {incident.priority}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>ID: {incident.id}</div>
                          <div>Địa điểm: {incident.location}</div>
                          <div>Ngày: {incident.date}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(incident.status)}`}>
                        {incident.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Hoạt động gần đây</h3>
              <div className="space-y-3">
                {userData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Activity className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{activity.action}</span>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{activity.detail}</p>
                      <p className="text-xs text-gray-500">Địa điểm: {activity.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
               <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin gói cước</h3>
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Gói dịch vụ:</span>
                      <span className="text-sm font-medium">{userData.subscription.plan}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Trạng thái:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(userData.subscription.status)}`}>
                        {userData.subscription.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Thanh toán tiếp theo:</span>
                      <span className="text-sm font-medium">{userData.subscription.nextBilling}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Phí hàng tháng:</span>
                      <span className="text-sm font-medium">{userData.subscription.amount}</span>
                    </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Lịch sử thanh toán</h3>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Giao dịch</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gói</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userData.paymentHistory.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{payment.id}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{payment.date}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{payment.package}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{payment.amount}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <Ban className="w-4 h-4" />
              <span>Đình chỉ tài khoản</span>
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