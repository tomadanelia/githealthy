const crypto = require('crypto');

const ALGO = 'aes-256-gcm'; 

const KEY = crypto.createHash('sha256').update(String(process.env.ENCRYPTION_KEY)).digest();

function encrypt(text) {
  const iv = crypto.randomBytes(12); 
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);

const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
]);

  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${encrypted.toString('hex')}:${tag.toString('hex')}`;
}

function decrypt(text) {
  const parts = text.split(':');
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format');
  }

const [ivHex, contentHex, tagHex] = parts;

  const iv = Buffer.from(ivHex, 'hex');
  const content = Buffer.from(contentHex, 'hex');
const tag = Buffer.from(tagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  
  decipher.setAuthTag(tag);

let decrypted = decipher.update(content);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString('utf8');
}

module.exports = { encrypt, decrypt };