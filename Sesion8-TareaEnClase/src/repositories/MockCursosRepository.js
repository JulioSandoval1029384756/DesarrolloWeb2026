import { randomUUID } from 'node:crypto';
import { ICursosRepository } from './ICursosRepository.js';

export class MockCursosRepository extends ICursosRepository {
  constructor(datos = []) {
    super();
    this.cursos = [...datos];
  }

  async listar() {
    return [...this.cursos].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  async obtener(id) {
    return this.cursos.find((c) => c.id === id) ?? null;
  }

  async crear(datos) {
    if (this.cursos.some((c) => c.codigo === datos.codigo)) {
      throw new Error('El código ya existe');
    }
    const curso = { id: randomUUID(), ...datos };
    this.cursos.push(curso);
    return curso;
  }
}
