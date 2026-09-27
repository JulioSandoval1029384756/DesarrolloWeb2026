export const config = {
  puerto: process.env.PORT ?? 3000,
  db: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
};

if (!config.jwtSecret) {
  // En desarrollo local puedes definirlo aquí, pero en producción SIEMPRE en .env
  config.jwtSecret = 'secreto-de-desarrollo-cambia-esto';
}
