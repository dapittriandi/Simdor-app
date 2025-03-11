import * as XLSX from "xlsx";

// Format tanggal dari Timestamp ke "DD/MM/YYYY"
const formatDate = (timestamp) => {
  if (!timestamp) return "-";
  if (timestamp.seconds) {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("id-ID");
  }
  return timestamp;
};

// Fungsi ekspor data ke Excel
export const exportToExcel = (orders, fileName = "Laporan Orders") => {
  if (!orders || orders.length === 0) {
    alert("❌ Tidak ada data untuk diekspor!");
    return;
  }

  // Header sesuai dengan sistem
  const headers = [
    "Nama Pelanggan",
    "Status Order - Tgl",
    "Nomor Order",
    "Tanggal Penyerahan Order ke CS",
    "Tanggal Order",
    "Tanggal Pekerjaan",
    "Proforma ke OPS",
    "Proforma ke DUKBIS",
    "Sertifikat PM06",
    "Jenis Sertifikat",
    "SI/SPK",
    "Jenis Pekerjaan",
    "Nama Tongkang/Vessel",
    "Lokasi Pekerjaan",
    "Estimasi Tonase",
    "Tonase DS",
    "Tanggal Pengiriman Invoice",
    "Tanggal Pengiriman Faktur Pajak",
    "Nilai Proforma",
    "Dokumen Selesai-INV",
    "Nomor Invoice",
    "Faktur Pajak",
    "Distribusi Sertifikat (Pengirim - tgl)",
    "Penerimaan Sertifikat (tgl - Penerima)",
  ];

  // Konversi data orders ke format array
  const data = orders.map((order) => [
    order.pelanggan || "-",
    `${order.statusOrder || "-"} - ${formatDate(order.tanggalStatusOrder)}`,
    order.nomorOrder || "-",
    formatDate(order.tanggalSerahOrderKeCs),
    formatDate(order.tanggalOrder),
    formatDate(order.tanggalPekerjaan),
    formatDate(order.proformaSerahKeOps),
    formatDate(order.proformaSerahKeDukbis),
    order.sertifikatPm06 || "-",
    order.jenisSertifikat || "-",
    order.siSpk || "-",
    order.jenisPekerjaan || "-",
    order.namaTongkang || "-",
    order.lokasiPekerjaan || "-",
    order.estimasiTonase ? parseFloat(order.estimasiTonase) : 0,
    order.tonaseDs ? parseFloat(order.tonaseDs) : 0,
    formatDate(order.tanggalPengirimanInvoice),
    formatDate(order.tanggalPengirimanFaktur),
    order.nilaiProforma ? `Rp ${parseFloat(order.nilaiProforma).toLocaleString("id-ID")}` : "Rp 0",
    order.dokumenSelesaiInv || "-",
    order.nomorInvoice || "-",
    order.fakturPajak || "-",
    formatDate(order.distribusiSertifikatPengirimTanggal),
    formatDate(order.distribusiSertifikatPenerimaTanggal),
  ]);

  // Buat worksheet dan workbook
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Laporan Orders");

  // Simpan file
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};
