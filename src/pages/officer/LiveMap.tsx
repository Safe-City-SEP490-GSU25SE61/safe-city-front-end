// src/pages/officer/LiveMap.tsx

import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../../components/common/SideBar';
import Header from '../../components/common/Header';
import NotificationBar from '../../components/common/NotificationBar';
import goongjs from '@goongmaps/goong-js';
import '@goongmaps/goong-js/dist/goong-js.css';
import {getIncidentById } from '../../services/api/incident';

import IncidentDetail from '../../components/officer/IncidentDetail';
import { 
  Flame, Car, Ambulance, Shield, Waves, Zap, AlertTriangle,
  Trash2, CarFront, Swords, Pickaxe, Eye, HelpCircle, RefreshCw
} from 'lucide-react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getOfficePolygon, type OfficerPolygon } from '../../services/api/map';

// Define incident interface based on actual API response
interface Incident {
  id: string;
  username?: string;
  type: string;
  subCategory: string;
  priorityLevel: string;
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
  const [incidents, ] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [showIncidentDetail, setShowIncidentDetail] = useState(false);
  const [loadingIncidentDetail, setLoadingIncidentDetail] = useState(false);

  const [officerPolygons, setOfficerPolygons] = useState<OfficerPolygon[]>([]);
  const [showOfficerBoundaries, setShowOfficerBoundaries] = useState(true);
  const [officerReports, setOfficerReports] = useState<any[]>([]);
  const [showOfficerReports, setShowOfficerReports] = useState(true);
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'quarter'>('week');

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any | null>(null);
  const markersRef = useRef<any[]>([]);
  const officerPolygonLayersRef = useRef<string[]>([]);

  // Fly to a report's location on the map
  const flyToReport = (report: any) => {
    if (mapRef.current && report.lng && report.lat) {
      mapRef.current.flyTo({
        center: [report.lng, report.lat],
        zoom: 18, // A bit closer zoom
        speed: 1.5,
        curve: 1,
        easing(t: number) {
          return t;
        }
      });
    }
  };

  // Helper function to show incident detail
  const showIncidentDetailModal = async (incident: Incident) => {
    console.log('🔴 showIncidentDetailModal called with incident:', incident);
    try {
      console.log('🔧 Setting loadingIncidentDetail to true');
      setLoadingIncidentDetail(true);
      console.log('🔧 Setting showIncidentDetail to true');
      setShowIncidentDetail(true);
      
      // Fetch complete incident details from API
      const apiData = await getIncidentById(incident.id);
      
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
  };

  // Helper function to show report detail modal
  const showReportDetailModal = async (report: any) => {
    console.log('🔵 showReportDetailModal called with report:', report);
    try {
      setLoadingIncidentDetail(true);
      setShowIncidentDetail(true);
      
      // Transform report data to format expected by IncidentDetail component
      const transformedData = {
        id: report.id,
        title: report.type || report.subCategory || 'Báo cáo',
        description: `Báo cáo ${report.type || report.subCategory} tại ${report.address}`,
        location: report.address || '',
        reportedDate: report.occurredAt ? new Date(report.occurredAt).toLocaleDateString('vi-VN') : '',
        reporter: 'Người dân',
        status: report.status || 'Đang xử lý',
        lat: report.lat,
        lng: report.lng,
        category: report.type || report.subCategory || 'Khác',
        evidence: [],
        updates: [],
        assignedOfficer: '',
        estimatedResolution: '',
        relatedIncidents: [],
        attachments: [],
        communeName: '',
        occurredAt: report.occurredAt ? new Date(report.occurredAt).toLocaleDateString('vi-VN') : ''
      };
      
      console.log('🔧 Transformed report data for IncidentDetail:', transformedData);
      setSelectedIncident(transformedData);
    } catch (error) {
      console.error('❌ Error showing report details:', error);
      setNotification({
        show: true,
        message: "Lỗi khi hiển thị chi tiết báo cáo",
        type: "error"
      });
      setShowIncidentDetail(false);
    } finally {
      setLoadingIncidentDetail(false);
    }
  };





  // Update markers when incidents change
  useEffect(() => {
    if (mapRef.current && incidents.length > 0) {
      addIncidentMarkers(mapRef.current);
    }
  }, [incidents]);

  // Update officer report markers when they change or when the toggle is switched
  useEffect(() => {
    if (mapRef.current && showOfficerReports && officerReports.length > 0) {
      addOfficerReportMarkers(mapRef.current);
    } else {
      // If reports are hidden or empty, clear only the report markers
      // This assumes you have a way to distinguish report markers from incident markers
      // For now, we clear all markers if the toggle is off, which is the current behavior of addOfficerReportMarkers
      if (!showOfficerReports) {
        clearMarkers();
      }
    }
  }, [officerReports, showOfficerReports, mapRef.current]);
  // Fetch incidents data

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
  const basePath = '/assets/';
  const imageIcons: { [key: string]: { icon: string; color: string; bgColor: string } } = {
    'giao thông': { icon: `${basePath}traffic.png`, color: '#1d4ed8', bgColor: '#eff6ff' },
    'an ninh': { icon: `${basePath}security.png`, color: '#991b1b', bgColor: '#fef2f2' },
    'môi trường': { icon: `${basePath}environment.png`, color: '#15803d', bgColor: '#f0fdf4' },
    'cơ sở hạ tầng': { icon: `${basePath}infrastructure.png`, color: '#b45309', bgColor: '#fffbeb' },
    'khác': { icon: `${basePath}other.png`, color: '#4b5563', bgColor: '#f9fafb' },
  };

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
    'other': { IconComponent: HelpCircle, color: '#374151', bgColor: '#f9fafb' },
    'default': { IconComponent: AlertTriangle, color: '#374151', bgColor: '#f9fafb' }
  };

