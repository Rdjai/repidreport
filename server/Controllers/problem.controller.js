// controllers/ProblemController.js
import Problem from '../models/Problem.js';
import { uploadFile } from '../services/FileService.js';

export const createProblem = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            location,
            userId,
            userInfo,
            severity
        } = req.body;

        const files = req.files || [];

        const evidence = [];
        for (const file of files) {
            const uploadedFile = await uploadFile(file);
            evidence.push({
                url: uploadedFile.url,
                type: file.mimetype.startsWith('image/') ? 'image' :
                    file.mimetype.startsWith('video/') ? 'video' : 'document',
                filename: file.originalname
            });
        }

        const problem = new Problem({
            title,
            description,
            category: category || 'Other',
            location: location ? JSON.parse(location) : null,
            userId,
            userInfo: userInfo ? JSON.parse(userInfo) : null,
            severity: severity || 'medium',
            evidence,
            status: 'open'
        });

        await problem.save();

        res.status(201).json({
            success: true,
            message: 'Problem reported successfully',
            data: problem
        });
    } catch (error) {
        console.error('Create problem error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all problems with sorting and filtering
export const getProblems = async (req, res) => {
    try {
        const {
            sort = 'recent',
            category,
            status = 'open',
            page = 1,
            limit = 10
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build query
        const query = {};
        if (category && category !== 'all') query.category = category;
        if (status && status !== 'all') query.status = status;

        // Build sort
        let sortQuery = {};
        if (sort === 'top') {
            sortQuery = { upvotes: -1, createdAt: -1 };
        } else if (sort === 'recent') {
            sortQuery = { createdAt: -1 };
        } else if (sort === 'urgent') {
            sortQuery = { severity: -1, createdAt: -1 };
        }

        const problems = await Problem.find(query)
            .populate('assignedTo', 'name phone skills rating')
            .sort(sortQuery)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Problem.countDocuments(query);

        res.json({
            success: true,
            data: problems,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get problems error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get problem by ID
export const getProblemById = async (req, res) => {
    try {
        const { id } = req.params;

        const problem = await Problem.findById(id)
            .populate('assignedTo', 'name phone skills rating');

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        res.json({
            success: true,
            data: problem
        });
    } catch (error) {
        console.error('Get problem by ID error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Upvote a problem
export const upvoteProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        const problem = await Problem.findById(id);
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        // Check if user already voted
        const hasVoted = problem.voters.includes(userId);

        if (hasVoted) {
            // Remove vote
            problem.upvotes -= 1;
            problem.voters = problem.voters.filter(voter => voter !== userId);
        } else {
            // Add vote
            problem.upvotes += 1;
            problem.voters.push(userId);
        }

        await problem.save();

        res.json({
            success: true,
            message: hasVoted ? 'Vote removed' : 'Problem upvoted',
            data: {
                upvotes: problem.upvotes,
                hasVoted: !hasVoted
            }
        });
    } catch (error) {
        console.error('Upvote problem error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Add comment to problem
export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, userInfo, text } = req.body;

        const problem = await Problem.findById(id);
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        problem.comments.push({
            userId,
            userInfo: JSON.parse(userInfo),
            text
        });

        await problem.save();

        res.json({
            success: true,
            message: 'Comment added successfully',
            data: problem.comments[problem.comments.length - 1]
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update problem status (for volunteers/admins)
export const updateProblemStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, volunteerId } = req.body;

        const updateData = { status };

        if (status === 'in_progress' && volunteerId) {
            updateData.assignedTo = volunteerId;
            updateData.assignedAt = new Date();
        } else if (status === 'resolved') {
            updateData.resolvedAt = new Date();
        }

        const problem = await Problem.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('assignedTo', 'name phone skills rating');

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        res.json({
            success: true,
            message: `Problem status updated to ${status}`,
            data: problem
        });
    } catch (error) {
        console.error('Update problem status error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get nearby problems
export const getNearbyProblems = async (req, res) => {
    try {
        const { lat, lng, maxDistance = 5000 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const problems = await Problem.find({
            status: 'open',
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(maxDistance)
                }
            }
        })
            .sort({ severity: -1, createdAt: -1 })
            .limit(20);

        res.json({
            success: true,
            data: problems
        });
    } catch (error) {
        console.error('Get nearby problems error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};