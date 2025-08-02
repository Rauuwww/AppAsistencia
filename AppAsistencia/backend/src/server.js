require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const asistenciaRoutes = require('./routes/asistenciaRoutes');

app.use(cors());
app.use(express.json());
app.use('/api', asistenciaRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
