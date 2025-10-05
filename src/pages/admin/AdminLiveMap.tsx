// src/pages/admin/AdminLiveMap.tsx

import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import NotificationBar from '../../components/common/NotificationBar';
import goongjs from '@goongmaps/goong-js';
import '@goongmaps/goong-js/dist/goong-js.css';
import { 
  BarChart3, PieChart, TrendingUp, MapPin, Users, AlertTriangle,
  CheckCircle2, Clock, XCircle, Eye, EyeOff, Ban
} from 'lucide-react';
import { getIncidentStatisticsAdmin } from '../../services/api/incident';
import { getCommuneData, getAdminReports } from '../../services/api/map';
import { getConfigByKeyword } from '../../services/api/congfig';

// Admin statistics interface based on provided data
interface AdminStatistics {
  totalReports: number;
  reportsByStatus: {
    solved: number;
    verified: number;
    pending: number;
    malicious: number;
    rejected: number;
    cancelled: number;
    closed: number;
    verified_hidden: number;
  };
  reportsByCommune: {
    [key: string]: number;
  };
  topCommuneName: string;
  topCommuneCount: number;
  reportsByType: {
    [key: string]: number;
  };
  reportsBySubType: {
    [key: string]: {
      [key: string]: number;
    };
  };
}
// Commune polygon data from API
interface CommunePolygon {
  id: number;
  name: string;
  coordinates: [number, number]; // Center coordinates for labels [lng, lat]
  polygon: string; // Stringified JSON containing FeatureCollection with MultiPolygon and Point features
  reportCount?: number;
}

// Vietnamese to English keyword mapping for icon fetching
const vietnameseToEnglishKeywordMap: { [key: string]: string } = {
  'giao thông': 'traffic',
  'an ninh': 'security',
  'môi trường': 'environment',
  'cơ sở hạ tầng': 'infrastructure',
  'khác': 'other',
};

