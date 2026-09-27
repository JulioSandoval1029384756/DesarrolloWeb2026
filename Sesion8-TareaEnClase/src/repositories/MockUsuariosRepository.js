import { randomUUID } from 'node:crypto';

export class MockUsuariosRepository {
  constructor(datos = []) {
    this.usuarios = [...datos];
  }

  async crear(datos) {
    if (this.usuarios.some((u) => u.email === datos.email)) {
      throw new Error('El email ya existe');
    }
    const usuario = { id: randomUUID(), ...datos };
    this.usuarios.push(usuario);
    return usuario;
  }

  async buscarPorEmail(email) {
    return this.usuarios.find((u) => u.email === email) ?? null;
  }
}
