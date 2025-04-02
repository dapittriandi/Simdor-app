import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../services/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { uploadToCloudinary } from "../../services/cloudinaryService";
import { ArrowLeft, Upload, Calendar, User, FileText, Map, Anchor, Database, AlertTriangle } from "lucide-react";

const CreateOrder = () => {
  const { portofolio } = useParams();
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("user"));
  const userEmail = userData?.email || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("main");
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

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const formatDateForInput = (timestamp) => {
    if (!timestamp) return ""; // Handle jika data kosong
    return new Date(timestamp.seconds * 1000).toISOString().split("T")[0]; // Format YYYY-MM-DD
  };
  
  const [files, setFiles] = useState({ siSpk: null });
  const [filePreview, setFilePreview] = useState(null);

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
    const file = e.target.files[0];
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pelanggan *</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="pelanggan" 
                      value={formData.pelanggan} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none" 
                      required 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Informasi Status */}
            <div className="mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                Status & Tanggal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Order *</label>
                  <select 
                    name="statusOrder" 
                    value={formData.statusOrder} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none appearance-none"
                  >
                    {["Draft", "Diproses", "Selesai", "Closed", "Next Order", "Archecking"].map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Status Order *</label>
                  <input 
                    type="date" 
                    name="tanggalStatusOrder" 
                    value={formatDateForInput(formData.tanggalStatusOrder)} 
                    onChange={handleDateChange} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Serah Order ke CS *</label>
                  <input 
                    type="date" 
                    name="tanggalSerahOrderKeCs" 
                    value={formatDateForInput(formData.tanggalSerahOrderKeCs)} 
                    onChange={handleDateChange} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none" 
                    required 
                  />
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Pekerjaan *</label>
                  <input 
                    type="text" 
                    name="jenisPekerjaan" 
                    value={formData.jenisPekerjaan} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi Pekerjaan *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Map className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      name="lokasiPekerjaan" 
                      value={formData.lokasiPekerjaan} 
                      onChange={handleChange} 
                      className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none" 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No SI/SPK</label>
                  <input 
                    type="text" 
                    name="noSiSpk" 
                    value={formData.noSiSpk} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none" 
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
                      className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none" 
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
                  Dokumen SI/SPK
                </h3>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                    <input 
                      type="file" 
                      id="file-upload" 
                      onChange={handleFileChange} 
                      className="hidden" 
                      required={formData.noSiSpk ? true : false}
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
                            <p className="text-xs text-gray-500 mt-1">PDF, DOCX, atau JPG. Max 10MB</p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimasi Tonase</label>
                  <input 
                    type="number" 
                    name="estimasiTonase" 
                    value={formData.estimasiTonase} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tonase DS</label>
                  <input 
                    type="number" 
                    name="tonaseDS" 
                    value={formData.tonaseDS} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none" 
                  />
                </div>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
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
    </div>
  );
};

export default CreateOrder;