const AdminLiveMap: React.FC = () => {
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });
  
  const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [communePolygons, setCommunePolygons] = useState<CommunePolygon[]>([]);
  const [showCommuneBoundaries, setShowCommuneBoundaries] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'status' | 'type' | 'commune'>('overview');
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'quarter'>('week');
  const [iconConfigs, setIconConfigs] = useState<Map<string, string>>(new Map());
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any | null>(null);
  const heatmapLayersRef = useRef<string[]>([]);
  const reportMarkersRef = useRef<any[]>([]);
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching statistics from API...', { timePeriod });
      const data = await getIncidentStatisticsAdmin(timePeriod);
      console.log('📊 API Response:', data);
      
      if (data) {
        setStatistics(data);
        setNotification({
          show: true,
          message: "Đã tải thống kê thành công",
          type: "success"
        });
        return data; // Return data for chaining
      } else {
        setStatistics(null);
        setNotification({
          show: true,
          message: "Không có dữ liệu",
          type: "error"
        });
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
      setStatistics(null);
      setNotification({
        show: true,
        message: "Lỗi khi tải dữ liệu",
        type: "error"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch commune polygon data from API with optional statistics data
  const fetchCommunePolygons = async (statisticsData?: AdminStatistics | null) => {
    try {
      const data = await getCommuneData();
      
      if (data && Array.isArray(data)) {
        // Use provided statistics data or current state
        const currentStats = statisticsData || statistics;
        
        // Map report counts to commune polygons and extract coordinates
        const polygonsWithReports = data.map((commune: any) => {
          // Parse coordinates from polygon JSON string
          let coordinates: [number, number] | undefined;
          
          if (commune.polygon && typeof commune.polygon === 'string') {
            try {
              const polygonData = JSON.parse(commune.polygon);
              
              // Look for Point feature in the FeatureCollection
              if (polygonData.features && Array.isArray(polygonData.features)) {
                const pointFeature = polygonData.features.find(
                  (feature: any) => feature.geometry?.type === 'Point'
                );
                
                if (pointFeature && pointFeature.geometry?.coordinates) {
                  coordinates = pointFeature.geometry.coordinates as [number, number];
                }
              }
            } catch (parseError) {
              // Silently handle parse errors
            }
          }
          
          const reportCount = currentStats?.reportsByCommune[commune.name] || 0;
          console.log(`🏘️ Commune ${commune.name}: ${reportCount} reports`);
          
          return {
            ...commune,
            coordinates, // Add parsed coordinates
            reportCount
          };
        });
        
        setCommunePolygons(polygonsWithReports);
        setNotification({
          show: true,
          message: `Đã tải ${data.length} ranh giới phường/xã với dữ liệu báo cáo`,
          type: "success"
        });
      } else {
        setCommunePolygons([]);
        setNotification({
          show: true,
          message: "Không có dữ liệu ranh giới",
          type: "error"
        });
      }
    } catch (error) {
      setCommunePolygons([]);
      setNotification({
        show: true,
        message: "Lỗi khi tải ranh giới phường/xã",
        type: "error"
      });
    }
  };

  // Combined function to fetch both statistics and commune data
  const fetchStatisticsAndCommunes = async () => {
    try {
      console.log('🔄 Fetching statistics and commune data together...');
      const statisticsData = await fetchStatistics();
      
      if (statisticsData) {
        // Fetch commune polygons with the fresh statistics data
        await fetchCommunePolygons(statisticsData);
      } else {
        // Still fetch commune polygons even if statistics failed
        await fetchCommunePolygons(null);
      }
    } catch (error) {
      console.error('❌ Error in combined fetch:', error);
    }
  };

  // Handle fetching reports for a specific commune
  const handleCommuneReports = async (commune: string, communeData: any, timePeriod: string) => {
    try {
      console.log(`📊 Fetching reports for commune: ${commune}`);
      const communeId = communeData?.id;

      if (!communeId) {
        console.warn(`⚠️ No commune ID found for: ${commune}`);
        setNotification({ show: true, message: `Không tìm thấy ID cho phường/xã: ${commune}`, type: "error" });
        return;
      }

      const response = await getAdminReports(communeId.toString(), timePeriod);
      console.log(`📋 Retrieved response for commune ${commune}:`, response);

      if (mapRef.current && response?.point) {
        console.log(`🗺️ Flying to ${commune} at point:`, response.point);
        mapRef.current.flyTo({
          center: [response.point.lng, response.point.lat],
          zoom: 15,
          speed: 1.5
        });
      }

      if (response?.reports) {
        addReportMarkers(response.reports);
        setNotification({ show: true, message: `Đã tải ${response.reports.length} báo cáo cho ${commune}`, type: "success" });
      } else {
        addReportMarkers([]); // Clear markers if no reports
      }

    } catch (error) {
      console.error('Error fetching commune reports:', error);
      setNotification({ show: true, message: `Lỗi khi tải báo cáo cho ${commune}`, type: "error" });
      addReportMarkers([]); // Clear markers on error
    }
  };

  // Get marker configuration based on incident type
  const getMarkerConfig = (type: string, currentIconConfigs: Map<string, string>) => {
    const lowerType = type.toLowerCase();
    const englishKeyword = vietnameseToEnglishKeywordMap[lowerType] || lowerType.replace(/\s+/g, '-');
    const iconKeyword = `${englishKeyword}-icon`;
    const iconUrl = currentIconConfigs.get(iconKeyword);

    console.log('🔍 getMarkerConfig called:', {
      type,
      lowerType,
      englishKeyword,
      iconKeyword,
      iconUrl,
      hasIconUrl: !!iconUrl,
      allIconConfigs: Array.from(currentIconConfigs.entries())
    });

    // Priority 1: Use dynamically fetched icon URL if available
    if (iconUrl) {
      console.log('✅ Icon URL found:', iconUrl);
      return {
        icon: iconUrl,
        color: '#374151',
        bgColor: '#f9fafb',
      };
    }

    console.warn('⚠️ No icon found for type:', type, 'keyword:', iconKeyword);
    // If no icon is found from the API, return null
    return null;
  };

  // Add report markers to the map with dynamic icon fetching
  const addReportMarkers = async (reports: any[]) => {
    if (!mapRef.current) return;

    // Clear existing report markers
    reportMarkersRef.current.forEach(marker => marker.remove());
    reportMarkersRef.current = [];

    if (!reports || reports.length === 0) {
      return;
    }

    // 1. Fetch needed icons
    const uniqueTypes = [...new Set(reports.map(r => r.type).filter(Boolean))];
    const keywordsToFetch: string[] = [];
    uniqueTypes.forEach(type => {
      const lowerType = type.toLowerCase();
      const englishKeyword = vietnameseToEnglishKeywordMap[lowerType] || lowerType.replace(/\s+/g, '-');
      const iconKeyword = `${englishKeyword}-icon`;
      if (!iconConfigs.has(iconKeyword)) {
        keywordsToFetch.push(iconKeyword);
      }
    });

    let currentIconConfigs = new Map(iconConfigs);

    if (keywordsToFetch.length > 0) {
      console.log('🔄 Fetching icon configurations for keywords:', keywordsToFetch);
      try {
        const iconPromises = keywordsToFetch.map(keyword =>
          getConfigByKeyword(keyword).then(data => ({ keyword, data }))
        );
        const results = await Promise.all(iconPromises);
        console.log('📦 Icon API responses:', results);
        
        results.forEach(({ keyword, data }) => {
          console.log(`🔍 Processing keyword "${keyword}":`, data);
          
          let iconUrl = null;
          let configData = null;
          
          // Handle different response structures
          if (data) {
            // Structure 1: Array-like object { 0: { value, key, ... } }
            if (data[0] && typeof data[0] === 'object') {
              configData = data[0];
              console.log(`  📦 Found data at index 0:`, configData);
            }
            // Structure 2: Direct object { value, key, ... }
            else if ('value' in data) {
              configData = data;
              console.log(`  📦 Found data directly:`, configData);
            }
            // Structure 3: Array [{ value, key, ... }]
            else if (Array.isArray(data) && data.length > 0) {
              configData = data[0];
              console.log(`  📦 Found data in array:`, configData);
            }
          }
          
          if (configData && configData.value) {
            iconUrl = configData.value;
            console.log(`  ✅ Found icon URL for "${keyword}":`, iconUrl);
            console.log(`  📝 Icon details - key: ${configData.key}, description: ${configData.description}`);
          } else {
            console.warn(`  ⚠️ No value found for "${keyword}".`);
            console.warn(`  📋 Data structure:`, data);
          }
          
          if (iconUrl) {
            currentIconConfigs.set(keyword, iconUrl);
            console.log(`  💾 Stored icon URL in map for "${keyword}"`);
          } else {
            console.error(`  ❌ Failed to extract icon URL for "${keyword}"`);
          }
        });
        
        console.log('💾 Updating iconConfigs state with:', Array.from(currentIconConfigs.entries()));
        setIconConfigs(currentIconConfigs);
      } catch (error) {
        console.error('❌ Error fetching icon configurations:', error);
      }
    } else {
      console.log('ℹ️ No new icon keywords to fetch (all cached)');
    }

    // 2. Create markers with fetched icons
    reports.forEach(report => {
      if (report.lat && report.lng) {
        const config = getMarkerConfig(report.type || 'default', currentIconConfigs);
        
        if (!config) {
          console.warn(`⚠️ No config found for report ${report.id}, skipping marker`);
          return;
        }
        
        const el = document.createElement('div');
        el.className = 'incident-marker';

        // Check if config.icon is a URL
        const isImageUrl = typeof config.icon === 'string' && 
          (config.icon.startsWith('http://') || 
           config.icon.startsWith('https://') || 
           config.icon.startsWith('/') || 
           config.icon.includes('.')  // Likely a file path
          );
        
        console.log('🎨 Creating admin report marker:', {
          reportId: report.id,
          type: report.type,
          iconValue: config.icon,
          isImageUrl
        });

        if (isImageUrl) {
          el.style.width = '40px';
          el.style.height = '40px';
          el.style.backgroundImage = `url("${config.icon}")`;
          el.style.backgroundSize = 'contain';
          el.style.backgroundRepeat = 'no-repeat';
          el.style.backgroundPosition = 'center';
          el.style.backgroundColor = 'transparent';
          el.style.borderRadius = '0';
          el.style.border = 'none';
          el.style.boxShadow = 'none';
          el.style.padding = '0';
          
          // Add error handling for image loading
          const testImg = new Image();
          testImg.onload = () => {
            console.log('✅ Admin report image loaded:', config.icon);
          };
          testImg.onerror = () => {
            console.error('❌ Failed to load admin report image:', config.icon);
            el.style.backgroundImage = 'none';
            el.innerHTML = `<span style="font-size: 12px; font-weight: bold; color: #ef4444;">${report.type?.charAt(0) || '?'}</span>`;
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
          };
          testImg.src = config.icon;
        } else {
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
        }

        el.style.cursor = 'pointer';

        const marker = new goongjs.Marker(el)
          .setLngLat([report.lng, report.lat])
          const popup = new goongjs.Popup({ offset: 25 }).setHTML(
            `<div style="font-family: Arial, sans-serif; font-size: 14px;">
              <h3 style="margin: 0 0 5px 0; font-size: 16px; color: #333;">${report.subCategory}</h3>
              <p style="margin: 0 0 3px 0; color: #555;"><strong>Địa chỉ:</strong> ${report.address}</p>
              <p style="margin: 0 0 3px 0; color: #555;"><strong>Loại:</strong> ${report.type}</p>
              <p style="margin: 0 0 3px 0; color: #555;"><strong>Trạng thái:</strong> ${report.status}</p>
              <p style="margin: 0; color: #555;"><strong>Thời gian:</strong> ${new Date(report.occurredAt).toLocaleString('vi-VN')}</p>
            </div>`
          );
          marker.setPopup(popup);
          marker.addTo(mapRef.current);
        
        reportMarkersRef.current.push(marker);
      }
    });
  };

  // Add commune polygon boundaries to map
  const addCommunePolygons = (map: any) => {
    // Check if map is ready
    if (!map || !map.loaded()) {
      setTimeout(() => {
        if (map && map.loaded()) {
          addCommunePolygons(map);
        }
      }, 1000);
      return;
    }

    // Clear existing commune layers
    heatmapLayersRef.current.forEach(layerId => {
      if (layerId.includes('commune-')) {
        try {
          if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
          }
        } catch (e) {
          // Silently handle cleanup errors
        }
      }
    });
    
    // Clear sources
    for (let i = 0; i < 100; i++) {
      try {
        if (map.getSource(`commune-${i}`)) map.removeSource(`commune-${i}`);
        if (map.getSource(`commune-label-${i}`)) map.removeSource(`commune-label-${i}`);
      } catch (e) {
        // Source doesn't exist, continue
      }
    }
    
    heatmapLayersRef.current = [];

    if (!showCommuneBoundaries || !communePolygons.length) {
      return;
    }

    let successCount = 0;

    communePolygons.forEach((commune, index) => {
      // Skip if no polygon data at all
      if (!commune.polygon) {
        return;
      }

      const sourceId = `commune-${index}`;
      const labelSourceId = `commune-label-${index}`;
      const layerId = `commune-layer-${index}`;
      const borderLayerId = `commune-border-${index}`;
      const labelLayerId = `commune-label-${index}`;
      
      try {
        // Parse polygon data if it's a string
        let polygonData;
        if (typeof commune.polygon === 'string') {
          try {
            polygonData = JSON.parse(commune.polygon);
          } catch (parseError) {
            return;
          }
        } else {
          polygonData = commune.polygon;
        }
        
        // Handle different data structures
        let geoJsonData;
        
        if (polygonData.features) {
          // Standard FeatureCollection format
          const polygonFeatures = polygonData.features.filter(
            (feature: any) => feature.geometry.type === 'MultiPolygon' || feature.geometry.type === 'Polygon'
          );
          
          if (polygonFeatures.length === 0) {
            return;
          }
          
          geoJsonData = {
            type: 'FeatureCollection',
            features: polygonFeatures
          };
        } else if (polygonData.type && polygonData.coordinates) {
          // Direct geometry format
          console.log(`Direct geometry format for ${commune.name}:`, polygonData.type);
          geoJsonData = {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: polygonData,
              properties: {
                name: commune.name,
                id: commune.id
              }
            }]
          };
        } else {
          console.warn(`⚠️ Unknown polygon data format for ${commune.name}:`, polygonData);
          return;
        }
        
        
        
        // Add polygon source
        map.addSource(sourceId, {
          type: 'geojson',
          data: geoJsonData
        });
        
        // Add fill layer with color based on report count
        const reportCount = commune.reportCount || 0;
        let fillColor = '#10b981'; // green for low
        let fillOpacity = 0.3; // Increased opacity for visibility
        let borderColor = '#059669';
        let borderWidth = 2; // Increased width for visibility
        
        if (reportCount >= 15) {
          fillColor = '#ef4444'; // red for high
          fillOpacity = 0.4;
          borderColor = '#dc2626';
          borderWidth = 3;
        } else if (reportCount >= 5) {
          fillColor = '#f59e0b'; // yellow for medium
          fillOpacity = 0.35;
          borderColor = '#d97706';
          borderWidth = 2.5;
        }
        
        console.log(`🎨 Adding fill layer ${layerId} with color ${fillColor}`);
        map.addLayer({
          id: layerId,
          type: 'fill',
          source: sourceId,
          layout: {
            'visibility': 'visible'
          },
          paint: {
            'fill-color': fillColor,
            'fill-opacity': fillOpacity
          },
          minzoom: 12 // Only show when zoom > 12
        });
        console.log(`✅ Fill layer ${layerId} added successfully`);
        
        // Add border layer
        console.log(`🔲 Adding border layer ${borderLayerId}`);
        map.addLayer({
          id: borderLayerId,
          type: 'line',
          source: sourceId,
          layout: {
            'visibility': 'visible'
          },
          paint: {
            'line-color': borderColor,
            'line-width': borderWidth
          },
          minzoom: 12 // Only show when zoom > 12
        });
        console.log(`✅ Border layer ${borderLayerId} added successfully`);
        
        // Add labels using center coordinates from API
        if (commune.coordinates && Array.isArray(commune.coordinates) && commune.coordinates.length === 2) {
          console.log(`🏷️ Adding label for ${commune.name} at coordinates:`, commune.coordinates);
          
          const labelGeoJson = {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: commune.coordinates // Use direct center coordinates from API
              },
              properties: {
                name: commune.name,
                reportCount: commune.reportCount || 0
              }
            }]
          };
          
          map.addSource(labelSourceId, {
            type: 'geojson',
            data: labelGeoJson
          });
          
          map.addLayer({
            id: labelLayerId,
            type: 'symbol',
            source: labelSourceId,
            layout: {
              'text-field': `${commune.name}\n(${reportCount} báo cáo)`,
              'text-font': ['Open Sans Regular'],
              'text-size': 11,
              'text-anchor': 'center',
              'text-line-height': 1.2,
              'visibility': 'visible'
            },
            paint: {
              'text-color': '#1f2937',
              'text-halo-color': '#ffffff',
              'text-halo-width': 2
            },
            minzoom: 12 // Only show when zoom > 12
          });
          
          heatmapLayersRef.current.push(labelLayerId);
          console.log(`✅ Label added for ${commune.name}`);
        } else {
          console.warn(`⚠️ No valid center coordinates for ${commune.name}:`, commune.coordinates);
        }
        
        // Add click events
        map.on('click', layerId, (e: any) => {
          const properties = e.features?.[0]?.properties;
          const communeName = properties?.name || commune.name;
          const reportCount = properties?.reportCount || commune.reportCount || 0;
          
          setNotification({
            show: true,
            message: `${communeName}: ${reportCount} báo cáo`,
            type: "info"
          });
        });
        
        // Add hover effects
        map.on('mouseenter', layerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        
        map.on('mouseleave', layerId, () => {
          map.getCanvas().style.cursor = '';
        });
        
        heatmapLayersRef.current.push(layerId, borderLayerId);
        successCount++;
        
        console.log(`✅ Successfully added ${commune.name}`);
        
      } catch (error) {
        console.error(`❌ Error adding ${commune.name}:`, error);
      }
    });
    
    console.log(`📊 Successfully added ${successCount}/${communePolygons.length} commune boundaries`);
    
    if (successCount > 0) {
      setNotification({
        show: true,
        message: `✅ Hiển thị ${successCount} ranh giới phường/xã`,
        type: "success"
      });
    } else {
      setNotification({
        show: true,
        message: `❌ Không thể hiển thị ranh giới`,
        type: "error"
      });
    }
  };



  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    goongjs.accessToken = 'VScS4DXaVgUaCjtOp6Vp2AAYlfcJVOIZ2JVjvAnL';

    const map = new goongjs.Map({
      container: mapContainer.current,
      style: 'https://tiles.goong.io/assets/goong_light_v2.json',
      center: [106.7009, 10.7769], // Ho Chi Minh City
      zoom: 12,
    });

    mapRef.current = map;

    map.on('load', () => {
      // Use combined function to ensure proper data loading sequence
      fetchStatisticsAndCommunes();
    });

    return () => {
      map.remove();
    };
  }, []);

  // Update commune polygons when data changes
  useEffect(() => {
    if (mapRef.current && communePolygons.length > 0) {
      addCommunePolygons(mapRef.current);
    }
  }, [communePolygons, showCommuneBoundaries]);

  // Refresh statistics and commune data when time period changes
  useEffect(() => {
    if (mapRef.current) {
      // Use combined function to ensure commune boundaries get updated colors
      fetchStatisticsAndCommunes();
    }
  }, [timePeriod]);

  // Get status icon and color
  const getStatusConfig = (status: string) => {
    const configs: { [key: string]: { icon: React.ReactNode; color: string; bgColor: string } } = {
      solved: { icon: <CheckCircle2 size={16} />, color: 'text-green-600', bgColor: 'bg-green-50' },
      verified: { icon: <Eye size={16} />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
      pending: { icon: <Clock size={16} />, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
      malicious: { icon: <Ban size={16} />, color: 'text-red-600', bgColor: 'bg-red-50' },
      rejected: { icon: <XCircle size={16} />, color: 'text-red-500', bgColor: 'bg-red-50' },
      cancelled: { icon: <XCircle size={16} />, color: 'text-gray-500', bgColor: 'bg-gray-50' },
      closed: { icon: <CheckCircle2 size={16} />, color: 'text-green-500', bgColor: 'bg-green-50' },
      verified_hidden: { icon: <EyeOff size={16} />, color: 'text-purple-600', bgColor: 'bg-purple-50' }
    };
    return configs[status] || { icon: <AlertTriangle size={16} />, color: 'text-gray-600', bgColor: 'bg-gray-50' };
  };

  // Get Vietnamese status name
  const getStatusName = (status: string) => {
    const names: { [key: string]: string } = {
      solved: 'Đã giải quyết',
      verified: 'Đã xác minh',
      pending: 'Đang chờ',
      malicious: 'Độc hại',
      rejected: 'Từ chối',
      cancelled: 'Hủy bỏ',
      closed: 'Đã đóng',
      verified_hidden: 'Xác minh ẩn'
    };
    return names[status] || status;
  };

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
            {/* Page Title */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Bản đồ Thống kê Admin</h1>
                  <p className="text-gray-600 mt-1">Tổng quan thống kê báo cáo trên toàn thành phố</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      console.log('🔄 Toggling commune boundaries:', !showCommuneBoundaries);
                      console.log('Current commune data:', communePolygons.length, 'communes');
                      setShowCommuneBoundaries(!showCommuneBoundaries);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      showCommuneBoundaries
                        ? 'bg-purple-500 text-white hover:bg-purple-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {showCommuneBoundaries ? 'Ẩn Ranh giới' : 'Hiện Ranh giới'} ({communePolygons.length})
                  </button>
                  <button
                    onClick={() => {
                      console.log('🗺️ Manual boundary reload triggered - fetching statistics and commune data');
                      fetchStatisticsAndCommunes();
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
                  >
                    Tải Ranh giới
                  </button>
                  <div className="flex items-center gap-2">
                    <select 
                      value={timePeriod}
                      onChange={(e) => setTimePeriod(e.target.value as 'week' | 'month' | 'quarter')}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      <option value="week">Theo tuần</option>
                      <option value="month">Theo tháng</option>
                      <option value="quarter">Theo quý</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      console.log('🔄 Manual refresh triggered - fetching statistics and commune data');
                      fetchStatisticsAndCommunes();
                    }}
                    disabled={loading}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50"
                  >
                    {loading ? 'Đang tải...' : 'Làm mới'}
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content: Map + Statistics */}
            <div className="flex flex-1 gap-6 p-6">
              {/* Map */}
              <div className="flex-1 bg-white rounded-lg shadow overflow-hidden" style={{ minHeight: '70vh' }}>
                <div
                  ref={mapContainer}
                  style={{ width: '100%', height: '75vh', borderRadius: '8px', overflow: 'hidden' }}
                  id="admin-map"
                />
              </div>

              {/* Statistics Panel */}
              <div className="w-96 bg-white rounded-lg shadow p-6 flex flex-col">
                {/* View Selector */}
                <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                  {[
                    { key: 'overview', label: 'Tổng quan', icon: <BarChart3 size={16} /> },
                    { key: 'status', label: 'Trạng thái', icon: <PieChart size={16} /> },
                    { key: 'type', label: 'Loại', icon: <TrendingUp size={16} /> },
                    { key: 'commune', label: 'Phường/Xã', icon: <MapPin size={16} /> }
                  ].map(({ key, label, icon }) => (
                    <button
                      key={key}
                      onClick={() => setSelectedView(key as any)}
                      className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                        selectedView === key
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {icon}
                      {label}
                    </button>
                  ))}
                </div>

                {loading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Đang tải thống kê...</p>
                    </div>
                  </div>
                ) : statistics ? (
                  <div className="flex-1 overflow-y-auto">
                    {/* Overview */}
                    {selectedView === 'overview' && (
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-blue-600 font-medium">Tổng số báo cáo</p>
                              <p className="text-2xl font-bold text-blue-900">{statistics.totalReports}</p>
                            </div>
                            <Users className="text-blue-500" size={32} />
                          </div>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-green-600 font-medium">Phường/Xã có nhiều báo cáo nhất</p>
                              <p className="text-lg font-bold text-green-900">{statistics.topCommuneName}</p>
                              <p className="text-sm text-green-700">{statistics.topCommuneCount} báo cáo</p>
                            </div>
                            <MapPin className="text-green-500" size={32} />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                            <p className="text-xs text-yellow-600 font-medium">Đang chờ</p>
                            <p className="text-xl font-bold text-yellow-900">{statistics.reportsByStatus.pending}</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                            <p className="text-xs text-green-600 font-medium">Đã giải quyết</p>
                            <p className="text-xl font-bold text-green-900">{statistics.reportsByStatus.solved}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Status View */}
                    {selectedView === 'status' && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 mb-4">Báo cáo theo trạng thái</h3>
                        {Object.entries(statistics.reportsByStatus).map(([status, count]) => {
                          const config = getStatusConfig(status);
                          const percentage = ((count / statistics.totalReports) * 100).toFixed(1);
                          return (
                            <div key={status} className={`${config.bgColor} rounded-lg p-3 border`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className={config.color}>{config.icon}</span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {getStatusName(status)}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-lg font-bold text-gray-900">{count}</span>
                                  <span className="text-xs text-gray-600 ml-1">({percentage}%)</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Type View */}
                    {selectedView === 'type' && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 mb-4">Báo cáo theo loại</h3>
                        {Object.entries(statistics.reportsByType)
                          .sort(([,a], [,b]) => b - a)
                          .map(([type, count]) => {
                            const percentage = ((count / statistics.totalReports) * 100).toFixed(1);
                            return (
                              <div key={type} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-900">{type}</span>
                                  <div className="text-right">
                                    <span className="text-lg font-bold text-gray-900">{count}</span>
                                    <span className="text-xs text-gray-600 ml-1">({percentage}%)</span>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })
                        }
                      </div>
                    )}

                    {/* Commune View */}
                    {selectedView === 'commune' && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 mb-4">Báo cáo theo Phường/Xã</h3>
                        {Object.entries(statistics.reportsByCommune)
                          .sort(([,a], [,b]) => b - a)
                          .map(([commune, count]) => {
                            const percentage = ((count / statistics.totalReports) * 100).toFixed(1);
                            const communeData = communePolygons.find(c => c.name === commune);
                            const density = count >= 15 ? 'high' : count >= 5 ? 'medium' : 'low';
                            return (
                              <div key={commune} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${
                                      density === 'high' ? 'bg-red-500' :
                                      density === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}></div>
                                    <span className="text-sm font-medium text-gray-900">{commune}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-lg font-bold text-gray-900">{count}</span>
                                    <span className="text-xs text-gray-600 ml-1">({percentage}%)</span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      if (mapRef.current && communeData?.coordinates) {
                                        console.log(`🗺️ Flying to ${commune} at coordinates:`, communeData.coordinates);
                                        mapRef.current.flyTo({
                                          center: communeData.coordinates,
                                          zoom: 14
                                        });
                                      } else {
                                        console.warn(`⚠️ No coordinates found for commune: ${commune}`);
                                      }
                                    }}
                                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                                  >
                                    Xem trên bản đồ
                                  </button>
                                  <button
                                    onClick={() => handleCommuneReports(commune, communeData, timePeriod)}
                                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                                  >
                                    Xem báo cáo
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        }
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <AlertTriangle className="mx-auto mb-4 text-gray-400" size={48} />
                      <p className="text-gray-600">Không có dữ liệu thống kê</p>
                    </div>
                  </div>
                )}

                {/* Export Buttons */}
                <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200">
                 
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLiveMap;