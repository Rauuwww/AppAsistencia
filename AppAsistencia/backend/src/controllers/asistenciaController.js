const db = require('../config/db');
const Papa = require('papaparse');
const fs = require('fs');

// Crear un nuevo evento
exports.crearEvento = async (req, res) => {
    const { nombre, fecha } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO eventos (nombre, fecha) VALUES (?, ?)',
            [nombre, fecha]
        );
        res.json({ id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener lista de eventos
exports.obtenerEventos = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM eventos');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Registrar asistencia con invitadoId generado automáticamente
exports.registrarAsistencia = async (req, res) => {
    const { nombreUsuario, empresa, eventoId, asistio } = req.body;
    const fecha = new Date();

    try {
        // Obtener el nombre del evento
        const [eventoRows] = await db.execute('SELECT nombre FROM eventos WHERE id = ?', [eventoId]);
        if (eventoRows.length === 0) {
            return res.status(404).json({ error: 'Evento no encontrado' });
        }

        const nombreEvento = eventoRows[0].nombre.replace(/\s+/g, '_');
        const usuarioSan = nombreUsuario.replace(/\s+/g, '_');
        const empresaSan = empresa.replace(/\s+/g, '_');

        const invitadoId = `${nombreEvento}_${usuarioSan}_${empresaSan}`;

        await db.execute(
            `INSERT INTO asistencias (invitadoId, nombreUsuario, empresa, eventoId, fecha, asistio)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [invitadoId, nombreUsuario, empresa, eventoId, fecha, asistio ?? 1]
        );

        res.json({ success: true, invitadoId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener todas las asistencias
exports.obtenerAsistencias = async (req, res) => {
    try {
        const [rows] = await db.execute(`
      SELECT a.id, a.invitadoId, a.nombreUsuario, a.empresa,
             e.nombre AS eventoNombre, a.fecha, a.asistio
      FROM asistencias a
      JOIN eventos e ON a.eventoId = e.id
    `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Exportar asistencias a CSV
exports.exportarCSV = async (req, res) => {
    try {
        const [rows] = await db.execute(`
      SELECT a.invitadoId, a.nombreUsuario, a.empresa, 
             e.nombre AS evento, a.fecha, a.asistio
      FROM asistencias a
      JOIN eventos e ON a.eventoId = e.id
    `);
        const csv = Papa.unparse(rows);
        fs.writeFileSync('asistencias.csv', csv);
        res.download('asistencias.csv');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Cambiar estado activo/inactivo de un evento
exports.cambiarEstadoEvento = async (req, res) => {
    const { id } = req.params;
    const { activo } = req.body;
    try {
        await db.execute('UPDATE eventos SET activo = ? WHERE id = ?', [activo, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Cambiar estado de asistencia (asistió o no) usando invitadoId
exports.cambiarEstadoAsistencia = async (req, res) => {
  const { invitadoId } = req.params; // ahora usamos invitadoId
  const { asistio } = req.body; // puede venir 1 o 0

  try {
    // Actualizamos la asistencia más reciente del invitado
    const [rows] = await db.execute(
      'SELECT id FROM asistencias WHERE invitadoId = ? ORDER BY fecha DESC LIMIT 1',
      [invitadoId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Asistencia no encontrada para ese invitado' });
    }

    const asistenciaId = rows[0].id;

    // Si se está marcando como asistió (1), actualizar la fecha y hora actual
    if (asistio == 1) {
      const fechaActual = new Date();
      await db.execute(
        'UPDATE asistencias SET asistio = ?, fecha = ? WHERE id = ?',
        [asistio, fechaActual, asistenciaId]
      );
    } else {
      // Si se está marcando como no asistió, solo cambiar el estado
      await db.execute(
        'UPDATE asistencias SET asistio = ? WHERE id = ?',
        [asistio, asistenciaId]
      );
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

