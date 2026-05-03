import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, updateOrder } from "../../services/orderServices";
import { Timestamp } from "firebase/firestore";
import { uploadToCloudinary } from "../../services/cloudinaryService";
import { FiTrash2, FiEdit, FiEye, FiFile, FiUpload, FiCalendar, FiSave, FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import { useTheme } from "../../components/layout/ThemeContext";

// ─────────────────────────────────────────────────────────────────
//  STYLES — mirrors Header.jsx & LengkapiOrder.jsx design language
// ─────────────────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');

.eo-root { font-family: 'DM Sans', sans-serif; }

/* ── Page ── */
.eo-page-dark  { background: #070b18; min-height: 100vh; }
.eo-page-light { background: linear-gradient(135deg, #f0f6ff 0%, #e8f0fe 50%, #f5f7ff 100%); min-height: 100vh; }

/* ── Card ── */
.eo-card-dark {
  background: rgba(10,16,34,0.85);
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  border: 1px solid rgba(99,148,255,0.12);
  box-shadow: 0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03);
  border-radius: 20px; overflow: hidden;
}
.eo-card-light {
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid rgba(59,130,246,0.14);
  box-shadow: 0 24px 64px rgba(37,99,235,0.1), inset 0 1px 0 rgba(255,255,255,0.9);
  border-radius: 20px; overflow: hidden;
}

/* ── Accent bar ── */
@keyframes accentFlow {
  0%   { background-position: 0 0; }
  100% { background-position: 200% 0; }
}
.eo-accent {
  height: 3px;
  background: linear-gradient(90deg, transparent 0%, #1d4ed8 15%, #60a5fa 40%, #a78bfa 60%, #3b82f6 80%, transparent 100%);
  background-size: 200% 100%;
  animation: accentFlow 4s linear infinite;
}

/* ── Card header ── */
.eo-card-header-dark  { border-bottom: 1px solid rgba(99,148,255,0.1);  padding: 28px 32px 24px; }
.eo-card-header-light { border-bottom: 1px solid rgba(59,130,246,0.1); padding: 28px 32px 24px; }

/* ── Typography ── */
.eo-title-dark  { color: rgba(220,232,255,0.95); font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
.eo-title-light { color: #0f2050; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
.eo-sub-dark  { color: rgba(148,163,220,0.7); font-size: 13px; margin-top: 4px; }
.eo-sub-light { color: #5a7ab5; font-size: 13px; margin-top: 4px; }
.eo-label-dark  { color: rgba(179,193,240,0.85); font-size: 12.5px; font-weight: 500; letter-spacing: 0.02em; margin-bottom: 7px; display: block; }
.eo-label-light { color: #334e7a; font-size: 12.5px; font-weight: 500; letter-spacing: 0.02em; margin-bottom: 7px; display: block; }

/* ── Badges ── */
.eo-badge-dark {
  background: linear-gradient(135deg, rgba(29,78,216,0.35), rgba(99,102,241,0.25));
  border: 1px solid rgba(96,165,250,0.25); color: #93c5fd;
  font-size: 11.5px; font-weight: 600; letter-spacing: 0.08em;
  padding: 5px 12px; border-radius: 8px;
}
.eo-badge-light {
  background: linear-gradient(135deg, rgba(59,130,246,0.12), rgba(99,102,241,0.08));
  border: 1px solid rgba(59,130,246,0.22); color: #1d4ed8;
  font-size: 11.5px; font-weight: 600; letter-spacing: 0.08em;
  padding: 5px 12px; border-radius: 8px;
}
.eo-status-dark  { background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); color: #6ee7b7; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; padding: 4px 11px; border-radius: 20px; }
.eo-status-light { background: rgba(16,185,129,0.1);  border: 1px solid rgba(16,185,129,0.22); color: #059669; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; padding: 4px 11px; border-radius: 20px; }

/* ── Section heading ── */
.eo-section-title-dark  { color: rgba(179,193,240,0.9); font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
.eo-section-title-light { color: #3b5a9a; font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
.eo-section-line-dark  { background: rgba(99,148,255,0.12); height: 1px; flex: 1; margin-left: 12px; }
.eo-section-line-light { background: rgba(59,130,246,0.12); height: 1px; flex: 1; margin-left: 12px; }

/* ── Input ── */
.eo-input-dark {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(99,148,255,0.18); border-radius: 10px;
  color: rgba(220,232,255,0.9); font-family: 'DM Sans', sans-serif; font-size: 13.5px;
  padding: 11px 14px; width: 100%; transition: border-color .2s, background .2s, box-shadow .2s; outline: none;
}
.eo-input-dark::placeholder { color: rgba(99,148,255,0.3); }
.eo-input-dark:focus { border-color: rgba(96,165,250,0.5); background: rgba(59,130,246,0.06); box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.eo-input-dark:read-only { background: rgba(255,255,255,0.02); border-color: rgba(99,148,255,0.08); color: rgba(148,163,220,0.5); cursor: default; }

.eo-input-light {
  background: rgba(255,255,255,0.9); border: 1px solid rgba(59,130,246,0.18); border-radius: 10px;
  color: #1e3a6a; font-family: 'DM Sans', sans-serif; font-size: 13.5px;
  padding: 11px 14px; width: 100%; transition: border-color .2s, background .2s, box-shadow .2s; outline: none;
}
.eo-input-light::placeholder { color: rgba(59,130,246,0.35); }
.eo-input-light:focus { border-color: rgba(37,99,235,0.45); background: white; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.eo-input-light:read-only { background: rgba(248,250,252,0.8); border-color: rgba(59,130,246,0.08); color: rgba(51,78,122,0.5); cursor: default; }

.eo-input-prefix-dark  { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: rgba(96,165,250,0.6); font-size: 13px; font-weight: 500; pointer-events: none; }
.eo-input-prefix-light { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #5a7ab5; font-size: 13px; font-weight: 500; pointer-events: none; }

/* ── Select ── */
.eo-select-dark {
  appearance: none; -webkit-appearance: none;
  background: rgba(255,255,255,0.04) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236394ff' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 14px center;
  border: 1px solid rgba(99,148,255,0.18); border-radius: 10px; color: rgba(220,232,255,0.9);
  font-family: 'DM Sans', sans-serif; font-size: 13.5px; padding: 11px 36px 11px 14px;
  width: 100%; transition: border-color .2s, background .2s, box-shadow .2s; outline: none; cursor: pointer;
}
.eo-select-dark:focus { border-color: rgba(96,165,250,0.5); background-color: rgba(59,130,246,0.06); box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.eo-select-dark option { background: #0d1a3a; color: rgba(220,232,255,0.9); }

.eo-select-light {
  appearance: none; -webkit-appearance: none;
  background: rgba(255,255,255,0.9) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 14px center;
  border: 1px solid rgba(59,130,246,0.18); border-radius: 10px; color: #1e3a6a;
  font-family: 'DM Sans', sans-serif; font-size: 13.5px; padding: 11px 36px 11px 14px;
  width: 100%; transition: border-color .2s, background .2s, box-shadow .2s; outline: none; cursor: pointer;
}
.eo-select-light:focus { border-color: rgba(37,99,235,0.45); background-color: white; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

/* ── Error ── */
.eo-error-dark  { color: #fca5a5; font-size: 11.5px; margin-top: 5px; display: flex; align-items: center; gap: 4px; }
.eo-error-light { color: #dc2626; font-size: 11.5px; margin-top: 5px; display: flex; align-items: center; gap: 4px; }

/* ── Panel ── */
.eo-panel-dark  { background: rgba(255,255,255,0.025); border: 1px solid rgba(99,148,255,0.08); border-radius: 14px; padding: 20px; }
.eo-panel-light { background: rgba(239,246,255,0.7); border: 1px solid rgba(59,130,246,0.1); border-radius: 14px; padding: 20px; }

/* ── File upload zone ── */
.eo-file-zone-dark {
  border: 1.5px dashed rgba(99,148,255,0.3); border-radius: 12px; background: rgba(59,130,246,0.04);
  transition: all .22s ease; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 28px 16px; text-align: center;
}
.eo-file-zone-dark:hover { border-color: rgba(96,165,250,0.55); background: rgba(59,130,246,0.08); box-shadow: 0 0 22px rgba(59,130,246,0.1); }

.eo-file-zone-light {
  border: 1.5px dashed rgba(59,130,246,0.28); border-radius: 12px; background: rgba(239,246,255,0.6);
  transition: all .22s ease; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 28px 16px; text-align: center;
}
.eo-file-zone-light:hover { border-color: rgba(37,99,235,0.5); background: rgba(219,234,254,0.5); box-shadow: 0 0 18px rgba(59,130,246,0.08); }

.eo-file-zone-uploading-dark  { border-color: rgba(245,158,11,0.45); background: rgba(245,158,11,0.05); }
.eo-file-zone-uploading-light { border-color: rgba(217,119,6,0.4);   background: rgba(255,251,235,0.8); }

/* ── File row ── */
.eo-file-row-dark {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(99,148,255,0.12); border-radius: 10px;
  padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; transition: all .18s ease;
}
.eo-file-row-dark:hover { background: rgba(59,130,246,0.06); border-color: rgba(96,165,250,0.22); }

.eo-file-row-light {
  background: rgba(255,255,255,0.92); border: 1px solid rgba(59,130,246,0.14); border-radius: 10px;
  padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; transition: all .18s ease;
}
.eo-file-row-light:hover { background: white; border-color: rgba(37,99,235,0.3); box-shadow: 0 4px 14px rgba(59,130,246,0.08); }

.eo-file-row-new-dark  { border-color: rgba(52,211,153,0.25) !important; background: rgba(16,185,129,0.04) !important; }
.eo-file-row-new-light { border-color: rgba(16,185,129,0.2)  !important; background: rgba(240,253,244,0.85) !important; }

/* ── File icon buttons ── */
.eo-file-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all .18s ease; background: transparent; }
.eo-file-btn.view-dark  { color: #60a5fa; } .eo-file-btn.view-dark:hover  { background: rgba(59,130,246,0.12); color: #93c5fd; }
.eo-file-btn.view-light { color: #2563eb; } .eo-file-btn.view-light:hover { background: rgba(59,130,246,0.1); }
.eo-file-btn.edit-dark  { color: #fbbf24; } .eo-file-btn.edit-dark:hover  { background: rgba(245,158,11,0.12); color: #fcd34d; }
.eo-file-btn.edit-light { color: #d97706; } .eo-file-btn.edit-light:hover { background: rgba(245,158,11,0.1); }
.eo-file-btn.del-dark   { color: #f87171; } .eo-file-btn.del-dark:hover   { background: rgba(239,68,68,0.12); color: #fca5a5; }
.eo-file-btn.del-light  { color: #dc2626; } .eo-file-btn.del-light:hover  { background: rgba(239,68,68,0.08); }

/* ── File text ── */
.eo-file-name-dark  { color: rgba(220,232,255,0.9); font-size: 13px; font-weight: 500; }
.eo-file-name-light { color: #1e3a6a; font-size: 13px; font-weight: 500; }
.eo-file-meta-dark  { color: rgba(99,148,255,0.55); font-size: 11.5px; margin-top: 2px; }
.eo-file-meta-light { color: #7a97c9; font-size: 11.5px; margin-top: 2px; }

/* ── Chips ── */
.eo-chip-unsaved-dark  { background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); color: #fcd34d; font-size: 10.5px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
.eo-chip-unsaved-light { background: rgba(253,230,138,0.6); border: 1px solid rgba(217,119,6,0.25); color: #b45309; font-size: 10.5px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }

/* ── Upload text ── */
.eo-upload-icon-dark  { color: rgba(96,165,250,0.55); margin-bottom: 10px; }
.eo-upload-icon-light { color: rgba(37,99,235,0.45);  margin-bottom: 10px; }
.eo-upload-text-dark  { color: rgba(96,165,250,0.8); font-size: 13px; font-weight: 500; }
.eo-upload-text-light { color: #2563eb; font-size: 13px; font-weight: 500; }
.eo-upload-hint-dark  { color: rgba(99,148,255,0.4); font-size: 11px; margin-top: 4px; }
.eo-upload-hint-light { color: #93aacf; font-size: 11px; margin-top: 4px; }

/* ── Buttons ── */
.eo-btn-cancel-dark {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(99,148,255,0.18); color: rgba(179,193,240,0.8);
  border-radius: 11px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
  padding: 12px 24px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all .2s ease;
}
.eo-btn-cancel-dark:hover { background: rgba(255,255,255,0.07); border-color: rgba(99,148,255,0.35); color: rgba(220,232,255,0.9); }

.eo-btn-cancel-light {
  background: rgba(255,255,255,0.85); border: 1px solid rgba(59,130,246,0.18); color: #4b6ea8;
  border-radius: 11px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
  padding: 12px 24px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all .2s ease;
  box-shadow: 0 1px 4px rgba(59,130,246,0.08);
}
.eo-btn-cancel-light:hover { background: white; border-color: rgba(37,99,235,0.35); color: #1d4ed8; box-shadow: 0 4px 14px rgba(59,130,246,0.1); }

.eo-btn-submit {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%);
  border: none; color: white; border-radius: 11px;
  font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
  padding: 12px 28px; cursor: pointer; display: flex; align-items: center; gap: 8px;
  transition: all .22s ease;
  box-shadow: 0 4px 18px rgba(37,99,235,0.35), 0 1px 0 rgba(255,255,255,0.12) inset;
  position: relative; overflow: hidden;
}
.eo-btn-submit::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent); opacity: 0; transition: opacity .2s ease; }
.eo-btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(37,99,235,0.45), 0 1px 0 rgba(255,255,255,0.12) inset; }
.eo-btn-submit:hover:not(:disabled)::before { opacity: 1; }
.eo-btn-submit:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

/* ── Divider ── */
.eo-divider-dark  { height: 1px; background: rgba(99,148,255,0.08); }
.eo-divider-light { height: 1px; background: rgba(59,130,246,0.08); }

/* ── Spinner ── */
@keyframes spin { to { transform: rotate(360deg); } }
.eo-spinner { animation: spin 0.85s linear infinite; }

/* ── Mount animation ── */
@keyframes eoIn { from { transform: translateY(22px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.eo-mounted { animation: eoIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards; }

/* ── Not found card ── */
.eo-notfound-dark  { background: rgba(10,16,34,0.9); border: 1px solid rgba(99,148,255,0.12); border-radius: 18px; padding: 48px 36px; text-align: center; max-width: 420px; }
.eo-notfound-light { background: rgba(255,255,255,0.92); border: 1px solid rgba(59,130,246,0.14); border-radius: 18px; box-shadow: 0 16px 48px rgba(37,99,235,0.1); padding: 48px 36px; text-align: center; max-width: 420px; }
`;

const EditOrder = () => {
  const { portofolio, id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const d = isDark;

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userData = JSON.parse(localStorage.getItem("user"));
  const userEmail = userData?.email || "";
  const userPeran = userData?.peran || "";
  const userBidang = userData?.bidang || "";
  const [files, setFiles] = useState({});
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState({});

  useEffect(() => {
    if (!userPeran) { alert("Anda tidak memiliki akses!"); navigate("/"); return; }
    if (userPeran === "admin portofolio" && userBidang !== portofolio) {
      alert("Anda tidak memiliki akses!"); navigate("/"); return;
    }
    setMounted(true);
    const fetchOrder = async () => {
      setLoading(true);
      const data = await getOrderById(id);
      if (data) setFormData({ ...data, documents: data.documents || {} });
      setLoading(false);
    };
    fetchOrder();
    return () => setMounted(false);
  }, [portofolio, userPeran, userBidang, id]);

  const formatDateForInput = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return "";
    return new Date(timestamp.seconds * 1000).toISOString().split("T")[0];
  };

  const allFields = {
    pelanggan: "Pelanggan", statusOrder: "Status Order",
    tanggalStatusOrder: "Tanggal Status Order", tanggalSerahOrderKeCs: "Tanggal Penyerahan Order ke CS",
    tanggalPekerjaan: "Tanggal Pekerjaan", proformaSerahKeOps: "Tanggal Proforma Diserahkan ke Ops",
    proformaSerahKeDukbis: "Tanggal Proforma Diserahkan ke Dukbis", noSiSpk: "No SI/SPK",
    jenisPekerjaan: "Jenis Pekerjaan", namaTongkang: "Nama Tongkang", lokasiPekerjaan: "Lokasi Pekerjaan",
    estimasiTonase: "Estimasi Kuantitas", tonaseDS: "Tonase DS", nilaiProforma: "Nilai Proforma",
    jenisSertifikat: "Jenis Sertifikat", keteranganSertifikatPM06: "Keterangan Sertifikat PM06",
    noSertifikatPM06: "Nomor Sertifikat PM06", nomorOrder: "Nomor Order", tanggalOrder: "Tanggal Order",
    nilaiInvoice: "Nilai Invoice (Fee)", tanggalPengirimanInvoice: "Tanggal Pengiriman Invoice",
    tanggalPengirimanFaktur: "Tanggal Pengiriman Faktur", nomorInvoice: "Nomor Invoice",
    fakturPajak: "Faktur Pajak", distribusiSertifikatPengirim: "Distribusi Sertifikat Pengirim",
    distribusiSertifikatPengirimTanggal: "Tanggal Distribusi Sertifikat Pengirim",
    distribusiSertifikatPenerima: "Distribusi Sertifikat Penerima",
    distribusiSertifikatPenerimaTanggal: "Tanggal Distribusi Sertifikat Penerima",
  };

  const editableFields = {
    "admin portofolio": [
      "pelanggan", "statusOrder", "tanggalSerahOrderKeCs", "tanggalPekerjaan",
      "proformaSerahKeOps", "proformaSerahKeDukbis", "noSiSpk", "jenisPekerjaan",
      "namaTongkang", "lokasiPekerjaan", "estimasiTonase", "tonaseDS", "nilaiProforma", "jenisSertifikat",
      ...(portofolio === "batubara" || portofolio === "ksp" ? ["tonaseDS", "keteranganSertifikatPM06", "noSertifikatPM06"] : [])
    ],
    "customer service": ["pelanggan", "nomorOrder", "tanggalOrder"],
    "admin keuangan": ["pelanggan", "nilaiInvoice", "tanggalPengirimanInvoice", "tanggalPengirimanFaktur", "nomorInvoice", "fakturPajak"],
    "all": ["distribusiSertifikatPengirim", "distribusiSertifikatPengirimTanggal", "distribusiSertifikatPenerima", "distribusiSertifikatPenerimaTanggal"]
  };

  const userFields = editableFields[userPeran] || [];
  const fieldsToShow = [...new Set([...userFields, ...editableFields["all"]])];

  const dateFieldKeys = [
    "tanggalOrder", "tanggalSerahOrderKeCs", "tanggalPekerjaan",
    "tanggalPengirimanInvoice", "tanggalPengirimanFaktur",
    "proformaSerahKeOps", "proformaSerahKeDukbis",
    "distribusiSertifikatPengirimTanggal", "distribusiSertifikatPenerimaTanggal"
  ];
  const dateLabels = {
    tanggalStatusOrder: "Status Order", tanggalSerahOrderKeCs: "Tanggal Serah Order ke CS",
    tanggalPekerjaan: "Tanggal Pekerjaan", tanggalOrder: "Tanggal Order",
    tanggalPengirimanInvoice: "Tanggal Pengiriman Invoice", tanggalPengirimanFaktur: "Tanggal Kirim Faktur Pajak",
    proformaSerahKeOps: "Tanggal Proforma Serah ke Ops", proformaSerahKeDukbis: "Tanggal Proforma Serah ke Dukbis",
    distribusiSertifikatPengirimTanggal: "Tanggal Distribusi Sertifikat Pengirim",
    distribusiSertifikatPenerimaTanggal: "Tanggal Diterima Sertifikat",
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value.trim() === "" ? null : value;
    if (type === "number") newValue = value ? Number(value) : null;
    else if (type === "checkbox") newValue = e.target.checked;
    else if (value.trim() === "") newValue = null;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value ? Timestamp.fromDate(new Date(value)) : null });
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    if (!fileList.length) return;
    const file = fileList[0];
    if (!file) return;
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) { alert('Tipe file tidak didukung. Harap pilih file PDF atau gambar (JPEG/PNG).'); return; }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) { alert('Ukuran file terlalu besar. Harap pilih file yang kurang dari 5MB.'); return; }
    setFiles((prev) => ({ ...prev, [name]: file }));
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [name]: { fileName: file.name, fileUrl: URL.createObjectURL(file) },
      },
    }));
    setFilePreviews((prev) => ({
      ...prev,
      [name]: { fileName: file.name, fileSize: (file.size / 1024).toFixed(2) + " KB", fileType: file.type },
    }));
  };

  const uploadFile = async (fileKey, file) => {
    if (!file) return null;
    setUploadingFiles(prev => ({ ...prev, [fileKey]: true }));
    try {
      const uploadedFileUrl = await uploadToCloudinary(file);
      return { key: fileKey, fileUrl: uploadedFileUrl, fileName: file.name };
    } catch { return null; }
    finally { setUploadingFiles(prev => ({ ...prev, [fileKey]: false })); }
  };

  const handleDeleteFile = async (fileKey) => {
    if (!formData.documents?.[fileKey]) { alert("File tidak ditemukan!"); return; }
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus file ${formData.documents[fileKey].fileName}?`);
    if (!confirmDelete) return;
    setLoading(true);
    try {
      const updatedDocuments = { ...formData.documents };
      delete updatedDocuments[fileKey];
      const updatedData = { ...formData, documents: updatedDocuments, updatedAt: Timestamp.now() };
      await updateOrder(id, updatedData);
      setFormData((prev) => ({ ...prev, documents: updatedDocuments }));
      setFiles((prev) => ({ ...prev, [fileKey]: null }));
      alert("File berhasil dihapus!");
    } catch { alert("Terjadi kesalahan saat menghapus file."); }
    finally { setLoading(false); }
  };

  const handleFormattedProforma = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const formatted = rawValue ? Number(rawValue).toLocaleString("id-ID") : "";
    setFormData((prev) => ({ ...prev, nilaiProforma: formatted }));
  };

  const validateFormData = () => {
    const errors = [];
    if (userPeran === "admin keuangan") {
      const hasFakturPajak = formData.fakturPajak && formData.fakturPajak.trim() !== "";
      const hasFakturPajakFile = formData.documents?.fakturPajak || files.fakturPajak;
      if ((hasFakturPajak && !hasFakturPajakFile) || (!hasFakturPajak && hasFakturPajakFile))
        errors.push("Faktur Pajak dan File Faktur Pajak harus diisi bersamaan.");
      const hasNomorInvoice = formData.nomorInvoice && formData.nomorInvoice.trim() !== "";
      const hasInvoiceFile = formData.documents?.invoice || files.nomorInvoice;
      if ((hasNomorInvoice && !hasInvoiceFile) || (!hasNomorInvoice && hasInvoiceFile))
        errors.push("Nomor Invoice dan File Invoice harus diisi bersamaan.");
    }
    if (userPeran === "admin portofolio") {
      const hasNoSiSpk = formData.noSiSpk && formData.noSiSpk.trim() !== "";
      const hasSiSpkFile = formData.documents?.siSpk || files.noSiSpk;
      if ((hasNoSiSpk && !hasSiSpkFile) || (!hasNoSiSpk && hasSiSpkFile))
        errors.push("Nomor Si/Spk dan File Si/Spk harus diisi bersamaan.");
      if (formData.keteranganSertifikatPM06 === "Ada") {
        const hasNoSertifikatPM06 = formData.noSertifikatPM06 && formData.noSertifikatPM06.trim() !== "";
        const hasSertifikatPM06File = formData.documents?.sertifikatPM06 || files.sertifikatPM06;
        if (!hasNoSertifikatPM06 || !hasSertifikatPM06File)
          errors.push("Nomor Sertifikat PM06 dan File Sertifikat PM06 wajib diisi jika keterangan 'Ada'.");
      }
      const isSertifikatTerbit = formData.jenisSertifikat && formData.jenisSertifikat !== "Tidak Terbit Sertifikat";
      if (isSertifikatTerbit) {
        const hasNoSertifikat = formData.noSertifikat && formData.noSertifikat.trim() !== "";
        const hasSertifikatFile = formData.documents?.sertifikat || files.noSertifikat;
        if (!hasNoSertifikat || !hasSertifikatFile)
          errors.push("Nomor Sertifikat dan File Sertifikat wajib diisi jika jenis sertifikat bukan 'Tidak Terbit Sertifikat'.");
      }
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateFormData();
    if (validationErrors.length > 0) { alert(`Error:\n${validationErrors.join('\n')}`); return; }

    const payload = {
      ...formData,
      nilaiProforma: typeof formData.nilaiProforma === "string"
        ? Number(formData.nilaiProforma.replace(/\./g, ""))
        : (typeof formData.nilaiProforma === "number" ? formData.nilaiProforma : null),
    };

    setLoading(true); setSaving(true);
    try {
      const existingData = await getOrderById(id);
      const fileKeys = Object.keys(files).filter(key => files[key] !== null);
      fileKeys.forEach(key => setUploadingFiles(prev => ({ ...prev, [key]: true })));
      const uploadedFiles = await Promise.all(fileKeys.map(key => uploadFile(key, files[key])));
      fileKeys.forEach(key => setUploadingFiles(prev => ({ ...prev, [key]: false })));
      const uploadedDocuments = uploadedFiles.reduce((acc, file) => {
        if (file) acc[file.key] = { fileName: file.fileName, fileUrl: file.fileUrl, uploadedBy: userData.email, uploadedAt: Timestamp.now() };
        return acc;
      }, {});
      const updatedData = {
        ...existingData, ...payload, lastUpdatedBy: userEmail, updatedAt: Timestamp.now(),
        documents: { ...formData.documents, ...uploadedDocuments },
      };
      await updateOrder(id, updatedData);
      setFiles({ siSpk: null, sertifikatPM06: null, sertifikat: null, invoice: null, fakturPajak: null });
      setFilePreviews({});
      alert("Data berhasil diperbarui!");
      navigate(`/orders/${portofolio}/detail/${id}`);
    } catch { alert("Terjadi kesalahan saat mengunggah file."); }
    finally { setLoading(false); setSaving(false); }
  };

  // ─── renderFileUpload ────────────────────────────────────────────
  const renderFileUpload = (fileKey, displayName) => {
    const hasExistingFile = formData.documents?.[fileKey];
    const hasNewFile = files[fileKey] || filePreviews[fileKey];
    const isUploading = uploadingFiles[fileKey];
    const t = d ? "dark" : "light";

    return (
      <div style={{ marginBottom: 16 }}>
        <label className={`eo-label-${t}`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <FiFile size={13} style={{ opacity: 0.6, flexShrink: 0 }} />
          {displayName}
        </label>

        {hasExistingFile && !hasNewFile ? (
          <div className={`eo-file-row-${t}`}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className={`eo-file-name-${t}`} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {formData.documents[fileKey].fileName}
              </p>
              <p className={`eo-file-meta-${t}`}>
                {formData.documents[fileKey].uploadedBy} · {new Date(formData.documents[fileKey].uploadedAt.seconds * 1000).toLocaleDateString("id-ID")}
              </p>
            </div>
            <div style={{ display: "flex", gap: 4, marginLeft: 12, flexShrink: 0 }}>
              <a href={formData.documents[fileKey].fileUrl} target="_blank" rel="noopener noreferrer" className={`eo-file-btn view-${t}`} title="Lihat">
                <FiEye size={15} />
              </a>
              <label className={`eo-file-btn edit-${t}`} title="Ubah" style={{ cursor: "pointer" }}>
                <FiEdit size={15} />
                <input type="file" name={fileKey} onChange={handleFileChange} style={{ display: "none" }} />
              </label>
              <button type="button" className={`eo-file-btn del-${t}`} title="Hapus" onClick={() => handleDeleteFile(fileKey)}>
                <FiTrash2 size={15} />
              </button>
            </div>
          </div>

        ) : hasNewFile ? (
          <div className={`eo-file-row-${t} eo-file-row-new-${t}`}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className={`eo-file-name-${t}`} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {filePreviews[fileKey]?.fileName || files[fileKey]?.name || "File baru"}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                <p className={`eo-file-meta-${t}`}>
                  {filePreviews[fileKey]?.fileSize || (files[fileKey] ? (files[fileKey].size / 1024).toFixed(2) + " KB" : "")}
                </p>
                <span className={`eo-chip-unsaved-${t}`}>Belum disimpan</span>
              </div>
            </div>
            <button type="button" className={`eo-file-btn del-${t}`} title="Batalkan"
              onClick={() => {
                setFiles((pf) => ({ ...pf, [fileKey]: null }));
                setFilePreviews((pp) => { const u = { ...pp }; delete u[fileKey]; return u; });
              }}>
              <FiTrash2 size={15} />
            </button>
          </div>

        ) : (
          <div style={{ position: "relative" }}>
            <input type="file" name={fileKey} onChange={handleFileChange} disabled={isUploading}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, zIndex: 10, cursor: isUploading ? "not-allowed" : "pointer" }} />
            <div className={`eo-file-zone-${t} ${isUploading ? `eo-file-zone-uploading-${t}` : ""}`}>
              {isUploading ? (
                <>
                  <div className="eo-spinner" style={{ width: 28, height: 28, border: `2.5px solid ${d ? "rgba(245,158,11,0.3)" : "rgba(217,119,6,0.25)"}`, borderTopColor: d ? "#fbbf24" : "#d97706", borderRadius: "50%", marginBottom: 10 }} />
                  <span style={{ fontSize: 13, color: d ? "#fcd34d" : "#b45309", fontWeight: 500 }}>Mengunggah file...</span>
                </>
              ) : (
                <>
                  <div className={`eo-upload-icon-${t}`}><FiUpload size={28} /></div>
                  <p className={`eo-upload-text-${t}`}>Klik untuk unggah file</p>
                  <p className={`eo-upload-hint-${t}`}>PDF atau JPEG/PNG · Maks 5 MB</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── Helpers ────────────────────────────────────────────────────
  const t = d ? "dark" : "light";
  const inputCls  = `eo-input-${t}`;
  const selectCls = `eo-select-${t}`;
  const panelCls  = `eo-panel-${t}`;

  const SectionHeading = ({ label }) => (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
      <span className={`eo-section-title-${t}`}>{label}</span>
      <div className={`eo-section-line-${t}`} />
    </div>
  );

  const Field = ({ label, name, children, colSpan }) => (
    <div style={colSpan === 2 ? { gridColumn: "1 / -1" } : {}}>
      <label className={`eo-label-${t}`}>{label}</label>
      {children}
    </div>
  );

  // ─── Loading screen ──────────────────────────────────────────────
  if (loading && !mounted) {
    return (
      <>
        <style>{STYLES}</style>
        <div className={`eo-root eo-page-${t}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <div style={{ textAlign: "center" }}>
            <div className="eo-spinner" style={{ width: 52, height: 52, border: "3px solid rgba(59,130,246,0.15)", borderTopColor: "#3b82f6", borderRadius: "50%", margin: "0 auto 18px" }} />
            <p style={{ color: d ? "rgba(148,163,220,0.7)" : "#6b8cbf", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>Memuat data order...</p>
          </div>
        </div>
      </>
    );
  }

  // ─── Not found screen ─────────────────────────────────────────────
  if (!formData && !loading) {
    return (
      <>
        <style>{STYLES}</style>
        <div className={`eo-root eo-page-${t}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
          <div className={`eo-notfound-${t}`}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: d ? "rgba(220,232,255,0.9)" : "#0f2050", marginBottom: 8 }}>Data Tidak Ditemukan</h2>
            <p style={{ fontSize: 14, color: d ? "rgba(148,163,220,0.65)" : "#5a7ab5", marginBottom: 24, lineHeight: 1.6 }}>
              Order yang Anda cari tidak dapat ditemukan atau telah dihapus.
            </p>
            <button className="eo-btn-submit" onClick={() => navigate(`/orders/${portofolio}`)}>
              <FiArrowLeft size={15} /> Kembali ke Daftar Order
            </button>
          </div>
        </div>
      </>
    );
  }

  // ─── MAIN RENDER ─────────────────────────────────────────────────
  return (
    <>
      <style>{STYLES}</style>
      <div className={`eo-root eo-page-${t}`} style={{ padding: "32px 16px 64px" }}>
        <div className={`eo-mounted ${mounted ? "" : "opacity-0"}`} style={{ maxWidth: 820, margin: "0 auto" }}>
          <div className={`eo-card-${t}`}>

            {/* Animated accent */}
            <div className="eo-accent" />

            {/* ── Card Header ── */}
            <div className={`eo-card-header-${t}`}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <h2 className={`eo-title-${t}`}>Edit Data Order</h2>
                  <p className={`eo-sub-${t}`}>
                    Form disesuaikan dengan hak akses sebagai{" "}
                    <span style={{ fontWeight: 600, color: d ? "#93c5fd" : "#1d4ed8" }}>{userPeran}</span>
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span className={`eo-badge-${t}`}>{portofolio.toUpperCase()}</span>
                  {formData.statusOrder && (
                    <span className={`eo-status-${t}`}>{formData.statusOrder}</span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} style={{ padding: "28px 32px" }}>

              {/* Pelanggan */}
              <div style={{ marginBottom: 24 }}>
                <SectionHeading label="Informasi Pelanggan" />
                <Field label="Pelanggan">
                  <input type="text" value={formData.pelanggan || ""} className={inputCls} readOnly />
                </Field>
              </div>

              {/* ── Admin Portofolio ── */}
              {userPeran === "admin portofolio" && (
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading label="Data Pekerjaan" />
                  <div className={panelCls}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                      <Field label="Jenis Pekerjaan">
                        <input type="text" name="jenisPekerjaan" value={formData.jenisPekerjaan || ""} onChange={handleChange} className={inputCls} />
                      </Field>
                      <Field label="Nama Tongkang">
                        <input type="text" name="namaTongkang" value={formData.namaTongkang || ""} onChange={handleChange} className={inputCls} />
                      </Field>
                      <Field label="Lokasi Pekerjaan">
                        <input type="text" name="lokasiPekerjaan" value={formData.lokasiPekerjaan || ""} onChange={handleChange} className={inputCls} />
                      </Field>
                      <Field label="Estimasi Kuantitas">
                        <input type="text" name="estimasiTonase" value={formData.estimasiTonase || ""} onChange={handleChange} className={inputCls} />
                      </Field>
                      <Field label="Tonase DS">
                        <input type="number" name="tonaseDS" value={formData.tonaseDS || ""} onChange={handleChange} className={inputCls} />
                      </Field>
                      <Field label="Nomor Si/Spk">
                        <input type="text" name="noSiSpk" value={formData.noSiSpk || ""} onChange={handleChange} className={inputCls} />
                      </Field>
                      <Field label="Nilai Proforma">
                        <div style={{ position: "relative" }}>
                          <span className={`eo-input-prefix-${t}`}>Rp</span>
                          <input type="text" name="nilaiProforma" value={formData.nilaiProforma || ""} onChange={handleFormattedProforma} className={inputCls} style={{ paddingLeft: 36 }} />
                        </div>
                      </Field>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Customer Service ── */}
              {userPeran === "customer service" && (
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading label="Data Order" />
                  <div className={panelCls}>
                    <Field label="Nomor Order">
                      <input type="text" name="nomorOrder" value={formData.nomorOrder || ""} onChange={handleChange} className={inputCls} />
                    </Field>
                  </div>
                </div>
              )}

              {/* ── Admin Keuangan ── */}
              {userPeran === "admin keuangan" && (
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading label="Data Keuangan" />
                  <div className={panelCls}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                      <Field label="Nomor Invoice">
                        <input type="text" name="nomorInvoice" value={formData.nomorInvoice || ""} onChange={handleChange} className={inputCls} />
                      </Field>
                      <Field label="Nomor Seri Faktur Pajak">
                        <input type="text" name="fakturPajak" value={formData.fakturPajak || ""} onChange={handleChange} className={inputCls} />
                      </Field>
                      <Field label="Nilai Invoice (Fee)">
                        <input type="number" name="nilaiInvoice" value={formData.nilaiInvoice || ""} onChange={handleChange} className={inputCls} />
                      </Field>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Distribusi Sertifikat (all) ── */}
              <div style={{ marginBottom: 24 }}>
                <SectionHeading label="Distribusi Sertifikat" />
                <div className={panelCls}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                    <Field label="Distribusi Sertifikat Pengirim">
                      <input type="text" name="distribusiSertifikatPengirim" value={formData.distribusiSertifikatPengirim || ""} onChange={handleChange} className={inputCls} />
                    </Field>
                    <Field label="Distribusi Sertifikat Penerima">
                      <input type="text" name="distribusiSertifikatPenerima" value={formData.distribusiSertifikatPenerima || ""} onChange={handleChange} className={inputCls} />
                    </Field>
                  </div>
                </div>
              </div>

              {/* ── Tanggal ── */}
              {Object.entries(allFields).some(([key]) => dateFieldKeys.includes(key) && fieldsToShow.includes(key)) && (
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading label="Informasi Tanggal" />
                  <div className={panelCls}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                      {Object.entries(allFields).map(([key, label]) => {
                        if (!dateFieldKeys.includes(key) || !fieldsToShow.includes(key)) return null;
                        return (
                          <Field key={key} label={dateLabels[key] || label}>
                            <div style={{ position: "relative" }}>
                              <FiCalendar size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: d ? "rgba(96,165,250,0.55)" : "#5a7ab5", pointerEvents: "none" }} />
                              <input
                                type="date" name={key}
                                value={formData[key] ? formatDateForInput(formData[key]) : ""}
                                onChange={handleDateChange}
                                className={inputCls}
                                style={{ paddingLeft: 36 }}
                              />
                            </div>
                          </Field>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Dokumen Pendukung ── */}
              {(userPeran === "admin portofolio" || userPeran === "admin keuangan") && (
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading label="Dokumen Pendukung" />
                  <div className={panelCls}>
                    {userPeran === "admin portofolio" && renderFileUpload("siSpk", "Upload Dokumen Si/Spk")}
                    {userPeran === "admin keuangan" && renderFileUpload("invoice", "Upload Dokumen Invoice")}
                    {userPeran === "admin keuangan" && renderFileUpload("fakturPajak", "Upload Dokumen Faktur Pajak")}
                  </div>
                </div>
              )}

              {/* ── Sertifikat PM06 ── */}
              {userPeran === "admin portofolio" && (
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading label="Informasi Sertifikat PM06" />
                  <div className={panelCls}>
                    <Field label="Keterangan Sertifikat PM06">
                      <select name="keteranganSertifikatPM06" value={formData.keteranganSertifikatPM06 || ''} onChange={handleChange} className={selectCls}>
                        {["Tidak Ada", "Ada"].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </Field>
                    {formData.keteranganSertifikatPM06 === "Ada" && (
                      <div style={{ marginTop: 16 }}>
                        <Field label="Nomor Sertifikat PM06">
                          <input type="text" name="noSertifikatPM06" value={formData.noSertifikatPM06 || ""} onChange={handleChange} className={inputCls} />
                        </Field>
                        <div style={{ marginTop: 16 }}>{renderFileUpload("sertifikatPM06", "Upload Sertifikat PM06")}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Jenis Sertifikat ── */}
              {userPeran === "admin portofolio" && (
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading label="Informasi Sertifikat" />
                  <div className={panelCls}>
                    <Field label="Jenis Sertifikat">
                      <select name="jenisSertifikat" value={formData.jenisSertifikat || ''} onChange={handleChange} className={selectCls}>
                        {["Tidak Terbit Sertifikat","LOADING","LS (PIK)","SERTIFIKAT","LAPORAN","KALIBRASI","HALAL"].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </Field>
                    {formData.jenisSertifikat !== "Tidak Terbit Sertifikat" && (
                      <div style={{ marginTop: 16 }}>
                        <Field label="Nomor Sertifikat">
                          <input type="text" name="noSertifikat" value={formData.noSertifikat || ""} onChange={handleChange} className={inputCls} />
                        </Field>
                        <div style={{ marginTop: 16 }}>{renderFileUpload("sertifikat", "Upload Sertifikat")}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Divider ── */}
              <div className={`eo-divider-${t}`} style={{ margin: "28px 0" }} />

              {/* ── Action buttons ── */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <button type="button" className={`eo-btn-cancel-${t}`} onClick={() => navigate(`/orders/${portofolio}/detail/${id}`)}>
                  <FiArrowLeft size={15} /> Kembali
                </button>
                <button type="submit" className="eo-btn-submit" disabled={saving || loading}>
                  {saving ? (
                    <>
                      <div className="eo-spinner" style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }} />
                      Menyimpan...
                    </>
                  ) : (
                    <><FiSave size={15} /> Simpan Perubahan</>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditOrder;