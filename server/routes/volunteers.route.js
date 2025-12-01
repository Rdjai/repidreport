// routes/volunteer.route.js
import express from 'express';
import {
    register,
    login,
    getProfile,
    updateAvailability,
    updateLocation,
    getNearby,
    acceptSOS
} from '../Controllers/volunteer.controller.js';
import { authenticate } from '../Middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/nearby', getNearby); // For users to find nearby volunteers

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/availability', authenticate, updateAvailability);
router.put('/location', authenticate, updateLocation);
router.post('/accept-sos', authenticate, acceptSOS);

export default router;