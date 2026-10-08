import 'dotenv/config'
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';

export interface StorageProvider {
  upload(data: Buffer, ext: string): Promise<{ key: string; url: string }>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}
const dir = path.resolve(process.env.UPLOAD_DIR ?? 'uploads');
const base = () => (process.env.BACKEND_URL ?? `http://localhost:${process.env.PORT ?? 4000}`).replace(/\/$/, '');

class LocalStorage implements StorageProvider {
  getUrl(key: string) { return `${base()}/files/${key}`; }
  async upload(data: Buffer, ext: string) {
    const key = `${crypto.randomUUID()}${ext}`;
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, key), data);
    return { key, url: this.getUrl(key) };
  }
  async delete(key: string) { await fs.rm(path.join(dir, path.basename(key)), { force: true }); }
}

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg', '.bmp', '.tiff']);

class CloudinaryStorage implements StorageProvider {
  private folder = process.env.CLOUDINARY_FOLDER ?? '';

  constructor() {
    // CLOUDINARY_URL set ho to auto-config; warna 3 vars se
    if (!process.env.CLOUDINARY_URL) {
      const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        throw new Error('Cloudinary env missing: set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET');
      }
      cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
        secure: true,
      });
    } else {
      cloudinary.config({ secure: true });
    }
  }

  // key = "<folder>/<uuid><ext>" -> images: public_id without ext, raw files: public_id with ext
  private parse(key: string) {
    const ext = path.extname(key).toLowerCase();
    const isImage = IMAGE_EXTS.has(ext);
    const publicId = isImage ? key.slice(0, -ext.length) : key;
    return { ext, isImage, publicId };
  }

  getUrl(key: string) {
    const { ext, isImage, publicId } = this.parse(key);
    return cloudinary.url(publicId, {
      resource_type: isImage ? 'image' : 'raw',
      format: isImage ? ext.slice(1) : undefined,
      secure: true,
    });
  }

  async upload(data: Buffer, ext: string) {
    const id = crypto.randomUUID();
    const isImage = IMAGE_EXTS.has(ext.toLowerCase());
    const publicId = this.folder ? `${this.folder}/${id}` : id;
    const key = `${publicId}${ext}`;

    await new Promise<void>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            public_id: isImage ? publicId : key, // raw files me ext public_id ka part hota hai
            resource_type: isImage ? 'image' : 'raw',
            overwrite: false,
          },
          (err) => (err ? reject(err) : resolve()),
        )
        .end(data);
    });

    return { key, url: this.getUrl(key) };
  }

  async delete(key: string) {
    const { isImage, publicId } = this.parse(key);
    await cloudinary.uploader.destroy(publicId, {
      resource_type: isImage ? 'image' : 'raw',
      invalidate: true,
    });
  }
}

export function getStorage(): StorageProvider {
  const p = process.env.STORAGE_PROVIDER ?? 'local';
  if (p === 'local') return new LocalStorage();
  if (p === 'cloudinary') return new CloudinaryStorage();
  throw new Error(`Storage provider "${p}" is not implemented`);
}
export const uploadDir = dir;