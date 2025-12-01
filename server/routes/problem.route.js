// routes/problem.route.js
import express from 'express';
import {
    createProblem,
    getProblems,
    getProblemById,
    upvoteProblem,
    addComment,
    updateProblemStatus,
    getNearbyProblems
} from '../Controllers/problem.controller.js';
import { upload } from '../services/FileService.js';
import { authenticate } from '../Middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getProblems);
router.get('/nearby', getNearbyProblems);
router.get('/:id', getProblemById);

router.post(
    '/',
    upload.array('evidence', 5),
    createProblem
);

router.post('/:id/upvote', upvoteProblem);
router.post('/:id/comment', addComment);

router.put('/:id/status', authenticate, updateProblemStatus);

export default router;