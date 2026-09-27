import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crearApp } from '../src/app.js';
import { MockCursosRepository } from '../src/repositories/MockCursosRepository.js';
import { MockUsuariosRepository } from '../src/repositories/MockUsuariosRepository.js';
import { hashearPassword, verificarPassword } from '../src/auth/passwords.js';
import { firmarToken, verificarToken } from '../src/auth/jwt.js';

async function levantarApp() {
  const app = crearApp({
    repo: new MockCursosRepository([]),
    usuariosRepo: new MockUsuariosRepository([]),
  });
  const servidor = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const base = `http://127.0.0.1:${servidor.address().port}`;
  return { servidor, base };
}

describe('passwords', () => {
  it('hashea y verifica correctamente', async () => {
    const hash = await hashearPassword('demo1234');
    assert.ok(!hash.includes('demo1234'));
    assert.equal(await verificarPassword('demo1234', hash), true);
    assert.equal(await verificarPassword('otra', hash), false);
  });
});

describe('jwt', () => {
  it('firma y verifica el payload', () => {
    const payload = verificarToken(firmarToken({ sub: 'u-1' }, '1h'));
    assert.equal(payload.sub, 'u-1');
    assert.ok(payload.exp);
  });
});

describe('POST /auth/registro y /auth/login', () => {
  it('registra un usuario con contraseña hasheada', async () => {
    const { servidor, base } = await levantarApp();
    const res = await fetch(`${base}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ana@umg.edu.gt', password: 'demo1234' }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.email, 'ana@umg.edu.gt');
    assert.equal(body.password, undefined, 'nunca debe devolver el hash');
    servidor.close();
  });

  it('login con credenciales correctas devuelve un token', async () => {
    const { servidor, base } = await levantarApp();
    await fetch(`${base}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ana@umg.edu.gt', password: 'demo1234' }),
    });

    const res = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ana@umg.edu.gt', password: 'demo1234' }),
    });
    assert.equal(res.status, 200);
    const { token } = await res.json();
    assert.ok(token, 'debe devolver un JWT');
    servidor.close();
  });

  it('login con contraseña incorrecta responde 401', async () => {
    const { servidor, base } = await levantarApp();
    await fetch(`${base}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ana@umg.edu.gt', password: 'demo1234' }),
    });

    const res = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ana@umg.edu.gt', password: 'mala-clave' }),
    });
    assert.equal(res.status, 401);
    servidor.close();
  });
});

// Punto 6: el log fire-and-forget no debe romper ni retrasar la respuesta
describe('POST /cursos con log fire-and-forget', () => {
  it('responde 201 sin esperar al log', async () => {
    const { servidor, base } = await levantarApp();
    const token = firmarToken({ sub: 'test' });

    const inicio = Date.now();
    const res = await fetch(`${base}/cursos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nombre: 'Redes', codigo: 'RED-1', creditos: 3 }),
    });
    const duracion = Date.now() - inicio;

    assert.equal(res.status, 201);
    assert.ok(duracion < 50, 'no debe esperar los 50ms del log simulado');
    servidor.close();
  });
});
