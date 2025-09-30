// controllers/upload.controller.js

import path from 'path';
import { s3, BUCKET } from '../config/aws.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * GET /upload
 * render หน้าอัปโหลด
 */

export const renderUploadPage = (req, res) => {
  res.render('upload', { title: 'Upload' });
};

/**
 * PUT /upload/presign
 * สร้าง Presigned PUT URL สำหรับอัปโหลดขึ้น S3
 * expects: query ?filename=...&filetype=...
 */

export const getPresignedPutUrl = async (req, res) => {
  const filename = req.query.filename;
  const filetype = req.query.filetype;

  if (!filename || !filetype) {
    return res.status(400).json({ error: 'filename and filetype required' });
  }

  // ดึง username/อีเมล จาก token (authenticate.js ควรเซ็ต req.user ไว้แล้ว)
  const claims = req.user || {};
  console.log('User claims:', claims);
  // ลองใช้หลายแหล่ง: cognito:username > email > 'anonymous'
  const targetUsername =
    claims.username ||
    claims['cognito:username']  ||
    claims.email ||
    claims.sub ||
    'anonymous';
  console.log('Presign upload for user:', targetUsername);
  const key = `users/${targetUsername}/uploads/${Date.now()}_${path.basename(filename)}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: filetype,
  });

  try {
    // AWS SDK v3
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });
    return res.json({ uploadUrl, key });
  } catch (err) {
    console.error('Failed to create presigned URL:', err);
    return res.status(500).json({ error: 'Failed to create presigned URL' });
  }
};
