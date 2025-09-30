// src/middlewares/authenticate.js
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const jwt = require('jsonwebtoken');

// ✅ สร้าง verifier สำหรับ Access และ Id Token
const accessVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  clientId: process.env.COGNITO_CLIENT_ID,
  tokenUse: 'access',
});
const idVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  clientId: process.env.COGNITO_CLIENT_ID,
  tokenUse: 'id',
});

// ดึง token จาก HttpOnly cookie หรือ Authorization header
function extractToken(req) {
  if (req.cookies?.access_token) return req.cookies.access_token; // แนะนำให้เก็บไว้ในคุกกี้
  const h = req.headers.authorization || req.headers.Authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7).trim() : null;
}

async function verifyEither(token) {
  try { return await accessVerifier.verify(token); }
  catch { return await idVerifier.verify(token); }
}

// 🔹 ใช้กับ API (ส่ง 401 JSON เมื่อ fail)


async function authenticateCognitoJWT(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    // ใช้ CognitoJwtVerifier เพื่อ verify และ decode claims ที่ถูกต้อง
    let claims;
    try {
      claims = await accessVerifier.verify(token);
    } catch {
      claims = await idVerifier.verify(token);
    }
    req.user = claims;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// 🔹 ใช้กับหน้า EJS (redirect กลับ /login เมื่อ fail)
async function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.redirect('/login?err=signin_required');
  try {
    req.user = await verifyEither(token);
    next();
  } catch {
    return res.redirect('/login?err=invalid_token');
  }
}

// ตัวอย่าง guard เช็ค role จาก cognito:groups
function requireRole(role) {
  return (req, res, next) => {
    const groups = req.user?.['cognito:groups'] || [];
    if (!groups.includes(role)) return res.status(403).send('Forbidden');
    next();
  };
}

module.exports = { authenticateCognitoJWT, requireAuth, requireRole };
