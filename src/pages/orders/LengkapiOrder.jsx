import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, updateOrder } from "../../services/orderServices";
import { Timestamp } from "firebase/firestore";
import { uploadToCloudinary } from "../../services/cloudinaryService";
import { FiDownload } from "react-icons/fi";

const LengkapiOrder = () => {
  const { portofolio, id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const userData = JSON.parse(localStorage.getItem("user"));
  const userPeran = userData?.peran || "";

  const [files, setFiles] = useState({
    noSiSpk: null,
    sertifikatPM06: null,
    noSertifikat: null,
    nomorInvoice: null,
    fakturPajak: null,
  });

  /** ✅ Konversi Firestore Timestamp ke format "YYYY-MM-DD" */
  const formatDateForInput = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return "";
    return new Date(timestamp.seconds * 1000).toISOString().split("T")[0];
  };

  // Pastikan tidak ada "Invalid time value" saat memproses tanggal
const handleDateConversion = (timestamp) => {
  if (!timestamp || !timestamp.seconds) return ""; // Jika null/undefined, kembalikan string kosong
  return new Date(timestamp.seconds * 1000).toISOString().split("T")[0]; // Konversi ke format YYYY-MM-DD
};

/** ✅ Ambil data dari Firestore */
useEffect(() => {
  const fetchOrder = async () => {
    setLoading(true);
    try {
      const data = await getOrderById(id);
      if (data) {
        setFormData({
          ...data,
          tanggalStatusOrder: formatDateForInput(data.tanggalStatusOrder),
          tanggalSerahOrderKeCs: formatDateForInput(data.tanggalSerahOrderKeCs),
          tanggalPekerjaan: formatDateForInput(data.tanggalPekerjaan),
          tanggalPengirimanInvoice: formatDateForInput(data.tanggalPengirimanInvoice),
          tanggalPengirimanFaktur: formatDateForInput(data.tanggalPengirimanFaktur),
        });
      }
    } catch (error) {
      console.error("❌ Error fetching order:", error);
    }
    setLoading(false);
  };

  fetchOrder();
}, [id]);

  // Hak akses masing-masing peran
  const editableFields = {
    "admin portofolio": [
      "statusOrder", "tanggalSerahOrderKeCs", "tanggalPekerjaan",
      "proformaSerahKeOps", "proformaSerahKeDukbis", "noSiSpk", "jenisPekerjaan",
      "namaTongkang", "lokasiPekerjaan", "estimasiTonase", "tonaseDS", "nilaiProforma",
      "jenisSertifikat",
      ...(portofolio === "batubara" || portofolio === "ksp" ? ["tonaseDS", "keteranganSertifikatPM06", "noSertifikatPM06"] : [])
    ],
    "customer service": ["nomorOrder", "tanggalOrder"],
    "admin keuangan": ["dokumenSelesaiINV", "tanggalPengirimanInvoice", "tanggalPengirimanFaktur", "nomorInvoice", "fakturPajak"],
    "all": ["distribusiSertifikatPengirim", "distribusiSertifikatPengirimTanggal", "distribusiSertifikatPenerima", "distribusiSertifikatPenerimaTanggal"]
  };

  const fieldsToShow = [...editableFields[userPeran] || [], ...editableFields["all"]];

  const handleDeleteFile = async (fileKey) => {
    if (!formData.documents?.[fileKey]) {
      alert("File tidak ditemukan!");
      return;
    }
  
    // Konfirmasi sebelum menghapus
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus file ${formData.documents[fileKey].fileName}?`);
    if (!confirmDelete) return;
  
    setLoading(true);
  
    try {
      const updatedDocuments = { ...formData.documents };
      delete updatedDocuments[fileKey]; // Hapus file dari objek dokumen
  
      const updatedData = {
        ...formData,
        documents: updatedDocuments,
        updatedAt: Timestamp.now(),
      };
  
      await updateOrder(id, updatedData);
      setFormData((prevData) => ({ ...prevData, documents: updatedDocuments }));
      setFiles((prevFiles) => ({ ...prevFiles, [fileKey]: null })); // Reset state file
      alert("File berhasil dihapus!");
    } catch (error) {
      console.error("Gagal menghapus file:", error);
      alert("Terjadi kesalahan saat menghapus file.");
    } finally {
      setLoading(false);
    }
  };  
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
  
    let newValue = value;
    if (type === "number") {
      newValue = value ? Number(value) : null; // Konversi string ke number, kosong jadi null
    } else if (type === "checkbox") {
      newValue = e.target.checked; // Konversi checkbox ke boolean
    } else if (value.trim() === "") {
      newValue = null; // Jika kosong, simpan null
    }
  
    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));
  
    console.log("✏️ Perubahan formData:", name, newValue); // Debug perubahan state
  };
  

  const handleDateChange = (e) => {
    const { name, value } = e.target;
  
    let newValue = null;
    if (value) {
      const parsedDate = new Date(value);
      if (!isNaN(parsedDate)) {
        newValue = Timestamp.fromDate(parsedDate);
      }
    }
  
    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));
  
    console.log("📅 Perubahan tanggal:", name, newValue); // Debug
  };
  

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    if (!files.length) return;
  
    setLoading(true);
    try {
      const uploadedFileUrl = await uploadToCloudinary(files[0]);
  
      const updatedDocuments = {
        ...formData.documents,
        [name]: {
          fileName: files[0].name,
          fileUrl: uploadedFileUrl,
          uploadedBy: userData.email,
          uploadedAt: Timestamp.now(),
        },
      };
  
      const updatedData = { ...formData, documents: updatedDocuments };
      await updateOrder(id, updatedData);
      
      setFormData(updatedData);
      setFiles((prevFiles) => ({ ...prevFiles, [name]: null })); // Reset file input
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Gagal mengunggah file.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Upload semua file secara paralel
      const uploadedFiles = await Promise.all(
        Object.entries(files).map(async ([key, file]) => {
          if (file) {
            const fileUrl = await uploadToCloudinary(file);
            return { key, fileUrl, fileName: file.name };
          }
          return null;
        })
      );
  
      // Konversi hasil upload ke dalam objek
      const uploadedDocuments = uploadedFiles.reduce((acc, file) => {
        if (file) {
          acc[file.key] = {
            fileName: file.fileName,
            fileUrl: file.fileUrl,
            uploadedBy: userData.email,
            uploadedAt: Timestamp.now(),
          };
        }
        return acc;
      }, {});
  
      // Perbarui data di Firestore
      const updatedData = {
        ...formData,
        updatedAt: Timestamp.now(),
        documents: {
          ...formData.documents,
          ...uploadedDocuments,
        },
      };
  
      console.log("🔥 Data sebelum update:", updatedData); // Tambahkan log untuk debug
  
      await updateOrder(id, updatedData);
      alert("✅ Data berhasil diperbarui!");
      navigate(`/orders/${portofolio}/detail/${id}`);
    } catch (error) {
      console.error("❌ Gagal mengunggah file:", error);
      alert("⚠️ Terjadi kesalahan saat mengunggah file.");
    } finally {
      setLoading(false);
    }
  };
  
  
  

  if (loading) return <p className="text-center text-gray-600">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Lengkapi Data Order</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        
        {/* Pelanggan (Read-Only) */}
        <label>Pelanggan</label>
        <input type="text" value={formData.pelanggan} className="w-full p-2 border rounded-lg bg-gray-100" readOnly />

        {/* Hak Akses Admin Portofolio */}
        {userPeran === "admin portofolio" && (
          <>
            <label>Status Order</label>
            <select name="statusOrder" value={formData.statusOrder} onChange={handleChange} className="w-full p-2 border rounded-lg">
              {["Draft", "Diproses", "Selesai", "Closed", "Next Order", "Archecking"].map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </>
        )}
{/* Hak Akses Admin Portofolio */}
{userPeran === "admin portofolio" && (
          <>
            <label>Tanggal Status Order</label>
                    <input type="date" name="tanggalStatusOrder" value={formData.tanggalStatusOrder || ""} onChange={handleDateChange} className="w-full p-2 border rounded-lg bg-gray-100"  />

          </>
        )}

{/* Hak Akses Admin Portofolio */}
{userPeran === "admin portofolio" && (
          <>
            <label>Jenis Pekerjaan</label>
                    <input type="text" name="jenisPekerjaan" value={formData.jenisPekerjaan || ""} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-100"  />

          </>
        )}

        {/* Hak Akses Admin Portofolio */}
{userPeran === "admin portofolio" && (
          <>
            <label>Nama Tongkang</label>
                    <input type="text" name="namaTongkang" value={formData.namaTongkang || ""} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-100"  />

          </>
        )}

        {/* Hak Akses Admin Portofolio */}
{userPeran === "admin portofolio" && (
          <>
            <label>Lokasi Pekerjaan</label>
                    <input type="text" name="lokasiPekerjaan" value={formData.lokasiPekerjaan || ""} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-100"  />

          </>
        )}

        {/* Hak Akses Admin Portofolio */}
{userPeran === "admin portofolio" && (
          <>
            <label>Estimasi Tonase</label>
                    <input type="text" name="estimasiTonase" value={formData.estimasiTonase || ""} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-100"  />

          </>
        )}

        {/* Hak Akses Admin Portofolio */}
{userPeran === "admin portofolio" && (
          <>
            <label>Nilai Proforma</label>
                    <input type="number" name="nilaiProforma" value={formData.nilaiProforma || ""} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-100"  />

          </>
        )}

        {/* Hak Akses cs */}
{userPeran === "customer service" && (
          <>
            <label>Nomor Order</label>
                    <input type="text" name="nomorOrder" value={formData.nomorOrder || ""} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-100"  />

          </>
        )}

          {/* Hak Akses keuangan */}
{userPeran === "admin keuangan" && (
          <>
            <label>Nomor Invoice</label>
                    <input type="text" name="nomorInvoice" value={formData.nomorInvoice || ""} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-100"  />

          </>
        )}

          {/* Hak Akses keuangan */}
{userPeran === "admin keuangan" && (
          <>
            <label>Faktur Pajak</label>
                    <input type="text" name="fakturPajak" value={formData.fakturPajak || ""} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-100"  />

          </>
        )}

        {/* Hak Akses keuangan */}
{userPeran === "admin keuangan" && (
          <>
            <label>Dokumen Selesai INV</label>
                    <input type="number" name="dokumenSelesaiINV" value={formData.dokumenSelesaiINV || ""} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-100"  />

          </>
        )}

        {/* Hak Akses keuangan */}
{userPeran === "admin portofolio" && (
          <>
            <label>Tonase DS</label>
                    <input type="number" name="tonaseDS" value={formData.tonaseDS || ""} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-100"  />

          </>
        )}

        {/* Hak Akses Admin Portofolio */}
{userPeran === "admin portofolio" && (
          <>
            <label>Nomor Si/Spk</label>
                    <input type="text" name="nilaiProforma" value={formData.noSiSpk || ""} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-100"  />

          </>
        )}

        {/* Hak Akses Admin Portofolio */}
{userPeran === "admin portofolio" && (
          <>
            <label>Upload Document Si/Spk</label>
            {formData.documents?.siSpk ? (
   <div className="p-2 border rounded-lg bg-gray-100 flex items-center justify-between">
      <div>
         <p className="text-sm font-semibold">{formData.documents.siSpk.fileName}</p>
         <p className="text-xs text-gray-500">Diunggah oleh: {formData.documents.siSpk.uploadedBy}</p>
         <p className="text-xs text-gray-500">
            {new Date(formData.documents.siSpk.uploadedAt.seconds * 1000).toLocaleDateString("id-ID")}
         </p>
      </div>
      <div className="flex gap-2">
         <a href={formData.documents.siSpk.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            Lihat
         </a>
         <label className="text-yellow-500 cursor-pointer hover:underline">
            Ubah
            <input type="file" name="siSpk" onChange={handleFileChange} className="hidden" />
         </label>
         <button type="button" className="text-red-500 hover:underline" onClick={() => handleDeleteFile("siSpk")}>
            Hapus
         </button>
      </div>
   </div>
) : (
   <input type="file" name="siSpk" onChange={handleFileChange} className="w-full p-2 border rounded-lg" />
)}

          </>
        )}

        {/* Hak Akses Admin keuangan */}
{userPeran === "admin keuangan" && (
          <>
            <label>Upload Document Invoice</label>
            {formData.documents?.invoice ? (
   <div className="p-2 border rounded-lg bg-gray-100 flex items-center justify-between">
      <div>
         <p className="text-sm font-semibold">{formData.documents.invoice.fileName}</p>
         <p className="text-xs text-gray-500">Diunggah oleh: {formData.documents.invoice.uploadedBy}</p>
         <p className="text-xs text-gray-500">
            {new Date(formData.documents.invoice.uploadedAt.seconds * 1000).toLocaleDateString("id-ID")}
         </p>
      </div>
      <div className="flex gap-2">
         <a href={formData.documents.invoice.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            Lihat
         </a>
         <label className="text-yellow-500 cursor-pointer hover:underline">
            Ubah
            <input type="file" name="invoice" onChange={handleFileChange} className="hidden" />
         </label>
         <button type="button" className="text-red-500 hover:underline" onClick={() => handleDeleteFile("invoice")}>
            Hapus
         </button>
      </div>
   </div>
) : (
   <input type="file" name="invoice" onChange={handleFileChange} className="w-full p-2 border rounded-lg" />
)}

          </>
        )}

        {/* Hak Akses Admin keuangan */}
{userPeran === "admin keuangan" && (
          <>
            <label>Upload Document Faktur Pajak</label>
            {formData.documents?.fakturPajak ? (
   <div className="p-2 border rounded-lg bg-gray-100 flex items-center justify-between">
      <div>
         <p className="text-sm font-semibold">{formData.documents.fakturPajak.fileName}</p>
         <p className="text-xs text-gray-500">Diunggah oleh: {formData.documents.invoice.uploadedBy}</p>
         <p className="text-xs text-gray-500">
            {new Date(formData.documents.fakturPajak.uploadedAt.seconds * 1000).toLocaleDateString("id-ID")}
         </p>
      </div>
      <div className="flex gap-2">
         <a href={formData.documents.fakturPajak.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            Lihat
         </a>
         <label className="text-yellow-500 cursor-pointer hover:underline">
            Ubah
            <input type="file" name="fakturPajak" onChange={handleFileChange} className="hidden" />
         </label>
         <button type="button" className="text-red-500 hover:underline" onClick={() => handleDeleteFile("fakturPajak")}>
            Hapus
         </button>
      </div>
   </div>
) : (
   <input type="file" name="fakturPajak" onChange={handleFileChange} className="w-full p-2 border rounded-lg" />
)}

          </>
        )}

        {/* Keterangan Sertifikat PM06 */}
        {userPeran === "admin portofolio" && (
          <>
        <label>Keterangan Sertifikat PM06</label>
        <select name="keteranganSertifikatPM06" value={formData.keteranganSertifikatPM06} onChange={handleChange} className="w-full p-2 border rounded-lg">
          {["Tidak Ada", "Ada"].map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>

        {formData.keteranganSertifikatPM06 === "Ada" && (
          <>
            <label>Nomor Sertifikat PM06</label>
            <input type="text" name="noSertifikatPM06" value={formData.noSertifikatPM06 || ""} onChange={handleChange} className="w-full p-2 border rounded-lg" />

            <label>Upload Sertifikat PM06</label>
            {formData.documents?.sertifikatPM06 ? (
   <div className="p-2 border rounded-lg bg-gray-100 flex items-center justify-between">
      <div>
         <p className="text-sm font-semibold">{formData.documents.sertifikatPM06.fileName}</p>
         <p className="text-xs text-gray-500">Diunggah oleh: {formData.documents.sertifikatPM06.uploadedBy}</p>
         <p className="text-xs text-gray-500">
            {new Date(formData.documents.sertifikatPM06.uploadedAt.seconds * 1000).toLocaleDateString("id-ID")}
         </p>
      </div>
      <div className="flex gap-2">
         <a href={formData.documents.sertifikatPM06.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            Lihat
         </a>
         <label className="text-yellow-500 cursor-pointer hover:underline">
            Ubah
            <input type="file" name="sertifikatPM06" onChange={handleFileChange} className="hidden" />
         </label>
         <button type="button" className="text-red-500 hover:underline" onClick={() => handleDeleteFile("sertifikatPM06")}>
            Hapus
         </button>
      </div>
   </div>
) : (
   <input type="file" name="sertifikatPM06" onChange={handleFileChange} className="w-full p-2 border rounded-lg" />
)}

          </>
        )}
        </>
      )}


        {/* Jenis Sertifikat */}
        {userPeran === "admin portofolio" && (
          <>
        <label>Jenis Sertifikat</label>
        <select name="jenisSertifikat" value={formData.jenisSertifikat} onChange={handleChange} className="w-full p-2 border rounded-lg">
          {["Tidak Terbit Sertifikat", "LOADING", "LS (PIK)", "SERTIFIKAT", "LAPORAN", "KALIBRASI", "HALAL"].map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>

        {formData.jenisSertifikat !== "Tidak Terbit Sertifikat" && (
          <>
            <label>Nomor Sertifikat</label>
            <input type="text" name="noSertifikat" value={formData.noSertifikat || ""} onChange={handleChange} className="w-full p-2 border rounded-lg" />

            <label>Upload Sertifikat</label>
            {formData.documents?.sertifikat ? (
   <div className="p-2 border rounded-lg bg-gray-100 flex items-center justify-between">
      <div>
         <p className="text-sm font-semibold">{formData.documents.sertifikat.fileName}</p>
         <p className="text-xs text-gray-500">Diunggah oleh: {formData.documents.sertifikat.uploadedBy}</p>
         <p className="text-xs text-gray-500">
            {new Date(formData.documents.sertifikat.uploadedAt.seconds * 1000).toLocaleDateString("id-ID")}
         </p>
      </div>
      <div className="flex gap-2">
         <a href={formData.documents.sertifikat.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            Lihat
         </a>
         <label className="text-yellow-500 cursor-pointer hover:underline">
            Ubah
            <input type="file" name="sertifikat" onChange={handleFileChange} className="hidden" />
         </label>
         <button type="button" className="text-red-500 hover:underline" onClick={() => handleDeleteFile("sertifikat")}>
            Hapus
         </button>
      </div>
   </div>
) : (
   <input type="file" name="sertifikat" onChange={handleFileChange} className="w-full p-2 border rounded-lg" />
)}

          </>
        )}
        </>
        )}

        {/* Input Tanggal */}
        {["tanggalOrder", "tanggalSerahOrderKeCs", "tanggalPekerjaan", "tanggalPengirimanInvoice", "tanggalPengirimanFaktur", "proformaSerahKeOps", "proformaSerahKeDukbis", "distribusiSertifikatPengirimTanggal", "distribusiSertifikatPenerimaTanggal"].map((key) => (
          fieldsToShow.includes(key) && (
            <div key={key}>
              <label>{key}</label>
              <input 
  type="date" 
  name={key} 
  value={formData[key] ? handleDateConversion(formData[key]) : ""}
  onChange={handleDateChange} 
  className="w-full p-2 border rounded-lg" 
/>
            </div>
          )
        ))}

            <label>Distribusi Sertifikat Pengirim</label>
                    <input type="text" name="distribusiSertifikatPengirim" value={formData.distribusiSertifikatPengirim || ""} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-100"  />

            <label>Distribusi Sertifikat Penerima</label>
                    <input type="text" name="distribusiSertifikatPenerima" value={formData.distribusiSertifikatPenerima || ""} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-100"  />

        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200">
          Simpan
        </button>
      </form>
    </div>
  );
};

export default LengkapiOrder;
