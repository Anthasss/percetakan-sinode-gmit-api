const prisma = require('../lib/prisma');
const s3Client = require('../lib/s3Client');
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const PUBLIC_URL_BASE = process.env.S3_PUBLIC_URL_BASE;

// Upload a new home banner
const uploadHomeBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed' 
      });
    }

    // Generate unique object key
    const fileExtension = req.file.originalname.split('.').pop();
    const objectKey = `home-banners/${crypto.randomUUID()}.${fileExtension}`;

    // Upload to S3
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: objectKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read', // Make the file publicly accessible
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // Generate public URL
    const publicUrl = `${PUBLIC_URL_BASE}/${objectKey}`;

    // Save to database
    const homeBanner = await prisma.homeBanner.create({
      data: {
        objectKey,
        publicUrl,
      },
    });

    res.status(201).json(homeBanner);
  } catch (error) {
    console.error('Error uploading home banner:', error);
    res.status(500).json({ error: 'Failed to upload home banner' });
  }
};

// Get all home banners
const getHomeBanners = async (req, res) => {
  try {
    const homeBanners = await prisma.homeBanner.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json(homeBanners);
  } catch (error) {
    console.error('Error getting home banners:', error);
    res.status(500).json({ error: 'Failed to get home banners' });
  }
};

// Delete a home banner
const deleteHomeBanner = async (req, res) => {
  try {
    const { id } = req.params;

    // Get banner from database
    const homeBanner = await prisma.homeBanner.findUnique({
      where: { id },
    });

    if (!homeBanner) {
      return res.status(404).json({ error: 'Home banner not found' });
    }

    // Delete from S3
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: homeBanner.objectKey,
    };

    try {
      await s3Client.send(new DeleteObjectCommand(deleteParams));
    } catch (s3Error) {
      console.error('Error deleting from S3:', s3Error);
      // Continue to delete from DB even if S3 delete fails
    }

    // Delete from database
    await prisma.homeBanner.delete({
      where: { id },
    });

    res.json({ message: 'Home banner deleted successfully' });
  } catch (error) {
    console.error('Error deleting home banner:', error);
    res.status(500).json({ error: 'Failed to delete home banner' });
  }
};

module.exports = {
  uploadHomeBanner,
  getHomeBanners,
  deleteHomeBanner,
};
