import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../services/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { uploadToCloudinary } from "../../services/cloudinaryService";
import { ArrowLeft, Upload, Calendar, User, FileText, Map, Anchor, Database, AlertTriangle, X, AlertCircle } from "lucide-react";

const CreateOrder = () => {
  const { portofolio } = useParams();
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("user"));
  const userEmail = userData?.email || "";
  const userPeran = userData.peran || "";
  const userBidang = userData.bidang || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("main");
  const [formData, setFormData] = useState({
    pelanggan: "",
    // statusOrder: "Draft",
    // tanggalStatusOrder: null,
    tanggalSerahOrderKeCs: null,
    jenisPekerjaan: "",
    lokasiPekerjaan: "",
    noSiSpk: "",
    namaTongkang: "",
    estimasiTonase: "",
    tonaseDS: "",
  });
  

  // Tambahkan deklarasi files DI SINI, sebelum useEffect
  const [files, setFiles] = useState({ siSpk: null });
  const [filePreview, setFilePreview] = useState(null);
  
  // Untuk melacak field yang sudah disentuh/dimodifikasi
  const [touchedFields, setTouchedFields] = useState({});
  
  // Untuk melacak validasi field secara realtime
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!userPeran) {
      alert("Anda tidak memiliki akses!");
      navigate("/");
      return;
    }

    if (userPeran !== "admin portofolio") {
      alert("Anda tidak memiliki akses!");
      navigate("/");
      return;
    }
    setMounted(true);
    return () => setMounted(false);
  }, [portofolio, userPeran, userBidang]);

  // Validasi field secara realtime ketika formData berubah
  useEffect(() => {
    validateFields();
  }, [formData, files]);

  const formatDateForInput = (timestamp) => {
    if (!timestamp) return ""; // Handle jika data kosong
    return new Date(timestamp.seconds * 1000).toISOString().split("T")[0]; // Format YYYY-MM-DD
  };
  

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    
    // Tandai field sebagai sudah disentuh
    setTouchedFields({
      ...touchedFields,
      [name]: true
    });
    
    let newValue = null;
    if (value) {
      const parsedDate = new Date(value);
      if (!isNaN(parsedDate)) {
        newValue = Timestamp.fromDate(parsedDate);
      }
    }
  
    setFormData({ ...formData, [name]: newValue });
  };
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Tandai field sebagai sudah disentuh
    setTouchedFields({
      ...touchedFields,
      [name]: true
    });
  
    let newValue = value;
  
    // 🔥 Jika input bertipe tanggal, ubah ke Timestamp
    if (type === "date") {
      newValue = value ? Timestamp.fromDate(new Date(value)) : null;
    }
  
    setFormData({ ...formData, [name]: newValue });
    
    // Jika mengubah noSiSpk, hapus file jika field kosong
    if (name === "noSiSpk" && !value) {
      setFiles({ ...files, siSpk: null });
      setFilePreview(null);
    }
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    // Cek apakah ada file yang dipilih
    if (!file) return;
  
    // Pengecekan Tipe File (hanya menerima PDF dan gambar, misalnya)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']; // Ekstensi yang diperbolehkan
    if (!allowedTypes.includes(file.type)) {
      alert('Tipe file tidak didukung. Harap pilih file PDF atau gambar (JPEG/PNG).');
      return; // Hentikan jika tipe file tidak sesuai
    }
  
    // Pengecekan Ukuran File (misalnya, maksimal 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB dalam byte
    if (file.size > maxSize) {
      alert('Ukuran file terlalu besar. Harap pilih file yang kurang dari 5MB.');
      return; // Hentikan jika ukuran file melebihi batas
    }

   
    // Tandai field sebagai sudah disentuh
    setTouchedFields({
      ...touchedFields,
      "file.siSpk": true
    });
    
    if (file) {
      setFiles({ ...files, siSpk: file });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validasi field secara realtime
  const validateFields = () => {
    const errors = {};
    
    if (!formData.pelanggan) errors.pelanggan = "Nama pelanggan wajib diisi";
    // if (!formData.tanggalStatusOrder) errors.tanggalStatusOrder = "Tanggal status order wajib diisi";
    if (!formData.tanggalSerahOrderKeCs) errors.tanggalSerahOrderKeCs = "Tanggal serah order ke CS wajib diisi";
    if (!formData.jenisPekerjaan) errors.jenisPekerjaan = "Jenis pekerjaan wajib diisi";
    if (!formData.lokasiPekerjaan) errors.lokasiPekerjaan = "Lokasi pekerjaan wajib diisi";
    
    // Validasi SI/SPK: jika nomor diisi, file harus diunggah
    if (formData.noSiSpk && !files.siSpk) {
      errors.siSpkFile = "File SI/SPK wajib diunggah jika nomor SI/SPK diisi";
    }
    
    setFieldErrors(errors);
    return errors;
  };

  const validateForm = () => {
    const errors = validateFields();
    
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      setPopupMessage(firstError);
      setShowPopup(true);
      return;
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Tandai semua field sebagai sudah disentuh
    const allFields = {
      pelanggan: true,
      statusOrder: true,
      tanggalStatusOrder: true,
      tanggalSerahOrderKeCs: true,
      jenisPekerjaan: true,
      lokasiPekerjaan: true,
      noSiSpk: true,
      "file.siSpk": true,
      "siSpkFile": true,
    };
    setTouchedFields(allFields);

    const validationError = validateForm();
    if (validationError) {
      setPopupMessage(validationError);
      setShowPopup(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let uploadedFiles = {};
      if (files.siSpk) {
        uploadedFiles.siSpk = await uploadToCloudinary(files.siSpk);
      }

      const newOrder = {
        portofolio,
        pelanggan: formData.pelanggan,
        statusOrder: "New Order",
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
        nilaiProforma: 0,
        nilaiInvoice: 0,
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
      
      // Tampilkan popup sukses
      setPopupMessage("Order berhasil ditambahkan!");
      setShowPopup(true);
      
      // Redirect setelah 1.5 detik
      setTimeout(() => {
        navigate(`/orders/${portofolio}`);
      }, 1500);
    } catch (error) {
      setPopupMessage("Gagal menambahkan order. Coba lagi.");
      setShowPopup(true);
      console.error(error);
    }

    setLoading(false);
  };

  // Helper untuk menampilkan error pada field
  const getFieldErrorDisplay = (fieldName) => {
    return touchedFields[fieldName] && fieldErrors[fieldName] ? (
      <div className="text-red-500 text-xs mt-1 flex items-center">
        <AlertCircle className="w-3 h-3 mr-1" />
        {fieldErrors[fieldName]}
      </div>
    ) : null;
  };

  const getFormSection = () => {
    switch (activeSection) {
      case "main":
        return (
          <>
            {/* Informasi Pelanggan */}
            <div className="mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-500" />
                Informasi Pelanggan
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Pelanggan <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="pelanggan" 
                      value={formData.pelanggan} 
                      onChange={handleChange} 
                      className={`w-full px-4 py-3 bg-gray-50 border ${
                        touchedFields.pelanggan && fieldErrors.pelanggan 
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                          : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                      } rounded-lg focus:ring-2 transition-all focus:outline-none`} 
                      required 
                    />
                  </div>
                  {getFieldErrorDisplay("pelanggan")}
                </div>
              </div>
            </div>

            {/* Informasi Status */}
            <div className="mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                Tanggal 
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Order <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="statusOrder" 
                    value={formData.statusOrder} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none appearance-none"
                  >
                    {["Draft", "Diproses", "Selesai", "Hold", "Closed", "Next Order", "Archecking"].map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Status Order <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date" 
                    name="tanggalStatusOrder" 
                    value={formatDateForInput(formData.tanggalStatusOrder)} 
                    onChange={handleDateChange} 
                    className={`w-full px-4 py-3 bg-gray-50 border ${
                      touchedFields.tanggalStatusOrder && fieldErrors.tanggalStatusOrder 
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                    } rounded-lg focus:ring-2 transition-all focus:outline-none`} 
                    required 
                  />
                  {getFieldErrorDisplay("tanggalStatusOrder")}
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Serah Order ke CS <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date" 
                    name="tanggalSerahOrderKeCs" 
                    value={formatDateForInput(formData.tanggalSerahOrderKeCs)} 
                    onChange={handleDateChange} 
                    className={`w-full px-4 py-3 bg-gray-50 border ${
                      touchedFields.tanggalSerahOrderKeCs && fieldErrors.tanggalSerahOrderKeCs 
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                    } rounded-lg focus:ring-2 transition-all focus:outline-none`} 
                    required 
                  />
                  {getFieldErrorDisplay("tanggalSerahOrderKeCs")}
                </div>
              </div>
            </div>

            {/* Informasi Pekerjaan */}
            <div className="mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-500" />
                Detail Pekerjaan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Pekerjaan <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="jenisPekerjaan" 
                    value={formData.jenisPekerjaan} 
                    onChange={handleChange} 
                    className={`w-full px-4 py-3 bg-gray-50 border ${
                      touchedFields.jenisPekerjaan && fieldErrors.jenisPekerjaan 
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                    } rounded-lg focus:ring-2 transition-all focus:outline-none`} 
                    required 
                  />
                  {getFieldErrorDisplay("jenisPekerjaan")}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lokasi Pekerjaan <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Map className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      name="lokasiPekerjaan" 
                      value={formData.lokasiPekerjaan} 
                      onChange={handleChange} 
                      className={`pl-10 w-full px-4 py-3 bg-gray-50 border ${
                        touchedFields.lokasiPekerjaan && fieldErrors.lokasiPekerjaan 
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                          : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                      } rounded-lg focus:ring-2 transition-all focus:outline-none`} 
                      required 
                    />
                  </div>
                  {getFieldErrorDisplay("lokasiPekerjaan")}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No SI/SPK</label>
                  <input 
                    type="text" 
                    name="noSiSpk" 
                    value={formData.noSiSpk} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none" required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tongkang</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Anchor className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      name="namaTongkang" 
                      value={formData.namaTongkang} 
                      onChange={handleChange} 
                      className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none" required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Upload SI/SPK */}
            {formData.noSiSpk && (
              <div className="mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <Upload className="w-5 h-5 mr-2 text-blue-500" />
                  Dokumen SI/SPK <span className="text-red-500">*</span>
                </h3>
                <div className="space-y-4">
                {getFieldErrorDisplay("siSpkFile")}
                  {/* Atau tambahkan pesan error secara langsung */}
                  {touchedFields["siSpkFile"] && fieldErrors.siSpkFile && (
                    <div className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {fieldErrors.siSpkFile}
                    </div>
                  )}
                  <div className={`border-2 ${
                    touchedFields["file.siSpk"] && fieldErrors.siSpkFile 
                      ? "border-red-300" 
                      : "border-dashed border-gray-300"
                  } rounded-lg p-6 text-center hover:bg-gray-50 transition-colors`}>
                    <input 
                      type="file" 
                      id="file-upload" 
                      name="siSpkFile"
                      onChange={handleFileChange} 
                      className="sr-only" // Screen reader only - lebih baik daripada hidden
                      style={{
                        position: 'absolute', // Posisi absolute untuk tetap bisa difokuskan
                        width: '1px',
                        height: '1px',
                        padding: '0',
                        margin: '-1px',
                        overflow: 'hidden',
                        clip: 'rect(0, 0, 0, 0)',
                        whiteSpace: 'nowrap',
                        borderWidth: '0'
                      }}
                      required={formData.noSiSpk ? true : false}
                      aria-required={formData.noSiSpk ? "true" : "false"}
                    />
                    <label 
                      htmlFor="file-upload" 
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      {filePreview ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-center">
                            <FileText className="h-10 w-10 text-blue-500" />
                          </div>
                          <span className="text-sm text-gray-600">{files.siSpk?.name}</span>
                          <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg inline-block">
                            Ubah file
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="h-12 w-12 text-blue-400" />
                          <div>
                            <p className="text-sm font-medium text-blue-600">Klik untuk unggah file</p>
                            <p className="text-xs text-gray-500 mt-1">PDF atau JPEG. Max 5MB</p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                  {getFieldErrorDisplay("siSpkFile")}
                </div>
              </div>
            )}

            {/* Informasi Tonase */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2 text-blue-500" />
                Informasi Tonase
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimasi Kuantitas/Tonase</label>
                  <input 
                    type="number" 
                    name="estimasiTonase" 
                    value={formData.estimasiTonase} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none" 
                  />
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tonase DS</label>
                  <input 
                    type="number" 
                    name="tonaseDS" 
                    value={formData.tonaseDS} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none" 
                  />
                </div> */}
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  // Komponen Popup Notification
  const NotificationPopup = () => {
    return showPopup ? (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity duration-300">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-100 opacity-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-blue-500" />
              Pemberitahuan
            </h3>
            <button 
              onClick={() => setShowPopup(false)} 
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-4">
            <p className="text-gray-600">{popupMessage}</p>
          </div>
          <div className="flex justify-end">
            <button 
              onClick={() => setShowPopup(false)} 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    ) : null;
  };

  return (
    <div className={`p-6 max-w-4xl mx-auto transition-all duration-500 ${
      mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
    }`}>
      {/* Header with Navigation */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(`/orders/${portofolio}`)}
          className="mr-4 p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-blue-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tambah Order {portofolio.toUpperCase()}</h2>
          <div className="h-1 w-24 mt-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 rounded-full animate-gradient-x"></div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        {/* Blue accent top bar with gradient animation */}
        <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 animate-gradient-x"></div>
        
        <div className="p-6">
          {/* Error display with animation */}
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm animate-fade-in">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {getFormSection()}
            
            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-between pt-4 border-t border-gray-100 gap-4">
              <button 
                type="button"
                onClick={() => navigate(`/orders/${portofolio}`)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Batal
              </button>
              
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menambahkan...
                  </>
                ) : (
                  <>
                    Tambah Order
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Popup Notification */}
      <NotificationPopup />
    </div>
  );
};

export default CreateOrder;