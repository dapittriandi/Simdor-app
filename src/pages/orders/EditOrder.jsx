import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, updateOrder } from "../../services/orderServices";
import { Timestamp } from "firebase/firestore";
import { uploadToCloudinary } from "../../services/cloudinaryService";
import { FiDownload, FiTrash2 } from "react-icons/fi";

const EditOrder = () => {
  const { portofolio, id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const userData = JSON.parse(localStorage.getItem("user"));
  const userPeran = userData?.peran || "";
  const [files, setFiles] = useState({});
  const [deletedFiles, setDeletedFiles] = useState([]);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      const data = await getOrderById(id);
      if (data) {
        setFormData({
          ...data,
          documents: data.documents || {},
        });
      }
      setLoading(false);
    };
    fetchOrder();
  }, [id]);

  const formatDateForInput = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return ""; // Jika null/undefined, return string kosong
    const date = timestamp.toDate();
    return date.toISOString().split("T")[0]; // Format YYYY-MM-DD
  };
  

  // **Mapping Semua Field**
  const allFields = {
    pelanggan: "Pelanggan",
    statusOrder: "Status Order",
    tanggalStatusOrder: "Tanggal Status Order",
    tanggalSerahOrderKeCs: "Tanggal Serah Order ke CS",
    tanggalPekerjaan: "Tanggal Pekerjaan",
    proformaSerahKeOps: "Proforma Serah ke Ops",
    proformaSerahKeDukbis: "Proforma Serah ke Dukbis",
    noSiSpk: "No SI/SPK",
    jenisPekerjaan: "Jenis Pekerjaan",
    namaTongkang: "Nama Tongkang",
    lokasiPekerjaan: "Lokasi Pekerjaan",
    estimasiTonase: "Estimasi Tonase",
    tonaseDS: "Tonase DS",
    nilaiProforma: "Nilai Proforma",
    jenisSertifikat: "Jenis Sertifikat",
    keteranganSertifikatPM06: "Keterangan Sertifikat PM06",
    noSertifikatPM06: "Nomor Sertifikat PM06",
    nomorOrder: "Nomor Order",
    tanggalOrder: "Tanggal Order",
    dokumenSelesaiINV: "Dokumen Selesai INV",
    tanggalPengirimanInvoice: "Tanggal Pengiriman Invoice",
    tanggalPengirimanFaktur: "Tanggal Pengiriman Faktur",
    nomorInvoice: "Nomor Invoice",
    fakturPajak: "Faktur Pajak",
    distribusiSertifikatPengirim: "Distribusi Sertifikat Pengirim",
    distribusiSertifikatPengirimTanggal: "Tanggal Distribusi Sertifikat Pengirim",
    distribusiSertifikatPenerima: "Distribusi Sertifikat Penerima",
    distribusiSertifikatPenerimaTanggal: "Tanggal Distribusi Sertifikat Penerima",
  };

  // Daftar Field yang Bisa Diedit Sesuai Peran User
  const editableFields = {
    "admin portofolio": [
      "pelanggan", "statusOrder", "tanggalSerahOrderKeCs", "tanggalPekerjaan",
      "proformaSerahKeOps", "proformaSerahKeDukbis", "noSiSpk", "jenisPekerjaan",
      "namaTongkang", "lokasiPekerjaan", "estimasiTonase", "tonaseDS", "nilaiProforma",
      "jenisSertifikat",
      ...(portofolio === "batubara" || portofolio === "ksp" ? ["tonaseDS", "keteranganSertifikatPM06", "noSertifikatPM06"] : [])
    ],
    "customer service": ["pelanggan", "nomorOrder", "tanggalOrder"],
    "admin keuangan": ["pelanggan", "dokumenSelesaiINV", "tanggalPengirimanInvoice", "tanggalPengirimanFaktur", "nomorInvoice", "fakturPajak"],
    "all": ["distribusiSertifikatPengirim", "distribusiSertifikatPengirimTanggal", "distribusiSertifikatPenerima", "distribusiSertifikatPenerimaTanggal"]
  };

  const userFields = editableFields[userPeran] || [];
  const fieldsToShow = [...new Set([...userFields, ...editableFields["all"]])];
  
  // **Mapping Custom Label untuk Field Tanggal**
  const dateLabels = {
    tanggalStatusOrder: "Status Order",
    tanggalSerahOrderKeCs: "Tanggal Serah Order ke CS",
    tanggalPekerjaan: "Tanggal Pekerjaan",
    tanggalOrder: "Tanggal Order",
    tanggalPengirimanInvoice: "Tanggal Pengiriman Invoice",
    tanggalPengirimanFaktur: "Tanggal Kirim Faktur Pajak",
    proformaSerahKeOps: "Proforma Serah ke Ops",
    proformaSerahKeDukbis: "Proforma Serah ke Dukbis",
    distribusiSertifikatPengirimTanggal: "Tanggal Distribusi Sertifikat Pengirim",
    distribusiSertifikatPenerimaTanggal: "Tanggal Distribusi Sertifikat Penerima",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value ?? "" });
  };

  const handleDateConversion = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return ""; // Jika null/undefined, return string kosong
    return new Date(timestamp.seconds * 1000).toISOString().split("T")[0]; // Format YYYY-MM-DD
  };
  
  // Fungsi menangani perubahan input tanggal
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value ? Timestamp.fromDate(new Date(value)) : null, // Simpan sebagai Timestamp Firestore
    });
  };

  // Fungsi menangani perubahan file
