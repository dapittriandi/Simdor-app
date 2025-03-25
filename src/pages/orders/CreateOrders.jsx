import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../services/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { uploadToCloudinary } from "../../services/cloudinaryService";

const CreateOrder = () => {
  const { portofolio } = useParams();
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("user"));
  const userEmail = userData?.email || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    pelanggan: "",
    statusOrder: "Draft",
    tanggalStatusOrder: null,
    tanggalSerahOrderKeCs: null,
    jenisPekerjaan: "",
    lokasiPekerjaan: "",
    noSiSpk: "",
    namaTongkang: "",
    estimasiTonase: "",
    tonaseDS: "",
  });

  const formatDateForInput = (timestamp) => {
    if (!timestamp) return ""; // Handle jika data kosong
    return new Date(timestamp.seconds * 1000).toISOString().split("T")[0]; // Format YYYY-MM-DD
  };
  

  const [files, setFiles] = useState({ siSpk: null });

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    
    let newValue = null;
    if (value) {
      const parsedDate = new Date(value);
      if (!isNaN(parsedDate)) {
        newValue = Timestamp.fromDate(parsedDate);
      }
    }
  
    setFormData({ ...formData, [name]: newValue });
  
    console.log("📅 Perubahan tanggal:", name, newValue); // Debugging
  };
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
  
    let newValue = value;
  
    // 🔥 Jika input bertipe tanggal, ubah ke Timestamp
    if (type === "date") {
      newValue = value ? Timestamp.fromDate(new Date(value)) : null;
    }
  
    setFormData({ ...formData, [name]: newValue });
  
    console.log("✏️ Perubahan:", name, newValue); // Debug
  };
  

  const handleFileChange = (e) => {
    setFiles({ ...files, siSpk: e.target.files[0] });
  };

  const validateForm = () => {
    if (!formData.pelanggan || !formData.tanggalStatusOrder || !formData.tanggalSerahOrderKeCs || !formData.jenisPekerjaan || !formData.lokasiPekerjaan) {
      return "Harap isi semua field yang wajib diisi!";
    }
    if (formData.noSiSpk && !files.siSpk) {
      return "Harap unggah file SI/SPK jika mengisi nomor SI/SPK!";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      let uploadedFiles = {};
      if (files.siSpk) {
        uploadedFiles.siSpk = await uploadToCloudinary(files.siSpk);
      }

      const newOrder = {
        portofolio,
        pelanggan: formData.pelanggan,
        statusOrder: formData.statusOrder,
        tanggalStatusOrder: formData.tanggalStatusOrder ? formData.tanggalStatusOrder : null,
        tanggalSerahOrderKeCs: formData.tanggalSerahOrderKeCs ? formData.tanggalSerahOrderKeCs : null,
        jenisPekerjaan: formData.jenisPekerjaan,
        lokasiPekerjaan: formData.lokasiPekerjaan,
        noSiSpk: formData.noSiSpk || "",
        namaTongkang: formData.namaTongkang || "",
        estimasiTonase: formData.estimasiTonase || "",
        tonaseDS: formData.tonaseDS ? Number(formData.tonaseDS) : 0,

        documents: uploadedFiles.siSpk
          ? { siSpk: { fileName: files.siSpk.name, fileUrl: uploadedFiles.siSpk, uploadedBy: userEmail, uploadedAt: Timestamp.now() } }
          : {},

        nomorOrder: "",
        tanggalOrder: null,
        tanggalPekerjaan: null,
        proformaSerahKeOps: null,
        proformaSerahKeDukbis: null,
        // noSertifikatPM06: "",
        // keteranganSertifikatPM06: "",
        // noSertifikat: "",
        // jenisSertifikat: "",
        nilaiProforma: 0,
        dokumenSelesaiINV: 0,
        nomorInvoice: "",
        fakturPajak: "",
        tanggalPengirimanInvoice: null,
        tanggalPengirimanFaktur: null,
        distribusiSertifikatPengirim: "",
        distribusiSertifikatPengirimTanggal: null,
        distribusiSertifikatPenerima: "",
        distribusiSertifikatPenerimaTanggal: null,

        createdBy: userEmail,
        lastUpdatedBy: userEmail,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, "orders"), newOrder);
      navigate(`/orders/${portofolio}`);
    } catch (error) {
      setError("Gagal menambahkan order. Coba lagi.");
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Tambah Data Order {portofolio}</h2>
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow-md rounded-md">
        {/* Inputan Wajib */}
        <div>
          <label className="block font-medium">Nama Pelanggan *</label>
          <input type="text" name="pelanggan" value={formData.pelanggan} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>

        <div>
          <label className="block font-medium">Status Order *</label>
          <select name="statusOrder" value={formData.statusOrder} onChange={handleChange} className="w-full p-2 border rounded">
            {["Draft", "Diproses", "Selesai", "Closed", "Next Order", "Archecking"].map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium">Tanggal Status Order *</label>
          <input type="date" name="tanggalStatusOrder" value={formatDateForInput(formData.tanggalStatusOrder)} onChange={handleDateChange} className="w-full p-2 border rounded" required />
        </div>

        <div>
          <label className="block font-medium">Tanggal Serah Order ke CS *</label>
          <input type="date" name="tanggalSerahOrderKeCs" value={formatDateForInput(formData.tanggalSerahOrderKeCs)} onChange={handleDateChange} className="w-full p-2 border rounded" required />
        </div>

        <div>
          <label className="block font-medium">Jenis Pekerjaan *</label>
          <input type="text" name="jenisPekerjaan" value={formData.jenisPekerjaan} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>

        <div>
          <label className="block font-medium">Lokasi Pekerjaan *</label>
          <input type="text" name="lokasiPekerjaan" value={formData.lokasiPekerjaan} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>

        {/* Input Nomor SI/SPK & Upload File */}
        <div>
          <label className="block font-medium">No SI/SPK</label>
          <input type="text" name="noSiSpk" value={formData.noSiSpk} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        {formData.noSiSpk && (
          <div>
            <label className="block font-medium">Upload Dokumen SI/SPK *</label>
            <input type="file" onChange={handleFileChange} className="w-full p-2 border rounded" required />
          </div>
        )}
        
         {/* Field Tambahan */}
         <div>
          <label className="block font-medium">Nama Tongkang</label>
          <input type="text" name="namaTongkang" value={formData.namaTongkang} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block font-medium">Estimasi Tonase</label>
          <input type="number" name="estimasiTonase" value={formData.estimasiTonase} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block font-medium">Tonase DS</label>
          <input type="number" name="tonaseDS" value={formData.tonaseDS} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded mt-4 hover:bg-green-600" disabled={loading}>
          {loading ? "Menambahkan..." : "Tambah"}
        </button>
      </form>
    </div>
  );
};

export default CreateOrder;
