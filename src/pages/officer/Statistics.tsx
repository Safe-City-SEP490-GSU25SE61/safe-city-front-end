import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import NotificationBar from '../../components/common/NotificationBar';
import { 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  Shield,
  RefreshCw,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  Users
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
  LineChart,
  Line
} from 'recharts';
import { getIncidentStatisticsOfficer } from '../../services/api/incident';
import { getBlogByOfficer } from '../../services/api/blog';

interface OfficerStatisticsData {
  totalIncidents: number;
  totalBlogs: number;
  myIncidents: number;
  myBlogs: number;
  incidentsByStatus: Record<string, number>;
  incidentsByType: Record<string, number>;
  blogsByStatus: Record<string, number>;
  ViolationBlog: number;
  recentActivity: Array<{
    id: string;
    type: 'incident' | 'blog';
    title: string;
    timestamp: string;
    status: string;
  }>;
  weeklyTrends: Array<{
    day: string;
    incidents: number;
    blogs: number;
  }>;
  performanceMetrics: {
    solvedIncidents: number;
  
    approvedBlogs: number;
    communityEngagement: number;
  };
}

const OfficerStatistics: React.FC = () => {
  const [statistics, setStatistics] = useState<OfficerStatisticsData>({
    totalIncidents: 0,
    totalBlogs: 0,
    myIncidents: 0,
    myBlogs: 0,
    incidentsByStatus: {},
    incidentsByType: {},
    blogsByStatus: {},
    ViolationBlog: 0,
    recentActivity: [],
    weeklyTrends: [],
    performanceMetrics: {
      solvedIncidents: 0,
      approvedBlogs: 0,
      communityEngagement: 0
    }
  });
  const [officerCommune, setOfficerCommune] = useState('Đang tải...');
  
    useEffect(() => {
      const profileData = localStorage.getItem('officerCommune');
      if (profileData) {
        const commune = JSON.parse(profileData);
        // Assuming the district is available at profile.ward.district.name
       
        setOfficerCommune(commune);
      }
    }, []);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'quarter'>('week');
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  const fetchStatistics = async () => {
    try {
      setRefreshing(true);
      
      // Fetch officer's statistics and blogs
      const [statisticsRes, blogsRes] = await Promise.all([
        getIncidentStatisticsOfficer(timePeriod),
        getBlogByOfficer()
      ]);

      // Use the statistics data from your new API
      const statsData = statisticsRes?.data || {};
      console.log('Statistics API Response:', statsData);
      
      // Process blogs data
      const blogs = blogsRes?.data || [];
      const blogsByStatus: Record<string, number> = {};
      blogs.forEach((blog: any) => {
        const status = blog.isApproved ? 'approved' : 'pending';
        blogsByStatus[status] = (blogsByStatus[status] || 0) + 1;
      });

      // Map your API response to the expected format
      const incidentsByStatus = statsData.reportsByStatus || {};
      const incidentsByType = statsData.reportsBySubType || {};
      
      // Generate recent activity (you may want to add this to your API response)
      const recentActivity = blogs.slice(0, 5).map((blog: any) => ({
        id: blog.id || Math.random().toString(),
        type: 'blog' as const,
        title: `Bài viết: ${blog.title || 'Không có tiêu đề'}`,
        timestamp: blog.createdAt || new Date().toISOString(),
        status: blog.isApproved ? 'approved' : 'pending'
      })).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Generate weekly trends (you may want to add this to your API response)
      const weeklyTrends = [
        { day: 'T2', incidents: Math.floor((statsData.totalReports || 0) * 0.1), blogs: Math.floor(blogs.length * 0.15) },
        { day: 'T3', incidents: Math.floor((statsData.totalReports || 0) * 0.15), blogs: Math.floor(blogs.length * 0.1) },
        { day: 'T4', incidents: Math.floor((statsData.totalReports || 0) * 0.2), blogs: Math.floor(blogs.length * 0.2) },
        { day: 'T5', incidents: Math.floor((statsData.totalReports || 0) * 0.25), blogs: Math.floor(blogs.length * 0.25) },
        { day: 'T6', incidents: Math.floor((statsData.totalReports || 0) * 0.15), blogs: Math.floor(blogs.length * 0.15) },
        { day: 'T7', incidents: Math.floor((statsData.totalReports || 0) * 0.1), blogs: Math.floor(blogs.length * 0.1) },
        { day: 'CN', incidents: Math.floor((statsData.totalReports || 0) * 0.05), blogs: Math.floor(blogs.length * 0.05) }
      ];

      // Calculate performance metrics from your API data
      const solvedIncidents = incidentsByStatus['solved'] || 0;
      const approvedBlogs = blogsByStatus['approved'] || 0;
      const ViolationBlog = blogsByStatus['rejected'] || 0;
      
      setStatistics({
        totalIncidents: statsData.totalReports || 0,
        totalBlogs: blogs.length,
        myIncidents: statsData.totalReports || 0,
        myBlogs: blogs.length,
        ViolationBlog,
        incidentsByStatus,
        incidentsByType,
        blogsByStatus,
        recentActivity,
        weeklyTrends,
        performanceMetrics: {
          solvedIncidents,
          approvedBlogs,
          communityEngagement: Math.floor((approvedBlogs + solvedIncidents) * 1.2)
        }
      });

      setNotification({
        show: true,
        message: "Dữ liệu thống kê đã được cập nhật!",
        type: "success",
      });

    } catch (error) {
      console.error('Error fetching statistics:', error);
      setNotification({
        show: true,
        message: "Có lỗi xảy ra khi tải dữ liệu thống kê",
        type: "error",
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
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      case 'solved': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'approved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'verified': return 'Đã xác minh';
      case 'solved': return 'Đã giải quyết';
      case 'cancelled': return 'Đã hủy';
      case 'approved': return 'Đã duyệt';
      default: return status;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'incident':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'blog':
        return <FileText className="w-4 h-4 text-blue-600" />;
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
                      Tổng quan hoạt động của {officerCommune}
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
                        <option value="week">Theo tuần</option>
                        <option value="month">Theo tháng</option>
                        <option value="quarter">Theo quý</option>
                      </select>
                    </div>
                    
                    {/* Refresh Button */}
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
                          <p className="text-sm font-medium text-gray-600">Báo cáo xử lý</p>
                          <p className="text-3xl font-bold text-gray-900">{statistics.myIncidents}</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg">
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-600">+15% so với tuần trước</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Bài viết đã tạo</p>
                          <p className="text-3xl font-bold text-gray-900">{statistics.myBlogs}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-600">+8% so với tuần trước</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Đã giải quyết</p>
                          <p className="text-3xl font-bold text-gray-900">{statistics.performanceMetrics.solvedIncidents}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-600">Tỷ lệ: {Math.round((statistics.performanceMetrics.solvedIncidents / statistics.myIncidents) * 100) || 0}%</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Bài viết vi phạm</p>
                          <p className="text-3xl font-bold text-gray-900">{statistics.ViolationBlog}</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <Users className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-600">+8h tuần này</span>
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

                    {/* Blog Status Chart */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Trạng thái bài viết
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={Object.entries(statistics.blogsByStatus).map(([status, count]) => ({
                              name: getStatusText(status),
                              value: count
                            }))}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Trends Chart */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Xu hướng hoạt động trong tuần
                    </h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={statistics.weeklyTrends}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="incidents" 
                            stroke="#ef4444" 
                            strokeWidth={2}
                            name="Báo cáo"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="blogs" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            name="Bài viết"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Recent Activity and Performance Metrics */}
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

                    {/* Performance Summary */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        Hiệu suất làm việc
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-gray-900">Báo cáo đã giải quyết</span>
                          </div>
                          <span className="text-lg font-bold text-green-600">{statistics.performanceMetrics.solvedIncidents}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900">Bài viết được duyệt</span>
                          </div>
                          <span className="text-lg font-bold text-blue-600">{statistics.performanceMetrics.approvedBlogs}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-600" />
                            <span className="text-sm font-medium text-gray-900">Tương tác cộng đồng</span>
                          </div>
                          <span className="text-lg font-bold text-purple-600">{statistics.performanceMetrics.communityEngagement}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-orange-600" />
                            <span className="text-sm font-medium text-gray-900">Bai viet vi pham</span>
                          </div>
                          <span className="text-lg font-bold text-orange-600">{statistics.ViolationBlog}</span>
                        </div>
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

export default OfficerStatistics;
