import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/api';

export interface BlogAuthor {
  id: string;
  fullName: string;
  avatar?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  color?: string;
}

export interface BlogModeration {
  id: number;
  blogId: number;
  isApproved: boolean;
  politeness: boolean;
  nonToxic: boolean;
  positiveMeaning: boolean;
  typeRequirement: boolean;
  reasoning: string;
  violationsJson: string[];
  createdAt: string;
}

export interface Blog {
  id: number;
  title: string;
  content: string;
  type: string;
  authorName: string;
  createdAt: string;
  mediaUrls?: string[];
  blogModeration?: BlogModeration;
  // Optional fields that might be present
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  reportCount?: number;
  updatedAt?: string;
  publishedAt?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isPinned?: boolean;
  description?: string;
  thumbnail?: string;
  tags?: string[];
  // Legacy fields for backward compatibility
  author?: BlogAuthor;
  category?: BlogCategory;
}

export interface BlogUpdateData {
  title?: string;
  content?: string;
  description?: string;
  thumbnail?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isPinned?: boolean;
  categoryId?: string;
  tags?: string[];
}

export interface BlogCreateOfficerData {
  title: string;
  content: string;
  type: string;
  communeId: number;
  mediaFiles?: File[];
}

export const getBlog = async () => {
    const response = await axios.get(API_ENDPOINTS.BLOG.BASE);
    return response.data;
};

export const getBlogById = async (id: string) => {
    const response = await axios.get(API_ENDPOINTS.BLOG.BY_ID(id));
    return response.data;
};

export const updateBlog = async (id: string, data: BlogUpdateData) => {
    const response = await axios.put(API_ENDPOINTS.BLOG.UPDATE(id), data);
    return response.data;
};

export const createBlog = async (data: Omit<BlogUpdateData, 'id'>) => {
    const response = await axios.post(API_ENDPOINTS.BLOG.CREATE, data);
    return response.data;
};

export const getBlogByOfficer = async () => {
    const response = await axios.get(API_ENDPOINTS.BLOG.GET_OFFICER);
    return response.data;
};

export const getBlogByIdOfficer = async (id: string) => {
    const response = await axios.get(API_ENDPOINTS.BLOG.GET_OFFICER_BY_ID(id));
    return response.data;
};

export const approveBlog = async (id: string, isApproved?: boolean, isPinned?: boolean) => {
    const params = new URLSearchParams();
    if (isApproved !== undefined) params.append('isApproved', isApproved.toString());
    if (isPinned !== undefined) params.append('isPinned', isPinned.toString());
    
    const url = `${API_ENDPOINTS.BLOG.APPROVE(id)}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await axios.patch(url, {}, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const createBlogOfficer = async (data: BlogCreateOfficerData) => {
    const formData = new FormData();
    
    // Append required fields
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('type', data.type);
    formData.append('communeId', data.communeId.toString());
    
    // Append media files if they exist
    if (data.mediaFiles && data.mediaFiles.length > 0) {
        data.mediaFiles.forEach((file) => {
            formData.append('mediaFiles', file);
        });
    }
    
    const response = await axios.post(API_ENDPOINTS.BLOG.CREATE_OFFICER, formData, {
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
