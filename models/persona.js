'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const persona = sequelize.define('persona', {
        nombres: { type: DataTypes.STRING(70), defaultValue: "NO_DATA" },
        apellidos: { type: DataTypes.STRING(70), defaultValue: "NO_DATA" },
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        cargo: {type: DataTypes.STRING(40), defaultValue: "NO_DATA"},
        institucion: {type: DataTypes.STRING(70), defaultValue: "NO_DATA"},
        estado:{type: DataTypes.BOOLEAN, defaultValue: true}
    }, {
        freezeTableName: true
    });
    persona.associate = function (models){
        persona.hasOne(models.cuenta, { foreignKey: 'id_persona', as: 'cuenta'});
        persona.hasMany(models.controlAcces, {foreignKey: 'id_persona', as: 'controlAcces'});
        persona.hasMany(models.persona_rol, {foreignKey: 'id_persona', as: 'persona_rol'});
    }
    return persona;
};