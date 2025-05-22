import crypto from 'crypto';
import config from '../config/config';
import logger from '../logs/logger';

const key = Buffer.from(config.key); // 32 bytes     

export function encrypt(data) {
  const iv = crypto.randomBytes(config.iv);
  const cipher = crypto.createCipheriv(config.algoritm, key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');

  logger.info('DATA ENCRYPTADA CORRECTAMENTE');
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted
  };
}

export function decrypt(encryptedData, ivHex) {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  logger.info('DATA DESENCRYPTADA CORRECTAMENTE');
  return JSON.parse(decrypted);
}