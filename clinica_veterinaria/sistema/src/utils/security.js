const crypto = require('crypto');

function getKey() {
  const value = process.env.CPF_ENCRYPTION_KEY || '';
  if (!/^[a-fA-F0-9]{64}$/.test(value)) {
    throw new Error('CPF_ENCRYPTION_KEY deve conter exatamente 64 caracteres hexadecimais.');
  }
  return Buffer.from(value, 'hex');
}

function encryptCPF(cpf) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(cpf.replace(/\D/g, ''), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

function decryptCPF(value) {
  const raw = Buffer.from(value, 'base64');
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const data = raw.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

function verifyPassword(password, stored) {
  try {
    const [algorithm, salt64, hash64] = stored.split('$');
    if (algorithm !== 'scrypt') return false;
    const salt = Buffer.from(salt64, 'base64');
    const expected = Buffer.from(hash64, 'base64');
    const actual = crypto.scryptSync(password, salt, expected.length);
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function validCPF(cpf) {
  const n = String(cpf).replace(/\D/g, '');
  if (n.length !== 11 || /^(\d)\1{10}$/.test(n)) return false;
  const calc = (base, factor) => {
    let sum = 0;
    for (const digit of base) sum += Number(digit) * factor--;
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(n.slice(0, 9), 10) === Number(n[9]) &&
         calc(n.slice(0, 10), 11) === Number(n[10]);
}

module.exports = { encryptCPF, decryptCPF, hashPassword, verifyPassword, validCPF };
