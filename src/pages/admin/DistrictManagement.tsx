import React, { useState, useMemo } from 'react';
import { User, MapPin, Plus, Users, Eye, Edit3, Trash2, Search, Filter } from 'lucide-react';
import SideBar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import FilterBar from '../../components/common/FilterBar';

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
}

interface District {
  id: number;
  name: string;
  code: string;
  population: number;
  area: string;
  status: string;
  wards: Ward[];
}

interface WardFormData {
  name: string;
  code: string;
  population: string;
  area: string;
  districtId: string;
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
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [viewMode, setViewMode] = useState('districts'); // 'districts' or 'wards'
  const [showAddWardModal, setShowAddWardModal] = useState(false);
  const [showAddAreaModal, setShowAddAreaModal] = useState(false);
  const [addAreaType, setAddAreaType] = useState<'district' | 'ward' | null>(null);
  const [districts, setDistricts] = useState<District[]>([
    {
      id: 1,
      name: "Quận 1",
      code: "Q01",
      population: 250000,
      area: "19.2 km²",
      status: "hoạt động",
      wards: [
        { id: 101, name: "Phường Bến Nghé", code: "P01", population: 15000, area: "1.2 km²", status: "hoạt động" },
        { id: 102, name: "Phường Bến Thành", code: "P02", population: 18000, area: "1.8 km²", status: "hoạt động" },
        { id: 103, name: "Phường Nguyễn Thái Bình", code: "P03", population: 12000, area: "0.9 km²", status: "hoạt động" },
        { id: 104, name: "Phường Phạm Ngũ Lão", code: "P04", population: 22000, area: "2.1 km²", status: "hoạt động" }
      ]
    },
    {
      id: 2,
      name: "Quận 3",
      code: "Q03",
      population: 190000,
      area: "4.9 km²",
      status: "hoạt động",
      wards: [
        { id: 201, name: "Phường 1", code: "P05", population: 14000, area: "0.8 km²", status: "hoạt động" },
        { id: 202, name: "Phường 2", code: "P06", population: 16000, area: "1.1 km²", status: "hoạt động" },
        { id: 203, name: "Phường 9", code: "P07", population: 13500, area: "0.9 km²", status: "hoạt động" }
      ]
    },
    {
      id: 3,
      name: "Thành phố Thủ Đức",
      code: "TD",
      population: 1200000,
      area: "211.5 km²",
      status: "hoạt động",
      wards: [
        { id: 301, name: "Phường Linh Trung", code: "P08", population: 45000, area: "8.2 km²", status: "hoạt động" },
        { id: 302, name: "Phường Linh Xuân", code: "P09", population: 38000, area: "6.5 km²", status: "hoạt động" },
        { id: 303, name: "Phường Bình Chiểu", code: "P10", population: 52000, area: "9.1 km²", status: "hoạt động" }
      ]
    }
  ]);
  
