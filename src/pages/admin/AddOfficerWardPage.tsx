import { useState, useEffect } from 'react';
import { Plus, Users, Eye, Trash2, UserRoundPlus } from 'lucide-react';
import SideBar from '../../components/common/SideBar';
import Header from '../../components/common/Header';

import SearchableSelect from '../../components/common/SearchableSelect';
import { assignToOfficer, unassignFromOfficer, getOfficerDistrictHistory } from '../../services/api/district';
import { getAllWards } from '../../services/api/ward';
import { getOfficers } from '../../services/api/account';
import NotificationBar from '../../components/common/NotificationBar';
import OfficerAssignHistory from '../../components/admin/OfficerAssignHistory';

// Interfaces
interface Officer {
  id: string;
  name: string;
  code: string;
  phone: string;
  email: string;
  status: string;
  currentDistrict?: string;
  roleId?: number;
}

interface District {
  id: number;
  name: string;
  code: string;
  officers: Officer[];
}

interface DistrictFormData {
  districtId: string;
}



const AddOfficerDistrictPage = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [showAssignDistrictModal, setShowAssignDistrictModal] = useState(false);
  const [districtFormData, setDistrictFormData] = useState<DistrictFormData>({ districtId: '' });
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: "success" | "error" | "info" }>({
    show: false,
    message: '',
    type: 'info',
  });
  const [historyPopup, setHistoryPopup] = useState<{ open: boolean; accountId?: number }>({ open: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [officerHistory, setOfficerHistory] = useState([]);
  const [confirmRemove, setConfirmRemove] = useState<{ open: boolean; officer: Officer | null }>({ open: false, officer: null });

  // Fetch districts and officers from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const districtsData = await getAllWards();
        setDistricts(districtsData);

        const officerData = await getOfficers();
        const officerUsers = officerData.map((user: any) => ({
          id: user.id,
          name: user.fullName,
          phone: user.phone,
          email: user.email,
          status: user.status,
          currentDistrict: user.districtName,
        }));
        setOfficers(officerUsers);
        console.log(officerUsers);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handler to assign officer to district (local state only, update with API if needed)
  const handleAssignDistrict = async () => {
    if (!districtFormData.districtId || !selectedOfficer) {
      setNotification({ show: true, message: 'Vui lòng chọn đầy đủ thông tin', type: 'error' });
      return;
    }

    try {
      // Call the API to assign officer to district
      await assignToOfficer({
        districtId: parseInt(districtFormData.districtId, 10),
        accountId: selectedOfficer.id, // Make sure this is the correct field for officer's account ID
      });

      // Update local state as before
      const selectedDistrict = districts.find(d => d.id === parseInt(districtFormData.districtId));
      if (!selectedDistrict) return;

      setOfficers(prevOfficers =>
        prevOfficers.map(o =>
          o.id === selectedOfficer.id
            ? { ...o, currentDistrict: selectedDistrict.name }
            : o
        )
      );

      setDistricts(prevDistricts =>
        prevDistricts.map(d =>
          d.id === selectedDistrict.id
            ? {
                ...d,
                officers: d.officers?.some(o => o.id === selectedOfficer.id)
                  ? d.officers
                  : [...(d.officers || []), { ...selectedOfficer, currentDistrict: selectedDistrict.name }]
              }
            : d
        )
      );

      setDistrictFormData({ districtId: '' });
      setShowAssignDistrictModal(false);
      setSelectedOfficer(null);
      setNotification({ show: true, message: 'Phân công sĩ quan vào quận thành công!', type: 'success' });
    } catch (error) {
      setNotification({ show: true, message: 'Có lỗi xảy ra khi phân công sĩ quan!', type: 'error' });
      // Optionally log error or handle it further
    }
  };

  // Handler to remove officer from district (local state only, update with API if needed)
  const handleRemoveFromDistrict = async (officer: Officer) => {
    if (!officer.currentDistrict) return;
    try {
      await unassignFromOfficer(officer.id.toString());
      // Remove officer from district's officers list
      setDistricts(prevDistricts =>
        prevDistricts.map(d =>
          d.name === officer.currentDistrict
            ? { ...d, officers: d.officers.filter(o => o.id !== officer.id) }
            : d
        )
      );
      // Remove currentDistrict from officer
      setOfficers(prevOfficers =>
        prevOfficers.map(o =>
          o.id === officer.id
            ? { ...o, currentDistrict: undefined }
            : o
        )
      );
      setNotification({ show: true, message: 'Đã xóa sĩ quan khỏi quận thành công!', type: 'success' });
    } catch (error) {
      setNotification({ show: true, message: 'Có lỗi xảy ra khi xóa sĩ quan khỏi quận!', type: 'error' });
    }
  };

  const handleOpenHistory = (officerId: string) => {
    setLoading(true);
    getOfficerDistrictHistory(officerId)
      .then((data) => {
        setOfficerHistory(data || []);
        setHistoryPopup({ open: true, accountId: parseInt(officerId) });
      })
      .catch(() => {
        setOfficerHistory([]);
        setHistoryPopup({ open: true, accountId: parseInt(officerId) });
      })
      .finally(() => setLoading(false));
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
                    Phân công sĩ quan vào quận
                  </h1>
                  <p className="text-gray-600">
                    Quản lý việc phân công sĩ quan vào các quận
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sĩ quan, mã sĩ quan..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Officer Table */}
            {loading ? (
              <div className="text-center py-12">
                <UserRoundPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Đang tải danh sách sĩ quan...</h3>
                <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
                <p className="text-gray-600">{error}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-xl shadow border">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 border-b text-left">Tên sĩ quan</th>
                      <th className="px-4 py-3 border-b text-left">Số điện thoại</th>
                      <th className="px-4 py-3 border-b text-left">Email</th>
                      <th className="px-4 py-3 border-b text-left">Quận hiện tại</th>
                      <th className="px-4 py-3 border-b text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {officers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-gray-500 italic">
                          Không có sĩ quan nào phù hợp
                        </td>
                      </tr>
                    )}
                    {officers.map(officer => (
                      <tr key={officer.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 border-b">{officer.name}</td>
                        <td className="px-4 py-3 border-b">{officer.phone}</td>
                        <td className="px-4 py-3 border-b">{officer.email}</td>
                        <td className="px-4 py-3 border-b">
                          {officer.currentDistrict === 'N/A' || !officer.currentDistrict
                            ? 'Chưa được phân công'
                            : officer.currentDistrict}
                        </td>
                        <td className="px-4 py-3 border-b text-center">
                          <div className="flex flex-wrap justify-center items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedOfficer(officer);
                                setShowAssignDistrictModal(true);
                              }}
                              className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              title="Phân công"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            {officer.currentDistrict && officer.currentDistrict !== 'N/A' && (
                              <button
                                onClick={() => setConfirmRemove({ open: true, officer })}
                                className="inline-flex items-center px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                title="Xóa khỏi quận"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenHistory(officer.id)}
                              className="inline-flex items-center px-3 py-1 bg-gray-100 text-blue-600 rounded-lg hover:bg-gray-200 transition-colors"
                              title="Lịch sử"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* End Officer Table */}
          </div>
        </div>
      </div>

      {/* Assign District Modal */}
      {showAssignDistrictModal && selectedOfficer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Phân công sĩ quan {selectedOfficer?.name} vào quận</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chọn quận</label>
                <SearchableSelect
                  options={districts.map(d => ({
                    label: `${d.name}`,
                    value: d.id.toString()
                  }))}
                  value={districtFormData.districtId}
                  onChange={(value: string) => setDistrictFormData({ districtId: value })}
                  placeholder="Chọn phường"
                  searchPlaceholder="Tìm kiếm phường..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={handleAssignDistrict}
                >
                  Phân công
                </button>
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  onClick={() => setShowAssignDistrictModal(false)}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmRemove.open && confirmRemove.officer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Xác nhận xóa sĩ quan khỏi quận</h2>
            <p className="mb-6">
              Bạn có chắc chắn muốn xóa sĩ quan <span className="font-semibold">{confirmRemove.officer.name}</span> khỏi phường <span className="font-semibold">{confirmRemove.officer.currentDistrict}</span>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                onClick={async () => {
                  await handleRemoveFromDistrict(confirmRemove.officer!);
                  setConfirmRemove({ open: false, officer: null });
                }}
              >
                Xóa
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                onClick={() => setConfirmRemove({ open: false, officer: null })}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <OfficerAssignHistory
        open={historyPopup.open}
        onClose={() => setHistoryPopup({ open: false })}
        history={officerHistory}
        loading={loading}
      />

      <NotificationBar
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </div>
  );
};

export default AddOfficerDistrictPage;
