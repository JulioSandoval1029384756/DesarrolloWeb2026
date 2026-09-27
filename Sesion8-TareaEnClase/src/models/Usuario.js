import { DataTypes } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

export const Usuario = sequelize.define('usuario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: { msg: 'Email inválido' } },
  },
  password: {
    // aquí se guarda el HASH, nunca la contraseña en texto plano
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'usuarios',
});
