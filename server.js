import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';  // Import CORS

dotenv.config();

const app = express();

// Gunakan middleware CORS untuk mengizinkan permintaan dari frontend
const corsOptions = {
  origin: 'http://localhost:5174',  // Izinkan frontend di localhost:5174
  methods: ['GET', 'POST', 'OPTIONS'],  // Izinkan method GET, POST, dan OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization'],  // Izinkan headers tertentu
};

// Gunakan CORS middleware dengan opsi konfigurasi
app.options('*', cors(corsOptions));  // Menangani preflight request (OPTIONS)

// Middleware untuk mem-parsing JSON body
app.use(express.json());

// Mengambil kredensial dari .env
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;
const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;

// Endpoint untuk menghapus file dari Cloudinary
app.post('/delete-file', async (req, res) => {
  const { publicId } = req.body;  // Mengambil publicId dari body permintaan

  if (!publicId) {
    return res.status(400).json({ error: 'publicId is required' });
  }

  try {
    // Mengirim permintaan ke Cloudinary untuk menghapus file
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/destroy`,
      {
        public_id: publicId,
        api_key: cloudinaryApiKey,
        api_secret: cloudinaryApiSecret,
      }
    );

    if (response.data.result === 'ok') {
      return res.json({ result: 'File successfully deleted' });
    } else {
      return res.status(500).json({ error: 'Failed to delete file from Cloudinary' });
    }
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    res.status(500).json({ error: 'Failed to delete file from Cloudinary', details: error.message });
  }
});

// Menjalankan server di port 3000
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
