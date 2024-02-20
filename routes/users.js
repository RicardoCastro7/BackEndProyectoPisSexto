var express = require('express');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid');
var router = express.Router();
const { body, validationResult } = require('express-validator');
const RolController = require('../controls/RolController');
var rolController = new RolController();
const PersonaController = require('../controls/PersonaController');
var personaController = new PersonaController();
const CuentaController = require('../controls/CuentaController');
var cuentaController = new CuentaController();
const PeticionController = require('../controls/PeticionController');
var peticionController = new PeticionController();
let jwt = require('jsonwebtoken');

/*const storage_archivo = (dir) => multer.diskStorage({
  destination: path.join(__dirname,'../public/archivos'+dir),
  filename: (req, file, cb) => {
    const partes = file.originalname.split('.');
    const extension = partes[partes.length - 1];
    cb(null, uuid.v4()+"."+extension);
  }
 
});*/

/*const extensiones_aceptadas_archivo = (req, file, cb) => {
  const allowedExtensions = ['.pdf','.docx', '.xlsx'];
  const ext = path.extname(file.originalname);
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF, DOCX y XLSX.'));
  }
};*/

/*const upload_archivo_practica = multer({ storage: storage_archivo('/practicas'), limits: {
  fileSize: 2 * 1024 * 1024 // 2 MB en bytes
},fileFilter: extensiones_aceptadas_archivo});*/

var auth = function middleware(req, res, next) {
  const token = req.headers['x-api-token'];
  //console.log(req.headers);
  if (token) {
    require('dotenv').config();
    const llave = process.env.KEY;
    jwt.verify(token, llave, async (err, decoded) => {
      if (err) {
        console.log('aqui', err);
        res.status(401);
        res.json({ msg: "Token no valido!", code: 401 });
      } else {
        var models = require('../models');
        var cuenta = models.cuenta;
        req.decoded = decoded;
        console.log("Aca\n\n");
        console.log(decoded);
        let aux = await cuenta.findOne({ where: { external_id: req.decoded.external } });
        if (aux) {
          next();
        } else {
          res.status(401);
          res.json({ msg: "Token no valido!", code: 401 });
        }
      }

    });
  } else {
    res.status(401);
    res.json({ msg: "No existe token!", code: 401 });
  }
}

//Usar este para modulos de admin
var authAdmin = function middleware(req, res, next) {
  const token = req.headers['x-api-token'];
  console.log(token);
  
  if (token) {
    
    require('dotenv').config();
    const llave = process.env.KEY;
    jwt.verify(token, llave, async (err, decoded) => {
      if (err) {
        console.log('aqui', err);
        res.status(401);
        res.json({ msg: "Token no validoo!", code: 401 });
      } else {
        var models = require('../models');
        var cuenta = models.cuenta;
        req.decoded = decoded;
        console.log("Aca\n\n");
        console.log(decoded);
        if (decoded.rol_nombre == "admin") {
          let aux = await cuenta.findOne({ where: { external_id: req.decoded.external } });
          if (aux) {
            next();
          } else {
            res.status(401);
            res.json({ msg: "Token no valido!", code: 401 });
          }
        } else {
          
          res.status(401);
            res.json({ msg: "Token no valido!", code: 401 });
        }
      }

    });
  } else {
    
    res.status(401);
    res.json({ msg: "No existe token!", code: 401 });
  }
}

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.json({ "version": "1.0", "name": "pis-grupo-c-backend" });
});

//INICIO DE SESION
router.post('/sesion', [
  body('correo', 'Ingrese un correo valido').exists().not().isEmpty().isEmail(),
  body('clave', 'Ingrese una clave valido').exists().not().isEmpty(),
], cuentaController.sesion)


//GET-ROL
router.get('/listar/rol', rolController.listar);

//POST ROL
router.post('/guardar/rol', rolController.guardar);


//GET-PERSONA
router.get('/listar/personas', /*auth,*/ personaController.listar);
router.get('/obtener/personas/:external', personaController.obtener);

//POST-PERSONA
router.post('/guardar/personas', [
  body('apellidos', 'Ingrese sus apellidos').trim().exists().not().isEmpty().isLength({ min: 3, max: 50 }).withMessage("Ingrese un valor mayor o igual a 3 y menor a 50"),
  body('nombres', 'Ingrese sus nombres').trim().exists().not().isEmpty().isLength({ min: 3, max: 50 }).withMessage("Ingrese un valor mayor o igual a 3 y menor a 50"),
], personaController.guardar);
router.post('/modificar/personas', /*auth,*/ personaController.modificar);

//petciones
router.get('/listar/peticiones', /*auth,*/ peticionController.listar);
router.get('/aceptarechazar/peticiones/:external/:estado', /*auth,*/ peticionController.aceptarRechazar);

module.exports = router;
