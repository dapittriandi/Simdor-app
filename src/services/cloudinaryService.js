import axios from 'axios';

// Variabel dari .env (hanya API Key dan Cloud Name yang digunakan di frontend)
const CLOUD_NAME = 'dgdswp2bg';
const UPLOAD_PRESET = "simdor_uploads";

export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET); // Menggunakan upload preset dari .env

  try {
    // Mengirim file ke Cloudinary untuk diupload
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      formData, // FormData di sini
      {
        headers: {
          "Content-Type": "multipart/form-data", // biarkan axios menangani header ini
        },
      }
    );
    return response.data.secure_url; // Mengembalikan URL file yang berhasil diunggah
  } catch (error) {
    console.error("Gagal mengunggah ke Cloudinary:", error);
    throw error;
  }
};

// Fungsi untuk menghapus file dari Cloudinary melalui Backend
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await axios.post('http://localhost:3000/delete-file', {
      publicId: publicId,  // publicId yang dikirim ke backend
    });
    return result.data;  // Mengembalikan hasil dari Cloudinary API (misalnya {result: "File successfully deleted"})
  } catch (error) {
    console.error("Error deleting file from Cloudinary", error);
    throw error;
  }
};