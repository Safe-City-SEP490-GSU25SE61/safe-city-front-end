// src/pages/officer/LiveMap.tsx

import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import NotificationBar from '../../components/common/NotificationBar';
import goongjs from '@goongmaps/goong-js';
import '@goongmaps/goong-js/dist/goong-js.css';
import FilterBar from '../../components/common/FilterBar';
import { getIncident, getIncidentById } from '../../services/api/incident';
import IncidentDetail from '../../components/officer/IncidentDetail';
import { 
  Flame, Car, Ambulance, Shield, Waves, Zap, AlertTriangle,
  Trash2, CarFront, Swords, Pickaxe, Eye, HelpCircle
} from 'lucide-react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Define incident interface based on actual API response
interface Incident {
  id: string;
  username?: string;
  type: string;
  description?: string;
  lng?: number;
  lat?: number;
  address?: string;
  status?: string;
  isAnonymous?: boolean;
  occurredAt?: string;
  createdAt?: string;
  verifiedByUserId?: string;
  communeName?: string;
  notes?: any[];
  imageUrls?: any[];
  // Legacy support for existing code
  name?: string;
  latitude?: number;
  longitude?: number;
}

const LiveMap: React.FC = () => {
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [showIncidentDetail, setShowIncidentDetail] = useState(false);
  const [loadingIncidentDetail, setLoadingIncidentDetail] = useState(false);

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any | null>(null);
  const markersRef = useRef<any[]>([]);

  // Helper function to show incident detail
  const showIncidentDetailModal = async (incident: Incident) => {
    console.log('🔴 showIncidentDetailModal called with incident:', incident);
    try {
      console.log('📋 Fetching incident detail for ID:', incident.id);
      setSelectedIncidentId(incident.id);
      console.log('🔧 Setting loadingIncidentDetail to true');
      setLoadingIncidentDetail(true);
      console.log('🔧 Setting showIncidentDetail to true');
      setShowIncidentDetail(true);
      
      // Fetch complete incident details from API
      const apiData = await getIncidentById(incident.id);
      console.log('📋 Raw API data received:', apiData);
      
      // Transform API data to format expected by IncidentDetail component
      const transformedData = {
        id: apiData.id,
        title: apiData.description || apiData.type || 'Không có tiêu đề',
        description: apiData.description || '',
        location: apiData.address || '',
        reportedDate: apiData.createdAt ? new Date(apiData.createdAt).toLocaleDateString('vi-VN') : '',
        reporter: apiData.isAnonymous ? 'Anonymous' : (apiData.userName || ''),
        status: apiData.status,
        lat: apiData.lat,
        lng: apiData.lng,
        category: apiData.type || 'Khác',
        evidence: [
          ...(apiData.imageUrls || []).map((url: string) => ({
            type: 'image',
            url,
            description: 'Hình ảnh hiện trường'
          })),
          ...(apiData.videoUrl ? [{
            type: 'video',
            url: apiData.videoUrl,
            description: 'Video hiện trường'
          }] : [])
        ],
        updates: (apiData.notes || []).map((note: any) => {
          if (typeof note === 'string') {
            return { date: '', officer: '', action: note };
          }
          return {
            date: note.createdAt ? new Date(note.createdAt).toLocaleDateString('vi-VN') : '',
            officer: note.officerName || 'Sĩ quan',
            action: note.content || note.message || ''
          };
        }),
        assignedOfficer: apiData.assignedOfficer || '',
        estimatedResolution: apiData.estimatedResolution || '',
        relatedIncidents: apiData.relatedIncidents || [],
        attachments: [],
        communeName: apiData.communeName || '',
        occurredAt: apiData.occurredAt ? new Date(apiData.occurredAt).toLocaleDateString('vi-VN') : ''
      };
      
      console.log('🔧 Transformed data for IncidentDetail:', transformedData);
      setSelectedIncident(transformedData);
    } catch (error) {
      console.error('❌ Error fetching incident details:', error);
      setNotification({
        show: true,
        message: "Lỗi khi tải chi tiết sự cố",
        type: "error"
      });
      console.log('🔧 Setting showIncidentDetail to false due to error');
      setShowIncidentDetail(false);
    } finally {
      console.log('🔧 Setting loadingIncidentDetail to false');
      setLoadingIncidentDetail(false);
    }
  };

  // Helper function to close incident detail
  const closeIncidentDetail = () => {
    setShowIncidentDetail(false);
    setSelectedIncident(null);
    setSelectedIncidentId(null);
  };

  // Example filter options (customize as needed)
  const filterOptions = {
    "Loại sự cố": [
      { label: "Tất cả", value: "" },
      { label: "Cháy nổ", value: "fire" },
      { label: "Tai nạn", value: "accident" },
    ],
  };

  // Example summary data (replace with real data)


  // Fetch incidents data
  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const data = await getIncident();
      
      if (data && Array.isArray(data)) {
        // Process incidents data
      } else {
        // Handle invalid data
      }
      
      setIncidents(data || []);
      setNotification({
        show: true,
        message: `Đã tải ${data?.length || 0} sự cố`,
        type: "success"
      });
    } catch (error) {
      console.error('❌ Error fetching incidents:', error);
      setNotification({
        show: true,
        message: "Lỗi khi tải dữ liệu sự cố",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render Lucide icons as SVG strings
  const renderIconToSvg = (IconComponent: React.ComponentType<any>) => {
    return renderToStaticMarkup(
      createElement(IconComponent, { 
        size: 20, 
        color: '#374151', // Simple gray color
        strokeWidth: 1.5
      })
    );
  };

  // Get marker icon and color based on incident type
  const getMarkerConfig = (type: string) => {
    const iconComponents: { [key: string]: { IconComponent: React.ComponentType<any>; color: string; bgColor: string } } = {
      // Fire incidents
      'fire': { IconComponent: Flame, color: '#374151', bgColor: '#f9fafb' },
      
      // Traffic and vehicle incidents
      'accident': { IconComponent: Car, color: '#374151', bgColor: '#f9fafb' },
      'tai nạn giao thông': { IconComponent: CarFront, color: '#374151', bgColor: '#f9fafb' },
      'ket xe': { IconComponent: Car, color: '#374151', bgColor: '#f9fafb' },
      
      // Medical emergencies
      'medical': { IconComponent: Ambulance, color: '#374151', bgColor: '#f9fafb' },
      
      // Crime and security
      'crime': { IconComponent: Shield, color: '#374151', bgColor: '#f9fafb' },
      'đánh nhau': { IconComponent: Swords, color: '#374151', bgColor: '#f9fafb' },
      'trộm cắp': { IconComponent: Eye, color: '#374151', bgColor: '#f9fafb' },
      'phá hoại công trình': { IconComponent: Pickaxe, color: '#374151', bgColor: '#f9fafb' },
      
      // Environmental and public order
      'flood': { IconComponent: Waves, color: '#374151', bgColor: '#f9fafb' },
      'xả rác': { IconComponent: Trash2, color: '#374151', bgColor: '#f9fafb' },
      'gây rối trật tự': { IconComponent: AlertTriangle, color: '#374151', bgColor: '#f9fafb' },
      
      // Emergency
      'emergency': { IconComponent: Zap, color: '#374151', bgColor: '#f9fafb' },
      
      // Other/Unknown
      'khác': { IconComponent: HelpCircle, color: '#374151', bgColor: '#f9fafb' },
      'other': { IconComponent: HelpCircle, color: '#374151', bgColor: '#f9fafb' },
      'default': { IconComponent: AlertTriangle, color: '#374151', bgColor: '#f9fafb' }
    };
    
    const config = iconComponents[type.toLowerCase()] || iconComponents.default;
    return {
      icon: renderIconToSvg(config.IconComponent),
      color: config.color,
      bgColor: config.bgColor
    };
  };

  // Create marker for incident
  const createIncidentMarker = (incident: Incident, map: any) => {
    const config = getMarkerConfig(incident.type);
    
    // Create a simple, visible marker element
    const el = document.createElement('div');
    el.className = 'incident-marker';
    el.innerHTML = config.icon;
    el.style.fontSize = '24px';
    el.style.width = '50px';
    el.style.height = '50px';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.backgroundColor = config.bgColor;
    el.style.borderRadius = '50%';
    el.style.border = `4px solid ${config.color}`;
    el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    el.style.cursor = 'pointer';
    el.style.zIndex = '1000';
    // Remove position relative to prevent positioning issues
    el.style.transform = 'translate(-50%, -50%)';
    el.style.pointerEvents = 'auto';
    
    
    
    // Add click event for popup
    el.addEventListener('click', () => {
      showIncidentDetailModal(incident);
      
      
      // Add event listener to the detail button after popup is added
      setTimeout(() => {
        const detailBtn = document.getElementById(`incident-detail-btn-${incident.id}`);
        if (detailBtn) {
          detailBtn.addEventListener('click', () => {
            showIncidentDetailModal(incident);
          });
        }
      }, 100);
    });
    
    // Use lat/lng from API or fallback to latitude/longitude
    const latValue = incident.lat || incident.latitude;
    const lngValue = incident.lng || incident.longitude;
    

    
    // Create marker with proper options to prevent movement during zoom
    const marker = new goongjs.Marker({
      element: el,
      anchor: 'center',
      offset: [0, 0]
    })
      .setLngLat([lngValue, latValue])
      .addTo(map);
    
    // Ensure marker stays fixed during zoom
    marker.getElement().style.position = 'absolute';
    
    return marker;
  };

  // Clear all markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  // Add markers for all incidents
  const addIncidentMarkers = (map: any) => {
    clearMarkers();
    
    if (!map) {
      console.error('❌ Map is not available');
      return;
    }
    
    let markersCreated = 0;
    const coordinateMap = new Map();
    
    incidents.forEach((incident, index) => {  
      console.log(`Processing incident ${index + 1}/${incidents.length}:`, {
        id: incident.id,
        description: incident.description,
        lat: incident.lat,
        latitude: incident.latitude,
        lng: incident.lng,
        longitude: incident.longitude
      });
      
      // Use lat/lng from API or fallback to latitude/longitude
      const latValue = incident.lat || incident.latitude;
      const lngValue = incident.lng || incident.longitude;
      
      if (latValue && lngValue) {
        // Validate coordinates
        const lat = parseFloat(latValue.toString());
        const lng = parseFloat(lngValue.toString());
        
        if (isNaN(lat) || isNaN(lng)) {
          console.warn(`⚠️ Invalid coordinates for incident ${incident.id}:`, { lat, lng });
          return;
        }
        
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          console.warn(`⚠️ Coordinates out of range for incident ${incident.id}:`, { lat, lng });
          return;
        }
        
        // Check if coordinates are outside Vietnam (rough bounds: lat 8-24, lng 102-110)
        if (lat < 8 || lat > 24 || lng < 102 || lng > 110) {
          console.warn(`⚠️ Coordinates outside Vietnam for incident ${incident.id}:`, { lat, lng, description: incident.description });
          console.warn(`This marker will be created but may not be visible in current map view`);
        }
        
        // Check for duplicate coordinates
        const coordKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
        if (coordinateMap.has(coordKey)) {
          console.warn(`⚠️ Duplicate coordinates found for incident ${incident.id} at [${lng}, ${lat}]. Previous incident: ${coordinateMap.get(coordKey)}`);
        } else {
          coordinateMap.set(coordKey, incident.id);
        }
        
        try {
          const marker = createIncidentMarker(incident, map);
          markersRef.current.push(marker);
          markersCreated++;
          console.log(`✅ Marker ${markersCreated} created for incident ${incident.id} at [${lng}, ${lat}]`);
        } catch (error) {
          console.error(`❌ Error creating marker for incident ${incident.id}:`, error);
        }
      } else {
        console.warn(`⚠️ Missing coordinates for incident ${incident.id}:`, {
          description: incident.description,
          lat: incident.lat,
          latitude: incident.latitude,
          lng: incident.lng,
          longitude: incident.longitude
        });
      }
    });
    
    console.log(`📊 Summary: ${markersCreated} markers created out of ${incidents.length} incidents`);
    console.log(`🗺️ Total markers on map: ${markersRef.current.length}`);
    
    // Force update marker visibility after adding markers
    setTimeout(() => {
      updateMarkerVisibility();
    }, 100);
  };

  // Update marker visibility based on zoom
  const updateMarkerVisibility = () => {
    if (!mapRef.current) return;
    
    const zoom = mapRef.current.getZoom();
    
    markersRef.current.forEach((marker, index) => {
      const element = marker.getElement();
      if (element) {
        // Show markers at all zoom levels for debugging
        element.style.display = 'flex';
      } 
    });
    
  };

  // Fetch incidents when component mounts
  useEffect(() => {
    fetchIncidents();
  }, []);

  // Add markers when incidents data changes
  useEffect(() => {
    if (mapRef.current && incidents.length > 0) {
      addIncidentMarkers(mapRef.current);
    }
  }, [incidents]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    goongjs.accessToken = 'VScS4DXaVgUaCjtOp6Vp2AAYlfcJVOIZ2JVjvAnL';

    const map = new goongjs.Map({
      container: mapContainer.current,
      style: 'https://tiles.goong.io/assets/goong_light_v2.json',
      center: [106.7009, 10.7769], // [lng, lat] for Ho Chi Minh City
      zoom: 12, 
    });

    mapRef.current = map;

    // Add click event listener for commune names
    map.on('click', (e: any) => {
      // Query rendered features at the click point
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['place-label'] // This layer typically contains place names
      });
      
      if (features.length > 0) {
        const feature = features[0];
        const properties = feature.properties;
        
        // Check if it's a commune/ward (place names starting with 'P.' or containing commune info)
        if (properties && (properties.name || properties.name_en)) {
          const placeName = properties.name || properties.name_en;
          console.log('Clicked on:', placeName);
          
          // Show alert with commune information
          window.alert(`Bạn đã click vào: ${placeName}`);
          
          // You can add more functionality here, like:
          // - Show detailed information about the commune
          // - Navigate to a specific page
          // - Update state with selected commune
        }
      }
    });
    
    // Change cursor to pointer when hovering over clickable areas
    map.on('mouseenter', 'place-label', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    
    map.on('mouseleave', 'place-label', () => {
      map.getCanvas().style.cursor = '';
    });

    // Clean up on unmount
    return () => {
      clearMarkers();
      map.remove();
    };
  }, []);

  // Fetch incidents on component mount
  useEffect(() => {
    fetchIncidents();
  }, []);

  // Add markers when incidents data changes
  useEffect(() => {
    if (mapRef.current && incidents.length > 0) {
      // Ensure map is fully loaded before adding markers
      if (mapRef.current.isStyleLoaded()) {
        addIncidentMarkers(mapRef.current);
      } else {
        mapRef.current.on('styledata', () => {
          addIncidentMarkers(mapRef.current);
        });
      }
    }
  }, [incidents]);
    

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
                  style={{ width: '100%', height: '85vh', borderRadius: '16px', overflow: 'hidden' }}
                  id="map"
                />
              </div>

              {/* Recent Incidents */}
              <div className="w-full max-w-xs bg-white rounded-lg shadow p-4 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Sự cố gần đây</h3>
                  <button 
                    onClick={fetchIncidents}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                    disabled={loading}
                  >
                    {loading ? '⟳' : '↻'} Làm mới
                  </button>
                </div>
                
                {loading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-gray-500">Đang tải...</div>
                  </div>
                ) : (
                  <div className="flex-1 space-y-3 overflow-y-auto">
                    {incidents.length > 0 ? (
                      incidents.slice(0, 10).map((incident) => (
                        <div key={incident.id} className="border-b pb-2 p-2 rounded hover:bg-gray-50">
                          <div className="font-bold text-red-600">{incident.description || 'Sự cố không mô tả'}</div>
                          <div className="text-sm flex items-center gap-1">
                            <span dangerouslySetInnerHTML={{ __html: getMarkerConfig(incident.type).icon }}></span>
                            <span>{incident.type}</span>
                          </div>
                          <div className="text-xs text-gray-400 mb-2">
                            {incident.createdAt ? new Date(incident.createdAt).toLocaleString('vi-VN') : 'Không rõ thời gian'}
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (mapRef.current) {
                                  const latValue = incident.lat || incident.latitude;
                                  const lngValue = incident.lng || incident.longitude;
                                  mapRef.current.flyTo({
                                    center: [lngValue, latValue],
                                    zoom: 15
                                  });
                                }
                              }}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                            >
                              Xem trên bản đồ
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('🔵 Chi tiết button clicked for incident:', incident.id);
                                showIncidentDetailModal(incident);
                              }}
                              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                            >
                              Chi tiết
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 text-center py-4">Không có sự cố nào</div>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 bg-green-500 text-white rounded px-3 py-2 text-sm">Xuất PDF</button>
                  <button className="flex-1 bg-blue-500 text-white rounded px-3 py-2 text-sm">Xuất Excel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Incident Detail Modal */}
      {console.log('🔍 Modal render check:', { showIncidentDetail, loadingIncidentDetail, selectedIncident: !!selectedIncident })}
      {showIncidentDetail && (
        <div className="fixed inset-0 z-[9999]" style={{ zIndex: 9999 }}>
          {loadingIncidentDetail ? (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Đang tải chi tiết sự cố...</p>
                </div>
              </div>
            </div>
          ) : selectedIncident ? (
            <IncidentDetail
              incident={selectedIncident}
              loading={false}
              onClose={closeIncidentDetail}
            />
          ) : (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-8 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-red-600">Không thể tải chi tiết sự cố</p>
                  <button 
                    onClick={closeIncidentDetail}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default LiveMap;
