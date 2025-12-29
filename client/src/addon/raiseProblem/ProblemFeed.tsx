// components/problems/ProblemFeed.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    ThumbsUp, ThumbsDown, MessageCircle, MapPin,
    Clock, AlertTriangle, Filter, Share2, Eye,
    User, Flag, MessageSquare, Loader, TrendingUp,
    AlertCircle, Map as MapIcon, LogIn, WifiOff,
    RefreshCw, Image as ImageIcon, Video, File,
    X, ExternalLink, Download, ChevronRight, Globe,
    Phone, Mail, Calendar, Heart, Bookmark,
    CheckCircle, AlertOctagon, BarChart,
    Users, Tag, Hash, Award, Star, Crown, Shield
} from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow, format } from 'date-fns';

interface Problem {
    _id: string;
    title: string;
    description: string;
    category: string;
    location?: {
        lat: number;
        lng: number;
        address: string;
    };
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    evidence: Array<{
        url: string;
        type: 'image' | 'video' | 'document';
        filename: string;
    }>;
    upvotes: number;
    downvotes: number;
    voters: {
        upvotes: string[];
        downvotes: string[];
    };
    comments: Array<{
        _id: string;
        text: string;
        userId: string;
        userName: string;
        userAvatar?: string;
        createdAt: string;
        upvotes: number;
    }>;
    userInfo: {
        _id: string;
        name: string;
        email?: string;
        avatar?: string;
        role?: string;
        reputation?: number;
    };
    createdAt: string;
    updatedAt: string;
    views: number;
    distance?: number;
    hasUpvoted?: boolean;
    hasDownvoted?: boolean;
    tags?: string[];
    priority?: number;
    assignedTo?: {
        _id: string;
        name: string;
        department?: string;
    };
    estimatedResolutionDate?: string;
    budgetAllocated?: number;
    progressUpdates?: Array<{
        date: string;
        update: string;
        updatedBy: string;
    }>;
}

// Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://repidreport-zynl.onrender.com/api';

