import bcrypt from 'bcrypt';

export async function hashearPassword(passwordPlano) {
  return bcrypt.hash(passwordPlano, 10);
}

export async function verificarPassword(passwordPlano, hash) {
  return bcrypt.compare(passwordPlano, hash);
}
