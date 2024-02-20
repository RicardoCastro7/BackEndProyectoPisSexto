'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const cuenta = sequelize.define('cuenta', {
        correo: { type: DataTypes.STRING(60), allowNull: false, unique:true },
        clave: { type: DataTypes.STRING(250), allowNull: false },
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        estado: {type: DataTypes.ENUM("ACEPTADO", "DENEGADO", "ESPERA"), defaultValue: "ESPERA"},
    }, {
        freezeTableName: true
    });

    cuenta.associate = function (models){
        cuenta.belongsTo(models.persona, {foreignKey: 'id_persona'});
        cuenta.hasOne(models.peticion, { foreignKey: 'id_cuenta', as: 'peticion'});
    }
    return cuenta;
};
