import express from 'express';
import cors from 'cors';
import knex from './database';
import path from 'path';
import multer from 'multer';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// --- 1. CONFIGURACIÓN DE MULTER ---
const storage = multer.diskStorage({
  // Carpeta de destino
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/images'));
  },
  // Nombre del archivo (nombre-timestamp.extension)
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${path.basename(file.originalname, ext)}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

// --- 2. RUTAS DE LA API ---

// Servir imágenes como archivos estáticos
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Obtener todos
app.get('/api/heroes', async (req, res) => {
  try {
    const heroes = await knex('catsuperheroe').select('*');
    res.json(heroes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener héroes' });
  }
});

app.post('/api/heroes', upload.single('image'), async (req, res) => {
  const { nombre, poder, fortaleza, resistencia, debilidad } = req.body;
  const imagen_url = req.file?.filename || 'Placeholder.png';

  try {
    const [id] = await knex('catsuperheroe').insert({
      nombre,
      poder,
      fortaleza,
      resistencia,
      debilidad,
      imagen_url,
    }).returning('id');
    res.status(201).json({ id, nombre, poder, fortaleza, resistencia, debilidad, imagen_url });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear héroe' });
  }
});

// Actualizar
app.put('/api/heroes/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { nombre, poder, fortaleza, resistencia, debilidad } = req.body;
  
  // Preparamos los datos para actualizar
  const updateData: any = { nombre, poder, fortaleza, resistencia, debilidad };
  
  if (req.file) {
    updateData.imagen_url = req.file.filename;
  }

  try {
    const rows = await knex('catsuperheroe')
      .where({ id })
      .update(updateData);
    
    if (rows) {
      res.json({ message: 'Héroe actualizado' });
    } else {
      res.status(404).json({ error: 'Héroe no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar héroe' });
  }
});

// Eliminar
app.delete('/api/heroes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await knex('catsuperheroe').where({ id }).del();
    if (rows) {
      res.json({ message: 'Héroe eliminado' });
    } else {
      res.status(404).json({ error: 'Héroe no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar héroe' });
  }
});

app.listen(port, () => {
  console.log(`🧠 API de Superhéroes escuchando en http://localhost:${port}`);
});