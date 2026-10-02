import { Router } from 'express';
import { REQUIRED_VARS } from '../config/cloudinary.js';

const router = Router();

/**
 * GET /api/cloudinary/status
 *
 * Reports only whether the required Cloudinary environment variables are
 * configured. It deliberately does NOT verify against the Cloudinary API and
 * it never returns any credential values — including the API secret.
 */
router.get('/status', (req, res) => {
  const missing = REQUIRED_VARS.filter((name) => !process.env[name]);

  res.json({
    configured: missing.length === 0,
    // Only which *variable names* are missing — never their values.
    missingVariables: missing,
  });
});

export default router;
