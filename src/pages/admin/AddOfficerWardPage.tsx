import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, MapPin, Plus, Users, Eye, Edit3, Trash2, Search, Filter, ChevronDown } from 'lucide-react';
import SideBar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import FilterBar from '../../components/common/FilterBar';

// Interfaces
interface Officer {
  id: number;
  name: string;
  code: string;
  phone: string;
  email: string;
  status: string;
  currentWard?: string;
}

interface Ward {
  id: number;
  name: string;
  code: string;
  districtName: string;
  districtCode: string;
  officers: Officer[];
}

interface OfficerFormData {
  officerId: string;
  wardId: string;
}

const AddOfficerWardPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [showAddOfficerModal, setShowAddOfficerModal] = useState(false);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);

  // Sample data - replace with actual API calls
  const [wards, setWards] = useState<Ward[]>([
    {
      id: 1,
      name: "Phường Bến Nghé",
      code: "P01",
      districtName: "Quận 1",
      districtCode: "Q01",
      officers: [
        {
          id: 1,
          name: "Nguyễn Văn A",
          code: "CA001",
          phone: "0962710373",
          email: "nguyenvana@email.com",
          status: "active",
          currentWard: "Phường Bến Nghé"
        }
      ]
    },
    {
      id: 2,
      name: "Phường Bến Thành",
      code: "P02",
      districtName: "Quận 1",
      districtCode: "Q01",
      officers: []
    }
  ]);

  const [officers, setOfficers] = useState<Officer[]>([
    {
      id: 1,
      name: "Nguyễn Văn A",
      code: "CA001",
      phone: "0962710373",
      email: "nguyenvana@email.com",
      status: "active",
      currentWard: "Phường Bến Nghé"
    },
    {
      id: 2,
      name: "Trần Văn B",
      code: "CA002",
      phone: "0987654321",
      email: "tranvanb@email.com",
      status: "active"
    }
  ]);

  const [officerFormData, setOfficerFormData] = useState<OfficerFormData>({
    officerId: '',
    wardId: ''
  });

  // Get unique districts from wards
  const districts = useMemo(() => {
    const uniqueDistricts = new Set(wards.map(ward => ward.districtName));
    return Array.from(uniqueDistricts).map(district => ({
      label: district,
      value: district
    }));
  }, [wards]);

  // Update the filter wards function to include district filtering
  const filteredWards = useMemo(() => {
    return wards.filter(ward => {
      const matchesSearch = ward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ward.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ward.districtName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDistrict = districtFilter === 'all' || ward.districtName === districtFilter;
      
      return matchesSearch && matchesDistrict;
    });
  }, [wards, searchTerm, districtFilter]);

  // Handle filter changes
  const handleFilterChange = (filters: Record<string, string>) => {
    setDistrictFilter(filters.district || 'all');
  };

  const handleAddOfficer = () => {
    if (!officerFormData.officerId || !officerFormData.wardId) {
      alert('Vui lòng chọn đầy đủ thông tin');
      return;
    }

    const selectedOfficer = officers.find(o => o.id === parseInt(officerFormData.officerId));
    if (!selectedOfficer) return;

    setWards(prevWards => 
      prevWards.map(ward => 
        ward.id === parseInt(officerFormData.wardId)
          ? { ...ward, officers: [...ward.officers, selectedOfficer] }
          : ward
      )
    );

    setOfficerFormData({ officerId: '', wardId: '' });
    setShowAddOfficerModal(false);
    alert('Thêm công an vào phường thành công!');
  };

  const handleRemoveOfficer = (wardId: number, officerId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa công an này khỏi phường?')) {
      setWards(prevWards =>
        prevWards.map(ward =>
          ward.id === wardId
            ? { ...ward, officers: ward.officers.filter(o => o.id !== officerId) }
            : ward
        )
      );
    }
  };

  const WardCard: React.FC<{ ward: Ward }> = ({ ward }) => (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-lg">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{ward.name}</h3>
            <p className="text-sm text-gray-500">Mã phường: {ward.code}</p>
            <p className="text-sm text-gray-500">Thuộc quận: {ward.districtName}</p>
          </div>
          <button
            onClick={() => {
              setSelectedWard(ward);
              setShowAddOfficerModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Thêm công an
          </button>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Danh sách công an ({ward.officers.length})</h4>
          {ward.officers.length > 0 ? (
            <div className="space-y-2">
              {ward.officers.map(officer => (
                <div key={officer.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{officer.name}</p>
                    <p className="text-sm text-gray-500">Mã công an: {officer.code}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveOfficer(ward.id, officer.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Xóa công an khỏi phường"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Chưa có công an nào được phân công</p>
          )}
        </div>
      </div>
    </div>
  );

  // Add this new component for the searchable dropdown
  const SearchableDropdown: React.FC<{
    options: Officer[];
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
  }> = ({ options, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter options based on search term
    const filteredOptions = options.filter(officer =>
      officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOfficer = options.find(o => o.id.toString() === value);

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span className="block truncate">
            {selectedOfficer ? `${selectedOfficer.name} - ${selectedOfficer.code}` : placeholder}
          </span>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm công an..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="overflow-y-auto max-h-48">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((officer) => (
                  <button
                    key={officer.id}
                    onClick={() => {
                      onChange(officer.id.toString());
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                      value === officer.id.toString() ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="font-medium">{officer.name}</div>
                    <div className="text-sm text-gray-500">{officer.code}</div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500">Không tìm thấy công an</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <SideBar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 p-4 sm:p-6">
          <div className="max-w-8xl mx-auto">
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Phân công công an vào phường
                  </h1>
                  <p className="text-gray-600">
                    Quản lý việc phân công công an vào các phường
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
              <FilterBar
                searchPlaceholder="Tìm kiếm theo tên phường, mã phường..."
                onSearch={setSearchTerm}
                onFilterChange={handleFilterChange}
                filterOptions={{
                  district: [
                    { label: 'Tất cả quận', value: 'all' },
                    ...districts
                  ]
                }}
                showExport={false}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
              {filteredWards.map(ward => (
                <WardCard key={ward.id} ward={ward} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Officer Modal */}
      {showAddOfficerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Thêm công an vào phường {selectedWard?.name}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chọn công an</label>
                <SearchableDropdown
                  options={officers.filter(o => !o.currentWard || o.currentWard === selectedWard?.name)}
                  value={officerFormData.officerId}
                  onChange={(value) => setOfficerFormData(prev => ({ ...prev, officerId: value }))}
                  placeholder="Chọn công an"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={handleAddOfficer}
                >
                  Thêm
                </button>
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  onClick={() => setShowAddOfficerModal(false)}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddOfficerWardPage;
