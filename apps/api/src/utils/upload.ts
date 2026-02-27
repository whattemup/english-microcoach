import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { config } from '../config.js';

// NOTE: In dev we run from repo root, so keep this path stable.
// In production, set UPLOAD_DIR to a writable mounted volume (e.g., /data/uploads).
const uploadDir = path.resolve(process.cwd(), config.uploadDir);
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`)
});

export const upload = multer({
  storage,
  limits: {
    fileSize: config.maxUploadBytes
  },
  fileFilter: (_req, file, cb) => {
    // Accept common audio types used by Expo/React Native recorders.
    const ok = [
      'audio/m4a',
      'audio/mp4',
      'audio/mpeg',
      'audio/wav',
      'audio/x-wav',
      'audio/webm',
      'audio/ogg',
      'application/octet-stream' // some Android recorders
    ].includes(file.mimetype);
    cb(ok ? null : (new Error('Tipo de archivo no soportado') as any), ok);
  }
});