  const [wardFormData, setWardFormData] = useState<WardFormData>({
    name: '',
    code: '',
    population: '',
    area: '',
    districtId: '',
    status: 'active'
  });
  
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleFormChange = (field: keyof WardFormData, value: string) => {
    setWardFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Filter districts based on search and status
  const filteredDistricts = useMemo(() => {
    return districts.filter(district => {
      const matchesSearch = district.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           district.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || district.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [districts, searchTerm, statusFilter]);

  // Get all wards for ward view
  const allWards = useMemo(() => {
    return districts.flatMap(district => 
      district.wards.map(ward => ({
        ...ward,
        districtName: district.name,
        districtCode: district.code
      }))
    );
  }, [districts]);

  // Add ward function
  const handleAddWard = () => {
    const errors: FormErrors = {};
    if (!wardFormData.name.trim()) errors.name = 'Tên phường là bắt buộc';
    if (!wardFormData.code.trim()) errors.code = 'Mã phường là bắt buộc';
    if (!wardFormData.population || parseInt(wardFormData.population)  <= 0) errors.population = 'Dân số không hợp lệ';
    if (!wardFormData.area.trim()) errors.area = 'Diện tích là bắt buộc';
    if (!wardFormData.districtId) errors.districtId = 'Vui lòng chọn quận';
    
    const codeExists = allWards.some(ward => ward.code.toLowerCase() === wardFormData.code.toLowerCase());
    if (codeExists) errors.code = 'Mã phường đã tồn tại';
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      // Generate new ward ID
      const newWardId = Math.max(...allWards.map(w => w.id)) + 1;
      
      // Create new ward
      const newWard = {
        id: newWardId,
        name: wardFormData.name.trim(),
        code: wardFormData.code.trim().toUpperCase(),
        population: parseInt(wardFormData.population),
        area: wardFormData.area.trim(),
        status: wardFormData.status
      };
      
      // Add ward to the selected district
      setDistricts(prevDistricts => 
        prevDistricts.map(district => 
          district.id === parseInt(wardFormData.districtId)
            ? { ...district, wards: [...district.wards, newWard] }
            : district
        )
      );
      
      // Reset form and close modal
      setWardFormData({
        name: '',
        code: '',
        population: '',
        area: '',
        districtId: '',
        status: 'active'
      });
      setFormErrors({});
      setShowAddWardModal(false);
      
      // Show success message
      alert('Thêm phường thành công!');
    }
  };
  
  const filteredWards = useMemo(() => {
    return allWards.filter(ward => 
      ward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ward.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ward.districtName.toLowerCase().includes(searchTerm.toLowerCase())
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

  const DistrictCard: React.FC<{ district: District }> = ({ district }) => (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-lg group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {district.name}
            </h3>
            <p className="text-sm text-gray-500">Mã: {district.code}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            district.status === 'hoạt động' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {district.status}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2 text-blue-500" />
            {district.population.toLocaleString()} người
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-green-500" />
            {district.area}
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Số phường: {district.wards.length}</p>
          <div className="flex flex-wrap gap-1">
            {district.wards.slice(0, 3).map(ward => (
              <span key={ward.id} className="px-2 py-1 bg-gray-100 text-xs rounded-md text-gray-700">
                {ward.name}
              </span>
            ))}
            {district.wards.length > 3 && (
              <span className="px-2 py-1 bg-blue-100 text-xs rounded-md text-blue-700">
                +{district.wards.length - 3} phường khác
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setSelectedDistrict(district)}
            className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Xem chi tiết
          </button>
          <button className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
            <Edit3 className="h-4 w-4" />
          </button>
          <button className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const WardRow: React.FC<{ ward: Ward }> = ({ ward }) => (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{ward.name}</div>
        <div className="text-sm text-gray-500">Mã: {ward.code}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{ward.districtName}</div>
        <div className="text-sm text-gray-500">{ward.districtCode}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {ward.population.toLocaleString()} người
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {ward.area}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          ward.status === 'hoạt động' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {ward.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex gap-2 justify-end">
          <button className="text-blue-600 hover:text-blue-900 p-1 rounded">
            <Eye className="h-4 w-4" />
          </button>
          <button className="text-gray-600 hover:text-gray-900 p-1 rounded">
            <Edit3 className="h-4 w-4" />
          </button>
          <button className="text-red-600 hover:text-red-900 p-1 rounded">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
                      Quận
                    </button>
                    <button
                      onClick={() => setViewMode('wards')}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        viewMode === 'wards' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Phường
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
            {viewMode === 'districts' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDistricts.map(district => (
                  <DistrictCard key={district.id} district={district} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phường
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quận
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dân số
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Diện tích
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredWards.map(ward => (
                        <WardRow key={ward.id} ward={ward} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
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
                <h2 className="text-xl font-bold mb-4 text-blue-700">Thêm Quận Mới</h2>
                <form className="mb-4 space-y-4 bg-blue-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên quận</label>
                    <input className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none" placeholder="Tên quận" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                    <textarea className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none" placeholder="Ghi chú" rows={2} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Polygon Data (GeoJSON...)</label>
                    <textarea className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none" placeholder="Polygon Data (GeoJSON...)" rows={2} />
                  </div>
                </form>
                <div className="flex gap-2 justify-end">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">Lưu</button>
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                    onClick={() => setAddAreaType(null)}
                  >
                    Quay lại
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4 text-green-700">Thêm Phường Mới</h2>
                <form className="mb-4 space-y-4 bg-green-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên phường</label>
                    <input className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400 focus:outline-none" placeholder="Tên phường" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quận</label>
                    <select className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400 focus:outline-none">
                      <option value="">Chọn quận</option>
                      {districts.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                    <textarea className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400 focus:outline-none" placeholder="Ghi chú" rows={2} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Polygon Data (GeoJSON...)</label>
                    <textarea className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400 focus:outline-none" placeholder="Polygon Data (GeoJSON...)" rows={2} />
                  </div>
                </form>
                <div className="flex gap-2 justify-end">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">Lưu</button>
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                    onClick={() => setAddAreaType(null)}
                  >
                    Quay lại
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* District Detail Modal */}
      {selectedDistrict && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedDistrict.name}</h2>
                  <p className="text-gray-600">Mã: {selectedDistrict.code}</p>
                </div>
                <button 
                  onClick={() => setSelectedDistrict(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Dân số</p>
                  <p className="text-xl font-bold text-blue-900">{selectedDistrict.population.toLocaleString()} người</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 mb-1">Diện tích</p>
                  <p className="text-xl font-bold text-green-900">{selectedDistrict.area}</p>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách phường ({selectedDistrict.wards.length})</h3>
              <div className="space-y-3">
                {selectedDistrict.wards.map(ward => (
                  <div key={ward.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{ward.name}</h4>
                        <p className="text-sm text-gray-500">Mã: {ward.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{ward.population.toLocaleString()} người</p>
                        <p className="text-sm text-gray-600">{ward.area}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrictManagement;