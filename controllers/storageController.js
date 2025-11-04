const { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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

/**
 * Upload an image to object storage
 * Body params:
 * - file: the image file (multipart/form-data)
 * - fileName: custom name for the file in storage (required)
 */
const uploadImage = async (req, res) => {
  try {
    const { fileName } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: 'fileName is required',
      });
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    await s3Client.send(command);

    // Construct public URL
    const publicUrl = `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${fileName}`;

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        key: fileName,
        url: publicUrl,
        size: req.file.size,
        contentType: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message,
    });
  }
};

/**
 * Delete an image from object storage
 * URL params:
 * - fileName: the key/name of the file to delete (required)
 */
const deleteImage = async (req, res) => {
  try {
    const { fileName } = req.params;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: 'fileName parameter is required',
      });
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });

    await s3Client.send(command);

    res.json({
      success: true,
      message: 'Image deleted successfully',
      data: {
        key: fileName,
      },
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message,
    });
  }
};

module.exports = {
  getAllImages,
  getImagesByPrefix,
  uploadImage,
  deleteImage,
  upload, // Export multer middleware
};
