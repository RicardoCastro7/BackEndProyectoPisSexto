'use strict';
var models = require('../models/');
var cuenta = models.cuenta;
var persona = models.persona;
var controlAcces = models.controlAcces;
const { body, validationResult, check } = require('express-validator');
const bcypt = require('bcrypt');
const salRounds = 8;
let jwt = require('jsonwebtoken');

class CuentaController {
    async sesion(req, res) {
        try {
            let errors = validationResult(req);
            if (errors.isEmpty()) {
                var login = await cuenta.findOne({
                    where: { correo: req.body.correo }, include: [{
                        model: models.persona, as: 'persona',
                        attributes: ['nombres', 'apellidos', 'cargo', 'external_id', 'institucion'],
                    }]
                });
                console.log("datos");
                const query = `
            SELECT persona.id, persona_rol.id_persona, persona_rol.id_rol, rol.id, rol.nombre
            FROM persona_rol
            INNER JOIN persona ON persona_rol.id_persona = persona.id
            INNER JOIN rol ON persona_rol.id_rol = rol.id
            WHERE persona.id = :id
          `;
          
      
                if (login === null) {
                    res.status(400);
                    res.json({
                        msg: "CUENTA NO ENCONTRADA",
                        code: 400
                    });
                } else {
                    var lista = await models.sequelize
                        .query(query, {
                            replacements: { id: login.id_persona },
                            type: models.Sequelize.QueryTypes.SELECT,
                        });
                    res.status(200);
                    var isClavaValida = function (clave, claveUs) {
                        return bcypt.compareSync(claveUs, clave);
                    };


                    if (login.estado === "ACEPTADO") {
                        if (isClavaValida(login.clave, req.body.clave)) {
                            const tokenData = {
                                external: login.external_id,
                                usuario: login.correo,
                                rol_id: lista[0].id_rol,
                                rol_nombre: lista[0].nombre,
                                check: true
                            };
                            require('dotenv').config();
                            const llave = process.env.KEY;
                            const token = jwt.sign(tokenData, llave, { expiresIn: "12h" });
                            const cambios = {
                                "Descripcion": "Inicio de sesion"
                            }
                            const datos = {
                                "tipo_consulta": "LEER",
                                "id_persona": login.id,
                                "data": cambios
                            }
                            //await controlAcces.create(datos);              <----pendiente
                            var nombreRol = lista[0].nombre;
                            res.json({
                                msg: 'Bienvenido, ' + login.persona.nombres,
                                code: 200,
                                info: {
                                    token: token,
                                    nombres: login.persona.nombres,
                                    apellidos: login.persona.apellidos,
                                    correo: login.correo,
                                    rol: nombreRol,
                                    user: login.persona
                                },
                            });

                        } else {
                            res.json({
                                msg: "CLAVE INCORRECTA",
                                code: 400
                            });
                        }
                    } else if (login.estado === "ESPERA") {
                        res.json({
                            msg: "SU PETICIÓN SE ENCUENTRA EN ESPERA",
                            code: 201
                        });
                    }
                    else {
                        res.json({
                            msg: "CUENTA SIN PERMISO DE ACCESO",
                            code: 201
                        });
                    }
                }
            } else {
                res.status(400);
                res.json({ msg: "Faltan datos", code: 400 });
            }
        } catch (error) {
            res.status(500);
            res.json({ msg: "Error al encontrar la llave", code: 500, info: error });
        }
    }
}
module.exports = CuentaController;
