import express from 'express';
import { analyzeImage } from '../services/cloudinaryAnalysis.js';

const router = express.Router();

/**
 * Analyze an existing Cloudinary image.
 *
 * Request:
 * POST /api/analysis/image
 * Body:
 * {
 *   "publicId": "your-cloudinary-public-id"
 * }
 */
router.post('/image', async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({
        error: 'publicId is required',
      });
    }

    const result = await analyzeImage(publicId);

    return res.json({
      success: true,
      analysis: result,
    });
  } catch (error) {
    console.error('Cloudinary analysis error:', error.message);

    return res.status(500).json({
      success: false,
      error: error.message || 'Analysis failed',
    });
  }
});

export default router;