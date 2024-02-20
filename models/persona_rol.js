'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const persona_rol = sequelize.define('persona_rol', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
    }, {
        freezeTableName: true
    });

    persona_rol.associate = function (models){
        persona_rol.belongsTo(models.persona, {foreignKey: 'id_persona'});
        persona_rol.belongsTo(models.rol, {foreignKey: 'id_rol'});
    }
    return persona_rol;
};
