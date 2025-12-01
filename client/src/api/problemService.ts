// services/problemService.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export interface ProblemFilters {
    sort?: 'recent' | 'top' | 'urgent';
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
    lat?: number;
    lng?: number;
    radius?: number;
}

export const problemService = {
    // Get all problems with filters
    getProblems: async (filters: ProblemFilters = {}) => {
        const params = new URLSearchParams();

        if (filters.sort) params.append('sort', filters.sort);
        if (filters.category && filters.category !== 'all') params.append('category', filters.category);
        if (filters.status && filters.status !== 'all') params.append('status', filters.status);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());

        const response = await api.get(`/problems?${params.toString()}`);
        return response.data;
    },

    // Get nearby problems
    getNearbyProblems: async (lat: number, lng: number, radius: number = 10) => {
        const response = await api.get(`/problems/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
        return response.data;
    },

    // Get single problem by ID
    getProblemById: async (id: string) => {
        const response = await api.get(`/problems/${id}`);
        return response.data;
    },

    // Create new problem
    createProblem: async (problemData: FormData) => {
        const response = await api.post('/problems/create', problemData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Upvote problem (no downvote endpoint exists)
    upvoteProblem: async (id: string) => {
        const userId = localStorage.getItem('userId') || `user-${Date.now()}`;
        const response = await api.post(`/problems/${id}/upvote`, { userId });
        return response.data;
    },

    // Add comment to problem
    addComment: async (problemId: string, comment: string) => {
        const response = await api.post(`/problems/${problemId}/comment`, {
            comment,
            userId: localStorage.getItem('userId') || 'anonymous'
        });
        return response.data;
    },

    // Update problem status (requires authentication)
    updateProblemStatus: async (problemId: string, status: string) => {
        const response = await api.put(`/problems/${problemId}/status`, { status });
        return response.data;
    },

    // Since you don't have a downvote endpoint, we need to adjust the voting logic
    voteProblem: async (id: string, voteType: 'upvote' | 'downvote') => {
        if (voteType === 'upvote') {
            return await problemService.upvoteProblem(id);
        } else {
            // Since there's no downvote endpoint, we might need to handle this differently
            // Option 1: Use a different endpoint if available
            // Option 2: Implement toggle voting (remove upvote)
            // For now, we'll just log an error
            throw new Error('Downvote endpoint not available');
        }
    },

    // Report problem (if endpoint exists, otherwise mock)
    reportProblem: async (problemId: string, reason: string) => {
        try {
            // If you have a report endpoint, use it:
            // const response = await api.post(`/problems/${problemId}/report`, { reason });
            // return response.data;

            // For now, just log and return success
            console.log(`Reporting problem ${problemId}: ${reason}`);
            return { success: true, message: 'Problem reported successfully' };
        } catch (error) {
            console.error('Error reporting problem:', error);
            return { success: false, message: 'Failed to report problem' };
        }
    },
};

export default problemService;