export const ProblemFeed: React.FC = () => {
    // State
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'recent' | 'top' | 'urgent'>('recent');
    const [category, setCategory] = useState('all');
    const [status, setStatus] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [voting, setVoting] = useState<string | null>(null);
    const [user, setUser] = useState<{ id: string; name: string; email: string; avatar?: string } | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [usingMockData, setUsingMockData] = useState(false);
    const [newComment, setNewComment] = useState('');

    // Initialize user from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Error parsing stored user:', error);
            }
        }
    }, []);

    // Categories
    const categories = [
        { id: 'all', name: 'All Categories', icon: '📋', color: 'gray' },
        { id: 'Infrastructure', name: 'Infrastructure', icon: '🏗️', color: 'blue' },
        { id: 'Safety', name: 'Safety', icon: '🛡️', color: 'red' },
        { id: 'Health', name: 'Health', icon: '🏥', color: 'green' },
        { id: 'Environment', name: 'Environment', icon: '🌿', color: 'emerald' },
        { id: 'Transport', name: 'Transport', icon: '🚗', color: 'purple' },
        { id: 'Education', name: 'Education', icon: '🎓', color: 'yellow' },
        { id: 'Other', name: 'Other', icon: '📌', color: 'gray' }
    ];

    // Statuses
    const statuses = [
        { id: 'all', name: 'All Status', color: 'gray', bgColor: 'bg-gray-100' },
        { id: 'open', name: 'Open', color: 'green', bgColor: 'bg-green-100' },
        { id: 'in_progress', name: 'In Progress', color: 'blue', bgColor: 'bg-blue-100' },
        { id: 'resolved', name: 'Resolved', color: 'purple', bgColor: 'bg-purple-100' },
        { id: 'closed', name: 'Closed', color: 'gray', bgColor: 'bg-gray-100' }
    ];

    // Severity levels
    const severities = [
        { id: 'low', name: 'Low', color: 'green', icon: '🟢' },
        { id: 'medium', name: 'Medium', color: 'yellow', icon: '🟡' },
        { id: 'high', name: 'High', color: 'orange', icon: '🟠' },
        { id: 'critical', name: 'Critical', color: 'red', icon: '🔴' }
    ];

    // Mock data for when API is unavailable
    const getMockProblems = (): Problem[] => [
        {
            _id: '1',
            title: 'Potholes on Main Street',
            description: 'Multiple large potholes causing traffic hazards and vehicle damage. Need immediate repair before accidents happen. This has been an ongoing issue for the past 2 months and several complaints have been filed.',
            category: 'Infrastructure',
            location: {
                lat: 23.256065,
                lng: 77.481972,
                address: 'Main Street, City Center, Bhopal, Madhya Pradesh'
            },
            severity: 'high',
            status: 'open',
            evidence: [
                { url: 'https://images.unsplash.com/photo-1542223616-740d5dff7f56?w=800&auto=format&fit=crop', type: 'image', filename: 'pothole1.jpg' },
                { url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w-800&auto=format&fit=crop', type: 'image', filename: 'pothole2.jpg' },
                { url: '/uploads/sample.pdf', type: 'document', filename: 'damage_report.pdf' }
            ],
            upvotes: 42,
            downvotes: 2,
            voters: { upvotes: [], downvotes: [] },
            comments: [
                {
                    _id: 'c1',
                    text: 'This is really dangerous! My car got damaged last week. The local authorities should take immediate action.',
                    userId: 'user1',
                    userName: 'John Doe',
                    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
                    createdAt: new Date(Date.now() - 86400000).toISOString(),
                    upvotes: 12
                },
                {
                    _id: 'c2',
                    text: 'I\'ve reported this issue multiple times but no action taken yet. Need more people to upvote this to get attention.',
                    userId: 'user2',
                    userName: 'Jane Smith',
                    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
                    createdAt: new Date(Date.now() - 172800000).toISOString(),
                    upvotes: 8
                }
            ],
            userInfo: {
                _id: 'u1',
                name: 'Rajesh Kumar',
                email: 'rajesh@example.com',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
                role: 'Community Leader',
                reputation: 2450
            },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            updatedAt: new Date().toISOString(),
            views: 156,
            distance: 0.5,
            tags: ['Road Safety', 'Vehicle Damage', 'Urgent'],
            priority: 1,
            assignedTo: {
                _id: 'a1',
                name: 'Municipal Corporation',
                department: 'Road Maintenance'
            },
            estimatedResolutionDate: '2024-02-15T00:00:00.000Z',
            budgetAllocated: 50000,
            progressUpdates: [
                {
                    date: '2024-01-15T10:30:00.000Z',
                    update: 'Issue logged and assigned to road maintenance department',
                    updatedBy: 'System Admin'
                },
                {
                    date: '2024-01-18T14:20:00.000Z',
                    update: 'Site inspection completed. Estimate prepared.',
                    updatedBy: 'Site Inspector'
                }
            ]
        },
        {
            _id: '2',
            title: 'Broken Street Lights',
            description: 'Street lights not working in the park area, making it unsafe at night for pedestrians and children playing. This has led to multiple incidents of theft and harassment after dark.',
            category: 'Safety',
            location: {
                lat: 23.258065,
                lng: 77.483972,
                address: 'City Park Area, Near Playground, Bhopal'
            },
            severity: 'medium',
            status: 'in_progress',
            evidence: [
                { url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&auto=format&fit=crop', type: 'image', filename: 'lights.jpg' },
                { url: '/uploads/video.mp4', type: 'video', filename: 'night_view.mp4' }
            ],
            upvotes: 28,
            downvotes: 1,
            voters: { upvotes: [], downvotes: [] },
            comments: [
                {
                    _id: 'c3',
                    text: 'My daughter is scared to walk through the park after 6 PM. Please fix this soon!',
                    userId: 'user3',
                    userName: 'Priya Sharma',
                    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
                    createdAt: new Date(Date.now() - 259200000).toISOString(),
                    upvotes: 15
                }
            ],
            userInfo: {
                _id: 'u2',
                name: 'Amit Patel',
                email: 'amit@example.com',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit',
                role: 'Local Resident',
                reputation: 1200
            },
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date().toISOString(),
            views: 89,
            distance: 1.2,
            tags: ['Public Safety', 'Women Safety', 'Children'],
            priority: 2,
            assignedTo: {
                _id: 'a2',
                name: 'Electricity Department',
                department: 'Public Lighting'
            },
            estimatedResolutionDate: '2024-01-25T00:00:00.000Z',
            budgetAllocated: 25000
        }
    ];

    // Main fetch function - SIMPLIFIED
    const fetchProblems = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('Fetching problems...');

            // Build API endpoint and parameters - SIMPLIFIED: just fetch all problems
            const params = new URLSearchParams();
            params.append('sort', sortBy);
            if (category !== 'all') params.append('category', category);
            if (status !== 'all') params.append('status', status);
            params.append('limit', '20'); // Fixed limit

            const response = await axios.get(`${API_BASE_URL}/problem?${params.toString()}`, {
                timeout: 10000
            });

            console.log('API Response received successfully');

            // Process response
            let problemsData: Problem[] = [];

            if (response.data.data) {
                problemsData = response.data.data;
            } else if (Array.isArray(response.data)) {
                problemsData = response.data;
            } else if (response.data.problems) {
                problemsData = response.data.problems;
            }

            const problemsWithVotes = problemsData.map((problem: Problem) => ({
                ...problem,
                hasUpvoted: user ? problem.voters?.upvotes?.includes(user.id) : false,
                hasDownvoted: user ? problem.voters?.downvotes?.includes(user.id) : false
            }));

            setProblems(problemsWithVotes);
            setUsingMockData(false);

        } catch (error: any) {
            console.error('Error fetching problems:', error);

            // Use mock data as fallback
            setUsingMockData(true);
            const mockProblems = getMockProblems();
            setProblems(mockProblems);
            setError('Using demo data. Backend API is currently unavailable.');
        } finally {
            setLoading(false);
        }
    }, [sortBy, category, status, user]);

    // Initial fetch - only once
    useEffect(() => {
        fetchProblems();
    }, []); // Empty array means run once on mount

    // Fetch when filters change
    useEffect(() => {
        // Don't run on initial mount
        if (!loading && problems.length > 0) {
            const timer = setTimeout(() => {
                fetchProblems();
            }, 500); // Debounce filter changes

            return () => clearTimeout(timer);
        }
    }, [sortBy, category, status]); // Only re-fetch when these change

    // Handle vote
    const handleVote = async (problemId: string, voteType: 'upvote' | 'downvote') => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        try {
            setVoting(problemId);
            const problem = problems.find(p => p._id === problemId);
            if (!problem) return;

            // Optimistic update
            setProblems(prev => prev.map(p => {
                if (p._id !== problemId) return p;

                const hasUpvoted = p.hasUpvoted || false;
                const hasDownvoted = p.hasDownvoted || false;

                let newUpvotes = p.upvotes || 0;
                let newDownvotes = p.downvotes || 0;
                let newHasUpvoted = hasUpvoted;
                let newHasDownvoted = hasDownvoted;

                if (voteType === 'upvote') {
                    if (hasUpvoted) {
                        // Remove upvote
                        newUpvotes = Math.max(0, newUpvotes - 1);
                        newHasUpvoted = false;
                    } else {
                        // Add upvote
                        newUpvotes += 1;
                        newHasUpvoted = true;
                        // Remove downvote if exists
                        if (hasDownvoted) {
                            newDownvotes = Math.max(0, newDownvotes - 1);
                            newHasDownvoted = false;
                        }
                    }
                } else {
                    if (hasDownvoted) {
                        // Remove downvote
                        newDownvotes = Math.max(0, newDownvotes - 1);
                        newHasDownvoted = false;
                    } else {
                        // Add downvote
                        newDownvotes += 1;
                        newHasDownvoted = true;
                        // Remove upvote if exists
                        if (hasUpvoted) {
                            newUpvotes = Math.max(0, newUpvotes - 1);
                            newHasUpvoted = false;
                        }
                    }
                }

                return {
                    ...p,
                    upvotes: newUpvotes,
                    downvotes: newDownvotes,
                    hasUpvoted: newHasUpvoted,
                    hasDownvoted: newHasDownvoted
                };
            }));

        } catch (error: any) {
            console.error(`Error ${voteType}:`, error);
        } finally {
            setVoting(null);
        }
    };

    // Handle login
    const handleLogin = () => {
        const mockUser = {
            id: `user-${Date.now()}`,
            name: 'Demo User',
            email: 'demo@example.com',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'
        };
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        setShowLoginModal(false);
        alert('Logged in as Demo User');
    };

    // Handle logout
    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
        alert('Logged out successfully');
    };

    // Manual refresh
    const handleRefresh = () => {
        fetchProblems();
    };

    // Handle card click to show details
    const handleCardClick = (problem: Problem) => {
        setSelectedProblem(problem);
        setShowDetailsModal(true);
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    };

    // Handle modal close
    const handleCloseModal = () => {
        setShowDetailsModal(false);
        setSelectedProblem(null);
        document.body.style.overflow = 'auto';
    };

    // Handle add comment in modal
    const handleAddComment = async () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        if (!newComment.trim() || !selectedProblem) return;

        const newCommentObj = {
            _id: `comment-${Date.now()}`,
            text: newComment.trim(),
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar,
            createdAt: new Date().toISOString(),
            upvotes: 0
        };

        // Update selected problem
        setSelectedProblem(prev => prev ? {
            ...prev,
            comments: [...(prev.comments || []), newCommentObj]
        } : prev);

        // Update in problems list
        setProblems(prev => prev.map(p => {
            if (p._id === selectedProblem._id) {
                return {
                    ...p,
                    comments: [...(p.comments || []), newCommentObj]
                };
            }
            return p;
        }));

        setNewComment('');
    };

    // Handle comment vote
    const handleCommentVote = (commentId: string) => {
        if (!selectedProblem) return;

        const updatedComments = selectedProblem.comments.map(comment => {
            if (comment._id === commentId) {
                return {
                    ...comment,
                    upvotes: (comment.upvotes || 0) + 1
                };
            }
            return comment;
        });

        setSelectedProblem({
            ...selectedProblem,
            comments: updatedComments
        });
    };

    // Helper functions
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-500 text-white';
            case 'high': return 'bg-orange-500 text-white';
            case 'medium': return 'bg-yellow-500 text-gray-800';
            case 'low': return 'bg-green-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return '🔴';
            case 'high': return '🟠';
            case 'medium': return '🟡';
            case 'low': return '🟢';
            default: return '⚪';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-green-100 text-green-800 border border-green-200';
            case 'in_progress': return 'bg-blue-100 text-blue-800 border border-blue-200';
            case 'resolved': return 'bg-purple-100 text-purple-800 border border-purple-200';
            case 'closed': return 'bg-gray-100 text-gray-800 border border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open': return '🔓';
            case 'in_progress': return '⚙️';
            case 'resolved': return '✅';
            case 'closed': return '🔒';
            default: return '📋';
        }
    };

    const getCategoryColor = (category: string) => {
        const cat = categories.find(c => c.id === category);
        return cat ? `bg-${cat.color}-100 text-${cat.color}-800 border border-${cat.color}-200` : 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch {
            return 'Recently';
        }
    };

    const formatFullDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'PPP pp');
        } catch {
            return 'Date not available';
        }
    };

    const getEvidenceIcon = (type: string) => {
        switch (type) {
            case 'image': return <ImageIcon className="text-blue-500" size={20} />;
            case 'video': return <Video className="text-red-500" size={20} />;
            default: return <File className="text-gray-500" size={20} />;
        }
    };

    // Loading skeleton
    if (loading && problems.length === 0) {
        return (
            <div className="max-w-6xl mx-auto p-4">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-lg shadow-md p-4">
                                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                                <div className="flex justify-between">
                                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Login Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                <LogIn className="text-red-500" size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Login Required
                            </h3>
                            <p className="text-gray-600">
                                You need to login to perform this action.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={handleLogin}
                                className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all font-medium"
                            >
                                Continue as Demo User
                            </button>
                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Problem Details Modal */}
            {showDetailsModal && selectedProblem && (
                <div className="fixed inset-0  bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8 relative">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-2xl p-6 z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1 pr-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        {selectedProblem.title}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProblem.status)}`}>
                                            {getStatusIcon(selectedProblem.status)} {selectedProblem.status.replace('_', ' ')}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(selectedProblem.severity)}`}>
                                            {getSeverityIcon(selectedProblem.severity)} {selectedProblem.severity.toUpperCase()}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedProblem.category)}`}>
                                            {selectedProblem.category}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column - Main Content */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Description */}
                                    <div className="bg-gray-50 rounded-xl p-5">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                            <MessageSquare className="mr-2 text-blue-500" size={20} />
                                            Description
                                        </h3>
                                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                            {selectedProblem.description}
                                        </p>
                                    </div>

                                    {/* Evidence */}
                                    {selectedProblem.evidence && selectedProblem.evidence.length > 0 && (
                                        <div className="bg-gray-50 rounded-xl p-5">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                                <AlertTriangle className="mr-2 text-orange-500" size={20} />
                                                Evidence ({selectedProblem.evidence.length})
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {selectedProblem.evidence.map((evidence, index) => (
                                                    <a
                                                        key={index}
                                                        href={evidence.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group relative block bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 transition-colors"
                                                    >
                                                        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                            {getEvidenceIcon(evidence.type)}
                                                        </div>
                                                        <div className="p-3">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm font-medium text-gray-700 truncate">
                                                                    {evidence.filename}
                                                                </span>
                                                                <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-500" />
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {evidence.type.toUpperCase()}
                                                            </p>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Progress Updates */}
                                    {selectedProblem.progressUpdates && selectedProblem.progressUpdates.length > 0 && (
                                        <div className="bg-gray-50 rounded-xl p-5">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                                <BarChart className="mr-2 text-green-500" size={20} />
                                                Progress Updates
                                            </h3>
                                            <div className="space-y-4">
                                                {selectedProblem.progressUpdates.map((update, index) => (
                                                    <div key={index} className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <p className="text-gray-700">{update.update}</p>
                                                            <span className="text-sm text-gray-500 whitespace-nowrap ml-2">
                                                                {formatDate(update.date)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600">Updated by: {update.updatedBy}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Comments Section */}
                                    <div className="bg-gray-50 rounded-xl p-5">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                            <Users className="mr-2 text-purple-500" size={20} />
                                            Comments ({selectedProblem.comments?.length || 0})
                                        </h3>

                                        {/* Add Comment */}
                                        <div className="mb-6">
                                            <div className="flex gap-3">
                                                {user?.avatar ? (
                                                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <User className="text-blue-500" size={20} />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <textarea
                                                        value={newComment}
                                                        onChange={(e) => setNewComment(e.target.value)}
                                                        placeholder="Add your comment..."
                                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                        rows={3}
                                                    />
                                                    <div className="flex justify-end mt-2">
                                                        <button
                                                            onClick={handleAddComment}
                                                            disabled={!newComment.trim()}
                                                            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            Post Comment
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Comments List */}
                                        <div className="space-y-4">
                                            {selectedProblem.comments?.map(comment => (
                                                <div key={comment._id} className="bg-white rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-3">
                                                            {comment.userAvatar ? (
                                                                <img src={comment.userAvatar} alt={comment.userName} className="w-8 h-8 rounded-full" />
                                                            ) : (
                                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                                    <User size={16} className="text-gray-500" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <h4 className="font-medium text-gray-900">{comment.userName}</h4>
                                                                <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleCommentVote(comment._id)}
                                                            className="flex items-center gap-1 text-gray-500 hover:text-red-500"
                                                        >
                                                            <Heart size={16} />
                                                            <span className="text-sm">{comment.upvotes || 0}</span>
                                                        </button>
                                                    </div>
                                                    <p className="text-gray-700 ml-11">{comment.text}</p>
                                                </div>
                                            ))}

                                            {(!selectedProblem.comments || selectedProblem.comments.length === 0) && (
                                                <div className="text-center py-8 text-gray-500">
                                                    <MessageCircle className="mx-auto mb-2" size={24} />
                                                    <p>No comments yet. Be the first to comment!</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Sidebar Info */}
                                <div className="space-y-6">
                                    {/* Reporter Info */}
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                            <User className="mr-2 text-blue-500" size={20} />
                                            Reported By
                                        </h3>
                                        <div className="flex items-center gap-3 mb-4">
                                            {selectedProblem.userInfo?.avatar ? (
                                                <img src={selectedProblem.userInfo.avatar} alt={selectedProblem.userInfo.name} className="w-12 h-12 rounded-full" />
                                            ) : (
                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User className="text-blue-500" size={24} />
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="font-bold text-gray-900">{selectedProblem.userInfo?.name || 'Anonymous'}</h4>
                                                {selectedProblem.userInfo?.role && (
                                                    <p className="text-sm text-gray-600">{selectedProblem.userInfo.role}</p>
                                                )}
                                                {selectedProblem.userInfo?.reputation && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Award size={14} className="text-yellow-500" />
                                                        <span className="text-xs font-medium">{selectedProblem.userInfo.reputation} points</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Reported {formatFullDate(selectedProblem.createdAt)}
                                        </p>
                                    </div>

                                    {/* Location Info */}
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                            <MapPin className="mr-2 text-green-500" size={20} />
                                            Location
                                        </h3>
                                        <div className="flex items-start gap-2 mb-3">
                                            <MapPin className="text-green-600 mt-1 flex-shrink-0" size={16} />
                                            <p className="text-gray-700">{selectedProblem.location?.address || 'Location not specified'}</p>
                                        </div>
                                        {selectedProblem.distance && (
                                            <p className="text-sm text-gray-600 flex items-center">
                                                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                {selectedProblem.distance.toFixed(1)} km away from you
                                            </p>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                            <BarChart className="mr-2 text-purple-500" size={20} />
                                            Statistics
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-white rounded-lg p-3 text-center">
                                                <div className="text-2xl font-bold text-green-600">{selectedProblem.upvotes || 0}</div>
                                                <div className="text-xs text-gray-600">Upvotes</div>
                                            </div>
                                            <div className="bg-white rounded-lg p-3 text-center">
                                                <div className="text-2xl font-bold text-red-600">{selectedProblem.downvotes || 0}</div>
                                                <div className="text-xs text-gray-600">Downvotes</div>
                                            </div>
                                            <div className="bg-white rounded-lg p-3 text-center">
                                                <div className="text-2xl font-bold text-blue-600">{selectedProblem.comments?.length || 0}</div>
                                                <div className="text-xs text-gray-600">Comments</div>
                                            </div>
                                            <div className="bg-white rounded-lg p-3 text-center">
                                                <div className="text-2xl font-bold text-orange-600">{selectedProblem.views || 0}</div>
                                                <div className="text-xs text-gray-600">Views</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                            <Tag className="mr-2 text-yellow-500" size={20} />
                                            Additional Information
                                        </h3>
                                        <div className="space-y-3">
                                            {/* Tags */}
                                            {selectedProblem.tags && selectedProblem.tags.length > 0 && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 mb-2">Tags:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedProblem.tags.map((tag, index) => (
                                                            <span key={index} className="px-2 py-1 bg-white text-gray-700 rounded-full text-xs border border-gray-300">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Assigned To */}
                                            {selectedProblem.assignedTo && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 mb-1">Assigned To:</p>
                                                    <p className="text-gray-900 font-medium">{selectedProblem.assignedTo.name}</p>
                                                    {selectedProblem.assignedTo.department && (
                                                        <p className="text-sm text-gray-600">{selectedProblem.assignedTo.department}</p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Estimated Resolution */}
                                            {selectedProblem.estimatedResolutionDate && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 mb-1">Estimated Resolution:</p>
                                                    <p className="text-gray-900 font-medium">{format(new Date(selectedProblem.estimatedResolutionDate), 'PPP')}</p>
                                                </div>
                                            )}

                                            {/* Budget */}
                                            {selectedProblem.budgetAllocated && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 mb-1">Budget Allocated:</p>
                                                    <p className="text-gray-900 font-medium">₹{selectedProblem.budgetAllocated.toLocaleString()}</p>
                                                </div>
                                            )}

                                            {/* Last Updated */}
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-1">Last Updated:</p>
                                                <p className="text-gray-900">{formatDate(selectedProblem.updatedAt)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="sticky bottom-0 bg-gradient-to-br from-red-50 to-orange-100 rounded-xl p-5">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Actions</h3>
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => handleVote(selectedProblem._id, 'upvote')}
                                                disabled={voting === selectedProblem._id}
                                                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${selectedProblem.hasUpvoted
                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                                                    : 'bg-white border border-gray-300 text-gray-700 hover:border-green-300 hover:text-green-700'
                                                    }`}
                                            >
                                                {voting === selectedProblem._id ? (
                                                    <Loader className="animate-spin" size={20} />
                                                ) : (
                                                    <>
                                                        <ThumbsUp size={20} />
                                                        <span className="font-medium">Upvote ({selectedProblem.upvotes || 0})</span>
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => handleVote(selectedProblem._id, 'downvote')}
                                                disabled={voting === selectedProblem._id}
                                                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${selectedProblem.hasDownvoted
                                                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md'
                                                    : 'bg-white border border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-700'
                                                    }`}
                                            >
                                                {voting === selectedProblem._id ? (
                                                    <Loader className="animate-spin" size={20} />
                                                ) : (
                                                    <>
                                                        <ThumbsDown size={20} />
                                                        <span className="font-medium">Downvote ({selectedProblem.downvotes || 0})</span>
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => navigator.clipboard.writeText(window.location.href)}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:border-blue-300 hover:text-blue-700 transition-all"
                                            >
                                                <Share2 size={20} />
                                                <span className="font-medium">Share</span>
                                            </button>

                                            <button
                                                onClick={() => alert('Reported to admin')}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:border-red-300 hover:text-red-700 transition-all"
                                            >
                                                <Flag size={20} />
                                                <span className="font-medium">Report</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl shadow-lg p-6 mb-8 border border-red-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">
                                Community Problems
                            </h1>
                            <div className="flex items-center gap-2">
                                {usingMockData ? (
                                    <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full shadow-sm">
                                        <WifiOff size={14} className="text-yellow-600" />
                                        <span className="text-sm font-medium text-yellow-700">Demo Mode</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full shadow-sm">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm font-medium text-green-700">Online</span>
                                    </div>
                                )}
                                {user ? (
                                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                                        ) : (
                                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                                <User size={16} className="text-red-500" />
                                            </div>
                                        )}
                                        <span className="text-sm font-medium">{user.name}</span>
                                        <button
                                            onClick={handleLogout}
                                            className="text-xs text-gray-500 hover:text-red-500"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowLoginModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 text-sm font-medium"
                                    >
                                        <LogIn size={16} />
                                        Login to Vote
                                    </button>
                                )}
                            </div>
                        </div>
                        <p className="text-gray-600 mb-2">
                            Report, track, and help solve issues in your community
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center">
                                <TrendingUp size={16} className="mr-1" />
                                {problems.length} issues reported
                            </span>
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="flex items-center gap-1 text-blue-500 hover:text-blue-700 disabled:opacity-50"
                            >
                                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                                {loading ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <Filter size={20} />
                            <span className="font-medium">
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </span>
                        </button>
                        <a
                            href="/report"
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all shadow-md font-medium"
                        >
                            <AlertCircle size={20} />
                            Report a Problem
                        </a>
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Sort By */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Sort By
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    {[
                                        { id: 'recent', label: 'Most Recent', icon: '🕒' },
                                        { id: 'top', label: 'Top Voted', icon: '🔥' },
                                        { id: 'urgent', label: 'Most Urgent', icon: '🚨' }
                                    ].map(option => (
                                        <button
                                            key={option.id}
                                            onClick={() => setSortBy(option.id as any)}
                                            className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${sortBy === option.id
                                                ? 'bg-red-500 text-white shadow-md'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:border-red-300'
                                                }`}
                                        >
                                            <span>{option.icon}</span>
                                            <span className="font-medium">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.icon} {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                >
                                    {statuses.map(st => (
                                        <option key={st.id} value={st.id}>
                                            {getStatusIcon(st.id)} {st.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Reset Filters */}
                        {(category !== 'all' || status !== 'all' || sortBy !== 'recent') && (
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        setCategory('all');
                                        setStatus('all');
                                        setSortBy('recent');
                                    }}
                                    className="text-red-500 hover:text-red-700 font-medium"
                                >
                                    Reset all filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Error/Info Message */}
            {(error || usingMockData) && (
                <div className={`mb-6 p-4 rounded-xl ${usingMockData ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center">
                        {usingMockData ? (
                            <AlertCircle className="text-yellow-500 mr-3" size={24} />
                        ) : (
                            <AlertTriangle className="text-red-500 mr-3" size={24} />
                        )}
                        <div className="flex-1">
                            <p className={`font-medium ${usingMockData ? 'text-yellow-700' : 'text-red-700'}`}>
                                {usingMockData
                                    ? 'Showing demo data. Backend API is currently unavailable.'
                                    : error}
                            </p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className={`px-4 py-2 rounded-lg font-medium ${usingMockData
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                        >
                            {loading ? 'Refreshing...' : 'Retry'}
                        </button>
                    </div>
                </div>
            )}

            {/* Problems Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {problems.map(problem => (
                    <div
                        key={problem._id}
                        onClick={() => handleCardClick(problem)}
                        className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col h-full cursor-pointer"
                    >
                        {/* Problem Header */}
                        <div className="p-5 pb-3">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg text-gray-900 truncate">
                                        {problem.title}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(problem.status)}`}>
                                        {getStatusIcon(problem.status)} {problem.status.replace('_', ' ')}
                                    </span>
                                    <div className={`w-3 h-3 rounded-full ${getSeverityColor(problem.severity)}`}
                                        title={`${problem.severity} severity`}></div>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                {problem.description}
                            </p>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center bg-gray-50 px-2 py-1 rounded-lg">
                                        <MapPin size={12} className="mr-1" />
                                        <span className="truncate max-w-[120px]">
                                            {problem.location?.address || 'Location not specified'}
                                        </span>
                                    </span>
                                    <span className="flex items-center bg-gray-50 px-2 py-1 rounded-lg">
                                        <Clock size={12} className="mr-1" />
                                        {formatDate(problem.createdAt)}
                                    </span>
                                </div>
                                <div className="flex items-center bg-gray-50 px-2 py-1 rounded-lg">
                                    <Eye size={12} className="mr-1" />
                                    <span>{problem.views || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Evidence Preview */}
                        {problem.evidence && problem.evidence.length > 0 && (
                            <div className="px-5 pb-3">
                                <div className="flex items-center text-sm text-gray-600 mb-2">
                                    <AlertTriangle size={14} className="mr-2" />
                                    <span className="font-medium">Evidence ({problem.evidence.length})</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {problem.evidence.slice(0, 3).map((evidence, index) => (
                                        <div
                                            key={index}
                                            className="relative block"
                                        >
                                            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
                                                {getEvidenceIcon(evidence.type)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stats */}
                        <div className="mt-auto px-5 py-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                {/* Voting */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleVote(problem._id, 'upvote');
                                        }}
                                        disabled={voting === problem._id}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${problem.hasUpvoted
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:border-green-300 hover:text-green-700'
                                            } ${!user ? 'opacity-80' : ''}`}
                                        title={!user ? 'Login to vote' : ''}
                                    >
                                        {voting === problem._id ? (
                                            <Loader size={16} className="animate-spin" />
                                        ) : (
                                            <ThumbsUp size={16} />
                                        )}
                                        <span className="font-medium">{problem.upvotes || 0}</span>
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleVote(problem._id, 'downvote');
                                        }}
                                        disabled={voting === problem._id}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${problem.hasDownvoted
                                            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-700'
                                            } ${!user ? 'opacity-80' : ''}`}
                                        title={!user ? 'Login to vote' : ''}
                                    >
                                        {voting === problem._id ? (
                                            <Loader size={16} className="animate-spin" />
                                        ) : (
                                            <ThumbsDown size={16} />
                                        )}
                                        <span className="font-medium">{problem.downvotes || 0}</span>
                                    </button>
                                </div>

                                {/* Click Indicator */}
                                <div className="flex items-center text-sm text-gray-500">
                                    <span className="hidden group-hover:inline">Click to view details</span>
                                    <ChevronRight size={16} className="group-hover:text-blue-500 transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {!loading && problems.length === 0 && (
                <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
                        <AlertTriangle className="text-gray-400" size={48} />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-3">
                        No problems found
                    </h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        {category !== 'all' || status !== 'all'
                            ? 'Try changing your filters or be the first to report an issue in this category!'
                            : 'Be the first to report an issue in your community!'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/report"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all shadow-md font-medium"
                        >
                            <AlertCircle size={20} />
                            Report a Problem
                        </a>
                        {(category !== 'all' || status !== 'all') && (
                            <button
                                onClick={() => {
                                    setCategory('all');
                                    setStatus('all');
                                }}
                                className="inline-flex items-center justify-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProblemFeed;