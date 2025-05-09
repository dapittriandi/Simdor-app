import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, updateOrder } from "../../services/orderServices";
import { Timestamp } from "firebase/firestore";
import { uploadToCloudinary, deleteFromCloudinary } from "../../services/cloudinaryService";
import { FiDownload, FiFile, FiTrash2, FiEdit, FiEye, FiUpload, FiCalendar, FiCheck } from "react-icons/fi";

const LengkapiOrder = () => {
  const { portofolio, id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userData = JSON.parse(localStorage.getItem("user"));
  const userPeran = userData?.peran || "";
  const userEmail = userData?.email || "";
  const userBidang = userData.bidang || "";

  const [files, setFiles] = useState({
    siSpk: null,
    sertifikatPM06: null,
    sertifikat: null,
    invoice: null,
    fakturPajak: null,
  });

  // Tambahkan state untuk memantau status order saat ini
const [currentStatusOrder, setCurrentStatusOrder] = useState(formData.statusOrder || "New Order");

  // Add a new state for file previews
const [filePreviews, setFilePreviews] = useState({});

// Menandai input yang belum lengkap
const checkForIncompleteData = (field) => {
  return !formData[field] || formData[field] === null || formData[field] === "";
};

  // Mapping Custom Label untuk Field Tanggal
  const dateLabels = {
    tanggalStatusOrder: "Status Order",
    tanggalSerahOrderKeCs: "Tanggal Penyerahan Order ke CS",
    tanggalPekerjaan: "Tanggal Pekerjaan",
    tanggalOrder: "Tanggal Order",
    tanggalPengirimanInvoice: "Tanggal Pengiriman Invoice",
    tanggalPengirimanFaktur: "Tanggal Pengiriman Faktur Pajak",
    proformaSerahKeOps: "Tanggal Proforma diserahkan ke Operasional",
    proformaBySistem: "Tanggal Proforma By Sistem",
    proformaSerahKeDukbis: "Tanggal Proforma diserahkan ke Dukbis",
    distribusiSertifikatPengirimTanggal: "Tanggal Distribusi Sertifikat Pengirim",
    distribusiSertifikatPenerimaTanggal: "Tanggal Diterima Sertifikat",
  };

  const formatDateForInput = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return ""; // Jika null/undefined, return string kosong
    const date = timestamp.toDate();
    return date.toISOString().split("T")[0]; // Format YYYY-MM-DD
  };
  
  // Ambil data dari Firestore
  useEffect(() => {
    if (!userPeran) {
      alert("Anda tidak memiliki akses!");
      navigate("/");
      return;
    }

    if (userPeran === "admin portofolio" && userBidang !== portofolio) {
      alert("Anda tidak memiliki akses!");
      navigate("/");
      return;
    }

    setMounted(true);
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const data = await getOrderById(id);
        if (data) {
          setFormData({
            ...data,
            tanggalStatusOrder: data.tanggalStatusOrder instanceof Timestamp ? data.tanggalStatusOrder : null,
            tanggalSerahOrderKeCs: data.tanggalSerahOrderKeCs instanceof Timestamp ? data.tanggalSerahOrderKeCs : null,
            // tanggalProformaBySistem: data.tanggalSerahOrderKeCs instanceof Timestamp ? data.tanggalSerahOrderKeCs : null,
            tanggalPekerjaan: data.tanggalPekerjaan instanceof Timestamp ? data.tanggalPekerjaan : null,
            tanggalPengirimanInvoice: data.tanggalPengirimanInvoice instanceof Timestamp ? data.tanggalPengirimanInvoice : null,
            tanggalPengirimanFaktur: data.tanggalPengirimanFaktur instanceof Timestamp ? data.tanggalPengirimanFaktur : null,
          });
        }
      } catch (error) {
        console.error("❌ Error fetching order:", error);
      }
      setLoading(false);
    };
    
    fetchOrder();
    return () => setMounted(false);
  }, [portofolio, userPeran, userBidang, id]);

  // Hak akses masing-masing peran
  const editableFields = {
    "admin portofolio": [
     "tanggalSerahOrderKeCs", "tanggalPekerjaan",
      "proformaSerahKeOps", "proformaSerahKeDukbis", "proformaBySistem", "noSiSpk", "jenisPekerjaan",
      "namaTongkang", "lokasiPekerjaan", "estimasiTonase", "tonaseDS", "nilaiProforma",
      "jenisSertifikat", "tanggalStatusOrder",
      ...(portofolio === "batubara" || portofolio === "ksp" ? ["tonaseDS", "keteranganSertifikatPM06", "noSertifikatPM06"] : [])
    ],
    "customer service": ["nomorOrder", "tanggalOrder"],
    "admin keuangan": ["tanggalStatusOrder", "nilaiInvoice", "tanggalPengirimanInvoice", "tanggalPengirimanFaktur", "nomorInvoice", "fakturPajak", "invoice"],
    "all": ["distribusiSertifikatPengirim", "distribusiSertifikatPengirimTanggal", "distribusiSertifikatPenerima", "distribusiSertifikatPenerimaTanggal"]
  };

  // Helper function untuk menentukan field apa yang ditampilkan berdasarkan status order
