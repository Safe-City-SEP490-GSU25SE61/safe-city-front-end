import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import FilterBar from '../../components/common/FilterBar';
import { Eye, AlertTriangle, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { PaginationComponent } from '../../components/common/Pagination';
import NotificationBar from '../../components/common/NotificationBar';
import IncidentDetail from '../../components/officer/IncidentDetail';
import { getIncident, getIncidentById } from '../../services/api/incident';
import { getUserProfile } from '../../services/api/account';
// Define a type for the incident object for better type safety
interface Incident {
  id: string;
  title: string;
  reportedDate: string;
  createdAt: string;
  occurredAt: string;
  createdAtISO: string;
  occurredAtISO: string;
  location: string;
  reporter: string;
  status: 'pending' | 'verified' | 'solved' | 'cancelled' | 'closed' | 'malicious';
  category: string;
  lat?: string;
  lng?: string;
  relatedReports?: Incident[];
  isRelated?: boolean;
}



// Remove the mock getIncidents function

const IncidentReport: React.FC = () => {
  const [officerCommune, setOfficerCommune] = useState('Đang tải...');

  useEffect(() => {
    const profileData = localStorage.getItem('officerCommune');
    if (profileData) {
      const commune = JSON.parse(profileData);
      // Assuming the district is available at profile.ward.district.name
     
      setOfficerCommune(commune);
    }
  }, []);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userProfile = await getUserProfile();
        if (userProfile && userProfile.data) {
          localStorage.setItem('officerCommune', JSON.stringify(userProfile.data.commune));
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setNotification({
          show: true,
          message: "Không thể tải thông tin người dùng.",
          type: "error",
        });
      }
    };

    fetchUserProfile();
  }, []); // Empty dependency array to run once on mount

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await getIncident(
        filters.range,
        filters.sort,
        filters.includeRelated,
        filters.priorityFilter,
        filters.fromDate,
        filters.toDate
      );
            const formatIncident = (incident: any, isRelated = false): Incident => {
        const formatCustomDate = (dateString: string) => {
          if (!dateString) return '';
          const date = new Date(dateString);
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
          createdAtISO: incident.createdAt || '',
          occurredAtISO: incident.occurredAt || '',
          location: incident.address || '',
          reporter: incident.isAnonymous ? 'Ẩn danh' : (incident.userName || ''),
          status: incident.status,
          category: incident.type || 'Khác',
          lat: incident.lat,
          lng: incident.lng,
          isRelated,
        };
      };

      const mappedIncidents = (res || []).map((item: any) => {
        if (item.mainReport) {
          const mainIncident = formatIncident(item.mainReport);
          mainIncident.relatedReports = (item.relatedReports || []).map((related: any) => formatIncident(related, true));
          return mainIncident;
        } else {
          return formatIncident(item);
        }
      });
      setIncidents(mappedIncidents);
      console.log(mappedIncidents)
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

  useEffect(() => {
    fetchIncidents();
  }, [filters.range, filters.sort, filters.includeRelated, filters.priorityFilter, filters.fromDate, filters.toDate]);

  // Filter incidents based on search term and filters
  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.reporter.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filters.status || incident.status === filters.status;
    const matchesCategory = !filters.category || incident.category === filters.category;

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

    return matchesSearch && matchesStatus && matchesCategory && matchesDate;
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
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      Quản lý báo cáo sự cố
                    </h1>
                  </div>
                  <p className="text-gray-600">
                    Danh sách các báo cáo sự cố và tình huống khẩn cấp trong khu vực
                  </p>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <span className="text-sm font-medium">Khu vực quản lý: {officerCommune}</span>
                  
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Tất cả báo cáo hiển thị đều thuộc phạm vi quản lý của bạn
                  </p>
                </div>
                <FilterBar
                  searchPlaceholder="Tìm kiếm báo cáo sự cố (Mã số, tiêu đề, địa điểm, người báo cáo)"
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người báo cáo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                        </tr>
                      </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedIncidents.map((incident) => {
                          const isExpanded = expandedRows.has(incident.id);
                          return (
                            <React.Fragment key={incident.id}>
                              <tr className={`transition-colors ${incident.relatedReports && incident.relatedReports.length > 0 ? 'bg-purple-50 hover:bg-purple-100' : 'hover:bg-gray-50'}`}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                  <div className="flex items-center gap-2">
                                    {incident.relatedReports && incident.relatedReports.length > 0 ? (
                                      <button
                                        onClick={() => {
                                          setExpandedRows(prev => {
                                            const newSet = new Set(prev);
                                            if (newSet.has(incident.id)) {
                                              newSet.delete(incident.id);
                                            } else {
                                              newSet.add(incident.id);
                                            }
                                            return newSet;
                                          });
                                        }}
                                        className="p-1 rounded-full hover:bg-gray-200"
                                      >
                                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                      </button>
                                    ) : (
                                      <div className="w-6"></div> // Placeholder for alignment
                                    )}
                                    <span>{incident.title}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{incident.reportedDate}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{incident.location}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{incident.reporter}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{incident.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                                    {getStatusText(incident.status)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <button
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                    onClick={() => handleViewIncident(incident)}
                                  >
                                    <Eye className="w-5 h-5" />
                                  </button>
                                </td>
                              </tr>
                              {isExpanded && incident.relatedReports && incident.relatedReports.map(related => (
                                <tr key={related.id} className="bg-blue-50 hover:bg-blue-100 transition-colors">
                                  <td className="pl-12 pr-6 py-3 whitespace-nowrap text-sm text-gray-800">
                                    <div className="flex items-center gap-2">
                                      <FileText size={14} className="text-gray-500" />
                                      <span>{related.title}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-800">{related.reportedDate}</td>
                                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-800">{related.location}</td>
                                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-800">{related.reporter}</td>
                                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-800">{related.category}</td>
                                  <td className="px-6 py-3 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(related.status)}`}>
                                      {getStatusText(related.status)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-3 whitespace-nowrap">
                                    <button
                                      className="text-gray-400 hover:text-gray-600 transition-colors"
                                      onClick={() => handleViewIncident(related)}
                                    >
                                      <Eye className="w-5 h-5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {filteredIncidents.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Không tìm thấy báo cáo sự cố nào trong khu vực {officerCommune}</p>
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
                onStatusUpdate={fetchIncidents}
              />
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default IncidentReport;
