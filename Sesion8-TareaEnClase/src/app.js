import express from 'express';
import { cursosRoutes } from './routes/cursos.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { manejadorErrores } from './middlewares/errores.js';
import { crearSessionMemoria } from './sessionStore.js';

process.on('unhandledRejection', (error) => {
  console.error('Promesa rechazada sin manejar:', error);
});

export function crearApp({ repo, usuariosRepo, sessionMiddleware }) {
  const app = express();
  app.use(express.json());

  // Si no se inyecta un store (ej. en tests), usamos MemoryStore por defecto
  app.use(sessionMiddleware ?? crearSessionMemoria());

  app.use('/cursos', cursosRoutes(repo));
  if (usuariosRepo) app.use('/auth', authRoutes(usuariosRepo));

  app.use(manejadorErrores);
  return app;
}
