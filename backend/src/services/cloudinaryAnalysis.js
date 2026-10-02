import { cloudinary } from '../config/cloudinary.js';

export async function analyzeImage(publicId) {
  if (!publicId) {
    throw new Error('publicId is required');
  }

  try {
    // Run Amazon Rekognition auto-tagging on the existing image.
    await cloudinary.api.update(publicId, {
      categorization: 'aws_rek_tagging',
      auto_tagging: 0.7,
    });

    // Fetch the updated Cloudinary resource.
    const result = await cloudinary.api.resource(publicId, {
      resource_type: 'image',
      type: 'upload',
      context: true,
      metadata: true,
      with_field: 'aws_rek_tagging',
    });

    return {
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      tags: result.tags || [],
      rekognition:
        result.info?.categorization?.aws_rek_tagging?.data || [],
      context: result.context || {},
      metadata: result.metadata || {},
    };
  } catch (error) {
    throw new Error(
      error?.message || 'Cloudinary media analysis failed'
    );
  }
}
