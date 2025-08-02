const express = require('express');
const router = express.Router();
const controller = require('../controllers/asistenciaController');

router.post('/eventos', controller.crearEvento);
router.get('/eventos', controller.obtenerEventos);
// Cambiar estado de evento (activo/inactivo)
router.put('/eventos/:id/estado', controller.cambiarEstadoEvento);

router.post('/asistencia', controller.registrarAsistencia);
router.get('/asistencias', controller.obtenerAsistencias);
// Cambiar estado de asistencia (asistió/no asistió) — aquí cambiamos :id por :invitadoId
router.put('/asistencia/:invitadoId/estado', controller.cambiarEstadoAsistencia);

router.get('/exportar', controller.exportarCSV);

module.exports = router;
