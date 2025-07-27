import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import FilterBar from '../../components/common/FilterBar';
import { Eye, AlertTriangle, Plus, FileText, MapPin } from 'lucide-react';
import { PaginationComponent } from '../../components/common/Pagination';

import NotificationBar from '../../components/common/NotificationBar';
import IncidentDetail from '../../components/officer/IncidentDetail';
import { getIncident, getIncidentById } from '../../services/api/incident';

// Define a type for the incident object for better type safety
interface Incident {
  id: string;
  title: string;
  reportedDate: string; // keep for compatibility
  createdAt: string;    // add this
  occurredAt: string;   // add this
  location: string;
  reporter: string;
  status: 'pending' | 'verified' | 'solved' | 'cancelled' | 'closed' | 'malicious';
  category: string;
  lat?: string;
  lng?: string;
}



// Remove the mock getIncidents function

const IncidentReport: React.FC = () => {
  // Mock officer district - in real app this would come from user context/auth
  const officerDistrict = "Quận 1";
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    dateFrom: '',
    dateTo: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [incidentDetail, setIncidentDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await getIncident();
      const mappedIncidents = (res || []).map((incident: any) => ({
        id: incident.id,
        title: incident.description || incident.type || 'Không có tiêu đề',
        reportedDate: incident.createdAt ? new Date(incident.createdAt).toLocaleString('vi-VN') : '',
        createdAt: incident.createdAt ? new Date(incident.createdAt).toLocaleString('vi-VN') : '',
        occurredAt: incident.occurredAt ? new Date(incident.occurredAt).toLocaleString('vi-VN') : '',
        location: incident.address || '',
        reporter: incident.isAnonymous ? 'Anonymous' : (incident.userName || ''),
        status: incident.status,
        category: incident.type || 'Khác',
        lat: incident.lat,
        lng: incident.lng,
      }));
      setIncidents(mappedIncidents);
    } catch (error) {
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // Filter incidents based on search term and filters
  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.reporter.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filters.status || incident.status === filters.status;
    const matchesCategory = !filters.category || incident.category === filters.category;

    // Date filtering
    let matchesDate = true;
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom.split('/').reverse().join('-'));
      const incidentDate = new Date(incident.reportedDate.split('/').reverse().join('-'));
      matchesDate = matchesDate && incidentDate >= from;
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo.split('/').reverse().join('-'));
      const incidentDate = new Date(incident.reportedDate.split('/').reverse().join('-'));
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
      { label: 'Khác', value: 'other' }
      
    ],
    createdFrom: { label: 'Từ ngày tạo', type: 'datetime' },
    createdTo: { label: 'Đến ngày tạo', type: 'datetime' },
    occurredFrom: { label: 'Từ ngày xảy ra', type: 'datetime' },
    occurredTo: { label: 'Đến ngày xảy ra', type: 'datetime' },
  };

  function enrichIncidentDetail(apiData: any) {
    const {
      id,
      title,
      description,
      location,
      reportedDate,
      reporterName,
      status,
      category,
    } = apiData;
  
    return {
      id,
      title,
      description,
      location,
      reportedDate,
      reporter: reporterName,
      status,
      category,
      evidence: [
        { type: 'image', url: 'https://th.bing.com/th?id=OIF.sjc%2bgHAmAM6YW71AdB5dhw&w=124&h=180&c=7&r=0&o=5&dpr=1.1&pid=1.7', description: 'Hình ảnh hiện trường' },
        { type: 'video', url: 'https://example.com/evidence2.mp4', description: 'Video giám sát' }
      ],
      updates: [
        { date: '2024-06-19 10:30', officer: 'Cảnh sát Nguyễn Văn C', action: 'Bắt đầu điều tra', status: 'investigating' },
        { date: '2024-06-19 14:15', officer: 'Cảnh sát Trần Văn D', action: 'Thu thập bằng chứng', status: 'investigating' }
      ],
      assignedOfficer: 'Cảnh sát Nguyễn Văn C',
      estimatedResolution: '2024-06-25',
      relatedIncidents: ['INC-2024-001', 'INC-2024-003'],
      attachments: [
        { name: 'Báo cáo sơ bộ.pdf', size: '2.3 MB', type: 'pdf' },
        { name: 'Biên bản ghi nhận.docx', size: '1.1 MB', type: 'docx' }
      ]
    };
  }

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
        category: res.type || 'Khác',
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
                    <span className="text-sm font-medium">Khu vực quản lý:</span>
                    <span className="text-sm">{officerDistrict}</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Tất cả báo cáo hiển thị đều thuộc phạm vi quản lý của bạn
                  </p>
                </div>
                <FilterBar
                  searchPlaceholder="Tìm kiếm báo cáo sự cố"
                  onSearch={setSearchTerm}
                  onFilterChange={(filters) => setFilters(filters as any)}
                  filterOptions={filterOptions}
                  showExport={true}
                  onExport={() => console.log('Export clicked')}
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian xảy ra</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa điểm</th>
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
                              {incident.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {incident.reportedDate}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {incident.reportedDate}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {incident.location}
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
                      <p className="text-gray-500">Không tìm thấy báo cáo sự cố nào trong khu vực {officerDistrict}</p>
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

export default IncidentReport;
