import React from 'react';


interface OfficerAssignHistoryProps {
  open: boolean;
  onClose: () => void;
  history: HistoryItem[];
  loading: boolean;
}

interface Change {
  oldCommuneName: string;
  newCommuneName: string;
}

interface HistoryItem {
  changedAt: string;
  changes: Change[];
}

const OfficerAssignHistory: React.FC<OfficerAssignHistoryProps> = ({ open, onClose, history, loading }) => {



  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Lịch sử phân công quận</h2>
              <p className="text-sm text-gray-600">Xem lại các thay đổi phân công của cán bộ</p>
            </div>
          </div>
          <button
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
            onClick={onClose}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-gray-600 font-medium">Đang tải lịch sử...</span>
              </div>
            </div>
          ) : history.length === 0 ? ( 
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="p-3 rounded-full w-fit mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có lịch sử</h3>
                <p className="text-gray-600">Chưa có lịch sử phân công nào được ghi nhận.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {new Date(item.changedAt).toLocaleDateString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(item.changedAt).toLocaleTimeString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {item.changes.map((change, cidx) => (
                      <div key={cidx} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-500">Từ:</span>
                              <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                                {change.oldCommuneName}
                              </span>
                            </div>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-500">Sang:</span>
                              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                                {change.newCommuneName}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfficerAssignHistory;