const handleFileChange = (e) => {
  const { name, files } = e.target;
  if (!files.length) return;
  
  setFiles((prevFiles) => ({
    ...prevFiles,
    [name]: files[0], // Simpan file ke state
  }));
};

// Fungsi hapus file yang sudah diupload
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let uploadedFiles = {};
      for (const key in files) {
        if (files[key]) {
          uploadedFiles[key] = await uploadToCloudinary(files[key]);
        }
      }

      const updatedDocuments = { ...formData.documents };
      deletedFiles.forEach((key) => delete updatedDocuments[key]);

      const updatedData = {
        ...formData,
        updatedAt: Timestamp.now(),
        documents: {
          ...updatedDocuments,
          ...Object.keys(uploadedFiles).reduce((acc, key) => ({
            ...acc,
            [key]: {
              fileName: files[key].name,
              fileUrl: uploadedFiles[key],
              uploadedBy: userData.email,
              uploadedAt: Timestamp.now(),
            },
          }), {}),
        },
      };

      await updateOrder(id, updatedData);
      alert("✅ Data berhasil diperbarui!");
      navigate(`/orders/${portofolio}/detail/${id}`);
    } catch (error) {
      console.error("Gagal menyimpan perubahan:", error);
      alert("❌ Terjadi kesalahan saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center text-gray-600">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Edit Data Order</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
         {/* Pelanggan (Read-Only) */}
         <label>Pelanggan</label>
        <input type="text" value={formData.pelanggan} className="w-full p-2 border rounded-lg bg-gray-100" />

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
                    <input type="date" name="tanggalStatusOrder" value={formData.tanggalStatusOrder ? formatDateForInput(formData.tanggalStatusOrder) : ""} onChange={handleDateChange} className="w-full p-2 border rounded-lg bg-gray-100"  />

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

        {/* Hak Akses Admin Portofolio
{userPeran === "admin portofolio" && (
          <>
            <label>Nomor Si/Spk</label>
                    <input type="text" name="nilaiProforma" value={formData.noSiSpk || ""} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-100"  />

          </>
        )} */}

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
        {/* Menampilkan semua field tanggal dengan label custom */}
{Object.entries(allFields).map(([key, label]) => {
  if ([
    "tanggalOrder", "tanggalSerahOrderKeCs", "tanggalPekerjaan", 
    "tanggalPengirimanInvoice", "tanggalPengirimanFaktur", 
    "proformaSerahKeOps", "proformaSerahKeDukbis", 
    "distribusiSertifikatPengirimTanggal", "distribusiSertifikatPenerimaTanggal"
  ].includes(key) && fieldsToShow.includes(key)) {
    return (
      <div key={key}>
        <label>{dateLabels[key] || label}</label>
        <input 
          type="date" 
          name={key} 
          value={formData[key] ? handleDateConversion(formData[key]) : ""}
          onChange={handleDateChange} 
          className="w-full p-2 border rounded-lg" 
        />
      </div>
    );
  }
  return null;
})}

            <label>Distribusi Sertifikat Pengirim</label>
                    <input type="text" name="distribusiSertifikatPengirim" value={formData.distribusiSertifikatPengirim || ""} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-100"  />

            <label>Distribusi Sertifikat Penerima</label>
                    <input type="text" name="distribusiSertifikatPenerima" value={formData.distribusiSertifikatPenerima || ""} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-100"  />

        <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200">
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
};

export default EditOrder;
