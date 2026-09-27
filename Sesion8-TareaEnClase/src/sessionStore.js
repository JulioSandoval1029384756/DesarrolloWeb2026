import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { config } from './config.js';
import { pool } from './db/pool.js';

// Punto 5 (antes): MemoryStore — se pierde al reiniciar, solo para dev/tests
export function crearSessionMemoria() {
  return session({
    secret: config.sessionSecret ?? 'secreto-de-sesion-dev',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax' },
  });
}

// Punto 5: store en PostgreSQL — sobrevive a reinicios del servidor
export function crearSessionPostgres() {
  const PgStore = connectPgSimple(session);
  return session({
    store: new PgStore({ pool, tableName: 'sesiones', createTableIfMissing: true }),
    secret: config.sessionSecret ?? 'secreto-de-sesion-dev',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax' },
  });
}
