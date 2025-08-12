import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import NotificationBar from '../../components/common/NotificationBar';
import { 
  BarChart3, 
  Users, 
  AlertTriangle, 
  Trophy, 
  MapPin, 
  TrendingUp, 
  Shield,
  RefreshCw,
  Filter,
  Clock,
  AlertCircle,
  DollarSign,
  CreditCard,
  Wallet
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { getIncidentAdmin } from '../../services/api/incident';
import { getUsers } from '../../services/api/account';

interface StatisticsData {
  totalIncidents: number;
  totalUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  incidentsByStatus: Record<string, number>;
  incidentsByType: Record<string, number>;
  incidentsByDistrict: Record<string, number>;
  usersByRole: Record<string, number>;
  subscriptionsByType: Record<string, number>;
  recentActivity: Array<{
    id: string;
    type: 'incident' | 'user' | 'achievement' | 'payment';
    title: string;
    timestamp: string;
    status: string;
  }>;
  monthlyTrends: Array<{
    month: string;
    incidents: number;
    users: number;
    revenue: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    subscriptions: number;
    premiumUpgrades: number;
    total: number;
  }>;
}

const AdminStatistics: React.FC = () => {
  const [statistics, setStatistics] = useState<StatisticsData>({
    totalIncidents: 0,
    totalUsers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    incidentsByStatus: {},
    incidentsByType: {},
    incidentsByDistrict: {},
    usersByRole: {},
    subscriptionsByType: {},
    recentActivity: [],
    monthlyTrends: [],
    revenueByMonth: []
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  const fetchStatistics = async () => {
    try {
      setRefreshing(true);
      
      // Fetch data from all APIs
      const [incidentsRes, usersRes] = await Promise.all([
        getIncidentAdmin(timePeriod, 'newest'),
        getUsers()
      ]);

      // Process incidents data
      const incidents = incidentsRes || [];
      const incidentsByStatus: Record<string, number> = {};
      const incidentsByType: Record<string, number> = {};
      const incidentsByDistrict: Record<string, number> = {};

      incidents.forEach((incident: any) => {
        const mainReport = incident.mainReport || incident;
        
        // Count by status
        const status = mainReport.status || 'unknown';
        incidentsByStatus[status] = (incidentsByStatus[status] || 0) + 1;
        
        // Count by type
        const type = mainReport.type || 'Khác';
        incidentsByType[type] = (incidentsByType[type] || 0) + 1;
        
        // Count by district
        const district = mainReport.district || 'Chưa xác định';
        incidentsByDistrict[district] = (incidentsByDistrict[district] || 0) + 1;
      });

      // Process users data
      const users = usersRes?.data || [];
      const usersByRole: Record<string, number> = {};
      users.forEach((user: any) => {
        const role = user.roleName || 'Unknown';
        usersByRole[role] = (usersByRole[role] || 0) + 1;
      });

      // Generate fake payment/subscription data
      const totalRevenue = 125000000; // 125M VND
      const monthlyRevenue = 15000000; // 15M VND this month
      const activeSubscriptions = Math.floor(users.length * 0.3); // 30% of users have subscriptions
      
      const subscriptionsByType = {
        'Gói Cơ Bản': Math.floor(activeSubscriptions * 0.6),
        'Gói Premium': Math.floor(activeSubscriptions * 0.3),
        'Gói Doanh Nghiệp': Math.floor(activeSubscriptions * 0.1)
      };

      // Generate recent activity including payments
      const recentActivity = [
        ...incidents.slice(0, 2).map((incident: any) => ({
          id: incident.id || Math.random().toString(),
          type: 'incident' as const,
          title: `Báo cáo: ${incident.mainReport?.title || 'Không có tiêu đề'}`,
          timestamp: incident.mainReport?.createdAt || new Date().toISOString(),
          status: incident.mainReport?.status || 'unknown'
        })),
        ...users.slice(0, 2).map((user: any) => ({
          id: user.id || Math.random().toString(),
          type: 'user' as const,
          title: `Người dùng: ${user.fullName || user.username || 'Không có tên'}`,
          timestamp: user.createdAt || new Date().toISOString(),
          status: user.isActive ? 'active' : 'inactive'
        })),
        // Add fake payment activities
        {
          id: 'payment-1',
          type: 'payment' as const,
          title: 'Thanh toán gói Premium - 299,000 VND',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: 'payment-2', 
          type: 'payment' as const,
          title: 'Gia hạn gói Cơ Bản - 99,000 VND',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: 'payment-3',
          type: 'payment' as const,
          title: 'Thanh toán gói Doanh Nghiệp - 999,000 VND',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        }
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 6);

      // Generate monthly trends with revenue data
      const monthlyTrends = [
        { month: 'T1', incidents: Math.floor(incidents.length * 0.7), users: Math.floor(users.length * 0.8), revenue: 8500000 },
        { month: 'T2', incidents: Math.floor(incidents.length * 0.85), users: Math.floor(users.length * 0.9), revenue: 11200000 },
        { month: 'T3', incidents: incidents.length, users: users.length, revenue: 13800000 },
        { month: 'T4', incidents: Math.floor(incidents.length * 1.1), users: Math.floor(users.length * 1.05), revenue: 15600000 },
        { month: 'T5', incidents: Math.floor(incidents.length * 0.95), users: Math.floor(users.length * 1.1), revenue: 14200000 },
        { month: 'T6', incidents: Math.floor(incidents.length * 1.2), users: Math.floor(users.length * 1.15), revenue: 17300000 }
      ];

      // Generate revenue breakdown by month
      const revenueByMonth = [
        { month: 'T1', subscriptions: 6800000, premiumUpgrades: 1700000, total: 8500000 },
        { month: 'T2', subscriptions: 8900000, premiumUpgrades: 2300000, total: 11200000 },
        { month: 'T3', subscriptions: 11000000, premiumUpgrades: 2800000, total: 13800000 },
        { month: 'T4', subscriptions: 12500000, premiumUpgrades: 3100000, total: 15600000 },
        { month: 'T5', subscriptions: 11400000, premiumUpgrades: 2800000, total: 14200000 },
        { month: 'T6', subscriptions: 13800000, premiumUpgrades: 3500000, total: 17300000 }
      ];

      setStatistics({
        totalIncidents: incidents.length,
        totalUsers: users.length,
        totalRevenue,
        monthlyRevenue,
        activeSubscriptions,
        incidentsByStatus,
        incidentsByType,
        incidentsByDistrict,
        usersByRole,
        subscriptionsByType,
        recentActivity,
        monthlyTrends,
        revenueByMonth
      });

      setNotification({
        show: true,
        message: "Dữ liệu thống kê đã được cập nhật thành công!",
        type: "success"
      });

    } catch (error) {
      console.error('Error fetching statistics:', error);
      setNotification({
        show: true,
        message: "Có lỗi xảy ra khi tải dữ liệu thống kê",
        type: "error"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [timePeriod]);

  const handleRefresh = () => {
    fetchStatistics();
  };



  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'verified': 'bg-blue-100 text-blue-800',
      'solved': 'bg-green-100 text-green-800',
      'cancelled': 'bg-gray-100 text-gray-800',
      'closed': 'bg-purple-100 text-purple-800',
      'malicious': 'bg-red-100 text-red-800',
      'approved': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      'pending': 'Chờ xử lý',
      'verified': 'Đã xác minh',
      'solved': 'Đã giải quyết',
      'cancelled': 'Đã hủy',
      'closed': 'Đã đóng',
      'malicious': 'Độc hại',
      'approved': 'Đã duyệt'
    };
    return texts[status] || status;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'incident':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'user':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'achievement':
        return <Trophy className="w-4 h-4 text-yellow-600" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-green-600" />;
      default:
        return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <>
      <NotificationBar
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                      Thống kê
                    </h1>
                    <p className="text-gray-600 mt-2">
                      Tổng quan về hoạt động hệ thống SafeCity
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Time Period Filter */}
                    <div className="flex items-center gap-2">
                      <Filter className="w-5 h-5 text-gray-500" />
                      <select
                        value={timePeriod}
                        onChange={(e) => setTimePeriod(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="day">Theo ngày</option>
                        <option value="week">Theo tuần</option>
                        <option value="month">Theo tháng</option>
                        <option value="year">Theo năm</option>
                      </select>
                    </div>
                    
                    {/* Action Buttons */}
                    <button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                      Làm mới
                    </button>
                    
                   
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {/* Key Metrics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Tổng báo cáo</p>
                          <p className="text-3xl font-bold text-gray-900">{statistics.totalIncidents}</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg">
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-600">+12% so với tháng trước</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Người dùng</p>
                          <p className="text-3xl font-bold text-gray-900">{statistics.totalUsers}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-600">+8% so với tháng trước</span>
                      </div>
                    </div>



                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                          <p className="text-3xl font-bold text-gray-900">{(statistics.totalRevenue / 1000000).toFixed(1)}M</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                          <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-600">+18% so với tháng trước</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Doanh thu tháng</p>
                          <p className="text-3xl font-bold text-gray-900">{(statistics.monthlyRevenue / 1000000).toFixed(1)}M</p>
                        </div>
                        <div className="p-3 bg-emerald-100 rounded-lg">
                          <Wallet className="w-6 h-6 text-emerald-600" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-600">Tháng hiện tại</span>
                      </div>
                    </div>
                  </div>

                  {/* Charts and Analytics */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Incident Status Pie Chart */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        Trạng thái báo cáo
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(statistics.incidentsByStatus).map(([status, count]) => ({
                                name: getStatusText(status),
                                value: count,
                                fill: status === 'pending' ? '#f59e0b' : 
                                      status === 'verified' ? '#3b82f6' :
                                      status === 'solved' ? '#10b981' :
                                      status === 'cancelled' ? '#ef4444' : '#6b7280'
                              }))}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {Object.entries(statistics.incidentsByStatus).map((_, index) => (
                                <Cell key={`cell-${index}`} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Incident Types Bar Chart */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                        Loại báo cáo
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={Object.entries(statistics.incidentsByType).slice(0, 5).map(([type, count]) => ({
                              name: type.length > 15 ? type.substring(0, 15) + '...' : type,
                              value: count
                            }))}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="name" 
                              angle={-45}
                              textAnchor="end"
                              height={60}
                              fontSize={12}
                            />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#8b5cf6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Revenue and Subscription Analytics */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Subscription Types Pie Chart */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        Phân bố gói đăng ký ({statistics.activeSubscriptions} người dùng)
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(statistics.subscriptionsByType).map(([type, count]) => ({
                                name: type,
                                value: count,
                                fill: type === 'Gói Cơ Bản' ? '#3b82f6' : 
                                      type === 'Gói Premium' ? '#f59e0b' :
                                      type === 'Gói Doanh Nghiệp' ? '#10b981' : '#6b7280'
                              }))}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {Object.entries(statistics.subscriptionsByType).map((_, index) => (
                                <Cell key={`cell-${index}`} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Revenue Breakdown Chart */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Doanh thu theo tháng (VND)
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={statistics.revenueByMonth}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis 
                              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                            />
                            <Tooltip 
                              formatter={(value: any) => [`${(value / 1000000).toFixed(1)}M VND`, '']}
                            />
                            <Legend />
                            <Bar dataKey="subscriptions" stackId="a" fill="#3b82f6" name="Đăng ký" />
                            <Bar dataKey="premiumUpgrades" stackId="a" fill="#f59e0b" name="Nâng cấp" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Trends Chart */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Xu hướng tổng quan theo tháng
                    </h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={statistics.monthlyTrends}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                          <Tooltip 
                            formatter={(value: any, name: string) => {
                              if (name === 'Doanh thu') {
                                return [`${(value / 1000000).toFixed(1)}M VND`, name];
                              }
                              return [value, name];
                            }}
                          />
                          <Legend />
                          <Area 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="incidents" 
                            stackId="1" 
                            stroke="#ef4444" 
                            fill="#ef4444" 
                            name="Báo cáo"
                          />
                          <Area 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="users" 
                            stackId="1" 
                            stroke="#3b82f6" 
                            fill="#3b82f6" 
                            name="Người dùng"
                          />
                          <Area 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#10b981" 
                            fill="#10b981" 
                            fillOpacity={0.3}
                            name="Doanh thu"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Recent Activity and District Distribution */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-green-600" />
                        Hoạt động gần đây
                      </h3>
                      <div className="space-y-4">
                        {statistics.recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {activity.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(activity.timestamp).toLocaleString('vi-VN')}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                              {getStatusText(activity.status)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Districts */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-red-600" />
                        Quận/Huyện
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(statistics.incidentsByDistrict)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 6)
                          .map(([district, count]) => (
                          <div key={district} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 truncate">{district}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-red-600 h-1.5 rounded-full" 
                                  style={{ width: `${(count / Math.max(...Object.values(statistics.incidentsByDistrict))) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium text-gray-900 w-6">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminStatistics;