const getFieldsToShowByStatus = (status) => {
  switch (status) {
    case "New Order":
      return ["nomorOrder", "tanggalOrder"];
    case "Entry":
      return ["tanggalPekerjaan", "tonaseDS"];
    case "Diproses - Lapangan":
      return ["keteranganSertifikatPM06", "jenisSertifikat", "noSertifikatPM06", ];
    case "Diproses - Sertifikat":
      return ["tanggalStatusOrder"];
    case "Closed Order":
      return ["proformaSerahKeOps", "proformaSerahKeDukbis", "proformaBySistem", "nilaiProforma"];
    case "Penerbitan Proforma":
      return ["tanggalPengirimanInvoice", "tanggalPengirimanFaktur", "nomorInvoice", "invoice", "fakturPajak", "nilaiInvoice"];
    case "Invoice":
      return [
        "distribusiSertifikatPengirim",
        "distribusiSertifikatPengirimTanggal",
        "distribusiSertifikatPenerima",
        "distribusiSertifikatPenerimaTanggal"
      ];
    default:
      return [];
  }
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
      // console.error("Gagal menghapus file:", error);
      alert("Terjadi kesalahan saat menghapus file.");
    } finally {
      setLoading(false);
    }
  };  

  const handleChange = (e) => {
    const { name, value, type } = e.target;
  
    let newValue = value.trim() === "" ? null : value;
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
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files.length) return;
   // Cek apakah ada file yang dipilih

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
    // Update state untuk menyimpan file yang dipilih
  setFiles((prevFiles) => ({
    ...prevFiles,
    [name]: file, // Simpan file pertama yang dipilih
  }));

  // Update formData.documents
  setFormData((prevFormData) => ({
    ...prevFormData,
    documents: {
      ...prevFormData.documents,
      [name]: {
        fileName: files.name,
        fileUrl: "", // Dapatkan URL file jika sudah diupload
        uploadedBy: userData.email,
        uploadedAt: Timestamp.now(),
      },
    },
  }));
  
    // Create a preview
    setFilePreviews((prevPreviews) => ({
      ...prevPreviews,
      [name]: {
        fileName: files.name,
        fileSize: (files[0].size / 1024).toFixed(2) + " KB",
        fileType: files.type,
      },
    }));
  };

  const [uploadingFiles, setUploadingFiles] = useState({});

  // Modified function to handle file upload on submit
