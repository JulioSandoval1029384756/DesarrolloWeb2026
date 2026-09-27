import { Router } from 'express';
import { asyncHandler } from '../middlewares/errores.js';
import { authJWT } from '../middlewares/auth.js';
import { validarCurso, revisarErrores } from '../validators/cursoValidator.js';
import { registrarLog } from '../services/logService.js';

export function cursosRoutes(repo) {
  const router = Router();

  // GET /cursos -> pública, no requiere token
  router.get('/', asyncHandler(async (req, res) => {
    res.json(await repo.listar());
  }));

  // POST /cursos -> protegida con authJWT + validada con express-validator
  router.post(
    '/',
    authJWT,
    validarCurso,
    revisarErrores,
    asyncHandler(async (req, res) => {
      const curso = await repo.crear(req.body);

      // Punto 6: fire-and-forget — no bloquea la respuesta, pero SÍ captura el error
      registrarLog(`Curso creado: ${curso.codigo} (${curso.id})`)
        .catch((err) => console.error('No se pudo registrar el log:', err.message));

      res.status(201).json(curso);
    }),
  );

  return router;
}
