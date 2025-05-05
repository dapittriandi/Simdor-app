import { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, deleteOrder } from "../../services/orderServices";
import NavigationInstruction from "../../utils/NavigationInstruction"
import { Timestamp } from "firebase/firestore";
import { 
  Edit, 
  Trash2, 
  ArrowLeft, 
  FileText, 
  AlertTriangle, 
  Check, 
  Clock, 
  RefreshCw,
  CheckCircle,
  Circle,
  ClipboardEdit,
  HardHat,
  FileCheck,
  ClipboardCheck,
  Receipt,
  PackageCheck
} from "lucide-react";

const TrackingStatus = ({ currentStatus, tanggalStatusOrder, formatDate }) => {
  const stepRefs = useRef([]);
  const [lineWidth, setLineWidth] = useState(0);

  // Daftar step order
  const steps = [
    { id: 0, label: "New Order", description: "Pengisian data pelanggan oleh Adm Ops" },
    { id: 1, label: "Entry", description: "Pembukaan order oleh Customer Service" },
    { id: 2, label: "Diproses - Lapangan", description: "Pengisian tanggal pekerjaan oleh Adm Ops (Sedang Proses Pekerjaan dilapangan oleh Tim Ops) " },
    { id: 3, label: "Diproses - Sertifikat", description: "Pengisian upload sertifikat oleh Adm Ops (Pekerjaan dilapangan selesai)" },
    { id: 4, label: "Closed Order", description: "Pengisian proforma dan tanggal selesai pekerjaan oleh Adm Ops (Menunggu Pembayaran oleh Pelanggan)" },
    { id: 5, label: "Invoice", description: "Pengisian Data Invoice Pekerjaan dan faktur oleh Bag. keuangan (Dokumen invoice siap didistribusikan ke Pelanggan)" },
    { id: 6, label: "Selesai", description: "Pendistribusian Sertifikat (Sertifikat telah didistribusikan oleh Adm Ops/keuangan)" },
  ];

  const getOrderStatusStep = (status) => {
    const orderSteps = steps.map(step => step.label);
    if (!status) return -1;
    return orderSteps.indexOf(status);
  };

  const currentStep = getOrderStatusStep(currentStatus);
  const isFinished = currentStatus === "Selesai";


  // Hitung lebar progress line sampai tengah step aktif
  useEffect(() => {
    if (stepRefs.current.length && currentStep >= 0) {
      const first = stepRefs.current[0];
      const current = stepRefs.current[currentStep];
      const last = stepRefs.current[stepRefs.current.length - 1];

  
      if (first && current) {
        const firstCenter = first.getBoundingClientRect().left + first.offsetWidth / 2;
        const currentCenter = current.getBoundingClientRect().left + current.offsetWidth / 2;
        const lastCenter = last.getBoundingClientRect().left + last.offsetWidth / 2;
        const stepHalfWidth = current.offsetWidth / 2;
        const lastStepHalfWidth = last.offsetWidth / 1;
  
       if (currentStep === stepRefs.current.length - 1) {
        // Step terakhir: garis dari awal sampai ujung kanan step terakhir
        setLineWidth((lastCenter + lastStepHalfWidth) - firstCenter);
      } else {
        // Belum selesai: garis dari awal sampai current step
        setLineWidth(currentCenter - firstCenter + stepHalfWidth);
      }
      }
    }
  }, [currentStep]);
  

  const getStepIcon = (index) => {
    switch(index) {
      case 0: return <FileText className="w-5 h-5" />;
      case 1: return <Edit className="w-5 h-5" />;
      case 2: return <RefreshCw className="w-5 h-5" />;
      case 3: return <FileText className="w-5 h-5" />;
      case 4: return <Check className="w-5 h-5" />;
      case 5: return <AlertTriangle className="w-5 h-5" />;
      case 6: return <CheckCircle className="w-5 h-5" />;
      default: return <Circle className="w-5 h-5" />;
    }
  };
  return (
    <div className="mb-6 mt-4">
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tracking Status Order</h2>
        <div className="w-16 h-1 bg-blue-500 mt-2 rounded-full"></div>
      </div>
      <div className="relative mb-10">
        

        {/* Titik awal */}
        <div className="absolute top-5 left-0 w-5 h-5 bg-blue-600 rounded-full z-10 transform -translate-x-1/2 -translate-y-1/3"></div>

        {/* Garis abu-abu background */}
        <div className="absolute top-5 left-0 right-0 h-1.5 bg-gray-200 z-0 rounded-full"></div>

        {/* Garis aktif */}
        <div 
          className="absolute top-5 left-0 h-1.5 bg-gradient-to-r from-blue-600 to-blue-400 z-1 rounded-full transition-all duration-500" 
          style={{ width: `${lineWidth}px` }}
        ></div>

        {/* Step */}
        <div className="relative z-10 flex justify-between mt-4">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isFirst = index === 0;
            const isLast = index === steps.length - 1;

            let bgColorClass = isCompleted || isCurrent ? "bg-blue-500" : "bg-white";
            let borderColorClass = isCompleted || isCurrent ? "border-blue-500" : "border-gray-300";
            let iconColorClass = isCompleted || isCurrent ? "text-white" : "text-gray-400";
            let textColorClass = isCompleted || isCurrent ? "text-blue-600 font-medium" : "text-gray-400";

            return (
              <div 
                key={step.id}
                ref={el => stepRefs.current[index] = el}
                className="flex flex-col items-center text-center"
                style={{ width: `${100 / steps.length}%`, maxWidth: "130px" }}
              >
                <div 
                  className={`flex items-center justify-center rounded-full border-2 ${borderColorClass} ${bgColorClass} shadow-sm transition-all duration-300 ${isFirst ? 'w-12 h-12' : 'w-10 h-10'}`}
                >
                  {isCurrent ? (
                    <Clock className={isFirst ? "w-6 h-6 text-white" : "w-5 h-5 text-white"} />
                  ) : isCompleted ? (
                    <div className={iconColorClass}>{getStepIcon(index)}</div>
                  ) : (
                    <div className={iconColorClass}>
                      {isLast ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </div>
                  )}
                </div>
                <p className={`mt-2 text-xs ${textColorClass} transition-all duration-300 font-medium`}>
                  {step.label}
                </p>
                <p className="text-xs text-gray-500 mt-1 hidden lg:block transition-all duration-300">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Titik akhir */}
        <div className={`absolute top-5 right-0 w-5 h-5 ${isFinished ? 'bg-blue-600' : 'bg-gray-300'} rounded-full z-10 transform translate-x-1/2 -translate-y-1/3`}></div>

      </div>

      {/* Info status */}
      <div className="flex items-center justify-center">
        <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-center text-blue-700">
            Status saat ini: <span className="font-semibold">{currentStatus || "Belum ada status"}</span>
            {tanggalStatusOrder && (
              <span className="ml-1">pada {formatDate(tanggalStatusOrder)}</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};


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
      setError(null);
  
      try {
        // console.log("Fetching order with ID:", id);
        const data = await getOrderById(id);
        // console.log("Order Data:", data);
  
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
  }, [portofolio, userPeran, userBidang, id]);
  
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
        "tanggalStatusOrder",
        "tanggalPengirimanInvoice",
        "tanggalPengirimanFaktur",
        "nomorInvoice",
        "fakturPajak",
        "nilaiInvoice",
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
        { key: "tanggalSerahOrderKeCs", label: "Tanggal Penyerahan Order Ke CS", isDate: true },
      ]
    },
    {
      title: "Detail Pekerjaan",
      icon: <Clock className="w-5 h-5 text-blue-500" />,
      fields: [
        { key: "noSiSpk", label: "Nomor SI/SPK" },
        { key: "jenisPekerjaan", label: "Jenis Pekerjaan" },
        { key: "lokasiPekerjaan", label: "Lokasi Pekerjaan" },
        { key: "tanggalPekerjaan", label: "Tanggal Pekerjaan", isDate: true },
        { key: "namaTongkang", label: "Nama Tongkang" },
        { key: "estimasiTonase", label: "Estimasi Kuantitas" },
        { key: "tonaseDS", label: "Tonase DS" },
      ]
    },
    {
      title: "Informasi Proforma & Sertifikat",
      icon: <Check className="w-5 h-5 text-blue-500" />,
      fields: [
        { key: "nilaiProforma", label: "Nilai Proforma (PAD)" },
        { key: "proformaSerahKeOps", label: "Tanggal Proforma diserahkan ke Operasional", isDate: true },
        { key: "proformaSerahKeDukbis", label: "Tanggal Proforma diserahkan ke Dukbis", isDate: true },
        { key: "keteranganSertifikatPM06", label: "Keterangan Sertifikat PM06(Port Batu Bara)" },
        { key: "jenisSertifikat", label: "Jenis Sertifikat" },
        { key: "noSertifikatPM06", label: "Nomor SertifikatPM06" },
        { key: "noSertifikat", label: "Nomor Sertifikat" },
        
      ]
    },
    {
      title: "Informasi Keuangan",
      icon: <RefreshCw className="w-5 h-5 text-blue-500" />,
      fields: [
        { key: "nilaiInvoice", label: "Nilai Invoice (Fee)" },
        { key: "nomorInvoice", label: "Nomor Invoice" },
        { key: "fakturPajak", label: "Nomor Seri Faktur Pajak" },
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
        { key: "distribusiSertifikatPenerimaTanggal", label: "Tanggal Diterima Sertifikat", isDate: true },
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
      case "entry":
        return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200";
      case "diproses - lapangan":
        return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200";
      case "invoice":
         return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "new order":
        return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200";
      case "selesai":
         return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-teal-100 text-teal-800 border border-teal-200";
      case "diproses - sertifikat":
         return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800 border border-purple-200";
      case "closed order":
         return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800 border border-orange-200";
      default:
        return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200";
    }
  };

  const showLengkapiButton = () => {
    if (order?.statusOrder === "New Order" && userPeran === "customer service") {
      return true;
    }
    if ((order?.statusOrder === "Entry" || order?.statusOrder === "Diproses - Lapangan") && userPeran === "admin portofolio") {
      return true;
    }
    if ((order?.statusOrder === "Diproses - Sertifikat" ) && userPeran === "admin portofolio") {
      return true;
    }
    if (( order?.statusOrder === "Closed Order") && userPeran === "admin keuangan") {
      return true;
    }
    
    if ( order?.statusOrder === "Invoice" && ["admin portofolio", "admin keuangan"].includes(userPeran)) {
      return true;
    }
    return false;
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{order.pelanggan || "No Customer Name"}</h3>
                <p className="text-gray-600 mt-1">{order.nomorOrder || "No Order Number"}</p>
              </div>
              <div className="mt-3 md:mt-0">
                <span className={`${getStatusBadge(order.statusOrder)}`}>
                  {order.statusOrder || "No Status"}
                </span>
              </div>
            </div>
          )}

          {/* Status Tracking - Ditambahkan di bawah Order Info Header */}
          {order && (
            <TrackingStatus 
              currentStatus={order.statusOrder} 
              tanggalStatusOrder={order.tanggalStatusOrder}
              formatDate={formatDate}
            />
          )}

          {order && (
            <NavigationInstruction
              currentStatus={order.statusOrder}
              userPeran={userPeran}
            />
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
                    : field.key === "nilaiProforma"  || field.key === "nilaiInvoice"  && order[field.key] 
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
                  showLengkapiButton() && (
                  <button 
                    onClick={() => navigate(`/orders/${portofolio}/detail/lengkapi/${id}`)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Lengkapi Data
                  </button>
                  )
                )
                }
                
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