  const lowerType = type.toLowerCase();

  if (imageIcons[lowerType]) {
    return imageIcons[lowerType];
  }

  const config = iconComponents[lowerType] || iconComponents.default;
  return {
    icon: renderIconToSvg(config.IconComponent),
    color: config.color,
    bgColor: config.bgColor
  };
};

// Create marker for incident
const createIncidentMarker = (incident: Incident, map: any) => {
  const config = getMarkerConfig(incident.type);
  
  const el = document.createElement('div');
  el.className = 'incident-marker';

  if (config.icon.startsWith('/assets/')) {
    el.style.width = '36px';
    el.style.height = '36px';
    el.style.backgroundImage = `url(${config.icon})`;
    el.style.backgroundSize = 'contain';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundPosition = 'center';
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
  el.style.zIndex = '40';
  el.style.transform = 'translate(-50%, -50%)';
  el.style.pointerEvents = 'auto';
    
    // Add click event for popup
    el.addEventListener('click', () => {
      showIncidentDetailModal(incident);
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
    
    
    markersRef.current.forEach((marker) => {
      const element = marker.getElement();
      if (element) {
        // Show markers at all zoom levels for debugging
        element.style.display = 'flex';
      } 
    });
    
  };

  // Fetch incidents when component mounts
 

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
      zoom: 12, 
      center: [106.62965000, 10.82302000],
    });

    mapRef.current = map;

    // Load initial data when map is ready
    map.on('load', () => {
      fetchOfficerPolygons();
    });

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

  // Fetch officer polygons from API
  const fetchOfficerPolygons = async () => {
    try {
      console.log(`🔄 Fetching officer polygons for ${timePeriod}...`);
      setLoading(true);
      const polygons = await getOfficePolygon(timePeriod);
      console.log('📊 Officer polygons fetched:', polygons);
      setOfficerPolygons(polygons.polygons);
      
      // Extract all reports from polygons
      const allReports = polygons.polygons.flatMap(polygon => polygon.reports || []);
      console.log('📍 Officer reports extracted:', allReports);
      setOfficerReports(allReports);
      
      if (polygons.polygons.length > 0) {
        setNotification({
          show: true,
          message: `Đã tải ${polygons.polygons.length} khu vực phân công và ${allReports.length} báo cáo`,
          type: "success"
        });
      }
    } catch (error) {
      console.error('❌ Error fetching officer polygons:', error);
      setOfficerPolygons([]);
      setOfficerReports([]);
      setNotification({
        show: true,
        message: "Lỗi khi tải ranh giới phân công",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add officer polygon boundaries to map
  const addOfficerPolygons = (map: any) => {
    // Check if map is ready
    if (!map || !map.loaded()) {
      setTimeout(() => {
        if (map && map.loaded()) {
          addOfficerPolygons(map);
        }
      }, 40);
      return;
    }

    // Clear existing officer polygon layers
    officerPolygonLayersRef.current.forEach(layerId => {
      try {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
      } catch (e) {
        // Silently handle cleanup errors
      }
    });
    
    // Clear sources
    for (let i = 0; i < 100; i++) {
      try {
        if (map.getSource(`officer-polygon-${i}`)) map.removeSource(`officer-polygon-${i}`);
        if (map.getSource(`officer-label-${i}`)) map.removeSource(`officer-label-${i}`);
      } catch (e) {
        // Source doesn't exist, continue
      }
    }
    
    officerPolygonLayersRef.current = [];

    if (!showOfficerBoundaries || !officerPolygons.length) {
      return;
    }

    let successCount = 0;

    officerPolygons.forEach((polygon, index) => {
      // Skip if no coordinates
      if (!polygon.coordinates || !Array.isArray(polygon.coordinates)) {
        console.warn(`⚠️ No coordinates for polygon ${polygon.name}`);
        return;
      }

      const sourceId = `officer-polygon-${index}`;
      const labelSourceId = `officer-label-${index}`;
      const layerId = `officer-layer-${index}`;
      const borderLayerId = `officer-border-${index}`;
      const labelLayerId = `officer-label-${index}`;
      
      try {
        // Create GeoJSON from MultiPolygon coordinates
        const geoJsonData = {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'MultiPolygon',
              coordinates: polygon.coordinates
            },
            properties: {
              name: polygon.name,
              id: polygon.id,
              reportCount: polygon.reports.length
            }
          }]
        };
        
        // Add polygon source
        map.addSource(sourceId, {
          type: 'geojson',
          data: geoJsonData
        });
        
        // Add fill layer with blue color for officer areas
        console.log(`🎨 Adding officer fill layer ${layerId}`);
        map.addLayer({
          id: layerId,
          type: 'fill',
          source: sourceId,
          layout: {
            'visibility': 'visible'
          },
          paint: {
            'fill-color': '#3b82f6', // blue color for officer areas
            'fill-opacity': 0.3
          },
          minzoom: 10 // Show at lower zoom levels
        });
        console.log(`✅ Officer fill layer ${layerId} added successfully`);
        
        // Add border layer
        console.log(`🔲 Adding officer border layer ${borderLayerId}`);
        map.addLayer({
          id: borderLayerId,
          type: 'line',
          source: sourceId,
          layout: {
            'visibility': 'visible'
          },
          paint: {
            'line-color': '#1d4ed8', // darker blue for border
            'line-width': 2
          },
          minzoom: 10
        });
        console.log(`✅ Officer border layer ${borderLayerId} added successfully`);
        
        // Calculate center point for label from MultiPolygon
        const bounds = new goongjs.LngLatBounds();
        // For MultiPolygon, coordinates[0] is the first polygon, coordinates[0][0] is the outer ring
        polygon.coordinates[0][0].forEach((coord: number[]) => {
          if (coord.length >= 2) {
            bounds.extend([coord[0], coord[1]] as [number, number]);
          }
        });
        const center = bounds.getCenter();
        
        // Add label
        console.log(`🏷️ Adding label for ${polygon.name} at center:`, [center.lng, center.lat]);
        
        const labelGeoJson = {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [center.lng, center.lat]
            },
            properties: {
              name: polygon.name,
              reportCount: polygon.reports.length
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
            'text-field': `${polygon.name}\n(${polygon.reports.length} báo cáo)`,
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
          minzoom: 12
        });
        
        // Add click event for polygon info
        map.on('click', layerId, (e: any) => {
          const properties = e.features[0].properties;
          setNotification({
            show: true,
            message: `Khu vực: ${properties.name} - ${properties.reportCount} báo cáo`,
            type: "info"
          });
        });
        
        // Change cursor on hover
        map.on('mouseenter', layerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        
        map.on('mouseleave', layerId, () => {
          map.getCanvas().style.cursor = '';
        });
        
        officerPolygonLayersRef.current.push(layerId, borderLayerId, labelLayerId);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Error adding officer polygon ${polygon.name}:`, error);
      }
    });
    
    console.log(`✅ Successfully added ${successCount}/${officerPolygons.length} officer polygons to map`);
  };

  // Add officer reports as markers to map
  const addOfficerReportMarkers = (map: any) => {
    if (!map || !map.loaded() || !showOfficerReports || !officerReports.length) {
      return;
    }

    console.log(`📍 Adding ${officerReports.length} officer report markers to map`);

    // Do not clear all markers, just the ones related to officer reports if we decide to separate them.
    // For now, we assume we want to show EITHER incidents OR officer reports from polygons, so clearing is ok.
    clearMarkers();

    officerReports.forEach((report) => {
      if (!report.lat || !report.lng) {
        console.warn(`⚠️ No coordinates for report ${report.id}`);
        return;
      }

      try {
        // Use the same marker creation logic as incidents for consistency
        const config = getMarkerConfig(report.type || report.subCategory || 'default');
        
        const el = document.createElement('div');
        el.className = 'incident-marker'; // Use same class for consistent styling
        if (config.icon.startsWith('/assets/')) {
          el.style.width = '36px';
          el.style.height = '36px';
          el.style.backgroundImage = `url(${config.icon})`;
          el.style.backgroundSize = 'contain';
          el.style.backgroundRepeat = 'no-repeat';
          el.style.backgroundPosition = 'center';
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
        el.style.zIndex = '40';
        el.style.transform = 'translate(-50%, -50%)';
        el.style.pointerEvents = 'auto';

        // Add click event to show report details in a modal
        el.addEventListener('click', () => {
          showReportDetailModal(report);
        });

        // Create the marker
        const marker = new goongjs.Marker({
          element: el,
          anchor: 'center',
          offset: [0, 0]
        })
          .setLngLat([report.lng, report.lat])
          .addTo(map);

        markersRef.current.push(marker);
      } catch (error) {
        console.error(`❌ Error adding marker for report ${report.id}:`, error);
      }
    });

    console.log(`✅ Successfully added ${markersRef.current.length} officer report markers`);
  };

  // Update officer polygon visibility
  useEffect(() => {
    if (mapRef.current && officerPolygons.length > 0) {
      addOfficerPolygons(mapRef.current);
    }
  }, [officerPolygons, showOfficerBoundaries]);

  // Update officer report markers visibility
  useEffect(() => {
    if (mapRef.current && officerReports.length > 0 && showOfficerReports) {
      addOfficerReportMarkers(mapRef.current);
    } else if (mapRef.current && !showOfficerReports) {
      // Clear markers when hiding reports
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    }
  }, [officerReports, showOfficerReports]);

  // Refetch officer polygons when time period changes
  useEffect(() => {
    if (mapRef.current && mapRef.current.loaded()) {
      fetchOfficerPolygons();
    }
  }, [timePeriod]);

  return (
    <>
      <NotificationBar
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification(n => ({ ...n, show: false }))}
      />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 flex flex-col p-6 gap-6">
            {/* Page Title & Controls */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bản đồ trực tuyến</h1>
                <p className="text-gray-600 mt-1">Xem các báo cáo và khu vực được phân công</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowOfficerBoundaries(!showOfficerBoundaries)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showOfficerBoundaries
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {showOfficerBoundaries ? 'Ẩn ranh giới' : 'Hiện ranh giới'}
                </button>
                <button
                  onClick={() => setShowOfficerReports(!showOfficerReports)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showOfficerReports
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {showOfficerReports ? 'Ẩn báo cáo' : 'Hiện báo cáo'}
                </button>
                <select
                  id="time-period"
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value as 'week' | 'month' | 'quarter')}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="week">Tuần</option>
                  <option value="month">Tháng</option>
                  <option value="quarter">Quý</option>
                </select>
                <button
                  onClick={fetchOfficerPolygons}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 disabled:bg-indigo-300 flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Làm mới
                </button>
              </div>
            </div>

            <div className="flex flex-row gap-4">
              {/* Map Container */}
              <div ref={mapContainer} className="h-[70vh] w-3/5 rounded-lg shadow-md" />

              {/* Officer Reports Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden w-2/5">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-lg">Báo cáo trong khu vực</h3>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 450px)' }}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                      
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Xem</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {officerReports.map((report) => (
                        <tr key={report.id} onClick={() => flyToReport(report)} className="cursor-pointer hover:bg-gray-50">
                          
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.type || report.subCategory}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${report.status === 'Mới' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(report.occurredAt).toLocaleString('vi-VN')}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button onClick={(e) => { e.stopPropagation(); showReportDetailModal(report); }} className="text-indigo-600 hover:text-indigo-900">Xem</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            </main>
          </div>
        </div>
      {showIncidentDetail && (
        <IncidentDetail
          loading={loadingIncidentDetail}
          onClose={closeIncidentDetail}
          incident={selectedIncident}
        />
      )}
    </>
  );
};

export default LiveMap;
