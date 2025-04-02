import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, updateOrder } from "../../services/orderServices";
import { Timestamp } from "firebase/firestore";
import { uploadToCloudinary } from "../../services/cloudinaryService";
import { FiDownload, FiTrash2, FiEdit, FiEye, FiFile, FiUpload, FiCalendar, FiSave, FiArrowLeft, FiCheck } from "react-icons/fi";

const EditOrder = () => {
  const { portofolio, id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userData = JSON.parse(localStorage.getItem("user"));
  const userPeran = userData?.peran || "";
  const [files, setFiles] = useState({});
  const [deletedFiles, setDeletedFiles] = useState([]);

  useEffect(() => {
    setMounted(true);
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
    return () => setMounted(false);
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
    setSaving(true);

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
      setSaving(false);
    }
  };

  const renderFileUpload = (fileKey, displayName) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <FiFile className="mr-2 text-blue-500" /> {displayName}
        </label>
        {formData.documents?.[fileKey] ? (
          <div className="p-3 border rounded-lg bg-blue-50 border-blue-200 flex items-center justify-between transition-all hover:shadow-md">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800 truncate">{formData.documents[fileKey].fileName}</p>
              <p className="text-xs text-gray-500 flex items-center mt-1">
                <span className="mr-2">Diunggah oleh: {formData.documents[fileKey].uploadedBy}</span>•
                <span className="ml-2">{new Date(formData.documents[fileKey].uploadedAt.seconds * 1000).toLocaleDateString("id-ID")}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <a 
                href={formData.documents[fileKey].fileUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                title="Lihat"
              >
                <FiEye size={18} />
              </a>
              <label 
                className="p-2 text-amber-600 hover:bg-amber-100 rounded-full transition-colors cursor-pointer"
                title="Ubah"
              >
                <FiEdit size={18} />
                <input type="file" name={fileKey} onChange={handleFileChange} className="hidden" />
              </label>
              <button 
                type="button" 
                className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                title="Hapus"
                onClick={() => handleDeleteFile(fileKey)}
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <input 
              type="file" 
              name={fileKey} 
              onChange={handleFileChange} 
              className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
            />
            <div className="p-3 border border-dashed border-blue-300 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors">
              <FiUpload className="mr-2" />
              <span>Pilih file untuk diunggah</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading && !mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 text-center">
          <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-gray-600">Memuat data order...</p>
        </div>
      </div>
    );
  }

  if (!formData && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white shadow-lg rounded-lg text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Data Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-4">Order yang Anda cari tidak dapat ditemukan atau telah dihapus.</p>
          <button 
            onClick={() => navigate(`/orders/${portofolio}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kembali ke Daftar Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`max-w-4xl mx-auto my-8 transition-all duration-500 transform ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Blue accent bar */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 animate-gradient-x"></div>
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Edit Data Order</h2>
            <div className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
              Portofolio: <span className="font-semibold">{portofolio.toUpperCase()}</span>
            </div>
          </div>
          <p className="text-gray-600 mt-1">
            Form ini disesuaikan dengan hak akses Anda sebagai <span className="font-semibold">{userPeran}</span>
          </p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pelanggan (Read-Only) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Pelanggan</label>
              <input 
                type="text" 
                value={formData.pelanggan || ''} 
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" 
                readOnly 
              />
            </div>

            {/* Status Order - Admin Portofolio */}
            {userPeran === "admin portofolio" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Order</label>
                <select 
                  name="statusOrder" 
                  value={formData.statusOrder || ''} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {["Draft", "Diproses", "Selesai", "Closed", "Next Order", "Archecking"].map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Tanggal Status Order - Admin Portofolio */}
            {userPeran === "admin portofolio" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FiCalendar className="mr-2 text-blue-500" /> Tanggal Status Order
                </label>
                <input 
                  type="date" 
                  name="tanggalStatusOrder" 
                  value={formData.tanggalStatusOrder ? formatDateForInput(formData.tanggalStatusOrder) : ""} 
                  onChange={handleDateChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                />
              </div>
            )}

            {/* Fields for Admin Portofolio */}
            {userPeran === "admin portofolio" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Pekerjaan</label>
                  <input 
                    type="text" 
                    name="jenisPekerjaan" 
                    value={formData.jenisPekerjaan || ""} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Tongkang</label>
                  <input 
                    type="text" 
                    name="namaTongkang" 
                    value={formData.namaTongkang || ""} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi Pekerjaan</label>
                  <input 
                    type="text" 
                    name="lokasiPekerjaan" 
                    value={formData.lokasiPekerjaan || ""} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimasi Tonase</label>
                  <input 
                    type="text" 
                    name="estimasiTonase" 
                    value={formData.estimasiTonase || ""} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nilai Proforma</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">Rp</span>
                    </div>
                    <input 
                      type="number" 
                      name="nilaiProforma" 
                      value={formData.nilaiProforma || ""} 
                      onChange={handleChange} 
                      className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Si/Spk</label>
                  <input 
                    type="text" 
                    name="noSiSpk" 
                    value={formData.noSiSpk || ""} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tonase DS</label>
                  <input 
                    type="number" 
                    name="tonaseDS" 
                    value={formData.tonaseDS || ""} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  />
                </div>
              </>
            )}

            {/* Fields for Customer Service */}
            {userPeran === "customer service" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Order</label>
                <input 
                  type="text" 
                  name="nomorOrder" 
                  value={formData.nomorOrder || ""} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                />
              </div>
            )}

            {/* Fields for Admin Keuangan */}
            {userPeran === "admin keuangan" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Invoice</label>
                  <input 
                    type="text" 
                    name="nomorInvoice" 
                    value={formData.nomorInvoice || ""} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Faktur Pajak</label>
                  <input 
                    type="text" 
                    name="fakturPajak" 
                    value={formData.fakturPajak || ""} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dokumen Selesai INV</label>
                  <input 
                    type="number" 
                    name="dokumenSelesaiINV" 
                    value={formData.dokumenSelesaiINV || ""} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  />
                </div>
              </>
            )}

            {/* Fields for Distribusi Sertifikat (All users) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Distribusi Sertifikat Pengirim</label>
              <input 
                type="text" 
                name="distribusiSertifikatPengirim" 
                value={formData.distribusiSertifikatPengirim || ""} 
                onChange={handleChange} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Distribusi Sertifikat Penerima</label>
              <input 
                type="text" 
                name="distribusiSertifikatPenerima" 
                value={formData.distribusiSertifikatPenerima || ""} 
                onChange={handleChange} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
              />
            </div>
          </div>

          {/* Date Input Fields */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiCalendar className="mr-2 text-blue-500" /> Informasi Tanggal
            </h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(allFields).map(([key, label]) => {
                  if ([
                    "tanggalOrder", "tanggalSerahOrderKeCs", "tanggalPekerjaan", 
                    "tanggalPengirimanInvoice", "tanggalPengirimanFaktur", 
                    "proformaSerahKeOps", "proformaSerahKeDukbis", 
                    "distribusiSertifikatPengirimTanggal", "distribusiSertifikatPenerimaTanggal"
                  ].includes(key) && fieldsToShow.includes(key)) {
                    return (
                      <div key={key} className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">{dateLabels[key] || label}</label>
                        <input
                          type="date"
                          name={key}
                          value={formData[key] ? handleDateConversion(formData[key]) : ""}
                          onChange={handleDateChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiFile className="mr-2 text-blue-500" /> Dokumen Pendukung
            </h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              {/* SI/SPK Documents - Admin Portofolio */}
              {userPeran === "admin portofolio" && (
                renderFileUpload("siSpk", "Upload Dokumen Si/Spk")
              )}

              {/* Invoice Document - Admin Keuangan */}
              {userPeran === "admin keuangan" && (
                renderFileUpload("invoice", "Upload Dokumen Invoice")
              )}

              {/* Faktur Pajak Document - Admin Keuangan */}
              {userPeran === "admin keuangan" && (
                renderFileUpload("fakturPajak", "Upload Dokumen Faktur Pajak")
              )}
            </div>
          </div>

          {/* Keterangan Sertifikat PM06 - Admin Portofolio */}
          {userPeran === "admin portofolio" && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informasi Sertifikat PM06</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan Sertifikat PM06</label>
                  <select 
                    name="keteranganSertifikatPM06" 
                    value={formData.keteranganSertifikatPM06 || ''} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {["Tidak Ada", "Ada"].map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {formData.keteranganSertifikatPM06 === "Ada" && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Sertifikat PM06</label>
                      <input 
                        type="text" 
                        name="noSertifikatPM06" 
                        value={formData.noSertifikatPM06 || ""} 
                        onChange={handleChange} 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                      />
                    </div>
                    {renderFileUpload("sertifikatPM06", "Upload Sertifikat PM06")}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Jenis Sertifikat - Admin Portofolio */}
          {userPeran === "admin portofolio" && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informasi Sertifikat</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Sertifikat</label>
                  <select 
                    name="jenisSertifikat" 
                    value={formData.jenisSertifikat || ''} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {["Tidak Terbit Sertifikat", "LOADING", "LS (PIK)", "SERTIFIKAT", "LAPORAN", "KALIBRASI", "HALAL"].map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {formData.jenisSertifikat !== "Tidak Terbit Sertifikat" && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Sertifikat</label>
                      <input 
                        type="text" 
                        name="noSertifikat" 
                        value={formData.noSertifikat || ""} 
                        onChange={handleChange} 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                      />
                    </div>
                    {renderFileUpload("sertifikat", "Upload Sertifikat")}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Form Buttons */}
          <div className="mt-8 flex items-center justify-between">
            <button 
              type="button" 
              onClick={() => navigate(`/orders/${portofolio}/detail/${id}`)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
            >
              <FiArrowLeft className="mr-2" />
              Kembali
            </button>
            <button 
              type="submit" 
              disabled={saving || loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all transform hover:scale-[1.02] shadow-lg flex items-center"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrder;