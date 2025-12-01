// src/services/crimePin.service.js
import { CrimePin } from '../models/CrimePin.model.js';
import { hashIp } from '../utils/ipUtils.js';
import { reverseGeocode } from '../utils/geocoding.js';
import { logger } from '../utils/logger.js';

// Rate limiting check
export const checkRateLimit = async (ip) => {
    if (!ip) return true;

    const ipHash = hashIp(ip);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentReports = await CrimePin.countDocuments({
        ipHash,
        createdAt: { $gte: oneHourAgo }
    });

    return recentReports < 10;
};

// Create crime pin
export const createCrimePin = async (data, clientIp = null) => {
    try {
        // Rate limiting check
        if (clientIp) {
            const canReport = await checkRateLimit(clientIp);
            if (!canReport) {
                throw new Error('Rate limit exceeded. Please try again later.');
            }
        }

        // Get address from coordinates
        if (!data.location.address || data.location.address === 'Location not specified') {
            data.location.address = await reverseGeocode(
                data.location.lat,
                data.location.lng
            );
        }

        const crimePin = new CrimePin({
            ...data,
            ipHash: clientIp ? hashIp(clientIp) : null
        });

        await crimePin.save();
        logger.info(`New crime pin created: ${crimePin._id}`);
        return crimePin;
    } catch (error) {
        logger.error(`Error creating crime pin: ${error.message}`);
        throw error;
    }
};

// Get crime pins with filters
export const getCrimePins = async (filters = {}) => {
    try {
        const {
            lat,
            lng,
            radius = 10,
            crimeType,
            minRating,
            maxRating,
            status = 'active',
            page = 1,
            limit = 50,
            sortBy = 'recent'
        } = filters;

        let query = { status };

        // Location-based query
        if (lat && lng && radius) {
            const radiusInRadians = parseFloat(radius) / 6378.1;
            query.location = {
                $geoWithin: {
                    $centerSphere: [
                        [parseFloat(lng), parseFloat(lat)],
                        radiusInRadians
                    ]
                }
            };
        }

        // Crime type filter
        if (crimeType && crimeType !== 'all') {
            query.crimeType = crimeType;
        }

        // Rating range filter
        if (minRating || maxRating) {
            query.rating = {};
            if (minRating) query.rating.$gte = parseInt(minRating);
            if (maxRating) query.rating.$lte = parseInt(maxRating);
        }

        // Sort options
        let sort = {};
        switch (sortBy) {
            case 'recent':
                sort.createdAt = -1;
                break;
            case 'top':
                sort.upvotes = -1;
                break;
            case 'urgent':
                sort.rating = -1;
                break;
            default:
                sort.createdAt = -1;
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Get total count
        const total = await CrimePin.countDocuments(query);

        // Get pins
        const data = await CrimePin.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limitNum);

        return {
            data,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
                hasMore: pageNum < Math.ceil(total / limitNum)
            }
        };
    } catch (error) {
        logger.error(`Error fetching crime pins: ${error.message}`);
        throw error;
    }
};

// Get single crime pin
export const getCrimePinById = async (id) => {
    try {
        const crimePin = await CrimePin.findById(id);

        if (!crimePin) {
            throw new Error('Crime report not found');
        }

        return crimePin;
    } catch (error) {
        logger.error(`Error fetching crime pin ${id}: ${error.message}`);
        throw error;
    }
};

// Update crime pin
export const updateCrimePin = async (id, updateData) => {
    try {
        const crimePin = await CrimePin.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!crimePin) {
            throw new Error('Crime report not found');
        }

        logger.info(`Crime pin updated: ${id}`);
        return crimePin;
    } catch (error) {
        logger.error(`Error updating crime pin ${id}: ${error.message}`);
        throw error;
    }
};

// Delete crime pin
export const deleteCrimePin = async (id) => {
    try {
        const crimePin = await CrimePin.findByIdAndDelete(id);

        if (!crimePin) {
            throw new Error('Crime report not found');
        }

        logger.info(`Crime pin deleted: ${id}`);
        return { message: 'Crime report deleted successfully' };
    } catch (error) {
        logger.error(`Error deleting crime pin ${id}: ${error.message}`);
        throw error;
    }
};

// Vote on crime pin
export const voteOnCrimePin = async (id, voteType) => {
    try {
        const update = voteType === 'upvote'
            ? { $inc: { upvotes: 1 } }
            : { $inc: { downvotes: 1 } };

        const crimePin = await CrimePin.findByIdAndUpdate(
            id,
            update,
            { new: true }
        );

        if (!crimePin) {
            throw new Error('Crime report not found');
        }

        logger.info(`Vote recorded on crime pin ${id}: ${voteType}`);
        return crimePin;
    } catch (error) {
        logger.error(`Error voting on crime pin ${id}: ${error.message}`);
        throw error;
    }
};

// Add comment
export const addComment = async (id, commentText) => {
    try {
        const crimePin = await CrimePin.findById(id);

        if (!crimePin) {
            throw new Error('Crime report not found');
        }

        crimePin.comments.push({
            text: commentText
        });

        await crimePin.save();
        logger.info(`Comment added to crime pin ${id}`);
        return crimePin.comments[crimePin.comments.length - 1];
    } catch (error) {
        logger.error(`Error adding comment to crime pin ${id}: ${error.message}`);
        throw error;
    }
};

// Get area statistics
export const getAreaStats = async (lat, lng, radius = 5) => {
    try {
        return await CrimePin.getAreaStats(lat, lng, radius);
    } catch (error) {
        logger.error(`Error getting area stats: ${error.message}`);
        throw error;
    }
};

// Get heatmap data
export const getHeatmapData = async (lat, lng, radius = 10) => {
    try {
        const crimePins = await CrimePin.findByLocation(lat, lng, radius);

        const heatmapData = crimePins.map(pin => ({
            lat: pin.location.lat,
            lng: pin.location.lng,
            intensity: pin.rating,
            crimeType: pin.crimeType
        }));

        return heatmapData;
    } catch (error) {
        logger.error(`Error getting heatmap data: ${error.message}`);
        throw error;
    }
};