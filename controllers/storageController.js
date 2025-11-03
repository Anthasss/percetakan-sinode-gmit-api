const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Configure S3 client for Domainesia Object Storage
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1', // Domainesia uses this region
  endpoint: process.env.S3_ENDPOINT, // e.g., https://s3.domainesia.com
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Required for S3-compatible services
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

/**
 * Get all images from the object storage
 * Optional query params:
 * - maxKeys: maximum number of objects to return (default: 1000)
 * - continuationToken: for pagination
 */
const getAllImages = async (req, res) => {
  try {
    const { maxKeys = 1000, continuationToken } = req.query;

    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: parseInt(maxKeys),
      ContinuationToken: continuationToken || undefined,
    });

    const response = await s3Client.send(command);

    // Map objects to return with public URL
    const images = (response.Contents || []).map((item) => {
      // Construct public URL: endpoint/bucket-name/object-key
      const publicUrl = `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${item.Key}`;
      
      return {
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
        url: publicUrl,
      };
    });

    res.json({
      success: true,
      count: images.length,
      isTruncated: response.IsTruncated,
      nextContinuationToken: response.NextContinuationToken,
      images: images,
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch images',
      error: error.message,
    });
  }
};

/**
 * Get images by prefix
 * URL params:
 * - prefix: the prefix to filter objects (required)
 * Query params:
 * - maxKeys: maximum number of objects to return (default: 1000)
 * - continuationToken: for pagination
 */
const getImagesByPrefix = async (req, res) => {
  try {
    const { prefix } = req.params;
    const { maxKeys = 1000, continuationToken } = req.query;

    if (!prefix) {
      return res.status(400).json({
        success: false,
        message: 'Prefix parameter is required',
      });
    }

    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: parseInt(maxKeys),
      ContinuationToken: continuationToken || undefined,
    });

    const response = await s3Client.send(command);

    // Map objects to return with public URL
    const images = (response.Contents || []).map((item) => {
      // Construct public URL: endpoint/bucket-name/object-key
      const publicUrl = `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${item.Key}`;
      
      return {
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
        url: publicUrl,
      };
    });

    res.json({
      success: true,
      prefix: prefix,
      count: images.length,
      isTruncated: response.IsTruncated,
      nextContinuationToken: response.NextContinuationToken,
      images: images,
    });
  } catch (error) {
    console.error('Error fetching images by prefix:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch images by prefix',
      error: error.message,
    });
  }
};

module.exports = {
  getAllImages,
  getImagesByPrefix,
};
