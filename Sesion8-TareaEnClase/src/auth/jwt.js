import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function firmarToken(payload, expiresIn = '1h') {
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
}

export function verificarToken(token) {
  return jwt.verify(token, config.jwtSecret);
}
