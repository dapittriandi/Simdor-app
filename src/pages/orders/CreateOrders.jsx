import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../services/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { uploadToCloudinary } from "../../services/cloudinaryService";
import { useUser } from "../../context/UserContext";
import { useTheme } from "../../components/layout/ThemeContext";
import {
  ArrowLeft, Upload, Calendar, User, FileText, Map, Anchor,
  Database, AlertTriangle, X, AlertCircle, Check, Plus,
  HardHat, Loader2
} from "lucide-react";

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

.co-root { font-family: 'DM Sans', sans-serif; }

.co-page-dark  { background: #060a16; min-height: 100vh; }
.co-page-light { background: #f0f5ff; min-height: 100vh; }

/* ── Accent flow ── */
@keyframes accentFlow { 0%{background-position:0 0}100%{background-position:200% 0} }
.co-accent-dark  { height:2px; background:linear-gradient(90deg,transparent,#1d4ed8 25%,#60a5fa 50%,#1d4ed8 75%,transparent); background-size:200% 100%; animation:accentFlow 4s linear infinite; }
.co-accent-light { height:2px; background:linear-gradient(90deg,transparent,#3b82f6 25%,#93c5fd 50%,#3b82f6 75%,transparent); background-size:200% 100%; animation:accentFlow 4s linear infinite; }

/* ── Glass main card ── */
.co-card-dark {
  background: rgba(6,10,22,0.82);
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  border: 1px solid rgba(99,148,255,0.12);
  box-shadow: 0 8px 48px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.03) inset;
  border-radius: 16px;
  overflow: hidden;
}
.co-card-light {
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid rgba(59,130,246,0.14);
  box-shadow: 0 8px 32px rgba(59,130,246,0.09), 0 1px 0 rgba(255,255,255,0.9) inset;
  border-radius: 16px;
  overflow: hidden;
}

/* ── Section divider ── */
.co-section-dark  { border-bottom: 1px solid rgba(99,148,255,0.07); padding-bottom: 24px; margin-bottom: 24px; }
.co-section-light { border-bottom: 1px solid rgba(59,130,246,0.1);  padding-bottom: 24px; margin-bottom: 24px; }
.co-section-last  { padding-bottom: 0; margin-bottom: 0; border-bottom: none; }

/* ── Section title ── */
.co-sec-title-dark  { font-size:13px; font-weight:600; color:rgba(147,197,253,0.9); letter-spacing:.04em; display:flex; align-items:center; gap:8px; margin-bottom:16px; }
.co-sec-title-light { font-size:13px; font-weight:600; color:#1d4ed8; letter-spacing:.04em; display:flex; align-items:center; gap:8px; margin-bottom:16px; }

/* ── Field label ── */
.co-label-dark  { display:block; font-size:11px; font-weight:500; color:rgba(99,148,255,0.55); letter-spacing:.07em; text-transform:uppercase; margin-bottom:6px; }
.co-label-light { display:block; font-size:11px; font-weight:500; color:rgba(37,99,235,0.5); letter-spacing:.07em; text-transform:uppercase; margin-bottom:6px; }

/* ── Input base ── */
.co-input-dark {
  width:100%; padding:10px 14px; border-radius:10px; font-size:13.5px; font-family:'DM Sans',sans-serif;
  background:rgba(255,255,255,0.04); border:1px solid rgba(99,148,255,0.14);
  color:#cbd5f0; outline:none; transition:all .2s ease;
  box-sizing: border-box;
}
.co-input-dark:hover  { border-color:rgba(99,148,255,0.25); background:rgba(255,255,255,0.06); }
.co-input-dark:focus  { border-color:rgba(59,130,246,0.55); background:rgba(59,130,246,0.06); box-shadow:0 0 0 3px rgba(59,130,246,0.1); }
.co-input-dark::placeholder { color:rgba(99,148,255,0.25); }
.co-input-dark::-webkit-calendar-picker-indicator { filter: invert(0.7) sepia(1) saturate(3) hue-rotate(190deg); cursor:pointer; }

.co-input-light {
  width:100%; padding:10px 14px; border-radius:10px; font-size:13.5px; font-family:'DM Sans',sans-serif;
  background:rgba(241,245,249,0.8); border:1px solid rgba(59,130,246,0.14);
  color:#1e3a5f; outline:none; transition:all .2s ease;
  box-sizing: border-box;
}
.co-input-light:hover  { border-color:rgba(59,130,246,0.28); background:white; }
.co-input-light:focus  { border-color:rgba(37,99,235,0.5); background:white; box-shadow:0 0 0 3px rgba(59,130,246,0.08); }
.co-input-light::placeholder { color:rgba(37,99,235,0.28); }

/* ── Input error state ── */
.co-input-error-dark  { border-color:rgba(239,68,68,0.45)!important; background:rgba(239,68,68,0.05)!important; }
.co-input-error-dark:focus { box-shadow:0 0 0 3px rgba(239,68,68,0.12)!important; }
.co-input-error-light { border-color:rgba(239,68,68,0.4)!important; background:rgba(254,242,242,0.6)!important; }
.co-input-error-light:focus { box-shadow:0 0 0 3px rgba(239,68,68,0.1)!important; }

/* ── Input with icon wrapper ── */
.co-input-icon { position:relative; }
.co-input-icon-inner { position:absolute; top:50%; left:12px; transform:translateY(-50%); pointer-events:none; }
.co-input-padded { padding-left:38px!important; }

/* ── Field error message ── */
.co-field-err-dark  { display:flex; align-items:center; gap:5px; font-size:11px; color:#f87171; margin-top:5px; }
.co-field-err-light { display:flex; align-items:center; gap:5px; font-size:11px; color:#dc2626; margin-top:5px; }

/* ── Header ── */
.co-h1-dark  { font-size:21px; font-weight:700; background:linear-gradient(135deg,#93c5fd,#fff 55%,#60a5fa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.co-h1-light { font-size:21px; font-weight:700; background:optional linear-gradient(135deg,#1d4ed8,#2563eb 55%,#3b82f6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  background: linear-gradient(135deg,#1d4ed8,#2563eb 55%,#3b82f6);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.co-sub-dark  { font-size:12px; color:rgba(99,148,255,0.45); margin-top:2px; }
.co-sub-light { font-size:12px; color:rgba(37,99,235,0.4); margin-top:2px; }

/* ── Back button ── */
.co-back-dark  { display:inline-flex; align-items:center; gap:7px; padding:8px 14px; border-radius:10px; background:rgba(255,255,255,0.04); border:1px solid rgba(99,148,255,0.14); color:rgba(148,163,220,0.8); font-size:13px; font-weight:500; cursor:pointer; transition:all .2s ease; }
.co-back-dark:hover  { background:rgba(59,130,246,0.1); border-color:rgba(99,148,255,0.28); color:#93c5fd; transform:translateX(-2px); }
.co-back-light { display:inline-flex; align-items:center; gap:7px; padding:8px 14px; border-radius:10px; background:rgba(255,255,255,0.8); border:1px solid rgba(59,130,246,0.18); color:#4b6ea8; font-size:13px; font-weight:500; cursor:pointer; transition:all .2s ease; }
.co-back-light:hover { background:#eff6ff; border-color:rgba(59,130,246,0.3); color:#1d4ed8; transform:translateX(-2px); }

/* ── Submit button ── */
.co-btn-submit { display:inline-flex; align-items:center; gap:8px; padding:11px 26px; border-radius:11px; background:linear-gradient(135deg,#16a34a,#22c55e); border:none; color:white; font-size:13.5px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; box-shadow:0 4px 18px rgba(34,197,94,0.3); transition:all .22s ease; }
.co-btn-submit:hover:not(:disabled) { background:linear-gradient(135deg,#15803d,#16a34a); transform:translateY(-1px); box-shadow:0 6px 22px rgba(34,197,94,0.4); }
.co-btn-submit:disabled { opacity:.6; cursor:not-allowed; }

/* ── Cancel button ── */
.co-btn-cancel-dark  { display:inline-flex; align-items:center; gap:7px; padding:11px 20px; border-radius:11px; background:rgba(255,255,255,0.04); border:1px solid rgba(99,148,255,0.14); color:rgba(148,163,220,0.8); font-size:13px; font-weight:500; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .2s; }
.co-btn-cancel-dark:hover  { background:rgba(255,255,255,0.07); color:#bfdbfe; }
.co-btn-cancel-light { display:inline-flex; align-items:center; gap:7px; padding:11px 20px; border-radius:11px; background:rgba(255,255,255,0.8); border:1px solid rgba(59,130,246,0.18); color:#4b6ea8; font-size:13px; font-weight:500; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .2s; }
.co-btn-cancel-light:hover { background:#eff6ff; color:#1d4ed8; }

/* ── Form footer ── */
.co-form-footer-dark  { border-top:1px solid rgba(99,148,255,0.07); padding-top:20px; margin-top:4px; display:flex; flex-wrap:wrap; justify-content:space-between; gap:12px; }
.co-form-footer-light { border-top:1px solid rgba(59,130,246,0.1); padding-top:20px; margin-top:4px; display:flex; flex-wrap:wrap; justify-content:space-between; gap:12px; }

/* ── Error banner ── */
.co-banner-dark  { display:flex; align-items:center; gap:10px; padding:12px 16px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); border-radius:11px; color:#fca5a5; font-size:13px; margin-bottom:20px; }
.co-banner-light { display:flex; align-items:center; gap:10px; padding:12px 16px; background:rgba(254,242,242,0.8); border:1px solid rgba(239,68,68,0.22); border-radius:11px; color:#b91c1c; font-size:13px; margin-bottom:20px; }

/* ── Upload zone ── */
.co-upload-dark {
  border:1.5px dashed rgba(99,148,255,0.22); border-radius:12px; padding:28px 20px;
  background:rgba(255,255,255,0.02); text-align:center; cursor:pointer;
  transition:all .22s ease; display:flex; flex-direction:column; align-items:center; gap:10px;
}
.co-upload-dark:hover  { border-color:rgba(99,148,255,0.45); background:rgba(59,130,246,0.05); }
.co-upload-dark.has-file { border-color:rgba(59,130,246,0.45); background:rgba(59,130,246,0.07); border-style:solid; }
.co-upload-dark.has-err  { border-color:rgba(239,68,68,0.4); background:rgba(239,68,68,0.04); }

.co-upload-light {
  border:1.5px dashed rgba(59,130,246,0.22); border-radius:12px; padding:28px 20px;
  background:rgba(241,245,249,0.5); text-align:center; cursor:pointer;
  transition:all .22s ease; display:flex; flex-direction:column; align-items:center; gap:10px;
}
.co-upload-light:hover  { border-color:rgba(37,99,235,0.4); background:rgba(219,234,254,0.4); }
.co-upload-light.has-file { border-color:rgba(37,99,235,0.4); background:rgba(219,234,254,0.25); border-style:solid; }
.co-upload-light.has-err  { border-color:rgba(239,68,68,0.35); background:rgba(254,242,242,0.4); }

/* ── Popup modal ── */
.co-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:50; padding:16px; }
.co-popup-dark {
  background:rgba(8,14,30,0.96); backdrop-filter:blur(28px); border:1px solid rgba(99,148,255,0.18);
  border-radius:16px; padding:24px; width:100%; max-width:400px;
  box-shadow:0 24px 80px rgba(0,0,0,0.6);
}
.co-popup-light {
  background:rgba(255,255,255,0.98); backdrop-filter:blur(28px); border:1px solid rgba(59,130,246,0.16);
  border-radius:16px; padding:24px; width:100%; max-width:400px;
  box-shadow:0 24px 60px rgba(59,130,246,0.18);
}
.co-popup-title-dark  { font-size:15px; font-weight:700; color:#93c5fd; display:flex; align-items:center; gap:8px; }
.co-popup-title-light { font-size:15px; font-weight:700; color:#1d4ed8; display:flex; align-items:center; gap:8px; }
.co-popup-body-dark  { font-size:13.5px; color:rgba(203,213,240,0.8); margin-top:12px; margin-bottom:20px; line-height:1.55; }
.co-popup-body-light { font-size:13.5px; color:#334155; margin-top:12px; margin-bottom:20px; line-height:1.55; }
.co-popup-close-dark  { display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:8px; background:rgba(255,255,255,0.05); border:1px solid rgba(99,148,255,0.14); cursor:pointer; color:rgba(148,163,220,0.7); transition:all .18s; }
.co-popup-close-dark:hover  { background:rgba(255,255,255,0.1); color:#93c5fd; }
.co-popup-close-light { display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:8px; background:rgba(241,245,249,0.8); border:1px solid rgba(59,130,246,0.15); cursor:pointer; color:#64748b; transition:all .18s; }
.co-popup-close-light:hover { background:#e0e7ff; color:#1d4ed8; }

.co-btn-ok { display:flex; align-items:center; justify-content:center; gap:6px; padding:9px 22px; border-radius:10px; background:linear-gradient(135deg,#1d4ed8,#3b82f6); border:none; color:white; font-size:13px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; box-shadow:0 4px 14px rgba(59,130,246,0.28); transition:all .2s; }
.co-btn-ok:hover { background:linear-gradient(135deg,#1e40af,#2563eb); transform:translateY(-1px); }

/* ── Required star ── */
.co-req { color:#f87171; margin-left:3px; }
.co-req-light { color:#dc2626; margin-left:3px; }

/* ── Mount animation ── */
@keyframes coFadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
.co-mount { animation: coFadeUp .4s cubic-bezier(0.22,1,0.36,1) both; }

/* ── Spinner ── */
@keyframes spin { to { transform:rotate(360deg); } }
.co-spin { animation: spin .8s linear infinite; }

/* ── Upload icon glow ── */
.co-upload-icon-dark  { color:rgba(99,148,255,0.45); }
.co-upload-icon-light { color:rgba(37,99,235,0.4); }
.co-upload-hint-dark  { font-size:11.5px; color:rgba(99,148,255,0.35); }
.co-upload-hint-light { font-size:11.5px; color:rgba(37,99,235,0.35); }
.co-upload-cta-dark   { font-size:12.5px; font-weight:600; color:#60a5fa; }
.co-upload-cta-light  { font-size:12.5px; font-weight:600; color:#2563eb; }
.co-filename-dark   { font-size:12.5px; color:rgba(147,197,253,0.85); font-weight:500; }
.co-filename-light  { font-size:12.5px; color:#1d4ed8; font-weight:500; }
.co-file-badge-dark  { display:inline-flex; align-items:center; gap:5px; padding:4px 12px; background:rgba(37,99,235,0.15); border:1px solid rgba(59,130,246,0.3); border-radius:99px; font-size:11px; color:#93c5fd; margin-top:4px; }
.co-file-badge-light { display:inline-flex; align-items:center; gap:5px; padding:4px 12px; background:rgba(219,234,254,0.8); border:1px solid rgba(59,130,246,0.28); border-radius:99px; font-size:11px; color:#1d4ed8; margin-top:4px; }
`;

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */
const FieldError = ({ show, message, isDark }) =>
  show ? (
    <div className={isDark ? "co-field-err-dark" : "co-field-err-light"}>
      <AlertCircle style={{ width:11, height:11, flexShrink:0 }} />
      {message}
    </div>
  ) : null;

const NotificationPopup = ({ show, message, onClose, isDark, isSuccess }) => {
  if (!show) return null;
  const d = isDark;
  return (
    <div className="co-overlay">
      <div className={d ? "co-popup-dark" : "co-popup-light"}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <p className={d ? "co-popup-title-dark" : "co-popup-title-light"}>
            {isSuccess
              ? <><Check style={{ width:16, height:16, color: d ? "#4ade80" : "#16a34a" }} /> Berhasil!</>
              : <><AlertCircle style={{ width:16, height:16, color: d ? "#f87171" : "#dc2626" }} /> Pemberitahuan</>
            }
          </p>
          <button onClick={onClose} className={d ? "co-popup-close-dark" : "co-popup-close-light"}>
            <X style={{ width:14, height:14 }} />
          </button>
        </div>
        <p className={d ? "co-popup-body-dark" : "co-popup-body-light"}>{message}</p>
        <div style={{ display:"flex", justifyContent:"flex-end" }}>
          <button onClick={onClose} className="co-btn-ok">
            <Check style={{ width:13, height:13 }} /> Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const CreateOrder = () => {
  const { portofolio } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

// SESUDAH
const { activeUser } = useUser();
const userData = activeUser;  const userEmail  = userData?.email || "";
  const userPeran  = userData?.peran || "";
  const userBidang = userData?.bidang || "";

  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [showPopup, setShowPopup]     = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [isSuccess, setIsSuccess]     = useState(false);
  const [mounted, setMounted]         = useState(false);
  // FIX: Tambah authReady agar guard RBAC tidak redirect sebelum UserContext siap
  const [authReady, setAuthReady]     = useState(false);
  const [files, setFiles]             = useState({ siSpk: null });
  const [filePreview, setFilePreview] = useState(null);
  const [touchedFields, setTouchedFields] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    pelanggan: "",
    tanggalSerahOrderKeCs: null,
    jenisPekerjaan: "",
    lokasiPekerjaan: "",
    noSiSpk: "",
    namaTongkang: "",
    estimasiTonase: "",
    tonaseDS: "",
  });

  const d = isDark;
  const T = (dark, light) => d ? dark : light;

  // FIX: Beri jeda 1 tick agar UserContext sempat load dari localStorage
  // sebelum guard RBAC dijalankan. Ini mencegah redirect palsu saat
  // activeUser belum ter-inisialisasi.
  useEffect(() => {
    const timer = setTimeout(() => setAuthReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!userPeran || userPeran !== "admin portofolio") {
      navigate("/");
      return;
    }
    setMounted(true);
    return () => setMounted(false);
  }, [authReady, portofolio, userPeran, userBidang]);

  useEffect(() => { validateFields(); }, [formData, files]);

  const formatDateForInput = (ts) => {
    if (!ts) return "";
    return new Date(ts.seconds * 1000).toISOString().split("T")[0];
  };

  const touch = (name) => setTouchedFields(prev => ({ ...prev, [name]: true }));

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    touch(name);
    let val = type === "date" ? (value ? Timestamp.fromDate(new Date(value)) : null) : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    if (name === "noSiSpk" && !value) { setFiles(prev => ({ ...prev, siSpk: null })); setFilePreview(null); }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    touch(name);
    const parsed = value ? new Date(value) : null;
    setFormData(prev => ({ ...prev, [name]: parsed && !isNaN(parsed) ? Timestamp.fromDate(parsed) : null }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['application/pdf','image/jpeg','image/png'].includes(file.type)) {
      alert('Tipe file tidak didukung. Harap pilih PDF atau gambar (JPEG/PNG).'); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maks 5MB.'); return;
    }
    touch("file.siSpk");
    setFiles(prev => ({ ...prev, siSpk: file }));
    const reader = new FileReader();
    reader.onloadend = () => setFilePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const validateFields = () => {
    const errors = {};
    if (!formData.pelanggan)            errors.pelanggan = "Nama pelanggan wajib diisi";
    if (!formData.tanggalSerahOrderKeCs) errors.tanggalSerahOrderKeCs = "Tanggal serah order ke CS wajib diisi";
    if (!formData.jenisPekerjaan)       errors.jenisPekerjaan = "Jenis pekerjaan wajib diisi";
    if (!formData.lokasiPekerjaan)      errors.lokasiPekerjaan = "Lokasi pekerjaan wajib diisi";
    if (formData.noSiSpk && !files.siSpk) errors.siSpkFile = "File SI/SPK wajib diunggah jika nomor SI/SPK diisi";
    setFieldErrors(errors);
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = { pelanggan:true, tanggalSerahOrderKeCs:true, jenisPekerjaan:true, lokasiPekerjaan:true, noSiSpk:true, "file.siSpk":true };
    setTouchedFields(allTouched);
    const errs = validateFields();
    if (Object.keys(errs).length > 0) {
      setPopupMessage(Object.values(errs)[0]);
      setIsSuccess(false);
      setShowPopup(true);
      return;
    }

    setLoading(true); setError(null);
    try {
      let uploadedFiles = {};
      if (files.siSpk) uploadedFiles.siSpk = await uploadToCloudinary(files.siSpk);

      const newOrder = {
        portofolio,
        pelanggan: formData.pelanggan,
        statusOrder: "New Order",
        tanggalStatusOrder: null,
        tanggalSerahOrderKeCs: formData.tanggalSerahOrderKeCs || null,
        jenisPekerjaan: formData.jenisPekerjaan,
        lokasiPekerjaan: formData.lokasiPekerjaan,
        noSiSpk: formData.noSiSpk || "",
        namaTongkang: formData.namaTongkang || "",
        estimasiTonase: formData.estimasiTonase || "",
        tonaseDS: formData.tonaseDS ? Number(formData.tonaseDS) : 0,
        documents: uploadedFiles.siSpk
          ? { siSpk: { fileName: files.siSpk.name, fileUrl: uploadedFiles.siSpk, uploadedBy: userEmail, uploadedAt: Timestamp.now() } }
          : {},
        nomorOrder: "", tanggalOrder: null, tanggalPekerjaan: null,
        proformaSerahKeOps: null, proformaSerahKeDukbis: null, proformaBySistem: null,
        nilaiProforma: 0, nilaiInvoice: 0, nomorInvoice: "", fakturPajak: "",
        tanggalPengirimanInvoice: null, tanggalPengirimanFaktur: null,
        distribusiSertifikatPengirim: "", distribusiSertifikatPengirimTanggal: null,
        distribusiSertifikatPenerima: "", distribusiSertifikatPenerimaTanggal: null,
        createdBy: userEmail, lastUpdatedBy: userEmail,
        createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, "orders"), newOrder);
      setIsSuccess(true);
      setPopupMessage("Order berhasil ditambahkan!");
      setShowPopup(true);
      setTimeout(() => navigate(`/orders/${portofolio}`), 1500);
    } catch (err) {
      console.error(err);
      setIsSuccess(false);
      setPopupMessage("Gagal menambahkan order. Silakan coba lagi.");
      setShowPopup(true);
    }
    setLoading(false);
  };

  const inputCls = (fieldName) =>
    `${T("co-input-dark","co-input-light")} ${touchedFields[fieldName] && fieldErrors[fieldName] ? T("co-input-error-dark","co-input-error-light") : ""}`;

  const secIconColor = d ? "#60a5fa" : "#2563eb";

  return (
    <div className={`co-root ${T("co-page-dark","co-page-light")}`}
      style={{ padding:"28px 20px 56px", transition:"background .4s ease" }}>
      <style>{STYLES}</style>

      <div
        className="co-mount"
        style={{
          maxWidth: 800,
          margin: "0 auto",
          opacity: mounted ? 1 : 0,
          transition: "opacity .4s"
        }}
      >

        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:24 }}>
          <button onClick={() => navigate(`/orders/${portofolio}`)} className={T("co-back-dark","co-back-light")}>
            <ArrowLeft style={{ width:14, height:14 }} /> Kembali
          </button>
          <div>
            <p className={T("co-h1-dark","co-h1-light")}>
              Tambah Order <span style={{ textTransform:"uppercase" }}>{portofolio}</span>
            </p>
            <div className={T("co-accent-dark","co-accent-light")} style={{ width:60, marginTop:4 }} />
          </div>
        </div>

        {/* ── Main Card ── */}
        <div className={T("co-card-dark","co-card-light")}>
          <div className={T("co-accent-dark","co-accent-light")} />

          <div style={{ padding:"24px 28px 28px" }}>

            {/* Error banner */}
            {error && (
              <div className={T("co-banner-dark","co-banner-light")}>
                <AlertTriangle style={{ width:16, height:16, flexShrink:0 }} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* ── Informasi Pelanggan ── */}
              <div className={T("co-section-dark","co-section-light")}>
                <p className={T("co-sec-title-dark","co-sec-title-light")}>
                  <User style={{ width:14, height:14, color:secIconColor }} /> Informasi Pelanggan
                </p>
                <div>
                  <label className={T("co-label-dark","co-label-light")}>
                    Nama Pelanggan <span className={T("co-req","co-req-light")}>*</span>
                  </label>
                  <input
                    type="text" name="pelanggan"
                    value={formData.pelanggan} onChange={handleChange}
                    placeholder="Masukkan nama pelanggan"
                    className={inputCls("pelanggan")}
                  />
                  <FieldError show={touchedFields.pelanggan && !!fieldErrors.pelanggan} message={fieldErrors.pelanggan} isDark={d} />
                </div>
              </div>

              {/* ── Tanggal ── */}
              <div className={T("co-section-dark","co-section-light")}>
                <p className={T("co-sec-title-dark","co-sec-title-light")}>
                  <Calendar style={{ width:14, height:14, color:secIconColor }} /> Tanggal
                </p>
                <div>
                  <label className={T("co-label-dark","co-label-light")}>
                    Tanggal Serah Order ke CS <span className={T("co-req","co-req-light")}>*</span>
                  </label>
                  <input
                    type="date" name="tanggalSerahOrderKeCs"
                    value={formatDateForInput(formData.tanggalSerahOrderKeCs)} onChange={handleDateChange}
                    className={inputCls("tanggalSerahOrderKeCs")}
                  />
                  <FieldError show={touchedFields.tanggalSerahOrderKeCs && !!fieldErrors.tanggalSerahOrderKeCs} message={fieldErrors.tanggalSerahOrderKeCs} isDark={d} />
                </div>
              </div>

              {/* ── Detail Pekerjaan ── */}
              <div className={T("co-section-dark","co-section-light")}>
                <p className={T("co-sec-title-dark","co-sec-title-light")}>
                  <HardHat style={{ width:14, height:14, color:secIconColor }} /> Detail Pekerjaan
                </p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:16 }}>

                  {/* Jenis Pekerjaan */}
                  <div>
                    <label className={T("co-label-dark","co-label-light")}>
                      Jenis Pekerjaan <span className={T("co-req","co-req-light")}>*</span>
                    </label>
                    <input type="text" name="jenisPekerjaan" value={formData.jenisPekerjaan} onChange={handleChange}
                      placeholder="Jenis pekerjaan" className={inputCls("jenisPekerjaan")} />
                    <FieldError show={touchedFields.jenisPekerjaan && !!fieldErrors.jenisPekerjaan} message={fieldErrors.jenisPekerjaan} isDark={d} />
                  </div>

                  {/* Lokasi Pekerjaan */}
                  <div>
                    <label className={T("co-label-dark","co-label-light")}>
                      Lokasi Pekerjaan <span className={T("co-req","co-req-light")}>*</span>
                    </label>
                    <div className="co-input-icon">
                      <div className="co-input-icon-inner">
                        <Map style={{ width:15, height:15, color: d ? "rgba(99,148,255,0.4)" : "rgba(37,99,235,0.4)" }} />
                      </div>
                      <input type="text" name="lokasiPekerjaan" value={formData.lokasiPekerjaan} onChange={handleChange}
                        placeholder="Lokasi pekerjaan"
                        className={`${inputCls("lokasiPekerjaan")} co-input-padded`} />
                    </div>
                    <FieldError show={touchedFields.lokasiPekerjaan && !!fieldErrors.lokasiPekerjaan} message={fieldErrors.lokasiPekerjaan} isDark={d} />
                  </div>

                  {/* No SI/SPK */}
                  <div>
                    <label className={T("co-label-dark","co-label-light")}>No SI/SPK</label>
                    <input type="text" name="noSiSpk" value={formData.noSiSpk} onChange={handleChange}
                      placeholder="Nomor SI/SPK (opsional)" className={inputCls("noSiSpk")} />
                  </div>

                  {/* Nama Tongkang */}
                  <div>
                    <label className={T("co-label-dark","co-label-light")}>Nama Tongkang</label>
                    <div className="co-input-icon">
                      <div className="co-input-icon-inner">
                        <Anchor style={{ width:15, height:15, color: d ? "rgba(99,148,255,0.4)" : "rgba(37,99,235,0.4)" }} />
                      </div>
                      <input type="text" name="namaTongkang" value={formData.namaTongkang} onChange={handleChange}
                        placeholder="Nama tongkang"
                        className={`${T("co-input-dark","co-input-light")} co-input-padded`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Upload SI/SPK ── */}
              {formData.noSiSpk && (
                <div className={T("co-section-dark","co-section-light")}>
                  <p className={T("co-sec-title-dark","co-sec-title-light")}>
                    <Upload style={{ width:14, height:14, color:secIconColor }} />
                    Dokumen SI/SPK <span className={T("co-req","co-req-light")}>*</span>
                  </p>
                  <FieldError show={touchedFields["file.siSpk"] && !!fieldErrors.siSpkFile} message={fieldErrors.siSpkFile} isDark={d} />

                  <input type="file" id="file-upload" name="siSpkFile" onChange={handleFileChange}
                    style={{ position:"absolute", width:1, height:1, opacity:0, overflow:"hidden" }}
                    accept=".pdf,.jpg,.jpeg,.png" />
                  <label htmlFor="file-upload" style={{ cursor:"pointer", display:"block" }}>
                    <div className={`${T("co-upload-dark","co-upload-light")} ${files.siSpk ? "has-file" : ""} ${touchedFields["file.siSpk"] && fieldErrors.siSpkFile ? "has-err" : ""}`}>
                      {files.siSpk ? (
                        <>
                          <FileText style={{ width:28, height:28, color: d ? "#60a5fa" : "#2563eb" }} />
                          <p className={T("co-filename-dark","co-filename-light")}>{files.siSpk.name}</p>
                          <span className={T("co-file-badge-dark","co-file-badge-light")}>
                            <Check style={{ width:10, height:10 }} /> Terunggah · Klik untuk ubah
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload style={{ width:28, height:28 }} className={T("co-upload-icon-dark","co-upload-icon-light")} />
                          <p className={T("co-upload-cta-dark","co-upload-cta-light")}>Klik untuk unggah file</p>
                          <p className={T("co-upload-hint-dark","co-upload-hint-light")}>PDF, JPEG, atau PNG · Maks 5MB</p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              )}

              {/* ── Informasi Tonase ── */}
              <div className="co-section-last">
                <p className={T("co-sec-title-dark","co-sec-title-light")}>
                  <Database style={{ width:14, height:14, color:secIconColor }} /> Informasi Tonase
                </p>
                <div style={{ maxWidth:280 }}>
                  <label className={T("co-label-dark","co-label-light")}>Estimasi Kuantitas / Tonase</label>
                  <input type="number" name="estimasiTonase" value={formData.estimasiTonase} onChange={handleChange}
                    placeholder="0" className={T("co-input-dark","co-input-light")} />
                </div>
              </div>

              {/* ── Form Footer ── */}
              <div className={T("co-form-footer-dark","co-form-footer-light")} style={{ marginTop:28 }}>
                <button type="button" onClick={() => navigate(`/orders/${portofolio}`)}
                  className={T("co-btn-cancel-dark","co-btn-cancel-light")}>
                  <ArrowLeft style={{ width:14, height:14 }} /> Batal
                </button>

                <button type="submit" disabled={loading} className="co-btn-submit">
                  {loading ? (
                    <><Loader2 style={{ width:15, height:15 }} className="co-spin" /> Menyimpan…</>
                  ) : (
                    <><Plus style={{ width:15, height:15 }} /> Tambah Order</>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* ── Popup ── */}
      <NotificationPopup
        show={showPopup} message={popupMessage}
        onClose={() => setShowPopup(false)}
        isDark={d} isSuccess={isSuccess}
      />
    </div>
  );
};

export default CreateOrder;