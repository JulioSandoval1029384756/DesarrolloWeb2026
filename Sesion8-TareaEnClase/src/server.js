import jwt from 'jsonwebtoken';
import { crearApp } from './app.js';
import { config } from './config.js';
import { conectar, sequelize } from './db/sequelize.js';
import { Curso } from './models/Curso.js';
import { Usuario } from './models/Usuario.js';
import { SequelizeCursosRepository } from './repositories/SequelizeCursosRepository.js';
import { SequelizeUsuariosRepository } from './repositories/SequelizeUsuariosRepository.js';
import { crearSessionPostgres } from './sessionStore.js';

await conectar();
await sequelize.sync({ alter: true }); // en producción: usar migraciones

const repo = new SequelizeCursosRepository(Curso);
const usuariosRepo = new SequelizeUsuariosRepository(Usuario);

// Punto 5: session store en Postgres (sobrevive a "node src/server.js" reiniciado)
const app = crearApp({ repo, usuariosRepo, sessionMiddleware: crearSessionPostgres() });

app.listen(config.puerto, () => {
  console.log(`🚀 Servidor arriba en http://localhost:${config.puerto}`);

  // Solo para pruebas rápidas: genera un token válido para el POST /cursos
  const tokenDemo = jwt.sign({ sub: 'demo' }, config.jwtSecret, { expiresIn: '1h' });
  console.log('🔑 Token de prueba (Bearer):', tokenDemo);
});
