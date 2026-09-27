import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { crearApp } from '../src/app.js';
import { config } from '../src/config.js';
import { MockCursosRepository } from '../src/repositories/MockCursosRepository.js';

// Firmamos con el mismo secreto que usará authJWT al verificar
const token = jwt.sign({ sub: 'test' }, config.jwtSecret);

const headers = (conToken = true) => ({
  'Content-Type': 'application/json',
  ...(conToken ? { Authorization: `Bearer ${token}` } : {}),
});

async function levantarApp() {
  const app = crearApp({ repo: new MockCursosRepository([]) });
  const servidor = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const base = `http://127.0.0.1:${servidor.address().port}`;
  return { servidor, base };
}

describe('API /cursos', () => {
  it('GET /cursos responde 200 con arreglo vacío', async () => {
    const { servidor, base } = await levantarApp();
    const res = await fetch(`${base}/cursos`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), []);
    servidor.close();
  });

  it('POST /cursos sin token responde 401', async () => {
    const { servidor, base } = await levantarApp();
    const res = await fetch(`${base}/cursos`, {
      method: 'POST',
      headers: headers(false),
      body: JSON.stringify({ nombre: 'Bases de Datos', codigo: 'BD-1', creditos: 4 }),
    });
    assert.equal(res.status, 401);
    servidor.close();
  });

  it('POST /cursos con datos inválidos responde 400', async () => {
    const { servidor, base } = await levantarApp();
    const res = await fetch(`${base}/cursos`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ nombre: '', codigo: '', creditos: 0 }),
    });
    assert.equal(res.status, 400);
    servidor.close();
  });

  it('POST /cursos con token y datos válidos responde 201', async () => {
    const { servidor, base } = await levantarApp();
    const res = await fetch(`${base}/cursos`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ nombre: 'Bases de Datos', codigo: 'BD-1', creditos: 4 }),
    });
    assert.equal(res.status, 201);
    const curso = await res.json();
    assert.equal(curso.codigo, 'BD-1');
    servidor.close();
  });
});
