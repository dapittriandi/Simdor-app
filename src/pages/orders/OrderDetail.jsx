import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, deleteOrder } from "../../services/orderServices";
import { Timestamp } from "firebase/firestore";
import { Edit, Trash2, ArrowLeft, FileText, AlertTriangle, Check, Clock, RefreshCw } from "lucide-react";

const OrderDetail = () => {
  const { portofolio, id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Data user dari localStorage
  const userData = JSON.parse(localStorage.getItem("user"));
  const userPeran = userData?.peran || "";
  const userBidang = userData?.bidang || "";

  useEffect(() => {
    setMounted(true);
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
  
      try {
        console.log("Fetching order with ID:", id);
        const data = await getOrderById(id);
        console.log("Order Data:", data);
  
        if (data) {
          setOrder(data);
        } else {
          setError("Order tidak ditemukan.");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Terjadi kesalahan saat mengambil data.");
      }
      setLoading(false);
    };
  
    fetchOrder();
    return () => setMounted(false);
  }, [id]);
  
  // Fungsi untuk menampilkan tanggal dengan format yang rapi
  const formatDate = (value) => {
    if (!value) return "-";
    if (value instanceof Timestamp) {
      const date = value.toDate();
      return new Date(date).toLocaleDateString("id-ID", {
        day: "2-digit", 
        month: "long", 
        year: "numeric"
      });
    }
    return value; // Jika sudah dalam format string, langsung tampilkan
  };

  // Fungsi cek apakah user sudah bisa mengedit data sesuai hak aksesnya
  const isEditableByRole = (order, role) => {
    const requiredFields = {
      "admin portofolio": [
        "pelanggan",
        "statusOrder",
        "tanggalStatusOrder",
        "tanggalSerahOrderKeCs",
        "tanggalPekerjaan",
        "proformaSerahKeOps",
        "proformaSerahKeDukbis",
        "jenisSertifikat",
        "keteranganSertifikatPM06",
        "noSiSpk",
        "jenisPekerjaan",
        "namaTongkang",
        "lokasiPekerjaan",
        "estimasiTonase",
        "tonaseDS",
        "nilaiProforma",
      ],
      "koordinator": [],
      "customer service": ["nomorOrder", "tanggalOrder"],
      "admin keuangan": [
        "tanggalPengirimanInvoice",
        "tanggalPengirimanFaktur",
        "nomorInvoice",
        "fakturPajak",
        "dokumenSelesaiINV",
      ],
      all: [
        "distribusiSertifikatPengirim",
        "distribusiSertifikatPengirimTanggal",
        "distribusiSertifikatPenerima",
        "distribusiSertifikatPenerimaTanggal",
      ],
    };

    const userRequiredFields = [...requiredFields[role], ...requiredFields.all];
    return userRequiredFields.every((field) => order[field] !== "" && order[field] !== null);
  };

  // Fungsi hapus order (Hanya Admin Portofolio)
  const handleDelete = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus order ini?")) return;
    try {
      await deleteOrder(id);
      alert("Order berhasil dihapus!");
      navigate(`/orders/${portofolio}`);
    } catch (err) {
      console.error("Gagal menghapus order:", err);
      alert("Gagal menghapus order.");
    }
  };

  // Field groups for better organization
  const fieldGroups = [
    {
      title: "Informasi Umum",
      icon: <FileText className="w-5 h-5 text-blue-500" />,
      fields: [
        { key: "pelanggan", label: "Nama Pelanggan" },
        { key: "statusOrder", label: "Status Order" },
        { key: "nomorOrder", label: "Nomor Order" },
        { key: "tanggalOrder", label: "Tanggal Order", isDate: true },
        // { key: "tanggalStatusOrder", label: "Tanggal Status Order", isDate: true },
        { key: "tanggalSerahOrderKeCs", label: "Tanggal Serah Order Ke CS", isDate: true },
      ]
    },
    {
      title: "Detail Pekerjaan",
      icon: <Clock className="w-5 h-5 text-blue-500" />,
      fields: [
        { key: "noSiSpk", label: "No SI/SPK" },
        { key: "jenisPekerjaan", label: "Jenis Pekerjaan" },
        { key: "lokasiPekerjaan", label: "Lokasi Pekerjaan" },
        { key: "tanggalPekerjaan", label: "Tanggal Pekerjaan", isDate: true },
        { key: "namaTongkang", label: "Nama Tongkang" },
        { key: "estimasiTonase", label: "Estimasi Tonase" },
        { key: "tonaseDS", label: "Tonase DS" },
      ]
    },
    {
      title: "Informasi Proforma & Sertifikat",
      icon: <Check className="w-5 h-5 text-blue-500" />,
      fields: [
        { key: "nilaiProforma", label: "Nilai Proforma" },
        { key: "proformaSerahKeOps", label: "Proforma diserahkan ke Operasional", isDate: true },
        { key: "proformaSerahKeDukbis", label: "Proforma diserahkan ke Dukbis", isDate: true },
        { key: "keteranganSertifikatPM06", label: "Keterangan Sertifikat PM06" },
        { key: "jenisSertifikat", label: "Jenis Sertifikat" },
        { key: "noSertifikatPM06", label: "Nomor SertifikatPM06" },
        { key: "noSertifikat", label: "Nomor Sertifikat" },
        
      ]
    },
    {
      title: "Informasi Keuangan",
      icon: <RefreshCw className="w-5 h-5 text-blue-500" />,
      fields: [
        { key: "dokumenSelesaiINV", label: "Dokumen Selesai INV" },
        { key: "nomorInvoice", label: "Nomor Invoice" },
        { key: "fakturPajak", label: "Faktur Pajak" },
        { key: "tanggalPengirimanInvoice", label: "Tanggal Pengiriman Invoice", isDate: true },
        { key: "tanggalPengirimanFaktur", label: "Tanggal Pengiriman Faktur", isDate: true },
      ]
    },
    {
      title: "Informasi Distribusi Sertifikat",
      icon: <RefreshCw className="w-5 h-5 text-blue-500" />,
      fields: [
        { key: "distribusiSertifikatPengirim", label: "Nama yang Mendistribusikan Sertifikat" },
        { key: "distribusiSertifikatPengirimTanggal", label: "Tanggal Distribusi Pengiriman Sertifikat", isDate: true },
        { key: "distribusiSertifikatPenerima", label: "Nama Penerima Sertifikat" },
        { key: "distribusiSertifikatPenerimaTanggal", label: "Tanggal Distribusi Penerimaan Sertifikat", isDate: true },
      ]
    },
    {
      title: "Meta Informasi",
      icon: <RefreshCw className="w-5 h-5 text-blue-500" />,
      fields: [
        { key: "createdBy", label: "Dibuat Oleh" },
        { key: "lastUpdatedBy", label: "Terakhir Diperbarui Oleh" },
        { key: "createdAt", label: "Dibuat Pada", isDate: true },
        { key: "updatedAt", label: "Diperbarui Pada", isDate: true },
      ]
    }
  ];

  // Function to get status badge color
  const getStatusBadge = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    switch (status.toLowerCase()) {
      case "diproses":
        return "bg-blue-100 text-blue-800";
      case "selesai":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-purple-100 text-purple-800";
      case "next order":
        return "bg-orange-100 text-orange-800";
      case "archecking":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && !mounted) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
          <button 
            onClick={() => navigate(`/orders/${portofolio}`)}
            className="mt-4 inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar Order
          </button>
        </div>
      </div>
    );
  }

  const canEdit = order && isEditableByRole(order, userPeran);

  return (
    <div className={`p-6 max-w-6xl mx-auto transition-all duration-500 ${
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
          <h2 className="text-2xl font-bold text-gray-800">Detail Order</h2>
          <div className="h-1 w-24 mt-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 rounded-full animate-gradient-x"></div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        {/* Blue accent top bar with gradient animation */}
        <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 animate-gradient-x"></div>
        
        <div className="p-6">
          {/* Order Info Header */}
          {order && (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{order.pelanggan || "No Customer Name"}</h3>
                <p className="text-gray-600 mt-1">{order.nomorOrder || "No Order Number"}</p>
              </div>
              <div className="mt-3 md:mt-0">
                <span className={`px-4 py-2 inline-flex items-center text-sm font-medium rounded-full ${getStatusBadge(order.statusOrder)}`}>
                  {order.statusOrder || "No Status"}
                </span>
              </div>
            </div>
          )}

          {/* Order Details */}
          {order && (
            <div className="space-y-8">
              {fieldGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center">
                    {group.icon}
                    <h3 className="ml-2 font-semibold text-gray-700">{group.title}</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {group.fields.map((field) => (
                        <div key={field.key} className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">{field.label}</p>
                          <p className="text-base font-medium text-gray-800">
                          {field.key === "statusOrder" && order.tanggalStatusOrder
                    ? `${order[field.key]} pada ${formatDate(order.tanggalStatusOrder)}`
                    : field.isDate
                    ? formatDate(order[field.key]) 
                    : field.key === "nilaiProforma" && order[field.key] 
                    ? `Rp ${Number(order[field.key]).toLocaleString()}`
                    : order[field.key] || "-"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          {order && userPeran !== "koordinator" && (
            <div className="mt-8 flex flex-col-reverse sm:flex-row justify-between gap-4">
              <button 
                onClick={() => navigate(`/orders/${portofolio}`)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </button>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {canEdit ? (
                  <button 
                    onClick={() => navigate(`/orders/${portofolio}/detail/edit/${id}`)}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate(`/orders/${portofolio}/detail/lengkapi/${id}`)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Lengkapi Data
                  </button>
                )}
                
                {userPeran === "admin portofolio" && userBidang === portofolio && (
                  <button 
                    onClick={handleDelete}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus Order
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;