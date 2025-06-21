import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string, 
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateInviteCode = (): string => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Encryption utilities for sensitive data like bank tokens
const algorithm = 'aes-256-gcm';
const secretKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const salt = process.env.ENCRYPTION_SALT || crypto.randomBytes(16).toString('hex');

// Derive key from secret
const key = crypto.scryptSync(secretKey, salt, 32);

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Combine iv, authTag, and encrypted data
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

export function decrypt(encryptedData: string): string {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}