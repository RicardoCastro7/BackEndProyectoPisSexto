'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const controlAcces = sequelize.define('controlAcces', {
        data: { type: DataTypes.JSON, allowNull: false},
        tipo_consulta: { type: DataTypes.ENUM('MODIFICAR', 'LEER', 'GUARDAR', 'ELIMINAR'), allowNull: false, defaultValue: 'LEER' },
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
    }, {
        freezeTableName: true
    });

    controlAcces.associate = function (models){
        controlAcces.belongsTo(models.persona, {foreignKey: 'id_persona'});
    }
    return controlAcces;
};