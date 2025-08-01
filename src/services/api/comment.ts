import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/api';

// Comment creation interface
export interface CommentCreateData {
  content: string;
  blogId: string;
}

export const createComment = async (data: CommentCreateData) => {
    const response = await axios.post(API_ENDPOINTS.COMMENT.CREATE, data);
    return response.data;
};
export const getCommentByBlogId = async (id: string) => {
    const response = await axios.get(API_ENDPOINTS.COMMENT.BY_BLOG_ID(id));
    return response.data;
};
