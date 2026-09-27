export class SequelizeUsuariosRepository {
  constructor(modelo) {
    this.modelo = modelo;
  }

  async crear(datos) {
    return this.modelo.create(datos);
  }

  async buscarPorEmail(email) {
    return this.modelo.findOne({ where: { email } });
  }
}
