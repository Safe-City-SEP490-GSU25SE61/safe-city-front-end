import React, { useState, useEffect } from 'react';

// This is a mock interface based on the image.
// You should adjust this to match your actual data structure.
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center">
            {/* Location Icon */}
            <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editedDistrict.name}
                  onChange={handleInputChange}
                  className="bg-transparent text-xl font-bold border-b border-white/50 focus:outline-none"
                />
              ) : (
                <h2 className="text-xl font-bold">{district.name}</h2>
              )}
              <p className="text-sm opacity-90">ID: {district.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200 p-2 rounded-full">
            {/* Close Icon */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
              <p className="text-gray-500">Trạng thái:</p>
              <p className="font-semibold text-blue-600">{district.status}</p>
            </div>
            <div>
              <p className="text-gray-500">Mức độ:</p>
              <span className="bg-red-100 text-red-800 text-xs font-bold mr-2 px-2.5 py-0.5 rounded-full">
                {district.level}/10
              </span>
            </div>
            <div>
              <p className="text-gray-500">Tổng sự cố:</p>
              <p className="font-bold text-2xl text-red-600">{district.totalIncidents}</p>
            </div>
            <div>
              <p className="text-gray-500">Ngày tạo:</p>
              <p className="font-semibold">{formatDisplayDate(district.createAt)}</p>
            </div>
            <div>
              <p className="text-gray-500">Cập nhật cuối:</p>
              <p className="font-semibold">{formatDisplayDate(district.lastUpdate)}</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-gray-500 text-sm">Ghi chú:</p>
            {isEditing ? (
              <textarea
                name="notes"
                value={editedDistrict.notes}
                onChange={handleInputChange}
                className="w-full border-gray-300 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            ) : (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mt-1">
                <p className="text-gray-800">{district.notes}</p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <p className="text-gray-500 text-sm">Tọa độ khu vực:</p>
            {isEditing ? (
              <textarea
                name="coordinates"
                value={editedDistrict.coordinates}
                onChange={handleInputChange}
                className="w-full border-gray-300 rounded-md p-2 mt-1 font-mono text-xs focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            ) : (
              <div className="bg-gray-100 p-3 mt-1 rounded text-gray-700 font-mono text-xs overflow-x-auto border border-gray-200">
                {district.coordinates}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-4">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Lưu
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Đóng
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