const uploadFile = async (fileKey, file) => {
  if (!file) return null;
  
  // Set uploading state for this file
  setUploadingFiles(prev => ({
    ...prev,
    [fileKey]: true
  }));
  
  try {
    const uploadedFileUrl = await uploadToCloudinary(file);
    
    return {
      key: fileKey,
      fileUrl: uploadedFileUrl,
      fileName: file.name
    };
  } catch (error) {
    // console.error(`Error uploading ${fileKey}:`, error);
    return null;
  } finally {
    // Clear uploading state
    setUploadingFiles(prev => ({
      ...prev,
      [fileKey]: false
    }));
  }
};

  const handleFormattedProforma = (e) => {
    const input = e.target.value;
    const rawValue = input.replace(/\D/g, ""); // hanya angka
    const formatted = rawValue ? Number(rawValue).toLocaleString("id-ID") : "";

    setFormData((prev) => ({
      ...prev,
      nilaiProformaRaw: rawValue,     // <-- untuk submit ke Firebase
      nilaiProforma: formatted,
      // nilaiInvoiceRaw: rawValue,     // <-- untuk submit ke Firebase
      // nilaiInvoice: formatted         // <-- untuk ditampilkan di UI
    }));
  };
  const handleFormattedInvoice = (e) => {
    const input = e.target.value;
    const rawValue = input.replace(/\D/g, ""); // hanya angka
    const formatted = rawValue ? Number(rawValue).toLocaleString("id-ID") : "";

    setFormData((prev) => ({
      ...prev,
      nilaiInvoiceRaw: rawValue,     // <-- untuk submit ke Firebase
      nilaiInvoice: formatted        // <-- untuk ditampilkan di UI
    }));
  };

 const validateFormData = () => {
  const errors = [];
  
  // Validasi faktur pajak (Admin Keuangan)
  if (userPeran === "admin keuangan") {
    // Cek faktur pajak dan file faktur harus diisi bersamaan
    const hasFakturPajak = formData.fakturPajak && formData.fakturPajak.trim() !== "";
    const hasFakturPajakFile = formData.documents?.fakturPajak || files.fakturPajak;
    
    if ((hasFakturPajak && !hasFakturPajakFile) || (!hasFakturPajak && hasFakturPajakFile)) {
      errors.push("Faktur Pajak dan File Faktur Pajak harus diisi bersamaan.");
    }
    
    // Cek nomor invoice dan file invoice harus diisi bersamaan
    const hasNomorInvoice = formData.nomorInvoice && formData.nomorInvoice.trim() !== "";
    const hasInvoiceFile = formData.documents?.invoice || files.invoice;
    
    if ((hasNomorInvoice && !hasInvoiceFile) || (!hasNomorInvoice && hasInvoiceFile)) {
      errors.push("Nomor Invoice dan File Invoice harus diisi bersamaan.");
    }
  }
  
  // Validasi Si/Spk (Admin Portofolio)
  if (userPeran === "admin portofolio") {
    const hasNoSiSpk = formData.noSiSpk && formData.noSiSpk.trim() !== "";
    const hasSiSpkFile = formData.documents?.siSpk || files.siSpk;
    
    if ((hasNoSiSpk && !hasSiSpkFile) || (!hasNoSiSpk && hasSiSpkFile)) {
      errors.push("Nomor Si/Spk dan File Si/Spk harus diisi bersamaan.");
    }
    
    // Validasi sertifikat PM06
    const isSertifikatPM06Ada = formData.keteranganSertifikatPM06 === "Ada";
    
    if (isSertifikatPM06Ada) {
      const hasNoSertifikatPM06 = formData.noSertifikatPM06 && formData.noSertifikatPM06.trim() !== "";
      const hasSertifikatPM06File = formData.documents?.sertifikatPM06 || files.sertifikatPM06;
      
      if (!hasNoSertifikatPM06 || !hasSertifikatPM06File) {
        errors.push("Nomor Sertifikat PM06 dan File Sertifikat PM06 wajib diisi jika keterangan 'Ada'.");
      }
    }
    
    // Validasi untuk sertifikat utama
    const isSertifikatTerbit = formData.jenisSertifikat && formData.jenisSertifikat !== "Tidak Terbit Sertifikat";
    
    if (isSertifikatTerbit) {
      const hasNoSertifikat = formData.noSertifikat && formData.noSertifikat.trim() !== "";
      const hasSertifikatFile = formData.documents?.sertifikat || files.sertifikat;
      
      if (!hasNoSertifikat || !hasSertifikatFile) {
        errors.push("Nomor Sertifikat dan File Sertifikat wajib diisi jika jenis sertifikat bukan 'Tidak Terbit Sertifikat'.");
      }
    }
  }
  
  // Validasi File Harus Ada
  const isFileRequired = formData.documents && Object.keys(formData.documents).length === 0;
  if (isFileRequired) {
    errors.push("File tidak boleh kosong. Harap unggah file yang diperlukan.");
  }

  return errors;
};

  // const checkRequiredFields = (status) => {
  //   const requiredFields = {
  //     "": ["pelanggan", "noSiSpk", "jenisPekerjaan", "namaTongkang", "lokasiPekerjaan", "estimasiTonase"],
  //     "NewOrder": ["pelanggan", "tanggalStatusOrder", "tanggalSerahOrderKeCs", "noSiSpk", "jenisPekerjaan", "namaTongkang", "lokasiPekerjaan", "estimasiTonase", "nomorOrder", "tanggalOrder"],
  //     "Entry": ["pelanggan", "tanggalStatusOrder", "tanggalSerahOrderKeCs", "noSiSpk", "jenisPekerjaan", "namaTongkang", "lokasiPekerjaan", "estimasiTonase", "nomorOrder", "tanggalOrder", "tanggalPekerjaan", "tonaseDS"],
  //     "Diproses - Lapangan": ["pelanggan", "tanggalStatusOrder", "tanggalSerahOrderKeCs", "noSiSpk", "jenisPekerjaan", "namaTongkang", "lokasiPekerjaan", "estimasiTonase", "nomorOrder", "tanggalOrder", "tanggalPekerjaan", "tonaseDS", "keteranganSertifikatPM06", "jenisSertifikat", "noSertifikat", "noSertifikatPM06"],
  //     "Diproses - Sertifikat": ["pelanggan", "tanggalStatusOrder", "tanggalSerahOrderKeCs", "noSiSpk", "jenisPekerjaan", "namaTongkang", "lokasiPekerjaan", "estimasiTonase", "nomorOrder", "tanggalOrder", "tanggalPekerjaan", "tonaseDS", "keteranganSertifikatPM06", "jenisSertifikat", "noSertifikat", "noSertifikatPM06", "nomorInvoice", "fakturPajak"],
  //     "closed invoice": ["pelanggan", "tanggalStatusOrder", "tanggalSerahOrderKeCs", "noSiSpk", "jenisPekerjaan", "namaTongkang", "lokasiPekerjaan", "estimasiTonase", "nomorOrder", "tanggalOrder", "tanggalPekerjaan", "tonaseDS", "keteranganSertifikatPM06", "jenisSertifikat", "noSertifikat", "noSertifikatPM06", "nomorInvoice", "fakturPajak", "distribusiSertifikatPengirim", "distribusiSertifikatPengirimTanggal", "distribusiSertifikatPenerima", "distribusiSertifikatPenerimaTanggal"],
  //     "Selesai":["pelanggan", "tanggalStatusOrder", "tanggalSerahOrderKeCs", "noSiSpk", "jenisPekerjaan", "namaTongkang", "lokasiPekerjaan", "estimasiTonase", "nomorOrder", "tanggalOrder", "tanggalPekerjaan", "tonaseDS", "keteranganSertifikatPM06", "jenisSertifikat", "noSertifikat", "noSertifikatPM06", "nomorInvoice", "fakturPajak", "distribusiSertifikatPengirim", "distribusiSertifikatPengirimTanggal", "distribusiSertifikatPenerima", "distribusiSertifikatPenerimaTanggal"],
  //   };

  //   return requiredFields[status]?.filter(field => !formData[field] || formData[field] === "");
  // };

  const checkRequiredFields = (status) => {
    const requiredFields = {
      "": ["pelanggan", "noSiSpk", "jenisPekerjaan", "namaTongkang", "lokasiPekerjaan", "estimasiTonase"],
      "New Order": ["nomorOrder", "tanggalOrder"],
      "Entry": ["tanggalPekerjaan", "tonaseDS"],
      "Diproses - Lapangan": [ "jenisSertifikat", ],
      "Diproses - Sertifikat": ["tanggalStatusOrder"],
      "Closed Order": ["proformaSerahKeOps", "proformaSerahKeDukbis", "proformaBySistem", "nilaiProforma"],
      "Penerbitan Proforma": ["nomorInvoice", "fakturPajak", "nilaiInvoice"],
      "Invoice": ["distribusiSertifikatPengirim", "distribusiSertifikatPengirimTanggal", "distribusiSertifikatPenerima", "distribusiSertifikatPenerimaTanggal"],
    };
  
  // Check if the required fields for "Diproses - Lapangan" are valid
  const missingFields = [];

  // Get the fields required for the current status
  const fieldsForCurrentStatus = requiredFields[status] || [];

  // Validasi untuk status Diproses - Lapangan (Memastikan salah satu sertifikat diisi)
  // Cek untuk Diproses - Lapangan: minimal salah satu sertifikat harus diisi
  if (status === "Diproses - Lapangan") {
    if (formData.jenisSertifikat === "-") {
      missingFields.push("keteranganSertifikatPM06 atau jenisSertifikat (salah satu wajib diisi)");
    }
  }

  // Periksa jika field lainnya belum diisi
  fieldsForCurrentStatus.forEach(field => {
    if (!formData[field] || formData[field] === "") {
      missingFields.push(field);
    }
  });

  return missingFields;
  };

  const checkDistributionFields = () => {
    // Field distribusi sertifikat yang harus diisi
    const distributionFields = [
      "distribusiSertifikatPengirim", 
      "distribusiSertifikatPengirimTanggal", 
      "distribusiSertifikatPenerima", 
      "distribusiSertifikatPenerimaTanggal"
    ];
  
    // Periksa apakah semua field distribusi sertifikat sudah terisi
    for (const field of distributionFields) {
      if (!formData[field] || formData[field] === "") {
        return false; // Jika ada field yang kosong, return false
      }
    }
  
    return true; // Semua field terisi, return true
  };
  
  
  const getNextStatus = (currentStatus) => {
    const statusOrderList = [
      "New Order",
      "Entry",
      "Diproses - Lapangan",
      "Diproses - Sertifikat",
      "Closed Order",
      "Penerbitan Proforma",
      "Invoice",
      "Selesai"
    ];
  
    const currentIndex = statusOrderList.indexOf(currentStatus);
  
    if (currentIndex === -1 || currentIndex === statusOrderList.length - 1) {
      // If already at the last status or invalid status, no change
      return null;
    }
  
    // Return the next status
    return statusOrderList[currentIndex + 1];
  };

 // Mendapatkan daftar field yang akan ditampilkan berdasarkan status order
  const fieldsToShowBasedOnStatus = getFieldsToShowByStatus(currentStatusOrder);

  // Modifikasi kode untuk menampilkan field berdasarkan status dan peran
  // Tambahkan kondisi pengecekan apakah field perlu ditampilkan berdasarkan status dan peran
  const shouldShowField = (fieldName) => {
    const hasFieldAccessPermission = fieldsToShow.includes(fieldName);
    const isFieldRelevantForCurrentStatus = fieldsToShowBasedOnStatus.includes(fieldName);
    
    // Field hanya ditampilkan jika memiliki akses dan relevan dengan status saat ini
    return hasFieldAccessPermission && isFieldRelevantForCurrentStatus;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validasi form data terlebih dahulu
    const validationErrors = validateFormData();
  
    if (validationErrors.length > 0) {
      // Tampilkan pesan error
      alert(`Error:\n${validationErrors.join('\n')}`);
      return; // Hentikan proses submit
    }

    const missingFields = checkRequiredFields(formData.statusOrder);
    if (missingFields.length > 0) {
      alert(`Field berikut harus diisi untuk status '${formData.statusOrder}':\n${missingFields.join(", ")}`);
      return; // Hentikan proses submit jika data belum lengkap
    }

  // Tentukan status berikutnya
  const nextStatus = getNextStatus(formData.statusOrder);
  if (!nextStatus) {
      alert("Status sudah berada di tahap terakhir.");
      return;
  }

   // Cek apakah status order adalah "Closed Invoice" dan jika semua field distribusi sertifikat terisi
   if (formData.statusOrder === "Invoice" && checkDistributionFields()) {
    setFormData((prevData) => ({
      ...prevData,
      statusOrder: "Selesai",  // Ubah status menjadi "Selesai" jika semua field distribusi sertifikat sudah terisi
    }));
  }

  // Tentukan tanggalStatusOrder berdasarkan kondisi status
  let statusDate;
  if (nextStatus === "Closed Order" && formData.tanggalStatusOrder) {
    // Jika status adalah "Diproses - Sertifikat" dan ada tanggal yang diisi, gunakan tanggal tersebut
    statusDate = formData.tanggalStatusOrder;
  } else {
    // Untuk status lainnya, gunakan waktu saat ini
    statusDate = Timestamp.now();
  }

    const payload = {
      ...formData,
      statusOrder: nextStatus, // Pastikan statusOrder sudah ada di sini
      tanggalStatusOrder: statusDate,  
      nilaiProforma: typeof formData.nilaiProforma === "string"
        ? Number(formData.nilaiProforma.replace(/\./g, ""))
        : (typeof formData.nilaiProforma === "number" ? formData.nilaiProforma : null),
      nilaiInvoice: typeof formData.nilaiInvoice === "string"
        ? Number(formData.nilaiInvoice.replace(/\./g, ""))
        : (typeof formData.nilaiInvoice === "number" ? formData.nilaiInvoice : null)
    };
  
    setLoading(true);
    setSaving(true);
  
    try {
      // Get existing data first
      const existingData = await getOrderById(id);
      // Upload all files in parallel and track which ones are being uploaded
      const fileKeys = Object.keys(files).filter(key => files[key] !== null);
      
      // Set all files as uploading
      fileKeys.forEach(key => {
        setUploadingFiles(prev => ({
          ...prev,
          [key]: true
        }));
      });
      
      const uploadPromises = fileKeys.map(key => uploadFile(key, files[key]));
      const uploadedFiles = await Promise.all(uploadPromises);
      
      // Clear uploading status for all files
      fileKeys.forEach(key => {
        setUploadingFiles(prev => ({
          ...prev,
          [key]: false
        }));
      });
  
      // Convert uploaded files to document objects
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
  
      // Update data in Firestore
      const updatedData = {
        ...existingData,
        ...payload,
        updatedAt: Timestamp.now(),
        lastUpdatedBy: userEmail,
        documents: {
          ...formData.documents,
          ...uploadedDocuments,
        },
      };
  
      await updateOrder(id, updatedData);
      
      // Clear file states after successful upload
      setFiles({
        siSpk: null,
        sertifikatPM06: null,
        sertifikat: null,
        invoice: null,
        fakturPajak: null,
      });
      setFilePreviews({});
      
      alert("Data berhasil diperbarui!");
      navigate(`/orders/${portofolio}/detail/${id}`);
    } catch (error) {
      // console.error("Gagal mengunggah file:", error);
      alert("Terjadi kesalahan saat mengunggah file.");
    } finally {
      setLoading(false);
      setSaving(false);
    }
  };

  useEffect(() => {
  setMounted(true);
  const fetchOrder = async () => {
    setLoading(true);
    try {
      const data = await getOrderById(id);
      if (data) {
        setFormData({
          ...data,
          jenisSertifikat: data.jenisSertifikat || "Tidak Terbit Sertifikat", // Set default jika belum ada
          tanggalStatusOrder: data.tanggalStatusOrder instanceof Timestamp ? data.tanggalStatusOrder : null,
          tanggalSerahOrderKeCs: data.tanggalSerahOrderKeCs instanceof Timestamp ? data.tanggalSerahOrderKeCs : null,
          tanggalPekerjaan: data.tanggalPekerjaan instanceof Timestamp ? data.tanggalPekerjaan : null,
          tanggalPengirimanInvoice: data.tanggalPengirimanInvoice instanceof Timestamp ? data.tanggalPengirimanInvoice : null,
          tanggalPengirimanFaktur: data.tanggalPengirimanFaktur instanceof Timestamp ? data.tanggalPengirimanFaktur : null,
          statusOrder: data.statusOrder,  // Menampilkan status terbaru
          // tanggalStatusOrder: data.tanggalStatusOrder,  // Menampilkan tanggal perubahan status
        });
        setCurrentStatusOrder(data.statusOrder || "New Order");
      }
    } catch (error) {
      console.error("❌ Error fetching order:", error);
    }
    setLoading(false);
  };
  
  fetchOrder();
  return () => setMounted(false);
}, [id]);
  
