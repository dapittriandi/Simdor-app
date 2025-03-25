import axios from "axios";

const CLOUD_NAME = "dgdswp2bg"; // Ganti dengan Cloud Name dari Cloudinary
const UPLOAD_PRESET = "simdor_uploads"; // Sesuai dengan Upload Preset yang dibuat

export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
      formData
    );
    return response.data.secure_url; // Mengembalikan URL file yang berhasil diunggah
  } catch (error) {
    console.error("Gagal mengunggah ke Cloudinary:", error);
    throw error;
  }
};
