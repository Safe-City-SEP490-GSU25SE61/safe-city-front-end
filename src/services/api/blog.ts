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
  authorId?: string;
  createdAt: string;
  mediaUrls?: string[];
  blogModeration?: BlogModeration;
  isApproved?: boolean;
  isVisible?: boolean;
  // Optional fields that might be present
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  reportCount?: number;
  updatedAt?: string;
  publishedAt?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  pinned?: boolean;
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
  description?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isPinned?: boolean;
  categoryId?: string;
  tags?: string[];
  mediaUrls?: string[];
  communeId?: number;
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

export const getBlogsByAuthorId = async (authorId: string): Promise<{ data: Blog[] }> => {
    const response = await axios.get(API_ENDPOINTS.BLOG.CITIZEN_BLOG_HISTORY, {
        params: { userId: authorId },
        headers: getAuthHeaders(),
    });
    return response.data;
};

export const approveBlog = async (id: string, isApproved?: boolean, isPinned?: boolean): Promise<any> => {
    console.log(`Faking blog approval for id: ${id}, isApproved: ${isApproved}, isPinned: ${isPinned}`);

    // Simulate API delay
    return new Promise((resolve) => {
        setTimeout(() => {
            // Find the blog in our fake data to update it (optional, but good for consistency)
            // Note: This won't actually persist the change across reloads, it just simulates the action.
            console.log(`Simulated approval for blog ${id} successful.`);
            resolve({ success: true, message: 'Blog status updated successfully' });
        }, 300);
    });
};
export const visibilityBlog = async (id: string, isVisible?: boolean): Promise<any> => {
    console.log(`Faking blog visibility for id: ${id}, isVisible: ${isVisible}`);

    // Simulate API delay
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Simulated visibility change for blog ${id} successful.`);
            resolve({ success: true, message: 'Blog visibility updated successfully' });
        }, 300);
    });
}

    
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
    
    // Append optional fields
    if (data.communeId !== undefined) {
        formData.append('communeId', data.communeId.toString());
    }
    if (data.description) {
        formData.append('description', data.description);
    }
    if (data.status) {
        formData.append('status', data.status);
    }
    if (data.isPinned !== undefined) {
        formData.append('isPinned', data.isPinned.toString());
    }
    if (data.categoryId) {
        formData.append('categoryId', data.categoryId);
    }
    if (data.tags && data.tags.length > 0) {
        data.tags.forEach(tag => formData.append('tags', tag));
    }
    if (data.mediaUrls && data.mediaUrls.length > 0) {
        data.mediaUrls.forEach(url => formData.append('mediaUrls', url));
    }
    
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
