// controllers/gallery.controller.js
import { s3 } from '../config/aws.js';
import { ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const renderOwnGallery = async (req, res) => {
  // ดึง username จาก path param หรือ req.user
  const username = req.params.username || req.user?.['cognito:username'] || req.user?.username || req.user?.email || req.user?.sub || 'anonymous';
  const prefix = `users/${username}/uploads/`;

  try {
    // List objects in user's S3 folder
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: prefix,
    });
    const data = await s3.send(listCommand);
    const files = data.Contents || [];
    // สร้าง presigned URL สำหรับแต่ละไฟล์
    const posts = await Promise.all(
      files.map(async (file, idx) => {
        const getCmd = new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: file.Key,
        });
        const imageUrl = await getSignedUrl(s3, getCmd, { expiresIn: 60 * 5 });
        return {
          id: idx,
          imageUrl,
          caption: null, // สามารถเพิ่ม logic ดึง caption จาก metadata ได้ถ้ามี
        };
      })
    );
    res.render('owngallery', { username, posts });
  } catch (err) {
    console.error('Error loading gallery:', err);
    res.status(500).send('Error loading gallery');
  }
};

export const renderFeedGallery = async (req, res) => {
  // ตัวอย่าง: ดึงไฟล์ทั้งหมดจากทุก user (อาจจะต้องมีการจัดการ pagination หรือจำกัดจำนวน)
  const prefix = `users/`;
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: prefix,
    });
    const data = await s3.send(listCommand);
    const files = data.Contents || [];  
    const posts = await Promise.all(
      files.map(async (file, idx) => {
        const getCmd = new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: file.Key,
        });
        const imageUrl = await getSignedUrl(s3, getCmd, { expiresIn: 60 * 5 });
        return {
          id: idx,
          imageUrl,
          caption: null,
        };
      })
    );
    res.render('feed', { posts });
  } catch (err) {
    console.error('Error loading feed:', err);
    res.status(500).send('Error loading feed');
  }
};