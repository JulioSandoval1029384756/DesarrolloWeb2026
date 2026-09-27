import { Router } from 'express';
import { body } from 'express-validator';
import { asyncHandler } from '../middlewares/errores.js';
import { revisarErrores } from '../validators/cursoValidator.js';
import { hashearPassword, verificarPassword } from '../auth/passwords.js';
import { firmarToken } from '../auth/jwt.js';

const validarCredenciales = [
  body('email').trim().isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];

export function authRoutes(usuariosRepo) {
  const router = Router();

  // Punto 4: registrar con contraseña hasheada
  router.post(
    '/registro',
    validarCredenciales,
    revisarErrores,
    asyncHandler(async (req, res) => {
      const { email, password } = req.body;
      const hash = await hashearPassword(password);
      const usuario = await usuariosRepo.crear({ email, password: hash });
      res.status(201).json({ id: usuario.id, email: usuario.email });
    }),
  );

  // Punto 4: login que devuelve un JWT
  router.post(
    '/login',
    validarCredenciales,
    revisarErrores,
    asyncHandler(async (req, res) => {
      const { email, password } = req.body;
      const usuario = await usuariosRepo.buscarPorEmail(email);
      if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });

      const coincide = await verificarPassword(password, usuario.password);
      if (!coincide) return res.status(401).json({ error: 'Credenciales inválidas' });

      // Punto 5: además de JWT, dejamos rastro en la sesión (para probar el store)
      req.session.usuarioId = usuario.id;

      const token = firmarToken({ sub: usuario.id });
      res.json({ token });
    }),
  );

  // Punto 5: para comprobar que la sesión sobrevive al reinicio del server
  router.get('/perfil-sesion', (req, res) => {
    if (!req.session.usuarioId) {
      return res.status(401).json({ error: 'No hay sesión activa' });
    }
    res.json({ usuarioId: req.session.usuarioId });
  });

  return router;
}
