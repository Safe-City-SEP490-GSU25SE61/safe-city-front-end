import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import FilterBar from '../../components/common/FilterBar';
import { Eye, AlertTriangle, FileText, MapPin, Users, Shield } from 'lucide-react';
import { PaginationComponent } from '../../components/common/Pagination';
import NotificationBar from '../../components/common/NotificationBar';
import IncidentDetail from '../../components/officer/IncidentDetail';
import { getIncident, getIncidentAdmin, getIncidentById } from '../../services/api/incident';
import { getAllWards } from '../../services/api/ward';

// Define a type for the incident object for better type safety
interface Incident {
  id: string;
  title: string;
  reportedDate: string;
  createdAt: string;
  occurredAt: string;
  // Store original ISO dates for filtering
  createdAtISO: string;
  occurredAtISO: string;
  location: string;
  reporter: string;
  status: 'pending' | 'verified' | 'solved' | 'cancelled' | 'closed' | 'malicious';
  category: string;
  district: string;
  assignedOfficer?: string;
  lat?: string;
  lng?: string;
}

const IncidentReportAdmin: React.FC = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    district: '',
    range: 'year' as 'day' | 'week' | 'year' | 'month',
    sort: 'newest' as 'newest' | 'oldest',
    includeRelated: false,
    priorityFilter: '',
    fromDate: '',
    toDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [incidentDetail, setIncidentDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });
  const [wards, setWards] = useState<Array<{label: string, value: string}>>([]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await getIncidentAdmin(filters.range, filters.sort, filters.includeRelated, filters.priorityFilter, filters.fromDate, filters.toDate);
      const mappedIncidents = (res || []).map((item: any) => {
        const incident = item.mainReport || item; // Handle nested structure
        
        // Custom date formatting function: HH:mm:ss d/m/yyyy (24-hour format)
        const formatCustomDate = (dateString: string) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          
          // Force 24-hour format
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          const seconds = date.getSeconds().toString().padStart(2, '0');
          const time = `${hours}:${minutes}:${seconds}`;
          
          const day = date.getDate();
          const month = date.getMonth() + 1;
          const year = date.getFullYear();
          return `${time} ${day}/${month}/${year}`;
        };
        
        return {
          id: incident.id,
          title: incident.description || incident.type || 'Không có tiêu đề',
          reportedDate: formatCustomDate(incident.createdAt),
          createdAt: formatCustomDate(incident.createdAt),
          occurredAt: formatCustomDate(incident.occurredAt),
          // Store original ISO dates for filtering
          createdAtISO: incident.createdAt || '',
          occurredAtISO: incident.occurredAt || '',
          location: incident.address || '',
          reporter: incident.isAnonymous ? 'Ẩn danh' : (incident.userName || ''),
          status: incident.status,
          category: incident.type || 'Khác',
          district: incident.communeName || 'Chưa xác định',
          assignedOfficer: incident.verifiedByName || 'Chưa phân công',
          lat: incident.lat,
          lng: incident.lng,
        };
      });
      setIncidents(mappedIncidents);
    } catch (error) {
      setIncidents([]);
      setNotification({
        show: true,
        message: "Có lỗi xảy ra khi tải danh sách báo cáo",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWards = async () => {
    try {
      const wardsData = await getAllWards();
      const formattedWards = wardsData.map((ward: any) => ({
        label: ward.name,
        value: ward.name
      }));
      setWards(formattedWards);
    } catch (error) {
      console.error('Error fetching wards:', error);
      // Keep empty array as fallback
      setWards([]);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [filters.range, filters.sort, filters.includeRelated, filters.priorityFilter, filters.fromDate, filters.toDate]);

  useEffect(() => {
    fetchWards();
  }, []);

  // Handle navigation state for automatic district filtering
  useEffect(() => {
    const state = location.state as { filterByDistrict?: string } | null;
    if (state?.filterByDistrict) {
      console.log(`🎯 Auto-filtering by district: ${state.filterByDistrict}`);
      setFilters(prev => ({
        ...prev,
        district: state.filterByDistrict || ''
      }));
      // Clear the state to prevent re-filtering on subsequent renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Filter incidents based on search term and filters
  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.assignedOfficer?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filters.status || incident.status === filters.status;
    const matchesCategory = !filters.category || incident.category === filters.category;
    const matchesDistrict = !filters.district || incident.district === filters.district;

    // Date filtering using ISO dates for accurate comparison
    let matchesDate = true;
    if (filters.fromDate) {
      const from = new Date(filters.fromDate);
      // Use original ISO date for accurate parsing
      const incidentDate = new Date(incident.createdAtISO);
      matchesDate = matchesDate && incidentDate >= from;
    }
    if (filters.toDate) {
      const to = new Date(filters.toDate);
      // Set to end of day for inclusive comparison
      to.setHours(23, 59, 59, 999);
      // Use original ISO date for accurate parsing
      const incidentDate = new Date(incident.createdAtISO);
      matchesDate = matchesDate && incidentDate <= to;
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesDistrict && matchesDate;
  });

  // Calculate paginated incidents
  const paginatedIncidents = filteredIncidents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filterOptions = {
    status: [
      { label: 'Chờ xác nhận', value: 'pending' },
      { label: 'Đã xác minh', value: 'verified' },
      { label: 'Đã giải quyết', value: 'solved' },
      { label: 'Đã hủy', value: 'cancelled' },
      { label: 'Đã đóng', value: 'closed' },
      { label: 'Sai phạm', value: 'malicious' }
    ],
    category: [
      { label: 'Trộm cắp', value: 'theft' },
      { label: 'Bạo lực', value: 'violence' },
      { label: 'Giao thông', value: 'traffic' },
      { label: 'An ninh', value: 'security' },
      { label: 'Khác', value: 'other' }
    ],
    district: wards,
    range: [
      { label: 'Theo ngày', value: 'day' },
      { label: 'Theo tuần', value: 'week' },
      { label: 'Theo tháng', value: 'month' },
      { label: 'Theo năm', value: 'year' },
    ],
    sort: [
      { label: 'Mới nhất', value: 'newest' },
      { label: 'Cũ nhất', value: 'oldest' }
    ],
    includeRelated: [
      { label: 'Bao gồm liên quan', value: 'true' },
      { label: 'Không bao gồm', value: 'false' }
    ],
    priorityFilter: [
      { label: 'Thấp', value: 'Low' },
      { label: 'Trung bình', value: 'Medium' },
      { label: 'Cao', value: 'High' },
      { label: 'Nghiêm trọng', value: 'Critical' }
    ],
    fromDate: { label: 'Từ ngày', type: 'datetime' as const },
    toDate: { label: 'Đến ngày', type: 'datetime' as const }
  };

  const handleViewIncident = async (incident: Incident) => {
    setLoadingDetail(true);
    setSelectedIncident(incident);
    try {
      const res = await getIncidentById(incident.id);
      // Map API data to detail format expected by IncidentDetail
      const detail = {
        id: res.id,
        title: res.description || res.type || 'Không có tiêu đề',
        description: res.description || '',
        location: res.address || '',
        reportedDate: res.createdAt ? new Date(res.createdAt).toLocaleDateString('vi-VN') : '',
        reporter: res.isAnonymous ? 'Anonymous' : (res.userName || ''),
        status: res.status,
        lat: res.lat,
        lng: res.lng,
        verifiedByName: res.verifiedByName,
        category: res.type || 'Khác',
        priorityLevel: res.priorityLevel || 'Khác',
        subCategory: res.subCategory || 'Khác',
        evidence: [
          ...(res.imageUrls || []).map((url: string) => ({
            type: 'image',
            url,
            description: 'Hình ảnh hiện trường'
          })),
          ...(res.videoUrl ? [{
            type: 'video',
            url: res.videoUrl,
            description: 'Video hiện trường'
          }] : [])
        ],
        updates: (res.notes || []).map((note: string) => {
          // Try to extract officer and date from the note string
          const match = note.match(/^\[(.*?)\]\s*(.*?):\s*(.*)$/);
          if (match) {
            return {
              date: match[1],
              officer: match[2],
              action: match[3]
            };
          }
          return { date: '', officer: '', action: note };
        }),
        assignedOfficer: res.assignedOfficer || '',
        estimatedResolution: res.estimatedResolution || '',
        relatedIncidents: res.relatedIncidents || [],
        attachments: [],
      };
      setIncidentDetail(detail);
    } catch (e) {
      setIncidentDetail(null);
      setNotification({
        show: true,
        message: "Có lỗi xảy ra khi tải chi tiết báo cáo",
        type: "error"
      });
    }
    setLoadingDetail(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      case 'solved': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-400 text-gray-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'malicious': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      default: return status;
    }
  };

  // Calculate statistics for admin overview (based on filtered results)
  const totalIncidents = filteredIncidents.length;
  const pendingIncidents = filteredIncidents.filter(i => i.status === 'pending').length;
  const verifiedIncidents = filteredIncidents.filter(i => i.status === 'verified').length;
  const solvedIncidents = filteredIncidents.filter(i => i.status === 'solved').length;

  return (
    <>
      <NotificationBar
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification(n => ({ ...n, show: false }))}
      />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
            <div className="mb-6">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-8 h-8 text-blue-600" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      Quản lý báo cáo sự cố - Admin
                    </h1>
                  </div>
                  <p className="text-gray-600">
                    Tổng quan và quản lý tất cả báo cáo sự cố trong toàn thành phố
                  </p>
                </div>
              </div>
              
              {/* Admin Statistics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tổng báo cáo</p>
                      <p className="text-2xl font-bold text-gray-900">{totalIncidents}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Chờ xác nhận</p>
                      <p className="text-2xl font-bold text-yellow-600">{pendingIncidents}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Đã xác minh</p>
                      <p className="text-2xl font-bold text-blue-600">{verifiedIncidents}</p>
                    </div>
                    <Eye className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Đã giải quyết</p>
                      <p className="text-2xl font-bold text-green-600">{solvedIncidents}</p>
                    </div>
                    <Shield className="w-8 h-8 text-green-500" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Phạm vi quản lý:</span>
                    <span className="text-sm">Toàn thành phố Hồ Chí Minh</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Quản lý và giám sát tất cả báo cáo sự cố từ các quận/huyện
                  </p>
                </div>
                <FilterBar
                  searchPlaceholder="Tìm kiếm báo cáo sự cố (ID, tiêu đề, địa điểm, người báo cáo, cán bộ)"
                  onSearch={setSearchTerm}
                  onFilterChange={(filters) => {
                    const updatedFilters = {
                      ...filters,
                      includeRelated: filters.includeRelated === 'true' ? true : filters.includeRelated === 'false' ? false : false
                    };
                    setFilters(updatedFilters as any);
                  }}
                  filterOptions={filterOptions}
                  showExport={true}
                  onExport={() => {
                    setNotification({
                      show: true,
                      message: "Chức năng xuất báo cáo đang được phát triển",
                      type: "info"
                    });
                  }}
                />
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />                
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Đang tải danh sách báo cáo...</h3>
                  <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian báo cáo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa điểm</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quận/Huyện</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người báo cáo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedIncidents.map((incident) => (
                          <tr key={incident.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                              <div className="max-w-xs truncate" title={incident.title}>
                                {incident.title}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {incident.reportedDate}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <div className="max-w-xs truncate" title={incident.location}>
                                  {incident.location}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {incident.district}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {incident.reporter}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {incident.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                                {getStatusText(incident.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex gap-2">
                                <button
                                  className="text-gray-400 hover:text-gray-600 transition-colors"
                                  onClick={() => handleViewIncident(incident)}
                                  title="Xem chi tiết báo cáo"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredIncidents.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Không tìm thấy báo cáo sự cố nào phù hợp với tiêu chí tìm kiếm</p>
                    </div>
                  )}
                  
                  {/* Pagination */}
                  {filteredIncidents.length > 0 && (
                    <div className="flex justify-center">
                      <PaginationComponent
                        totalItems={filteredIncidents.length}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
            
            {selectedIncident && incidentDetail && (
              <IncidentDetail
                incident={incidentDetail}
                loading={loadingDetail}
                onClose={() => {
                  setSelectedIncident(null);
                  setIncidentDetail(null);
                }}
              />
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default IncidentReportAdmin;