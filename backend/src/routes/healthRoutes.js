import { Router } from 'express';

const router = Router();

/**
 * GET /api/health
 * Simple liveness endpoint for the React dashboard to detect the backend.
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'mediatrust-ai-backend',
    timestamp: new Date().toISOString(),
  });
});

export default router;
