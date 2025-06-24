import React, { useState, useEffect } from 'react';

// This is a mock interface based on the image.
// You should adjust this to match your actual data structure.
interface Ward {
  id: number;
  name: string;
  status: string;
  level: number;
  totalIncidents: number;
  creationDate: string;
  lastUpdate: string;
  notes: string;
  coordinates: string;
  district: string; // The district this ward belongs to
  districtId?: number;
}

interface District {
  id: number;
  name: string;
}

interface WardDetailProps {
  ward: Ward | null;
  districts: District[];
  onClose: () => void;
  onSave: (data: any) => void;
}

const WardDetail: React.FC<WardDetailProps> = ({ ward, districts, onClose, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedWard, setEditedWard] = useState<Ward | null>(null);

  useEffect(() => {
    if (ward) {
      setEditedWard(ward);
    }
  }, [ward]);

  if (!ward || !editedWard) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedWard(prev => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSave = () => {
    if (editedWard) {
      const dataToSave = {
        name: editedWard.name,
        note: editedWard.notes,
        polygonData: editedWard.coordinates,
        districtId: editedWard.districtId,
      };
      onSave(dataToSave);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedWard(ward);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editedWard.name}
                  onChange={handleInputChange}
                  className="bg-transparent text-xl font-bold border border-white/50 rounded-md px-2 focus:outline-none"
                />
              ) : (
                <h2 className="text-xl font-bold">{ward.name}</h2>
              )}
              <p className="text-sm opacity-90">ID: {ward.id}</p>
            </div>
          <button onClick={onClose} className="text-white hover:text-gray-200 p-2 rounded-full">
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
              <p className="font-semibold text-blue-600">{ward.status}</p>
            </div>
            <div>
              <p className="text-gray-500">Mức độ:</p>
              <p className="font-semibold text-red-600">{ward.level}/10</p>
            </div>
            <div>
              <p className="text-gray-500">Tổng sự cố:</p>
              <p className="font-bold text-2xl text-red-600">{ward.totalIncidents}</p>
            </div>
            <div>
              <p className="text-gray-500">Quận/Huyện:</p>
              {isEditing ? (
                <select
                  name="districtId"
                  value={editedWard.districtId || ''}
                  onChange={handleInputChange}
                  className="w-full font-semibold text-green-600 bg-transparent border border-gray-300 rounded-md p-1 focus:outline-none focus:border-green-500"
                >
                  <option value="">Chọn quận</option>
                  {districts.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              ) : (
                <p className="font-semibold text-green-600">{ward.district}</p>
              )}
            </div>
            <div>
              <p className="text-gray-500">Ngày tạo:</p>
              <p className="font-semibold">{ward.creationDate}</p>
            </div>
            <div>
              <p className="text-gray-500">Cập nhật cuối:</p>
              <p className="font-semibold">{ward.lastUpdate}</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-gray-500 text-sm">Ghi chú:</p>
            {isEditing ? (
              <textarea
                name="notes"
                value={editedWard.notes}
                onChange={handleInputChange}
                className="w-full border-gray-300 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            ) : (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mt-1">
                <p className="text-gray-800">{ward.notes}</p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <p className="text-gray-500 text-sm">Tọa độ khu vực:</p>
            {isEditing ? (
              <textarea
                name="coordinates"
                value={editedWard.coordinates}
                onChange={handleInputChange}
                className="w-full border-gray-300 rounded-md p-2 mt-1 font-mono text-xs focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            ) : (
              <div className="bg-gray-100 p-3 mt-1 rounded text-gray-700 font-mono text-xs overflow-x-auto border border-gray-200">
                {ward.coordinates}
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
                className="px-6 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
              >
                Lưu thay đổi
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Đóng
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
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

export default WardDetail;