const renderFileUpload = (fileKey, displayName) => {
  const hasExistingFile = formData.documents?.[fileKey];
  const hasNewFile = files[fileKey] || filePreviews[fileKey];
  const isUploading = uploadingFiles[fileKey];
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
        <FiFile className="mr-2 text-blue-500" /> {displayName}
      </label>
      
      {/* Existing File from Database */}
      {hasExistingFile && !hasNewFile ? (
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
      ) : hasNewFile ? (
        /* New file preview (not yet uploaded to Cloudinary) */
        <div className="p-3 border rounded-lg bg-green-50 border-green-200 flex items-center justify-between transition-all hover:shadow-md">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {filePreviews[fileKey]?.fileName || files[fileKey]?.name || "File baru"}
            </p>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="mr-2">Ukuran: {filePreviews[fileKey]?.fileSize || (files[fileKey] ? (files[fileKey].size / 1024).toFixed(2) + " KB" : "")}</span>
              <span className="ml-2 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">Belum disimpan</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              type="button" 
              className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
              title="Batalkan"
              onClick={() => {
                setFiles((prevFiles) => ({ ...prevFiles, [fileKey]: null }));
                setFilePreviews((prevPreviews) => {
                  const updated = { ...prevPreviews };
                  delete updated[fileKey];
                  return updated;
                });
              }}
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </div>
      ) : (
        /* No file - Upload option */
        <div className="relative">
          <input 
            type="file" 
            name={fileKey} 
            onChange={handleFileChange} 
            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
            disabled={isUploading}
          />
          <div className={`p-3 border border-dashed ${isUploading ? 'border-amber-300 bg-amber-50' : 'border-blue-300 bg-blue-50'} rounded-lg flex items-center justify-center ${isUploading ? 'text-amber-600' : 'text-blue-600'} hover:bg-blue-100 transition-colors`}>
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Mengunggah file...</span>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <FiUpload className="h-12 w-12 text-blue-400" />
                  <p className="text-sm font-medium text-blue-600">Klik untuk unggah file</p>
                  <p className="text-xs text-gray-500 mt-1">PDF atau JPEG. Max 5MB</p>
                </div>
              </>
            )}
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
        {/* Accent bar */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 animate-gradient-x"></div>
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Lengkapi Data Order</h2>
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
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" 
                readOnly 
              />
            </div>

            {/* Tanggal Status Order - Admin Portofolio */}
            {(userPeran === "admin portofolio" || userPeran === "admin keuangan") && formData.statusOrder === "Diproses - Sertifikat" && (
                shouldShowField('tanggalStatusOrder') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FiCalendar className="mr-2 text-blue-500" /> Pilih Tanggal Closed
                    </label>
                    <input
                      type="date"
                      name="tanggalStatusOrder"
                      value={formData.tanggalStatusOrder ? formatDateForInput(formData.tanggalStatusOrder) : ""}
                      onChange={handleDateChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    {checkForIncompleteData('tanggalStatusOrder') && (
                      <p className="text-red-500 text-sm mt-1">Data belum lengkap</p>
                    )}
                  </div>
                )
              )}
              
            {/* Fields for Admin Portofolio */}
            {userPeran === "admin portofolio" && (
              <>
               {shouldShowField('jenisPekerjaan') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Pekerjaan</label>
                  <input 
                    type="text" 
                    name="jenisPekerjaan" 
                    value={formData.jenisPekerjaan || ""} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  />
                  {checkForIncompleteData('jenisPekerjaan') && (
                    <p className="text-red-500 text-sm mt-1">Data belum lengkap</p>
                  )}
                </div>
                )}

                {shouldShowField('namaTongkang') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Tongkang</label>
                  <input 
                    type="text" 
                    name="namaTongkang" 
                    value={formData.namaTongkang || ""} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  />
                  {checkForIncompleteData('namaTongkang') && (
                    <p className="text-red-500 text-sm mt-1">Data belum lengkap</p>
                  )}
                </div>
                )}

                {shouldShowField('lokasiPekerjaan') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi Pekerjaan</label>
                  <input 
                    type="text" 
                    name="lokasiPekerjaan" 
                    value={formData.lokasiPekerjaan || ""} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  />
                  {checkForIncompleteData('lokasiPekerjaan') && (
                    <p className="text-red-500 text-sm mt-1">Data belum lengkap</p>
                  )}
                </div>
                )}
                
                {shouldShowField('estimasiTonase') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimasi Kuantitas</label>
                  <input 
                    type="text" 
                    name="estimasiTonase" 
                    value={formData.estimasiTonase || ""} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  />
                  {checkForIncompleteData('estimasiTonase') && (
                    <p className="text-red-500 text-sm mt-1">Data belum lengkap</p>
                  )}
                </div>
                )}

                {shouldShowField('nilaiProforma') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nilai Proforma</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">Rp</span>
                    </div>
                    <input 
                      type="text" 
                      name="nilaiProforma" 
                      value={formData.nilaiProforma || ""} 
                      onChange={handleFormattedProforma} 
                      className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    />
                    {checkForIncompleteData('nilaiProforma') && (
                      <p className="text-red-500 text-sm mt-1">Data belum lengkap</p>
                    )}
                  </div>
                </div>
                )}

                {shouldShowField('noSiSpk') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Si/Spk</label>
                  <input 
                    type="text" 
                    name="noSiSpk" 
                    value={formData.noSiSpk || ""} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  />
                  {checkForIncompleteData('noSiSpk') && (
                    <p className="text-red-500 text-sm mt-1">Data belum lengkap</p>
                  )}
                </div>
                )}

                {shouldShowField('tonaseDS') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tonase DS</label>
                  <input 
                    type="number" 
                    name="tonaseDS" 
                    value={formData.tonaseDS || ""} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  />
                  {checkForIncompleteData('tonaseDS') && (
                    <p className="text-red-500 text-sm mt-1">Data belum lengkap</p>
                  )}
                </div>
                )}

              </>
            )}

            {/* Fields for Customer Service */}
            {userPeran === "customer service" && (
              shouldShowField('nomorOrder') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Order</label>
                <input 
                  type="text" 
                  name="nomorOrder" 
                  value={formData.nomorOrder || ""} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                />
                {checkForIncompleteData('nomorOrder') && (
                  <p className="text-red-500 text-sm mt-1">Data belum lengkap</p>
                )}
              </div>
            ))}

            {/* Fields for Admin Keuangan */}
            {userPeran === "admin keuangan" && (
              <>
                {shouldShowField('nomorInvoice') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Invoice</label>
                  <input 
                    type="text" 
                    name="nomorInvoice" 
                    value={formData.nomorInvoice || ""} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  />
                  {checkForIncompleteData('nomorInvoice') && (
                    <p className="text-red-500 text-sm mt-1">Data belum lengkap</p>
                  )}
                </div>
                  )}

                  {shouldShowField('fakturPajak') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Seri Faktur Pajak</label>
                  <input 
                    type="text" 
                    name="fakturPajak" 
                    value={formData.fakturPajak || ""} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  />
                  {checkForIncompleteData('fakturPajak') && (
                    <p className="text-red-500 text-sm mt-1">Data belum lengkap</p>
                  )}
                </div>
                  )}

                  {shouldShowField('nilaiInvoice') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nilai Invoice (Fee)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">Rp</span>
                    </div>
                      <input 
                        type="text" 
                        name="nilaiInvoice" 
                        value={formData.nilaiInvoice || ""} 
                        onChange={handleFormattedInvoice} 
                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                      />
                      {checkForIncompleteData('nilaiInvoice') && (
                        <p className="text-red-500 text-sm mt-1">Data belum lengkap</p>
                      )}
                  </div>
                </div>
                )}
              </>
            )}

          {shouldShowField('distribusiSertifikatPengirim') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Yang Mendistribusi/Mengirim Sertifikat
              </label>
              <input
                type="text"
                name="distribusiSertifikatPengirim"
                value={formData.distribusiSertifikatPengirim || ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {checkForIncompleteData('distribusiSertifikatPengirim') && (
                <p className="text-red-500 text-sm mt-1">Data belum lengkap</p>
              )}
           </div>
          )}
              
            {shouldShowField('distribusiSertifikatPenerima') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Yang Menerima Sertifikat </label>
              <input 
                type="text" 
                name="distribusiSertifikatPenerima" 
                value={formData.distribusiSertifikatPenerima || ""} 
                onChange={handleChange} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
              />
              {checkForIncompleteData('distribusiSertifikatPenerima') && (
                <p className="text-red-500 text-sm mt-1">Data belum lengkap</p>
              )}
            </div>
            )}
            
          </div>

          {/* Date Input Fields */}
          <div className="mt-8">
            {/* <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiCalendar className="mr-2 text-blue-500" /> Informasi Tanggal
            </h3> */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(dateLabels).map((key) =>
                  fieldsToShow.includes(key) ? (
                    shouldShowField(key) && !shouldShowField("tanggalStatusOrder")  && (
                    <div key={key} className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">{dateLabels[key]}</label>
                      <input
                        type="date"
                        name={key}
                        value={formData[key] ? formatDateForInput(formData[key]) : ""}
                        onChange={handleDateChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      {checkForIncompleteData(key) && (
                        <p className="text-red-500 text-sm mt-1">Data belum lengkap</p>
                      )}
                    </div>
                    )
                  ) : null
                )}
              </div>
            </div>
          </div>

          
          {/* Keterangan Sertifikat PM06 - Admin Portofolio */}
          {shouldShowField('keteranganSertifikatPM06') && (
            <>
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
                      {checkForIncompleteData('noSertifikatPM06') && (
                        <p className="text-red-500 text-sm mt-1">Isi Nomor SertifikatPM06</p>
                      )}
                    </div>
                    {renderFileUpload("sertifikatPM06", "Upload Sertifikat PM06")}
                  </>
                )}
              </div>
            </div>
          )}
          </>
          )}

          {/* Jenis Sertifikat - Admin Portofolio */}
          {shouldShowField('jenisSertifikat') && (
            <>
          {userPeran === "admin portofolio" && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informasi Sertifikat</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Sertifikat</label>
                  <select 
                    name="jenisSertifikat" 
                    value={formData.jenisSertifikat || '-'} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {["-","Tidak Terbit Sertifikat", "LOADING", "LS (PIK)", "SERTIFIKAT", "LAPORAN", "KALIBRASI", "HALAL"].map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {formData.jenisSertifikat != "-" && formData.jenisSertifikat != "Tidak Terbit Sertifikat"   && (
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
                      {checkForIncompleteData('noSertifikat') && (
                        <p className="text-red-500 text-sm mt-1">Isi Nomor Sertifikat</p>
                      )}
                    </div>
                    {renderFileUpload("sertifikat", "Upload Sertifikat")}
                  </>
                )}
              </div>
            </div>
          )}
          </>
          )}

          {/* File Uploads Section */}
          <div className="mt-8">
            {/* <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiFile className="mr-2 text-blue-500" /> Dokumen Pendukung
            </h3> */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 gap-4">
                {/* Si/Spk Document - Admin Portofolio */}
                {shouldShowField('siSpk') && (
                  <>
                {userPeran === "admin portofolio" && (
                  renderFileUpload("siSpk", "Upload Dokumen Si/Spk")
                )}
                </>
                )}

                {/* Invoice Document - Admin Keuangan */}
                {shouldShowField('invoice') && (
                  <>
                {userPeran === "admin keuangan" && (
                  renderFileUpload("invoice", "Upload Dokumen Invoice")
                )}
                </>
                )}

                {/* Faktur Pajak Document - Admin Keuangan */}
                {shouldShowField('fakturPajak') && (
                  <>
                {userPeran === "admin keuangan" && (
                  renderFileUpload("fakturPajak", "Upload Dokumen Faktur Pajak")
                )}
                </>
                )}
              </div>
            </div>
          </div>

          {/* Form Buttons */}
          <div className="mt-8 flex items-center justify-between">
            <button 
              type="button" 
              onClick={() => navigate(`/orders/${portofolio}/detail/${id}`)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
            >
              Batal
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
                  <FiCheck className="mr-2" />
                  Simpan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LengkapiOrder;