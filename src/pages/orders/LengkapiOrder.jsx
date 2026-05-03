import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, updateOrder } from "../../services/orderServices";
import { Timestamp } from "firebase/firestore";
import { uploadToCloudinary, deleteFromCloudinary } from "../../services/cloudinaryService";
import { FiDownload, FiFile, FiTrash2, FiEdit, FiEye, FiUpload, FiCalendar, FiCheck, FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import { useTheme } from "../../components/layout/ThemeContext";

// ─────────────────────────────────────────────
//  STYLES  (mirrors Header.jsx design language)
// ─────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');

.lo-root { font-family: 'DM Sans', sans-serif; }

/* ── Page wrapper ── */
.lo-page-dark  { background: #070b18; min-height: 100vh; }
.lo-page-light { background: linear-gradient(135deg, #f0f6ff 0%, #e8f0fe 50%, #f5f7ff 100%); min-height: 100vh; }

/* ── Card ── */
.lo-card-dark {
  background: rgba(10,16,34,0.85);
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  border: 1px solid rgba(99,148,255,0.12);
  box-shadow: 0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03);
  border-radius: 20px;
  overflow: hidden;
}
.lo-card-light {
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid rgba(59,130,246,0.14);
  box-shadow: 0 24px 64px rgba(37,99,235,0.1), inset 0 1px 0 rgba(255,255,255,0.9);
  border-radius: 20px;
  overflow: hidden;
}

/* ── Accent bar ── */
@keyframes accentFlow {
  0%   { background-position: 0 0; }
  100% { background-position: 200% 0; }
}
.lo-accent {
  height: 3px;
  background: linear-gradient(90deg, transparent 0%, #1d4ed8 15%, #60a5fa 40%, #a78bfa 60%, #3b82f6 80%, transparent 100%);
  background-size: 200% 100%;
  animation: accentFlow 4s linear infinite;
}

/* ── Card header ── */
.lo-card-header-dark {
  border-bottom: 1px solid rgba(99,148,255,0.1);
  padding: 28px 32px 24px;
}
.lo-card-header-light {
  border-bottom: 1px solid rgba(59,130,246,0.1);
  padding: 28px 32px 24px;
}

/* ── Text ── */
.lo-title-dark  { color: rgba(220,232,255,0.95); font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
.lo-title-light { color: #0f2050; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }

.lo-sub-dark  { color: rgba(148,163,220,0.7); font-size: 13px; margin-top: 4px; }
.lo-sub-light { color: #5a7ab5; font-size: 13px; margin-top: 4px; }

.lo-label-dark  { color: rgba(179,193,240,0.85); font-size: 12.5px; font-weight: 500; letter-spacing: 0.02em; margin-bottom: 7px; display: block; }
.lo-label-light { color: #334e7a; font-size: 12.5px; font-weight: 500; letter-spacing: 0.02em; margin-bottom: 7px; display: block; }

/* ── Badge (portofolio / peran) ── */
.lo-badge-dark {
  background: linear-gradient(135deg, rgba(29,78,216,0.35), rgba(99,102,241,0.25));
  border: 1px solid rgba(96,165,250,0.25);
  color: #93c5fd;
  font-size: 11.5px; font-weight: 600; letter-spacing: 0.08em;
  padding: 5px 12px; border-radius: 8px;
}
.lo-badge-light {
  background: linear-gradient(135deg, rgba(59,130,246,0.12), rgba(99,102,241,0.08));
  border: 1px solid rgba(59,130,246,0.22);
  color: #1d4ed8;
  font-size: 11.5px; font-weight: 600; letter-spacing: 0.08em;
  padding: 5px 12px; border-radius: 8px;
}

/* ── Status badge ── */
.lo-status-dark {
  background: rgba(16,185,129,0.12);
  border: 1px solid rgba(16,185,129,0.25);
  color: #6ee7b7;
  font-size: 11px; font-weight: 600; letter-spacing: 0.06em;
  padding: 4px 11px; border-radius: 20px;
}
.lo-status-light {
  background: rgba(16,185,129,0.1);
  border: 1px solid rgba(16,185,129,0.22);
  color: #059669;
  font-size: 11px; font-weight: 600; letter-spacing: 0.06em;
  padding: 4px 11px; border-radius: 20px;
}

/* ── Section title ── */
.lo-section-title-dark  { color: rgba(179,193,240,0.9); font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
.lo-section-title-light { color: #3b5a9a; font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }

.lo-section-line-dark  { background: rgba(99,148,255,0.12); height: 1px; flex: 1; margin-left: 12px; }
.lo-section-line-light { background: rgba(59,130,246,0.12); height: 1px; flex: 1; margin-left: 12px; }

/* ── Input ── */
.lo-input-dark {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(99,148,255,0.18);
  border-radius: 10px;
  color: rgba(220,232,255,0.9);
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  padding: 11px 14px;
  width: 100%;
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  outline: none;
}
.lo-input-dark::placeholder { color: rgba(99,148,255,0.3); }
.lo-input-dark:focus {
  border-color: rgba(96,165,250,0.5);
  background: rgba(59,130,246,0.06);
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}
.lo-input-dark:read-only {
  background: rgba(255,255,255,0.02);
  border-color: rgba(99,148,255,0.08);
  color: rgba(148,163,220,0.55);
  cursor: default;
}

.lo-input-light {
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(59,130,246,0.18);
  border-radius: 10px;
  color: #1e3a6a;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  padding: 11px 14px;
  width: 100%;
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  outline: none;
}
.lo-input-light::placeholder { color: rgba(59,130,246,0.35); }
.lo-input-light:focus {
  border-color: rgba(37,99,235,0.45);
  background: white;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}
.lo-input-light:read-only {
  background: rgba(248,250,252,0.8);
  border-color: rgba(59,130,246,0.08);
  color: rgba(51,78,122,0.5);
  cursor: default;
}

/* Input with prefix (Rp) */
.lo-input-prefix-dark  { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: rgba(96,165,250,0.6); font-size: 13px; font-weight: 500; pointer-events: none; }
.lo-input-prefix-light { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #5a7ab5; font-size: 13px; font-weight: 500; pointer-events: none; }

/* ── Select ── */
.lo-select-dark {
  appearance: none;
  -webkit-appearance: none;
  background: rgba(255,255,255,0.04) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236394ff' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 14px center;
  border: 1px solid rgba(99,148,255,0.18);
  border-radius: 10px;
  color: rgba(220,232,255,0.9);
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  padding: 11px 36px 11px 14px;
  width: 100%;
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  outline: none;
  cursor: pointer;
}
.lo-select-dark:focus {
  border-color: rgba(96,165,250,0.5);
  background-color: rgba(59,130,246,0.06);
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}
.lo-select-dark option { background: #0d1a3a; color: rgba(220,232,255,0.9); }

.lo-select-light {
  appearance: none;
  -webkit-appearance: none;
  background: rgba(255,255,255,0.9) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 14px center;
  border: 1px solid rgba(59,130,246,0.18);
  border-radius: 10px;
  color: #1e3a6a;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  padding: 11px 36px 11px 14px;
  width: 100%;
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  outline: none;
  cursor: pointer;
}
.lo-select-light:focus {
  border-color: rgba(37,99,235,0.45);
  background-color: white;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}

/* ── Error hint ── */
.lo-error-dark  { color: #fca5a5; font-size: 11.5px; margin-top: 5px; display: flex; align-items: center; gap: 4px; }
.lo-error-light { color: #dc2626; font-size: 11.5px; margin-top: 5px; display: flex; align-items: center; gap: 4px; }

/* ── Section panel ── */
.lo-panel-dark {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(99,148,255,0.08);
  border-radius: 14px;
  padding: 20px;
}
.lo-panel-light {
  background: rgba(239,246,255,0.7);
  border: 1px solid rgba(59,130,246,0.1);
  border-radius: 14px;
  padding: 20px;
}

/* ── File upload zone ── */
.lo-file-zone-dark {
  border: 1.5px dashed rgba(99,148,255,0.3);
  border-radius: 12px;
  background: rgba(59,130,246,0.04);
  transition: all 0.22s ease;
  cursor: pointer;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 28px 16px;
  text-align: center;
}
.lo-file-zone-dark:hover {
  border-color: rgba(96,165,250,0.55);
  background: rgba(59,130,246,0.08);
  box-shadow: 0 0 22px rgba(59,130,246,0.1);
}
.lo-file-zone-light {
  border: 1.5px dashed rgba(59,130,246,0.28);
  border-radius: 12px;
  background: rgba(239,246,255,0.6);
  transition: all 0.22s ease;
  cursor: pointer;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 28px 16px;
  text-align: center;
}
.lo-file-zone-light:hover {
  border-color: rgba(37,99,235,0.5);
  background: rgba(219,234,254,0.5);
  box-shadow: 0 0 18px rgba(59,130,246,0.08);
}
.lo-file-zone-uploading-dark {
  border-color: rgba(245,158,11,0.45);
  background: rgba(245,158,11,0.05);
}
.lo-file-zone-uploading-light {
  border-color: rgba(217,119,6,0.4);
  background: rgba(255,251,235,0.8);
}

/* ── File row (existing / preview) ── */
.lo-file-row-dark {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(99,148,255,0.12);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex; align-items: center; justify-content: space-between;
  transition: all 0.18s ease;
}
.lo-file-row-dark:hover { background: rgba(59,130,246,0.06); border-color: rgba(96,165,250,0.22); }

.lo-file-row-light {
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(59,130,246,0.14);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex; align-items: center; justify-content: space-between;
  transition: all 0.18s ease;
}
.lo-file-row-light:hover { background: white; border-color: rgba(37,99,235,0.3); box-shadow: 0 4px 14px rgba(59,130,246,0.08); }

.lo-file-row-new-dark  { border-color: rgba(52,211,153,0.25); background: rgba(16,185,129,0.04); }
.lo-file-row-new-light { border-color: rgba(16,185,129,0.2);  background: rgba(240,253,244,0.85); }

/* ── File icon buttons ── */
.lo-file-btn-dark {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  border: none; cursor: pointer; transition: all 0.18s ease;
  background: rgba(255,255,255,0.04);
}
.lo-file-btn-dark.view  { color: #60a5fa; }
.lo-file-btn-dark.view:hover  { background: rgba(59,130,246,0.12); color: #93c5fd; }
.lo-file-btn-dark.edit  { color: #fbbf24; }
.lo-file-btn-dark.edit:hover  { background: rgba(245,158,11,0.12); color: #fcd34d; }
.lo-file-btn-dark.del  { color: #f87171; }
.lo-file-btn-dark.del:hover  { background: rgba(239,68,68,0.12); color: #fca5a5; }

.lo-file-btn-light {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  border: none; cursor: pointer; transition: all 0.18s ease;
  background: transparent;
}
.lo-file-btn-light.view  { color: #2563eb; }
.lo-file-btn-light.view:hover  { background: rgba(59,130,246,0.1); }
.lo-file-btn-light.edit  { color: #d97706; }
.lo-file-btn-light.edit:hover  { background: rgba(245,158,11,0.1); }
.lo-file-btn-light.del  { color: #dc2626; }
.lo-file-btn-light.del:hover  { background: rgba(239,68,68,0.08); }

/* ── Buttons ── */
.lo-btn-cancel-dark {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(99,148,255,0.18);
  color: rgba(179,193,240,0.8);
  border-radius: 11px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 500;
  padding: 12px 24px;
  cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  transition: all 0.2s ease;
}
.lo-btn-cancel-dark:hover {
  background: rgba(255,255,255,0.07);
  border-color: rgba(99,148,255,0.35);
  color: rgba(220,232,255,0.9);
}
.lo-btn-cancel-light {
  background: rgba(255,255,255,0.85);
  border: 1px solid rgba(59,130,246,0.18);
  color: #4b6ea8;
  border-radius: 11px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 500;
  padding: 12px 24px;
  cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 4px rgba(59,130,246,0.08);
}
.lo-btn-cancel-light:hover {
  background: white;
  border-color: rgba(37,99,235,0.35);
  color: #1d4ed8;
  box-shadow: 0 4px 14px rgba(59,130,246,0.1);
}

.lo-btn-submit {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%);
  border: none;
  color: white;
  border-radius: 11px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 600;
  padding: 12px 28px;
  cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  transition: all 0.22s ease;
  box-shadow: 0 4px 18px rgba(37,99,235,0.35), 0 1px 0 rgba(255,255,255,0.12) inset;
  position: relative; overflow: hidden;
}
.lo-btn-submit::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
  opacity: 0; transition: opacity 0.2s ease;
}
.lo-btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 28px rgba(37,99,235,0.45), 0 1px 0 rgba(255,255,255,0.12) inset;
}
.lo-btn-submit:hover:not(:disabled)::before { opacity: 1; }
.lo-btn-submit:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

/* ── Loading ── */
@keyframes spin { to { transform: rotate(360deg); } }
.lo-spinner { animation: spin 0.85s linear infinite; }

/* ── Mount animation ── */
@keyframes loIn {
  from { transform: translateY(22px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
.lo-mounted { animation: loIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards; }

/* ── Loading screen ── */
.lo-loading-dark  { background: #070b18; }
.lo-loading-light { background: #f0f6ff; }

/* ── Divider ── */
.lo-divider-dark  { height: 1px; background: rgba(99,148,255,0.08); margin: 8px 0; }
.lo-divider-light { height: 1px; background: rgba(59,130,246,0.08);  margin: 8px 0; }

/* ── Unsaved chip ── */
.lo-chip-unsaved-dark  { background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); color: #fcd34d; font-size: 10.5px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
.lo-chip-unsaved-light { background: rgba(253,230,138,0.6); border: 1px solid rgba(217,119,6,0.25);  color: #b45309;  font-size: 10.5px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }

/* ── File name & meta text ── */
.lo-file-name-dark  { color: rgba(220,232,255,0.9); font-size: 13px; font-weight: 500; }
.lo-file-name-light { color: #1e3a6a; font-size: 13px; font-weight: 500; }
.lo-file-meta-dark  { color: rgba(99,148,255,0.55); font-size: 11.5px; margin-top: 2px; }
.lo-file-meta-light { color: #7a97c9; font-size: 11.5px; margin-top: 2px; }

/* ── Upload icon container ── */
.lo-upload-icon-dark  { color: rgba(96,165,250,0.55); margin-bottom: 10px; }
.lo-upload-icon-light { color: rgba(37,99,235,0.45);  margin-bottom: 10px; }
.lo-upload-text-dark  { color: rgba(96,165,250,0.8); font-size: 13px; font-weight: 500; }
.lo-upload-text-light { color: #2563eb; font-size: 13px; font-weight: 500; }
.lo-upload-hint-dark  { color: rgba(99,148,255,0.4); font-size: 11px; margin-top: 4px; }
.lo-upload-hint-light { color: #93aacf; font-size: 11px; margin-top: 4px; }

/* ── Not-found card ── */
.lo-notfound-dark {
  background: rgba(10,16,34,0.9);
  border: 1px solid rgba(99,148,255,0.12);
  border-radius: 18px;
  padding: 48px 36px;
  text-align: center;
  max-width: 420px;
}
.lo-notfound-light {
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(59,130,246,0.14);
  border-radius: 18px;
  box-shadow: 0 16px 48px rgba(37,99,235,0.1);
  padding: 48px 36px;
  text-align: center;
  max-width: 420px;
}
`;

const LengkapiOrder = () => {
  const { portofolio, id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const d = isDark;

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userData = JSON.parse(localStorage.getItem("user"));
  const userPeran = userData?.peran || "";
  const userEmail = userData?.email || "";
  const userBidang = userData?.bidang || "";

  const [files, setFiles] = useState({
    siSpk: null,
    sertifikatPM06: null,
    sertifikat: null,
    invoice: null,
    fakturPajak: null,
  });

  const [currentStatusOrder, setCurrentStatusOrder] = useState(formData.statusOrder || "New Order");
  const [filePreviews, setFilePreviews] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState({});

  const checkForIncompleteData = (field) =>
    !formData[field] || formData[field] === null || formData[field] === "";

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
    if (!timestamp || !timestamp.seconds) return "";
    const date = timestamp.toDate();
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (!userPeran) { alert("Anda tidak memiliki akses!"); navigate("/"); return; }
    if (userPeran === "admin portofolio" && userBidang !== portofolio) {
      alert("Anda tidak memiliki akses!"); navigate("/"); return;
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
            tanggalPekerjaan: data.tanggalPekerjaan instanceof Timestamp ? data.tanggalPekerjaan : null,
            tanggalPengirimanInvoice: data.tanggalPengirimanInvoice instanceof Timestamp ? data.tanggalPengirimanInvoice : null,
            tanggalPengirimanFaktur: data.tanggalPengirimanFaktur instanceof Timestamp ? data.tanggalPengirimanFaktur : null,
          });
        }
      } catch (error) { console.error("❌ Error fetching order:", error); }
      setLoading(false);
    };
    fetchOrder();
    return () => setMounted(false);
  }, [portofolio, userPeran, userBidang, id]);

  const editableFields = {
    "admin portofolio": [
      "tanggalSerahOrderKeCs", "tanggalPekerjaan",
      "proformaSerahKeOps", "proformaSerahKeDukbis", "proformaBySistem", "noSiSpk", "jenisPekerjaan",
      "namaTongkang", "lokasiPekerjaan", "estimasiTonase", "tonaseDS", "nilaiProforma",
      "jenisSertifikat", "tanggalStatusOrder",
      ...(portofolio === "batubara" || portofolio === "ksp"
        ? ["tonaseDS", "keteranganSertifikatPM06", "noSertifikatPM06"] : [])
    ],
    "customer service": ["nomorOrder", "tanggalOrder"],
    "admin keuangan": ["tanggalStatusOrder", "nilaiInvoice", "tanggalPengirimanInvoice", "tanggalPengirimanFaktur", "nomorInvoice", "fakturPajak", "invoice"],
    "all": ["distribusiSertifikatPengirim", "distribusiSertifikatPengirimTanggal", "distribusiSertifikatPenerima", "distribusiSertifikatPenerimaTanggal"]
  };

  const getFieldsToShowByStatus = (status) => {
    switch (status) {
      case "New Order":             return ["nomorOrder", "tanggalOrder"];
      case "Entry":                 return ["tanggalPekerjaan", "tonaseDS"];
      case "Diproses - Lapangan":   return ["keteranganSertifikatPM06", "jenisSertifikat", "noSertifikatPM06"];
      case "Diproses - Sertifikat": return ["tanggalStatusOrder"];
      case "Closed Order":          return ["proformaSerahKeOps", "proformaSerahKeDukbis", "proformaBySistem", "nilaiProforma"];
      case "Penerbitan Proforma":   return ["tanggalPengirimanInvoice", "tanggalPengirimanFaktur", "nomorInvoice", "invoice", "fakturPajak", "nilaiInvoice"];
      case "Invoice":               return ["distribusiSertifikatPengirim","distribusiSertifikatPengirimTanggal","distribusiSertifikatPenerima","distribusiSertifikatPenerimaTanggal"];
      default: return [];
    }
  };

  const fieldsToShow = [...(editableFields[userPeran] || []), ...editableFields["all"]];

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
      setFormData((prevData) => ({ ...prevData, documents: updatedDocuments }));
      setFiles((prevFiles) => ({ ...prevFiles, [fileKey]: null }));
      alert("File berhasil dihapus!");
    } catch { alert("Terjadi kesalahan saat menghapus file."); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value.trim() === "" ? null : value;
    if (type === "number") newValue = value ? Number(value) : null;
    else if (type === "checkbox") newValue = e.target.checked;
    else if (value.trim() === "") newValue = null;
    setFormData((prevData) => ({ ...prevData, [name]: newValue }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    let newValue = null;
    if (value) { const p = new Date(value); if (!isNaN(p)) newValue = Timestamp.fromDate(p); }
    setFormData((prevData) => ({ ...prevData, [name]: newValue }));
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
    setFiles((prevFiles) => ({ ...prevFiles, [name]: file }));
    setFormData((prevFormData) => ({
      ...prevFormData,
      documents: { ...prevFormData.documents, [name]: { fileName: file.name, fileUrl: "", uploadedBy: userData.email, uploadedAt: Timestamp.now() } },
    }));
    setFilePreviews((prevPreviews) => ({
      ...prevPreviews,
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

  const handleFormattedProforma = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const formatted = rawValue ? Number(rawValue).toLocaleString("id-ID") : "";
    setFormData((prev) => ({ ...prev, nilaiProformaRaw: rawValue, nilaiProforma: formatted }));
  };

  const handleFormattedInvoice = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const formatted = rawValue ? Number(rawValue).toLocaleString("id-ID") : "";
    setFormData((prev) => ({ ...prev, nilaiInvoiceRaw: rawValue, nilaiInvoice: formatted }));
  };

  const validateFormData = () => {
    const errors = [];
    if (userPeran === "admin keuangan") {
      const hasFakturPajak = formData.fakturPajak && formData.fakturPajak.trim() !== "";
      const hasFakturPajakFile = formData.documents?.fakturPajak || files.fakturPajak;
      if ((hasFakturPajak && !hasFakturPajakFile) || (!hasFakturPajak && hasFakturPajakFile))
        errors.push("Faktur Pajak dan File Faktur Pajak harus diisi bersamaan.");
      const hasNomorInvoice = formData.nomorInvoice && formData.nomorInvoice.trim() !== "";
      const hasInvoiceFile = formData.documents?.invoice || files.invoice;
      if ((hasNomorInvoice && !hasInvoiceFile) || (!hasNomorInvoice && hasInvoiceFile))
        errors.push("Nomor Invoice dan File Invoice harus diisi bersamaan.");
    }
    if (userPeran === "admin portofolio") {
      const hasNoSiSpk = formData.noSiSpk && formData.noSiSpk.trim() !== "";
      const hasSiSpkFile = formData.documents?.siSpk || files.siSpk;
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
        const hasSertifikatFile = formData.documents?.sertifikat || files.sertifikat;
        if (!hasNoSertifikat || !hasSertifikatFile)
          errors.push("Nomor Sertifikat dan File Sertifikat wajib diisi jika jenis sertifikat bukan 'Tidak Terbit Sertifikat'.");
      }
    }
    const isFileRequired = formData.documents && Object.keys(formData.documents).length === 0;
    if (isFileRequired) errors.push("File tidak boleh kosong. Harap unggah file yang diperlukan.");
    return errors;
  };

  const checkDistributionFields = () => {
    const distributionFields = ["distribusiSertifikatPengirim","distribusiSertifikatPengirimTanggal","distribusiSertifikatPenerima","distribusiSertifikatPenerimaTanggal"];
    return distributionFields.every(f => formData[f] && formData[f] !== "");
  };

  const checkRequiredFields = (status) => {
    const requiredFields = {
      "New Order": ["pelanggan", "nomorOrder", "tanggalOrder"],
      "Entry": ["tanggalPekerjaan", "tonaseDS"],
      "Diproses - Lapangan": ["keteranganSertifikatPM06", "jenisSertifikat"],
      "Diproses - Sertifikat": ["tanggalStatusOrder"],
      "Closed Order": ["proformaSerahKeOps", "proformaSerahKeDukbis", "proformaBySistem", "nilaiProforma"],
      "Penerbitan Proforma": ["tanggalPengirimanInvoice", "tanggalPengirimanFaktur", "nomorInvoice", "nilaiInvoice"],
      "Invoice": ["distribusiSertifikatPengirim", "distribusiSertifikatPengirimTanggal", "distribusiSertifikatPenerima", "distribusiSertifikatPenerimaTanggal"],
    };
    return (requiredFields[status] || []).filter(field => !formData[field] || formData[field] === "");
  };

  const getNextStatus = (currentStatus) => {
    const list = ["New Order","Entry","Diproses - Lapangan","Diproses - Sertifikat","Closed Order","Penerbitan Proforma","Invoice","Selesai"];
    const idx = list.indexOf(currentStatus);
    return (idx === -1 || idx === list.length - 1) ? null : list[idx + 1];
  };

  const fieldsToShowBasedOnStatus = getFieldsToShowByStatus(currentStatusOrder);
  const shouldShowField = (fieldName) =>
    fieldsToShow.includes(fieldName) && fieldsToShowBasedOnStatus.includes(fieldName);

  useEffect(() => {
    setMounted(true);
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const data = await getOrderById(id);
        if (data) {
          setFormData({
            ...data,
            jenisSertifikat: data.jenisSertifikat || "Tidak Terbit Sertifikat",
            tanggalStatusOrder: data.tanggalStatusOrder instanceof Timestamp ? data.tanggalStatusOrder : null,
            tanggalSerahOrderKeCs: data.tanggalSerahOrderKeCs instanceof Timestamp ? data.tanggalSerahOrderKeCs : null,
            tanggalPekerjaan: data.tanggalPekerjaan instanceof Timestamp ? data.tanggalPekerjaan : null,
            tanggalPengirimanInvoice: data.tanggalPengirimanInvoice instanceof Timestamp ? data.tanggalPengirimanInvoice : null,
            tanggalPengirimanFaktur: data.tanggalPengirimanFaktur instanceof Timestamp ? data.tanggalPengirimanFaktur : null,
            statusOrder: data.statusOrder,
          });
          setCurrentStatusOrder(data.statusOrder || "New Order");
        }
      } catch (error) { console.error("❌ Error fetching order:", error); }
      setLoading(false);
    };
    fetchOrder();
    return () => setMounted(false);
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateFormData();
    if (validationErrors.length > 0) { alert(`Error:\n${validationErrors.join('\n')}`); return; }
    const missingFields = checkRequiredFields(formData.statusOrder);
    if (missingFields.length > 0) { alert(`Field berikut harus diisi untuk status '${formData.statusOrder}':\n${missingFields.join(", ")}`); return; }
    const nextStatus = getNextStatus(formData.statusOrder);
    if (!nextStatus) { alert("Status sudah berada di tahap terakhir."); return; }
    if (formData.statusOrder === "Invoice" && checkDistributionFields()) {
      setFormData((prevData) => ({ ...prevData, statusOrder: "Selesai" }));
    }
    let statusDate;
    if (nextStatus === "Closed Order" && formData.tanggalStatusOrder) statusDate = formData.tanggalStatusOrder;
    else statusDate = Timestamp.now();

    const payload = {
      ...formData,
      statusOrder: nextStatus,
      tanggalStatusOrder: statusDate,
      nilaiProforma: typeof formData.nilaiProforma === "string" ? Number(formData.nilaiProforma.replace(/\./g, "")) : (typeof formData.nilaiProforma === "number" ? formData.nilaiProforma : null),
      nilaiInvoice: typeof formData.nilaiInvoice === "string" ? Number(formData.nilaiInvoice.replace(/\./g, "")) : (typeof formData.nilaiInvoice === "number" ? formData.nilaiInvoice : null),
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
      const updatedData = { ...existingData, ...payload, updatedAt: Timestamp.now(), lastUpdatedBy: userEmail, documents: { ...formData.documents, ...uploadedDocuments } };
      await updateOrder(id, updatedData);
      setFiles({ siSpk: null, sertifikatPM06: null, sertifikat: null, invoice: null, fakturPajak: null });
      setFilePreviews({});
      alert("Data berhasil diperbarui!");
      navigate(`/orders/${portofolio}/detail/${id}`);
    } catch { alert("Terjadi kesalahan saat mengunggah file."); }
    finally { setLoading(false); setSaving(false); }
  };

  // ─── renderFileUpload (redesigned) ───────────────────────────────────
  const renderFileUpload = (fileKey, displayName) => {
    const hasExistingFile = formData.documents?.[fileKey];
    const hasNewFile = files[fileKey] || filePreviews[fileKey];
    const isUploading = uploadingFiles[fileKey];
    const btnCls = `lo-file-btn-${d ? "dark" : "light"}`;

    return (
      <div style={{ marginBottom: 16 }}>
        <label className={`lo-label-${d ? "dark" : "light"}`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <FiFile style={{ opacity: 0.6, flexShrink: 0 }} size={13} />
          {displayName}
        </label>

        {hasExistingFile && !hasNewFile ? (
          <div className={`lo-file-row-${d ? "dark" : "light"}`}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className={`lo-file-name-${d ? "dark" : "light"}`} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {formData.documents[fileKey].fileName}
              </p>
              <p className={`lo-file-meta-${d ? "dark" : "light"}`}>
                {formData.documents[fileKey].uploadedBy} · {new Date(formData.documents[fileKey].uploadedAt.seconds * 1000).toLocaleDateString("id-ID")}
              </p>
            </div>
            <div style={{ display: "flex", gap: 4, flexShrink: 0, marginLeft: 12 }}>
              <a href={formData.documents[fileKey].fileUrl} target="_blank" rel="noopener noreferrer" className={`${btnCls} view`} title="Lihat">
                <FiEye size={15} />
              </a>
              <label className={`${btnCls} edit`} title="Ubah" style={{ cursor: "pointer" }}>
                <FiEdit size={15} />
                <input type="file" name={fileKey} onChange={handleFileChange} className="hidden" style={{ display: "none" }} />
              </label>
              <button type="button" className={`${btnCls} del`} title="Hapus" onClick={() => handleDeleteFile(fileKey)}>
                <FiTrash2 size={15} />
              </button>
            </div>
          </div>

        ) : hasNewFile ? (
          <div className={`lo-file-row-${d ? "dark" : "light"} lo-file-row-new-${d ? "dark" : "light"}`}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className={`lo-file-name-${d ? "dark" : "light"}`} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {filePreviews[fileKey]?.fileName || files[fileKey]?.name || "File baru"}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                <p className={`lo-file-meta-${d ? "dark" : "light"}`}>
                  {filePreviews[fileKey]?.fileSize || (files[fileKey] ? (files[fileKey].size / 1024).toFixed(2) + " KB" : "")}
                </p>
                <span className={`lo-chip-unsaved-${d ? "dark" : "light"}`}>Belum disimpan</span>
              </div>
            </div>
            <button
              type="button"
              className={`${btnCls} del`}
              title="Batalkan"
              onClick={() => {
                setFiles((pf) => ({ ...pf, [fileKey]: null }));
                setFilePreviews((pp) => { const u = { ...pp }; delete u[fileKey]; return u; });
              }}
            >
              <FiTrash2 size={15} />
            </button>
          </div>

        ) : (
          <div style={{ position: "relative" }}>
            <input
              type="file"
              name={fileKey}
              onChange={handleFileChange}
              disabled={isUploading}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, zIndex: 10, cursor: isUploading ? "not-allowed" : "pointer" }}
            />
            <div className={`lo-file-zone-${d ? "dark" : "light"} ${isUploading ? `lo-file-zone-uploading-${d ? "dark" : "light"}` : ""}`}>
              {isUploading ? (
                <>
                  <div className="lo-spinner" style={{ width: 28, height: 28, border: `2.5px solid ${d ? "rgba(245,158,11,0.3)" : "rgba(217,119,6,0.25)"}`, borderTopColor: d ? "#fbbf24" : "#d97706", borderRadius: "50%", marginBottom: 10 }} />
                  <span style={{ fontSize: 13, color: d ? "#fcd34d" : "#b45309", fontWeight: 500 }}>Mengunggah file...</span>
                </>
              ) : (
                <>
                  <div className={`lo-upload-icon-${d ? "dark" : "light"}`}>
                    <FiUpload size={28} />
                  </div>
                  <p className={`lo-upload-text-${d ? "dark" : "light"}`}>Klik untuk unggah file</p>
                  <p className={`lo-upload-hint-${d ? "dark" : "light"}`}>PDF atau JPEG/PNG · Maks 5 MB</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── Loading screen ───────────────────────────────────────────────────
  if (loading && !mounted) {
    return (
      <>
        <style>{STYLES}</style>
        <div className={`lo-root lo-loading-${d ? "dark" : "light"}`}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <div style={{ textAlign: "center" }}>
            <div className="lo-spinner" style={{ width: 52, height: 52, border: "3px solid rgba(59,130,246,0.15)", borderTopColor: "#3b82f6", borderRadius: "50%", margin: "0 auto 18px" }} />
            <p style={{ color: d ? "rgba(148,163,220,0.7)" : "#6b8cbf", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>Memuat data order...</p>
          </div>
        </div>
      </>
    );
  }

  // ─── Not found screen ─────────────────────────────────────────────────
  if (!formData && !loading) {
    return (
      <>
        <style>{STYLES}</style>
        <div className={`lo-root lo-page-${d ? "dark" : "light"}`}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
          <div className={`lo-notfound-${d ? "dark" : "light"}`}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: d ? "rgba(220,232,255,0.9)" : "#0f2050", marginBottom: 8 }}>Data Tidak Ditemukan</h2>
            <p style={{ fontSize: 14, color: d ? "rgba(148,163,220,0.65)" : "#5a7ab5", marginBottom: 24, lineHeight: 1.6 }}>
              Order yang Anda cari tidak dapat ditemukan atau telah dihapus.
            </p>
            <button className="lo-btn-submit" onClick={() => navigate(`/orders/${portofolio}`)}>
              <FiArrowLeft size={15} /> Kembali ke Daftar Order
            </button>
          </div>
        </div>
      </>
    );
  }

  // ─── Section heading helper ───────────────────────────────────────────
  const SectionHeading = ({ label }) => (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
      <span className={`lo-section-title-${d ? "dark" : "light"}`}>{label}</span>
      <div className={`lo-section-line-${d ? "dark" : "light"}`} />
    </div>
  );

  // ─── Field wrapper (label + input + error) ────────────────────────────
  const Field = ({ label, children, name, style }) => (
    <div style={style}>
      <label className={`lo-label-${d ? "dark" : "light"}`}>{label}</label>
      {children}
      {name && checkForIncompleteData(name) && (
        <p className={`lo-error-${d ? "dark" : "light"}`}>
          <FiAlertCircle size={11} /> Data belum lengkap
        </p>
      )}
    </div>
  );

  const inputCls = `lo-input-${d ? "dark" : "light"}`;
  const selectCls = `lo-select-${d ? "dark" : "light"}`;
  const panelCls = `lo-panel-${d ? "dark" : "light"}`;

  // ─── MAIN RENDER ─────────────────────────────────────────────────────
  return (
    <>
      <style>{STYLES}</style>
      <div
        className={`lo-root lo-page-${d ? "dark" : "light"}`}
        style={{ padding: "32px 16px 64px" }}
      >
        <div
          className={`lo-mounted ${mounted ? "" : "opacity-0"}`}
          style={{ maxWidth: 820, margin: "0 auto" }}
        >
          {/* ── Card ── */}
          <div className={`lo-card-${d ? "dark" : "light"}`}>

            {/* Animated accent bar */}
            <div className="lo-accent" />

            {/* ── Card header ── */}
            <div className={`lo-card-header-${d ? "dark" : "light"}`}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <h2 className={`lo-title-${d ? "dark" : "light"}`}>Lengkapi Data Order</h2>
                  <p className={`lo-sub-${d ? "dark" : "light"}`}>
                    Form disesuaikan dengan hak akses sebagai{" "}
                    <span style={{ fontWeight: 600, color: d ? "#93c5fd" : "#1d4ed8" }}>{userPeran}</span>
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span className={`lo-badge-${d ? "dark" : "light"}`}>
                    {portofolio.toUpperCase()}
                  </span>
                  {formData.statusOrder && (
                    <span className={`lo-status-${d ? "dark" : "light"}`}>
                      {formData.statusOrder}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Form body ── */}
            <form onSubmit={handleSubmit} style={{ padding: "28px 32px" }}>

              {/* Pelanggan (read-only) */}
              <div style={{ marginBottom: 24 }}>
                <SectionHeading label="Informasi Pelanggan" />
                <Field label="Pelanggan">
                  <input type="text" value={formData.pelanggan || ""} className={inputCls} readOnly />
                </Field>
              </div>

              {/* ── Tanggal Status Order ── */}
              {(userPeran === "admin portofolio" || userPeran === "admin keuangan") &&
                formData.statusOrder === "Diproses - Sertifikat" &&
                shouldShowField('tanggalStatusOrder') && (
                  <div style={{ marginBottom: 24 }}>
                    <SectionHeading label="Tanggal Closed" />
                    <div className={panelCls}>
                      <Field label="Pilih Tanggal Closed" name="tanggalStatusOrder">
                        <div style={{ position: "relative" }}>
                          <FiCalendar size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: d ? "rgba(96,165,250,0.55)" : "#5a7ab5", pointerEvents: "none" }} />
                          <input
                            type="date"
                            name="tanggalStatusOrder"
                            value={formData.tanggalStatusOrder ? formatDateForInput(formData.tanggalStatusOrder) : ""}
                            onChange={handleDateChange}
                            className={inputCls}
                            style={{ paddingLeft: 36 }}
                          />
                        </div>
                      </Field>
                    </div>
                  </div>
                )}

              {/* ── Admin Portofolio fields ── */}
              {userPeran === "admin portofolio" && (
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading label="Data Pekerjaan" />
                  <div className={panelCls}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                      {shouldShowField('jenisPekerjaan') && (
                        <Field label="Jenis Pekerjaan" name="jenisPekerjaan">
                          <input type="text" name="jenisPekerjaan" value={formData.jenisPekerjaan || ""} onChange={handleChange} className={inputCls} />
                        </Field>
                      )}
                      {shouldShowField('namaTongkang') && (
                        <Field label="Nama Tongkang" name="namaTongkang">
                          <input type="text" name="namaTongkang" value={formData.namaTongkang || ""} onChange={handleChange} className={inputCls} />
                        </Field>
                      )}
                      {shouldShowField('lokasiPekerjaan') && (
                        <Field label="Lokasi Pekerjaan" name="lokasiPekerjaan">
                          <input type="text" name="lokasiPekerjaan" value={formData.lokasiPekerjaan || ""} onChange={handleChange} className={inputCls} />
                        </Field>
                      )}
                      {shouldShowField('estimasiTonase') && (
                        <Field label="Estimasi Kuantitas" name="estimasiTonase">
                          <input type="text" name="estimasiTonase" value={formData.estimasiTonase || ""} onChange={handleChange} className={inputCls} />
                        </Field>
                      )}
                      {shouldShowField('tonaseDS') && (
                        <Field label="Tonase DS" name="tonaseDS">
                          <input type="number" name="tonaseDS" value={formData.tonaseDS || ""} onChange={handleChange} className={inputCls} />
                        </Field>
                      )}
                      {shouldShowField('noSiSpk') && (
                        <Field label="Nomor Si/Spk" name="noSiSpk">
                          <input type="text" name="noSiSpk" value={formData.noSiSpk || ""} onChange={handleChange} className={inputCls} />
                        </Field>
                      )}
                      {shouldShowField('nilaiProforma') && (
                        <Field label="Nilai Proforma" name="nilaiProforma">
                          <div style={{ position: "relative" }}>
                            <span className={`lo-input-prefix-${d ? "dark" : "light"}`}>Rp</span>
                            <input type="text" name="nilaiProforma" value={formData.nilaiProforma || ""} onChange={handleFormattedProforma} className={inputCls} style={{ paddingLeft: 36 }} />
                          </div>
                        </Field>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Customer Service fields ── */}
              {userPeran === "customer service" && shouldShowField('nomorOrder') && (
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading label="Data Order" />
                  <div className={panelCls}>
                    <Field label="Nomor Order" name="nomorOrder">
                      <input type="text" name="nomorOrder" value={formData.nomorOrder || ""} onChange={handleChange} className={inputCls} />
                    </Field>
                  </div>
                </div>
              )}

              {/* ── Admin Keuangan fields ── */}
              {userPeran === "admin keuangan" && (
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading label="Data Keuangan" />
                  <div className={panelCls}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                      {shouldShowField('nomorInvoice') && (
                        <Field label="Nomor Invoice" name="nomorInvoice">
                          <input type="text" name="nomorInvoice" value={formData.nomorInvoice || ""} onChange={handleChange} className={inputCls} />
                        </Field>
                      )}
                      {shouldShowField('fakturPajak') && (
                        <Field label="Nomor Seri Faktur Pajak" name="fakturPajak">
                          <input type="text" name="fakturPajak" value={formData.fakturPajak || ""} onChange={handleChange} className={inputCls} />
                        </Field>
                      )}
                      {shouldShowField('nilaiInvoice') && (
                        <Field label="Nilai Invoice (Fee)" name="nilaiInvoice">
                          <div style={{ position: "relative" }}>
                            <span className={`lo-input-prefix-${d ? "dark" : "light"}`}>Rp</span>
                            <input type="text" name="nilaiInvoice" value={formData.nilaiInvoice || ""} onChange={handleFormattedInvoice} className={inputCls} style={{ paddingLeft: 36 }} />
                          </div>
                        </Field>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Distribusi Sertifikat (all roles) ── */}
              {(shouldShowField('distribusiSertifikatPengirim') || shouldShowField('distribusiSertifikatPenerima')) && (
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading label="Distribusi Sertifikat" />
                  <div className={panelCls}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                      {shouldShowField('distribusiSertifikatPengirim') && (
                        <Field label="Nama Yang Mendistribusi / Mengirim Sertifikat" name="distribusiSertifikatPengirim">
                          <input type="text" name="distribusiSertifikatPengirim" value={formData.distribusiSertifikatPengirim || ""} onChange={handleChange} className={inputCls} />
                        </Field>
                      )}
                      {shouldShowField('distribusiSertifikatPenerima') && (
                        <Field label="Nama Yang Menerima Sertifikat" name="distribusiSertifikatPenerima">
                          <input type="text" name="distribusiSertifikatPenerima" value={formData.distribusiSertifikatPenerima || ""} onChange={handleChange} className={inputCls} />
                        </Field>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tanggal fields ── */}
              {Object.keys(dateLabels).some(k => fieldsToShow.includes(k) && shouldShowField(k) && !shouldShowField("tanggalStatusOrder")) && (
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading label="Informasi Tanggal" />
                  <div className={panelCls}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                      {Object.keys(dateLabels).map((key) =>
                        fieldsToShow.includes(key) && shouldShowField(key) && !shouldShowField("tanggalStatusOrder") ? (
                          <Field key={key} label={dateLabels[key]} name={key}>
                            <div style={{ position: "relative" }}>
                              <FiCalendar size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: d ? "rgba(96,165,250,0.55)" : "#5a7ab5", pointerEvents: "none" }} />
                              <input
                                type="date"
                                name={key}
                                value={formData[key] ? formatDateForInput(formData[key]) : ""}
                                onChange={handleDateChange}
                                className={inputCls}
                                style={{ paddingLeft: 36 }}
                              />
                            </div>
                          </Field>
                        ) : null
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Sertifikat PM06 ── */}
              {shouldShowField('keteranganSertifikatPM06') && userPeran === "admin portofolio" && (
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
                        <Field label="Nomor Sertifikat PM06" name="noSertifikatPM06">
                          <input type="text" name="noSertifikatPM06" value={formData.noSertifikatPM06 || ""} onChange={handleChange} className={inputCls} />
                        </Field>
                        <div style={{ marginTop: 16 }}>
                          {renderFileUpload("sertifikatPM06", "Upload Sertifikat PM06")}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Jenis Sertifikat ── */}
              {shouldShowField('jenisSertifikat') && userPeran === "admin portofolio" && (
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading label="Informasi Sertifikat" />
                  <div className={panelCls}>
                    <Field label="Jenis Sertifikat">
                      <select name="jenisSertifikat" value={formData.jenisSertifikat || '-'} onChange={handleChange} className={selectCls}>
                        {["-","Tidak Terbit Sertifikat","LOADING","LS (PIK)","SERTIFIKAT","LAPORAN","KALIBRASI","HALAL"].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </Field>
                    {formData.jenisSertifikat !== "-" && formData.jenisSertifikat !== "Tidak Terbit Sertifikat" && (
                      <div style={{ marginTop: 16 }}>
                        <Field label="Nomor Sertifikat" name="noSertifikat">
                          <input type="text" name="noSertifikat" value={formData.noSertifikat || ""} onChange={handleChange} className={inputCls} />
                        </Field>
                        <div style={{ marginTop: 16 }}>
                          {renderFileUpload("sertifikat", "Upload Sertifikat")}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Dokumen Pendukung ── */}
              {(shouldShowField('siSpk') || shouldShowField('invoice') || shouldShowField('fakturPajak')) && (
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading label="Dokumen Pendukung" />
                  <div className={panelCls}>
                    {shouldShowField('siSpk') && userPeran === "admin portofolio" && renderFileUpload("siSpk", "Upload Dokumen Si/Spk")}
                    {shouldShowField('invoice') && userPeran === "admin keuangan" && renderFileUpload("invoice", "Upload Dokumen Invoice")}
                    {shouldShowField('fakturPajak') && userPeran === "admin keuangan" && renderFileUpload("fakturPajak", "Upload Dokumen Faktur Pajak")}
                  </div>
                </div>
              )}

              {/* ── Divider ── */}
              <div className={`lo-divider-${d ? "dark" : "light"}`} style={{ margin: "28px 0" }} />

              {/* ── Action buttons ── */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <button
                  type="button"
                  className={`lo-btn-cancel-${d ? "dark" : "light"}`}
                  onClick={() => navigate(`/orders/${portofolio}/detail/${id}`)}
                >
                  <FiArrowLeft size={15} /> Batal
                </button>
                <button type="submit" className="lo-btn-submit" disabled={saving || loading}>
                  {saving ? (
                    <>
                      <div className="lo-spinner" style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }} />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <FiCheck size={15} /> Simpan Perubahan
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>{/* end card */}
        </div>
      </div>
    </>
  );
};

export default LengkapiOrder;