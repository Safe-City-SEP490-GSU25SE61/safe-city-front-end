// src/pages/officer/LiveMap.tsx

import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import NotificationBar from '../../components/common/NotificationBar';
import goongjs from '@goongmaps/goong-js';
import '@goongmaps/goong-js/dist/goong-js.css';
import FilterBar from '../../components/common/FilterBar';

const LiveMap: React.FC = () => {
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  const mapContainer = useRef<HTMLDivElement>(null);

  // Example filter options (customize as needed)
  const filterOptions = {
    "Loại sự cố": [
      { label: "Tất cả", value: "" },
      { label: "Cháy nổ", value: "fire" },
      { label: "Tai nạn", value: "accident" },
    ],
  };

  // Example summary data (replace with real data)
  const summary = [
    { label: "Sự cố diễn ra trong ngày", value: 75 },
    { label: "Khu vực nguy hiểm", value: 5 },
    { label: "Lực lượng đã triển khai", value: 65 },
    { label: "Tin nhắn chưa đọc", value: 7265 },
  ];

  // Example recent incidents (replace with real data)
  const recentIncidents = [
    { id: "INC-123-2025", type: "Cháy nổ", location: "Phường 23/Quận Tân Bình", time: "2 tiếng trước" },
    // ... more incidents ...
  ];

  useEffect(() => {
    if (!mapContainer.current) return;

    goongjs.accessToken = '123'; // <-- Replace with your key

    const map = new goongjs.Map({
      container: mapContainer.current,
      style: 'https://tiles.goong.io/assets/goong_light_v2.json',
      center: [106.7009, 10.7769], // [lng, lat] for Ho Chi Minh City
      zoom: 11, // You can adjust the zoom level as needed
    });

    // Clean up on unmount
    return () => map.remove();
  }, []);

  return (
    <>
      <NotificationBar
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification(n => ({ ...n, show: false }))}
      />
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <Header />

          {/* Page Content */}
          <div className="flex-1 flex flex-col">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
              {summary.map((item, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                  <div className="text-2xl font-bold">{item.value}</div>
                  <div className="text-gray-500 text-sm text-center">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Filter Bar */}
            <div className="px-6">
              <FilterBar
                filterOptions={filterOptions}
                // Add your handlers here
              />
            </div>

            {/* Main Content: Map + Recent Incidents */}
            <div className="flex flex-1 gap-6 p-6">
              {/* Map */}
              <div className="flex-1 bg-white rounded-lg shadow overflow-hidden" style={{ minHeight: '70vh' }}>
                <div
                  ref={mapContainer}
                  style={{ width: '100%', height: '70vh', borderRadius: '16px', overflow: 'hidden' }}
                  id="map"
                />
              </div>

              {/* Recent Incidents */}
              <div className="w-full max-w-xs bg-white rounded-lg shadow p-4 flex flex-col">
                <h3 className="font-semibold mb-4">Sự cố gần đây</h3>
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {recentIncidents.map((inc, idx) => (
                    <div key={idx} className="border-b pb-2">
                      <div className="font-bold text-red-600">{inc.id}</div>
                      <div className="text-sm">{inc.type} – {inc.location}</div>
                      <div className="text-xs text-gray-400">{inc.time}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 bg-green-500 text-white rounded px-3 py-2">Xuất PDF</button>
                  <button className="flex-1 bg-blue-500 text-white rounded px-3 py-2">Xuất excel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LiveMap;
