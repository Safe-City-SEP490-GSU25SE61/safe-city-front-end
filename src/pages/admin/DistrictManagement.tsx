import React, { useState, useMemo, useEffect } from 'react';
import { User, MapPin, Plus, Users, Eye, Edit3, Trash2, Search, Filter } from 'lucide-react';
import SideBar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import FilterBar from '../../components/common/FilterBar';
import DistrictDetail from '../../components/admin/DistrictDetail';
import WardDetail from '../../components/admin/WardDetail';
import NotificationBar from '../../components/common/NotificationBar';
import { PaginationComponent } from '../../components/common/Pagination';
import { getAllDistricts, getDistrictById, updateDistrictById, createDistrict } from '../../services/api/district';
import { getAllWards, getWardById, updateWardById, createWard } from '../../services/api/ward';

// Add these interfaces
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

interface District {
  id: number;
  name: string;
  code: string;
  population: number;
  area: string;
  status: string;
  wards: Ward[];
  createAt: string | Date;
  notes: string;
  coordinates: string;
  totalReportedIncidents?: number;
  dangerLevel?: number;
  apiLastUpdated?: string | Date;
}

interface EnrichedDistrict extends District {
  totalIncidents: number;
  avgDangerLevel: number;
  dangerLevelLabel: string;
  lastUpdated: string | Date;
}

interface WardFormData {
  name: string;
  notes: string;
  coordinates: string;
  districtId: string;
  status: string;
}

// Add district form data interface
interface DistrictFormData {
  name: string;
  code: string;
  population: string;
  area: string;
  notes: string;
  coordinates: string;
  status: string;
}

interface FormErrors {
  name?: string;
  code?: string;
  population?: string;
  area?: string;
  districtId?: string;
}

const DistrictManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState<EnrichedDistrict | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [viewMode, setViewMode] = useState('districts'); // 'districts' or 'wards'
  const [showAddWardModal, setShowAddWardModal] = useState(false);
  const [showAddAreaModal, setShowAddAreaModal] = useState(false);
  const [addAreaType, setAddAreaType] = useState<'district' | 'ward' | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [currentWardPage, setCurrentWardPage] = useState(1);
  const itemsPerPage = 10;
  
  // Add notification state
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

  // Add district form data state
  const [districtFormData, setDistrictFormData] = useState<DistrictFormData>({
    name: '',
    code: '',
    population: '',
    area: '',
    notes: '',
    coordinates: '',
    status: 'active'
  });
  
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const formatDisplayDate = (date: string | Date | undefined) => {
    if (!date) return 'N/A';
    // Check if it's already a Date object or a string that can be parsed
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return date.toString(); // Fallback to original string if invalid
    }
    return dateObj.toLocaleString();
  };

  const handleWardEdit = (id: number) => {
    alert(`Chức năng chỉnh sửa cho ID ${id} chưa được triển khai.`);
    setSelectedWard(null); // Close the modal after acknowledgment
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
        setError('Lỗi khi tải chi tiết phường.');
    } finally {
        setIsDetailLoading(false);
    }
  };

  const handleViewDetails = async (districtId: number) => {
    // Show the modal immediately with basic info from the list
    setSelectedDistrict(districts.find(d => d.id === districtId) as unknown as EnrichedDistrict || null);
    setIsDetailLoading(true);
  
    try {
      const detailedData = await getDistrictById(districtId.toString());
      if (detailedData) {
        // Create a new enriched district object with the full details from the API
        const enrichedDetailedDistrict: EnrichedDistrict = {
          id: detailedData.id,
          name: detailedData.name,
          code: detailedData.code || `Q${detailedData.id}`,
          population: detailedData.population || 0,
          area: detailedData.area || 'N/A',
          status: detailedData.isActive ? 'hoạt động' : 'tạm dừng',
          wards: detailedData.wards || [], // Important: wards are now fetched
          createAt: detailedData.createAt,
          notes: detailedData.note,
          coordinates: detailedData.polygonData,
          totalIncidents: detailedData.totalReportedIncidents ?? 0,
          avgDangerLevel: detailedData.dangerLevel ?? 0,
          dangerLevelLabel: getDangerLevelLabel(detailedData.dangerLevel ?? 0),
          lastUpdated: detailedData.lastUpdated,
        };
        setSelectedDistrict(enrichedDetailedDistrict);
      }
    } catch (err) {
      console.error("Failed to fetch district details:", err);
      setError('Lỗi khi tải chi tiết quận.');
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Filter districts based on search and status
  const filteredDistricts = useMemo(() => {
    return districts.map(district => {
      const totalIncidents = district.totalReportedIncidents ?? 0;
      const avgDangerLevel = district.dangerLevel ?? 0;
      
      let dangerLevelLabel = 'Thấp';
      if (avgDangerLevel >= 7) {
        dangerLevelLabel = 'Cao';
      } else if (avgDangerLevel >= 4) {
        dangerLevelLabel = 'Trung bình';
      }
      
      const lastUpdated = (district as any).lastUpdated || district.apiLastUpdated;

      return {
        ...district,
        totalIncidents,
        avgDangerLevel: Math.round(avgDangerLevel),
        dangerLevelLabel,
        lastUpdated
      };
    }).filter(district => {
      const matchesSearch = (district.name && district.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (district.code && district.code.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || district.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [districts, searchTerm, statusFilter]);

  // Get all wards for ward view
  const allWards = useMemo(() => {
    if (viewMode === 'wards' && wards.length > 0) {
      return wards;
    }
    return districts.flatMap(district =>
      (district.wards || []).map(ward => ({
        ...ward,
        districtName: district.name,
        districtCode: district.code,
      })),
    );
  }, [districts, wards, viewMode]);

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
          setAddAreaType(null);
          setShowAddAreaModal(false);
          
          setNotification({ message: "Thêm phường thành công!", type: "success", show: true });
        }
      } catch (error) {
        console.error("Failed to create ward:", error);
        setNotification({ message: "Lỗi khi thêm phường. Vui lòng thử lại.", type: "error", show: true });
      }
    }
  };
  
  const filteredWards = useMemo(() => {
    return allWards.filter(ward => 
      ward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ward.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ward.districtName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allWards, searchTerm]);
  
  const filterOptions = {
    status: [
      { label: 'Tất cả trạng thái', value: 'all' },
      { label: 'Đang hoạt động', value: 'active' },
      { label: 'Không hoạt động', value: 'inactive' }
    ]
  };

  // Update the filtering logic to work with the new FilterBar
  const handleFilterChange = (filters: Record<string, string>) => {
    setStatusFilter(filters.status || 'all');
  };

  const DistrictRow: React.FC<{ district: EnrichedDistrict }> = ({ district }) => {
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
              <div className="text-sm font-medium text-gray-900">{district.name}</div>
              <div className="text-sm text-gray-500">ID: {district.id}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
          {district.wards?.length ?? 0}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
          {district.totalIncidents}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${dangerLevelColor(district.avgDangerLevel)}`}>
            {district.avgDangerLevel}/10 - {district.dangerLevelLabel}
          </span>
        </td>
        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${statusColor(district.status)}`}>
          {district.status}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDisplayDate(district.lastUpdated)}</td>
        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
          <button 
            onClick={() => handleViewDetails(district.id)}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mx-auto">
            <Eye className="h-4 w-4" />
            Chi tiết
          </button>
        </td>
      </tr>
    );
  };

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
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {ward.districtName || 'Chưa xác định'}
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

  const handleSaveDistrict = async (updatedDistrict: any) => {
    if (!selectedDistrict) return;

    try {
      // The API expects `note` and `polygonData`
      const dataToUpdate = {
        name: updatedDistrict.name,
        note: updatedDistrict.notes,
        polygonData: updatedDistrict.coordinates
      };
      
      await updateDistrictById(selectedDistrict.id.toString(), dataToUpdate);
      
      // Manually create a fully enriched district object after update.
      const newEnrichedDistrict = {
        ...updatedDistrict,
        // Recalculate any derived fields if necessary, or just use what we have
        totalIncidents: selectedDistrict.totalIncidents, 
        avgDangerLevel: selectedDistrict.avgDangerLevel,
        dangerLevelLabel: getDangerLevelLabel(selectedDistrict.avgDangerLevel),
        lastUpdated: new Date(), // Set to now
        wards: selectedDistrict.wards || [], // Preserve the wards array
      };
      
      // Update local state to reflect changes instantly
      setDistricts(districts.map(d => (d.id === newEnrichedDistrict.id ? newEnrichedDistrict : d)));
      setSelectedDistrict(newEnrichedDistrict);

      // Show success notification
      setNotification({
        message: "Cập nhật quận thành công!",
        type: "success",
        show: true,
      });

    } catch (error) {
      console.error("Failed to update district:", error);
      setError('Lỗi khi cập nhật quận.');
      
      // Show error notification
      setNotification({
        message: "Lỗi khi cập nhật quận. Vui lòng thử lại.",
        type: "error",
        show: true,
      });
      
      // Optionally, revert the optimistic update on failure
      setSelectedDistrict(selectedDistrict);
    }
  };

  // Add district function with notification
  const handleAddDistrict = async () => {
    const errors: FormErrors = {};
    if (!districtFormData.name.trim()) errors.name = 'Tên quận là bắt buộc';
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      try {
        // Prepare data for API based on user feedback
        const districtData = {
          name: districtFormData.name.trim(),
          note: districtFormData.notes.trim(),
          polygonData: districtFormData.coordinates.trim(),
        };
        
        // Call API to create district
        const response = await createDistrict(districtData);
        
        if (response && response.data) {
          const newDistrictData = response.data;
          // Format the new district from the API response to match the local state structure
          const formattedNewDistrict: District = {
            id: newDistrictData.id,
            name: newDistrictData.name,
            code: newDistrictData.code || `Q${newDistrictData.id}`,
            population: newDistrictData.population || 0,
            area: newDistrictData.area || 'N/A',
            status: newDistrictData.isActive ? 'hoạt động' : 'tạm dừng',
            wards: newDistrictData.wards || [],
            createAt: newDistrictData.createAt || new Date().toISOString(),
            notes: newDistrictData.note,
            coordinates: newDistrictData.polygonData,
            totalReportedIncidents: newDistrictData.totalReportedIncidents,
            dangerLevel: newDistrictData.dangerLevel,
            apiLastUpdated: newDistrictData.lastUpdated,
          };
          
          // Add to local state
          setDistricts(prevDistricts => [...prevDistricts, formattedNewDistrict]);
          
          // Reset form and close modal
          setDistrictFormData({
            name: '',
            code: '',
            population: '',
            area: '',
            notes: '',
            coordinates: '',
            status: 'active'
          });
          setFormErrors({});
          setAddAreaType(null);
          setShowAddAreaModal(false);
          
          // Show success notification
          setNotification({
            message: "Thêm quận thành công!",
            type: "success",
            show: true,
          });
        }
      } catch (error) {
        console.error("Failed to create district:", error);
        setNotification({
          message: "Lỗi khi thêm quận. Vui lòng thử lại.",
          type: "error",
          show: true,
        });
      }
    }
  };

  const handleSaveWard = async (updatedWardData: any) => {
    if (!selectedWard) return;

    try {
      await updateWardById(selectedWard.id.toString(), updatedWardData);

      // Optimistically update the local state
      const updatedWards = wards.map(w =>
        w.id === selectedWard.id ? { ...w, ...updatedWardData, district: districts.find(d => d.id === parseInt(updatedWardData.districtId))?.name } : w
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
    const fetchAndSetDistricts = async () => {
      try {
        setLoading(true);
        const apiData = await getAllDistricts();
        if (apiData && Array.isArray(apiData)) {
          const formattedDistricts: District[] = apiData.map((d: any) => ({
            id: d.id,
            name: d.name,
            code: d.code || `Q${d.id}`,
            population: d.population || 0,
            area: d.area || 'N/A',
            status: d.isActive ? 'hoạt động' : 'tạm dừng',
            wards: d.wards || [],
            createAt: d.createAT,
            notes: d.note,
            coordinates: d.polygonData,
            totalReportedIncidents: d.totalReportedIncidents,
            dangerLevel: d.dangerLevel,
            apiLastUpdated: d.lastUpdated,
          }));
          setDistricts(formattedDistricts);
        } else {
          console.error("Fetched data is not in the expected format:", apiData);
          setError('Dữ liệu quận nhận được không đúng định dạng.');
        }
      } catch (error) {
        console.error('Error fetching districts:', error);
        setError('Đã xảy ra lỗi khi tải danh sách quận.');
      } finally {
        setLoading(false);
      }
    };
    fetchAndSetDistricts();
  }, []);

  useEffect(() => {
    const fetchAndSetWards = async () => {
      if (viewMode === 'wards') {
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
            setError('Dữ liệu phường nhận được không đúng định dạng.');
          }
        } catch (err) {
          console.error('Error fetching wards:', err);
          setError('Đã xảy ra lỗi khi tải danh sách phường.');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchAndSetWards();
  }, [viewMode]);

  // Paginated data
  const paginatedDistricts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDistricts.slice(startIndex, endIndex);
  }, [filteredDistricts, currentPage]);

  const paginatedWards = useMemo(() => {
    const startIndex = (currentWardPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredWards.slice(startIndex, endIndex);
  }, [filteredWards, currentWardPage]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

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
          {/* Header */}
          <div className="max-w-8xl mx-auto">
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Quản lý khu vực
                  </h1>
                  <p className="text-gray-600">
                    Danh sách các quận và phường trong hệ thống
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2 bg-white rounded-lg p-1 border border-gray-200">
                    <button
                      onClick={() => setViewMode('districts')}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        viewMode === 'districts' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Quận/Huyện
                    </button>
                    <button
                      onClick={() => setViewMode('wards')}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        viewMode === 'wards' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Phường/Xã
                    </button>
                  </div>
                  <button
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    onClick={() => setShowAddAreaModal(true)}
                  >
                    <Plus className="w-5 h-5" />
                    Thêm khu vực mới
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Bar section - now cleaner without the toggle buttons */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
              <FilterBar
                searchPlaceholder="Tìm kiếm quận hoặc phường..."
                onSearch={setSearchTerm}
                onFilterChange={handleFilterChange}
                filterOptions={filterOptions}
                showExport={false}
              />
            </div>

            {/* Content */}
            {loading ? (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Đang tải khu vực...</h3>
                <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
              </div>
            ) : (
              viewMode === 'districts' ? (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Khu vực
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Số phường
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
                        {paginatedDistricts.map(district => (
                          <DistrictRow key={district.id} district={district as unknown as EnrichedDistrict} /> 
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination for Districts */}
                  {filteredDistricts.length > 0 && (
                    <div className="flex justify-center">
                      <PaginationComponent
                        totalItems={filteredDistricts.length}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quận
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
              )
            )}
          </div>
        </div>
      </div>

      {/* Add Area Modal */}
      {showAddAreaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg">
            {!addAreaType ? (
              <>
                <h2 className="text-lg font-bold mb-4">Bạn muốn thêm gì?</h2>
                <div className="flex flex-col gap-4">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                    onClick={() => setAddAreaType('district')}
                  >
                    Thêm Quận
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                    onClick={() => setAddAreaType('ward')}
                  >
                    Thêm Phường
                  </button>
                  <button
                    className="mt-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowAddAreaModal(false)}
                  >
                    Hủy
                  </button>
                </div>
              </>
            ) : addAreaType === 'district' ? (
              <>
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                    <h2 className="text-xl font-bold">Thêm Quận Mới</h2>
                    <button onClick={() => setAddAreaType(null)} className="text-white hover:text-gray-200 p-2 rounded-full">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); handleAddDistrict(); }}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên quận *</label>
                    <input 
                      className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nhập tên quận"
                      value={districtFormData.name}
                      onChange={(e) => setDistrictFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                    {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                    <textarea 
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      placeholder="Thêm ghi chú cho quận"
                      rows={3}
                      value={districtFormData.notes}
                      onChange={(e) => setDistrictFormData(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dữ liệu Polygon (GeoJSON)</label>
                    <textarea 
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none font-mono text-xs"
                      placeholder="[[[106.70, 10.77], ...]]"
                      rows={4}
                      value={districtFormData.coordinates}
                      onChange={(e) => setDistrictFormData(prev => ({ ...prev, coordinates: e.target.value }))}
                    />
                  </div>
                </form>

                <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex gap-2 justify-end">
                  <button 
                    className="px-6 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setAddAreaType(null)}
                  >
                    Hủy
                  </button>
                  <button 
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                    onClick={handleAddDistrict}
                  >
                    Lưu
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                  <h2 className="text-xl font-bold">Thêm Phường Mới</h2>
                  <button onClick={() => setAddAreaType(null)} className="text-white hover:text-gray-200 p-2 rounded-full">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                  </button>
                </div>
                <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); handleAddWard(); }}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quận *</label>
                    <select 
                      className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-400 focus:outline-none ${formErrors.districtId ? 'border-red-500' : 'border-gray-300'}`}
                      value={wardFormData.districtId}
                      onChange={e => setWardFormData({...wardFormData, districtId: e.target.value})}
                    >
                      <option value="">Chọn quận</option>
                      {districts.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                    {formErrors.districtId && <p className="text-red-500 text-sm mt-1">{formErrors.districtId}</p>}
                  </div>
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
                    onClick={() => setAddAreaType(null)}
                  >
                    Hủy
                  </button>
                  <button onClick={handleAddWard} className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">Lưu</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* District Detail Modal */}
      {selectedDistrict && (
        <DistrictDetail
          district={{
            id: selectedDistrict.id,
            name: selectedDistrict.name,
            status: selectedDistrict.status,
            level: selectedDistrict.avgDangerLevel,
            totalIncidents: selectedDistrict.totalIncidents,
            createAt: selectedDistrict.createAt,
            lastUpdate: selectedDistrict.lastUpdated,
            notes: selectedDistrict.notes,
            coordinates: selectedDistrict.coordinates,
          }}
          onClose={() => setSelectedDistrict(null)}
          onSave={handleSaveDistrict}
        />
      )}

      {/* Ward Detail Modal */}
      {selectedWard && (
        <WardDetail
          ward={{
            id: selectedWard.id,
            name: selectedWard.name,
            status: selectedWard.status,
            level: selectedWard.dangerLevel,
            totalIncidents: selectedWard.incidents,
            creationDate: formatDisplayDate(selectedWard.createAt), // Using lastUpdated as creation date for now
            lastUpdate: formatDisplayDate(selectedWard.lastUpdated),
            notes: selectedWard.notes || `Phường ${selectedWard.name} thuộc ${selectedWard.districtName || 'Quận chưa xác định'}`,
            coordinates: selectedWard.coordinates || "Chưa có dữ liệu tọa độ", // Mock coordinates
            district: selectedWard.districtName || 'Chưa xác định',
            districtId: selectedWard.districtId
          }}
          onClose={() => setSelectedWard(null)}
          onSave={handleSaveWard}
          districts={districts}
        />
      )}
    </div>
  );
};

export default DistrictManagement;