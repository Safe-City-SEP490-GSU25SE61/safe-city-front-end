import React, { useState } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, Eye, Package, Calendar, DollarSign, Users } from 'lucide-react';
import SideBar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import FilterBar from '../../components/common/FilterBar';

const PackageManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  // Sample service packages data
  const [packages] = useState([
    {
      id: 'PKG001',
      name: 'Gói An Ninh Cơ Bản',
      description: 'Gói dịch vụ an ninh cơ bản cho khu dân cư',
      category: 'security',
      price: 500000,
      duration: '1 tháng',
      features: ['Giám sát 24/7', 'Báo cáo hàng tuần', 'Hỗ trợ khẩn cấp'],
      status: 'active',
      subscribers: 45,
      createdDate: '2025-01-15'
    },
    {
      id: 'PKG003',
      name: 'Gói Báo Cáo Sự Cố',
      description: 'Dịch vụ báo cáo và xử lý sự cố trong khu vực',
      category: 'reporting',
      price: 300000,
      duration: '1 tháng',
      features: ['Báo cáo nhanh', 'Theo dõi tiến độ', 'Thông báo SMS'],
      status: 'active',
      subscribers: 67,
      createdDate: '2025-01-20'
    },
    {
      id: 'PKG004',
      name: 'Gói Quản Lý Cộng Đồng',
      description: 'Công cụ quản lý và kết nối cộng đồng',
      category: 'community',
      price: 800000,
      duration: '1 tháng',
      features: ['Diễn đàn cộng đồng', 'Lịch sự kiện', 'Thông báo chung'],
      status: 'inactive',
      subscribers: 12,
      createdDate: '2025-01-05'
    }
  ]);

  const categories = [
    { value: 'all', label: 'Tất cả' },
    { value: 'security', label: 'An ninh' },
    { value: 'reporting', label: 'Báo cáo' },
    { value: 'community', label: 'Cộng đồng' }
  ];

  // Filter packages based on search and category
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || pkg.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      security: 'bg-red-100 text-red-800',
      reporting: 'bg-blue-100 text-blue-800',
      community: 'bg-green-100 text-green-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (filters: Record<string, string>) => {
    setSelectedCategory(filters.category || 'all');
  };

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
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Xem danh sách các gói dịch vụ
              </h1>
              <p className="text-gray-600">
                Danh sách các gói dịch vụ có trong hệ thống
              </p>
            </div>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              Thêm gói mới
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <FilterBar
              searchPlaceholder="Tìm kiếm gói dịch vụ..."
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              filterOptions={{
                category: categories
              }}
            />
          </div>
        </div>

        {/* Statistics Cards */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Tổng gói dịch vụ</p>
                <p className="text-2xl font-bold text-gray-900">{packages.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Gói đang hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">
                  {packages.filter(p => p.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Tổng người đăng ký</p>
                <p className="text-2xl font-bold text-gray-900">
                  {packages.reduce((sum, p) => sum + p.subscribers, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Doanh thu ước tính</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(packages.reduce((sum, p) => sum + (p.price * p.subscribers), 0))}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div> */}

        {/* Packages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <div key={pkg.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
              {/* Package Header */}
              <div className="bg-blue-600 p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                    <p className="text-blue-100 text-sm">{pkg.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(pkg.category)}`}>
                    {categories.find(c => c.value === pkg.category)?.label}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold">{formatPrice(pkg.price)}</span>
                    <span className="text-blue-100 text-sm">/{pkg.duration}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-xs">Người đăng ký</p>
                    <p className="text-xl font-bold">{pkg.subscribers}</p>
                  </div>
                </div>
              </div>

              {/* Package Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Tính năng:</h4>
                  <ul className="space-y-1">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">
                    Tạo: {new Date(pkg.createdDate).toLocaleDateString('vi-VN')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(pkg.status)}`}>
                    {pkg.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                    <Eye className="w-4 h-4" />
                    Xem
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors">
                    <Edit2 className="w-4 h-4" />
                    Sửa
                  </button>
                  <button className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPackages.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy gói dịch vụ</h3>
            <p className="text-gray-600">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
          </div>
        )}
      </div>
    </div>
    </div>
  </div>
);
};

export default PackageManagement;