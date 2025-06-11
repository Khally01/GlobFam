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