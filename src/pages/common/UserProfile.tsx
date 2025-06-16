import React, { useState } from 'react';
import { Camera, Edit2, Save, X, User, MapPin, Mail, Phone, Calendar, CreditCard } from 'lucide-react';
import SideBar from '../../components/common/SideBar';
import Header from '../../components/common/Header';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: 'Nguyễn Văn An',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    streetAddress: '123 Đường Nguyễn Huệ',
    city: 'Thành phố Hồ Chí Minh',
    email: 'nguyenvanan@email.com',
    phone: '0962710373',
    dateOfBirth: '1990-05-15',
    citizenId: '079090001234',
    avatar: "https://th.bing.com/th/id/OIP.Ys4EwBzRHsMocY-f7WuiKQHaHa?w=180&h=181&c=7&r=0&o=7&dpr=1.1&pid=1.7&rm=3"
  });

  const [tempData, setTempData] = useState({ ...profileData });

  const handleEdit = () => {
    setIsEditing(true);
    setTempData({ ...profileData });
  };

  const handleSave = () => {
    setProfileData({ ...tempData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempData({ ...profileData });
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setTempData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
     
      reader.readAsDataURL(file);
    }
  };

  const currentData = isEditing ? tempData : profileData;

  const InputField = ({ label, value, field, type = "text", icon: Icon, placeholder, readOnly = false, colspan = false }: { label: string, value: string, field: string, type?: string, icon: React.ElementType, placeholder: string, readOnly?: boolean, colspan?: boolean }) => (
    <div className={`${colspan ? 'col-span-full' : 'col-span-full sm:col-span-1'}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
        {label}
        {readOnly && <span className="text-xs text-gray-400">(Không thể chỉnh sửa)</span>}
      </label>
      {isEditing && !readOnly ? (
        <input
          type={type}
          value={value}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400"
        />
      ) : (
        <div className={`w-full px-4 py-3 rounded-xl transition-all duration-200 ${
          readOnly 
            ? 'bg-gray-100 border border-gray-200 text-gray-600' 
            : 'bg-gray-50 border border-gray-200 text-gray-900'
        }`}>
          {type === 'date' && !readOnly ? new Date(value).toLocaleDateString('vi-VN') : value}
        </div>
      )}
    </div>
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
          <div className="max-w-8xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Thông tin cá nhân</h1>
                <p className="text-gray-600">Quản lý và cập nhật thông tin tài khoản của bạn</p>
              </div>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Edit2 className="w-5 h-5" />
                  <span className="font-medium">Chỉnh sửa</span>
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    <X className="w-5 h-5" />
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                  >
                    <Save className="w-5 h-5" />
                    Lưu thay đổi
                  </button>
                </div>
              )}
            </div>

            {/* Profile Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              {/* Avatar Section */}
              <div className="bg-blue-600 px-6 sm:px-8 py-8 sm:py-12">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative group">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                      {currentData.avatar ? (
                        <img
                          src={currentData.avatar}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/10 backdrop-blur-sm">
                          <User className="w-16 h-16 sm:w-20 sm:h-20 text-white/60" />
                        </div>
                      )}
                    </div>
                    
                    {isEditing && (
                      <label className="absolute bottom-2 right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-all duration-200 shadow-lg group-hover:scale-110">
                        <Camera className="w-6 h-6 text-gray-600" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  
                  <div className="text-center sm:text-left text-white">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                      {currentData.fullName}
                    </h2>
                    <p className="text-blue-100 text-lg">
                      {currentData.email}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 text-blue-100">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">
                        {currentData.ward}, {currentData.district}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Section */}
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Personal Information Section */}
                  <div className="col-span-full mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Thông tin cá nhân
                    </h3>
                    
                  </div>

                  <InputField
                    label="Họ và tên"
                    value={currentData.fullName}
                    field="fullName"
                    icon={User}
                    placeholder="Nhập họ và tên"
                    colspan={true}
                  />

                  <InputField
                    label="Email"
                    value={currentData.email}
                    field="email"
                    type="email"
                    icon={Mail}
                    placeholder="example@email.com"
                  />

                  <InputField
                    label="Số điện thoại"
                    value={currentData.phone}
                    field="phone"
                    type="tel"
                    icon={Phone}
                    placeholder="0123456789"
                  />

                  <InputField
                    label="Ngày sinh"
                    value={currentData.dateOfBirth}
                    field="dateOfBirth"
                    type="date"
                    icon={Calendar}
                    placeholder="DD/MM/YYYY"
                  />

                  <InputField
                    label="Số căn cước công dân"
                    value={currentData.citizenId}
                    field="citizenId"
                    icon={CreditCard}
                    readOnly={true}
                    placeholder="1234567890"
                  />

                  {/* Address Section */}
                  <div className="col-span-full mt-8 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      Địa chỉ thường trú
                    </h3>
                 
                  </div>

                  <InputField
                    label="Số nhà, đường"
                    value={currentData.streetAddress}
                    field="streetAddress"
                    placeholder="123 Đường ABC"
                    colspan={true}
                    icon={MapPin}
                  />

                  <InputField
                    label="Phường/Xã"
                    value={currentData.ward}
                    field="ward"
                    placeholder="Phường 1"
                    icon={MapPin}
                  />

                  <InputField
                    label="Quận/Huyện"
                    value={currentData.district}
                    field="district"
                    placeholder="Quận 1"
                    icon={MapPin}
                  />

                  <InputField
                    label="Thành phố/Tỉnh"
                    value={currentData.city}
                    field="city"
                    placeholder="TP. Hồ Chí Minh"
                    colspan={true}
                    icon={MapPin}
                  />
                </div>

                {/* Save Changes Notice */}
                {isEditing && (
                  <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-blue-800 font-medium">Lưu ý quan trọng</p>
                        <p className="text-blue-700 text-sm mt-1">
                          Vui lòng kiểm tra kỹ thông tin trước khi lưu. Một số thông tin sau khi thay đổi có thể cần xác thực lại.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;