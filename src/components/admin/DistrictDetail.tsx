import React, { useState, useEffect } from 'react';

// This is a mock interface based on the image.
// You should adjust this to match your actual data structure.
interface Ward {
  id: number;
  name: string;
  // Add more fields if needed
}

interface District {
  id: number;
  name: string;
  status: string;
  level: number;
  totalIncidents: number;
  createAt: string | Date;
  lastUpdate: string | Date;
  notes: string;
  coordinates: string;
  wards?: Ward[];
  totalAssignedOfficers?: number;
}

interface DistrictDetailProps {
  district: District | null;
  onClose: () => void;
  onSave: (district: District) => void;
}

const DistrictDetail: React.FC<DistrictDetailProps> = ({ district, onClose, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDistrict, setEditedDistrict] = useState(district);

  useEffect(() => {
    setEditedDistrict(district);
  }, [district]);

  if (!district || !editedDistrict) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedDistrict(prev => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSave = () => {
    if (editedDistrict) {
      onSave(editedDistrict);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedDistrict(district);
  };

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

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-500 text-white">
          <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
            </svg>
          </div>
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={editedDistrict.name}
                onChange={handleInputChange}
                className="bg-transparent text-2xl font-bold border-b border-white/50 focus:outline-none w-full"
              />
            ) : (
              <h2 className="text-2xl font-bold">{district.name}</h2>
            )}
            <p className="text-xs opacity-80 mt-1">ID: {district.id}</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Trạng thái</p>
              <div className="font-semibold text-blue-700 bg-blue-100 rounded px-2 py-1 inline-block">{district.status}</div>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Mức độ</p>
              <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">{district.level}/10</span>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Tổng sự cố</p>
              <div className="font-bold text-2xl text-red-600">{district.totalIncidents}</div>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Cán bộ được phân công</p>
              <div className="font-bold text-lg text-green-700">{district.totalAssignedOfficers ?? 0}</div>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Ngày tạo</p>
              <div className="font-semibold">{formatDisplayDate(district.createAt)}</div>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Cập nhật cuối</p>
              <div className="font-semibold">{formatDisplayDate(district.lastUpdate)}</div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <p className="text-gray-500 text-sm mb-1">Ghi chú</p>
            {isEditing ? (
              <textarea
                name="notes"
                value={editedDistrict.notes}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            ) : (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mt-1 rounded-lg">
                <p className="text-gray-800">{district.notes}</p>
              </div>
            )}
          </div>

          {/* Coordinates */}
          <div className="mt-6">
            <p className="text-gray-500 text-sm mb-1">Tọa độ khu vực</p>
            {isEditing ? (
              <textarea
                name="coordinates"
                value={editedDistrict.coordinates}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-2 mt-1 font-mono text-xs focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            ) : (
              <div className="bg-gray-100 p-3 mt-1 rounded-lg text-gray-700 font-mono text-xs overflow-x-auto border border-gray-200">
                {district.coordinates}
              </div>
            )}
          </div>

          {/* Wards List */}
          <div className="mt-6">
            <p className="text-gray-500 text-sm mb-2">Danh sách phường</p>
            <div className="flex flex-wrap gap-2">
              {district.wards && district.wards.length > 0 ? (
                district.wards.map((ward) => (
                  <span
                    key={ward.id}
                    className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full border border-indigo-200"
                  >
                    {ward.name}
                  </span>
                ))
              ) : (
                <span className="text-gray-400">Chưa có phường nào</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-8 py-4 bg-white border-t border-gray-200 flex justify-end gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700"
              >
                Lưu
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Đóng
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700"
              >
                Chỉnh sửa
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DistrictDetail;
