import axios from 'axios';


// Define the structure for the API response
export interface OfficerPolygonResponse {
  polygon: string; // JSON string containing GeoJSON FeatureCollection
  reports: OfficerReport[];
}

export interface OfficerReport {
  id: string;
  communeId: number;
  type: string;
  subCategory: string;
  address: string;
  lat: number;
  lng: number;
  occurredAt: string;
  status: string;
}

// GeoJSON interfaces
export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  bbox?: number[];
  features: GeoJSONFeature[];
}

export interface GeoJSONFeature {
  type: "Feature";
  properties: {
    id: number;
    name: string;
  };
  geometry: {
    type: "MultiPolygon" | "Point";
    coordinates: any; // Can be MultiPolygon coordinates or Point coordinates
  };
  bbox?: number[];
}

export interface OfficerPolygon {
  id: number;
  name: string;
  coordinates: any; // Can be MultiPolygon or other types
  reports: OfficerReport[];
}

export interface OfficerMapData {
  polygons: OfficerPolygon[];
  centerPoint?: { lat: number; lng: number };
}

/**
 * Fetches the polygons and a center point for the currently authenticated officer.
 * @param range - Time range for filtering reports: 'week', 'month', or 'quarter'
 */
export const getOfficePolygon = async (range?: 'week' | 'month' | 'quarter'): Promise<OfficerMapData> => {
  try {
    const params = range ? { range } : {};
    const response = await axios.get<OfficerPolygonResponse>(API_ENDPOINTS.MAP.OFFICER_POLYGON, {
      headers: getAuthHeaders(),
      params,
    });

    const geoJsonData: GeoJSONFeatureCollection = JSON.parse(response.data.polygon);

    // Find the center point feature
    const pointFeature = geoJsonData.features.find(
      feature => feature.geometry.type === 'Point'
    );

        let centerPoint: { lat: number; lng: number } | undefined = undefined;
    if (pointFeature && pointFeature.geometry.type === 'Point') {
      centerPoint = { 
        lng: pointFeature.geometry.coordinates[0], 
        lat: pointFeature.geometry.coordinates[1] 
      };
    }



    // Extract MultiPolygon features for drawing
    const polygonFeatures = geoJsonData.features.filter(
      feature => feature.geometry.type === 'MultiPolygon'
    );

    // Convert to OfficerPolygon format
    const polygons: OfficerPolygon[] = polygonFeatures.map(feature => ({
      id: feature.properties.id,
      name: feature.properties.name,
      coordinates: feature.geometry.coordinates,
      reports: response.data.reports.filter(report => report.communeId === feature.properties.id),
    }));

    return { polygons, centerPoint };
  } catch (error) {
    console.error('Error fetching officer polygons:', error);
    throw error;
  }
};
import { API_ENDPOINTS } from '../../constants/api';

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getCommuneData = async () => {
  const response = await axios.get(API_ENDPOINTS.MAP.COMMUNE_DATA, {
    headers: getAuthHeaders(),
  });
  return response.data;
};
export const getOfficerReports = async () => {
  const response = await axios.get(API_ENDPOINTS.MAP.OFFICER_REPORTS, {
    headers: getAuthHeaders(),
  });
  return response.data;
};
export const getAdminReports = async (communeId?: string, timePeriod?: string) => {
  const url = communeId 
    ? `${API_ENDPOINTS.MAP.ADMIN_REPORTS}/details?communeId=${communeId}`
    : API_ENDPOINTS.MAP.ADMIN_REPORTS;
  
  const response = await axios.get(url, {
    headers: getAuthHeaders(),
    params: {
      range:timePeriod
    }
  });
  return response.data;
};


