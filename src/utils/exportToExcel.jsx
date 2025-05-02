import * as XLSX from "xlsx-js-style";

// Fungsi untuk memformat tanggal dengan benar termasuk format Indonesia DD/MM/YYYY
const formatDate = (timestamp) => {
  if (!timestamp) return null;  // Return null for empty dates

  // Case 1: Handle Firebase timestamp (has seconds property)
  if (timestamp && timestamp.seconds) {
    const date = new Date(timestamp.seconds * 1000);
    return isNaN(date.getTime()) ? null : date;
  }

  // Case 2: Handle string dengan format Indonesia "DD/MM/YYYY"
  if (typeof timestamp === 'string' && timestamp.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const [day, month, year] = timestamp.split('/').map(Number);
    const date = new Date(year, month - 1, day); // Bulan di JavaScript mulai dari 0
    return isNaN(date.getTime()) ? null : date;
  }

  // Case 3: Handle direct date strings or objects
  try {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const numValue = parseFloat(value);
  return isNaN(numValue) ? 0 : numValue;
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const numValue = parseFloat(value);
  return isNaN(numValue) ? 0 : numValue;
};

// Main export function
export const exportToExcel = (orders, fileName = "Laporan Orders") => {
  if (!orders || orders.length === 0) {
    alert("❌ Tidak ada data untuk diekspor!");
    return;
  }

  // Headers array
  const headers = [
    "Nama Pelanggan",
    "Status Order - Tanggal Status",
    "Porotofolio",
    "Nomor Order",
    "Tanggal Serah Order ke CS",
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
    "Estimasi Kuantitas",
    "Tonase DS",
    "Tanggal Pengiriman Invoice",
    "Tanggal Pengiriman Faktur Pajak",
    "Nilai Proforma",
    "Nilai Invoice (Fee)",
    "Nomor Invoice",
    "Faktur Pajak",
    "Distribusi Sertifikat (Pengirim - Tanggal)",
    "Penerimaan Sertifikat (Tanggal - Penerima)"
  ];

  // Fungsi helper untuk membuat sel tanggal dengan benar
  const getDateCell = (timestamp) => {
    // console.log("Original timestamp value:", timestamp);
    
    const dateValue = formatDate(timestamp);
    // console.log("Converted to date object:", dateValue);
    
    if (dateValue instanceof Date) {
      // console.log("Valid date - using date format");
      return { 
        t: 'd', 
        v: dateValue,
        z: 'dd/mm/yyyy' 
      };
    } else {
      // console.log("Invalid date - using dash placeholder");
      return { t: 's', v: '-' };
    }
  };

  // Format string untuk tanggal pada display text
  const formatDateString = (timestamp) => {
    const dateValue = formatDate(timestamp);
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
    return "-";
  };

  // Format untuk gabungan nama dan tanggal
  const formatNamaTanggalGabung = (nama, tanggal) => {
    const namaOrDash = nama || "-";
    const tanggalFormatted = formatDateString(tanggal);
    return `${namaOrDash} - ${tanggalFormatted}`;
  };

  const formatTanggalNamaGabung = (tanggal, nama) => {
    const tanggalFormatted = formatDateString(tanggal);
    const namaOrDash = nama || "-";
    return `${tanggalFormatted} - ${namaOrDash}`;
  };    

  // Convert orders data to array format
  const data = orders.map((order) => {
    // Debug tanggal untuk troubleshooting
    // console.log("Tanggal Serah Order ke CS:", order.tanggalSerahOrderKeCs);
    // const dateCell = getDateCell(order.tanggalSerahOrderKeCs);
    // console.log("Formatted date:", dateCell);
    
    return [
      order.pelanggan || "-",
      `${order.statusOrder || "-"} - ${formatDateString(order.tanggalStatusOrder)}`,
      order.portofolio || "-",
      order.nomorOrder || "-",
      getDateCell(order.tanggalSerahOrderKeCs),
      getDateCell(order.tanggalOrder),
      getDateCell(order.tanggalPekerjaan),
      getDateCell(order.proformaSerahKeOps),
      getDateCell(order.proformaSerahKeDukbis),
      order.noSertifikatPM06 || "-",
      order.jenisSertifikat || "-",
      order.noSiSpk || "-", 
      order.jenisPekerjaan || "-",
      order.namaTongkang || "-",
      order.lokasiPekerjaan || "-",
      { t: 'n', v: formatNumber(order.estimasiTonase), z: '#,##0' },
      { t: 'n', v: formatNumber(order.tonaseDS), z: '#,##0' },
      getDateCell(order.tanggalPengirimanInvoice),
      getDateCell(order.tanggalPengirimanFaktur),
      { t: 'n', v: formatCurrency(order.nilaiProforma), z: '"Rp"#,##0.00' },
      { t: 'n', v: formatCurrency(order.nilaiInvoice), z: '"Rp"#,##0.00' },
      order.nomorInvoice || "-",
      order.fakturPajak || "-",
      formatNamaTanggalGabung(order.distribusiSertifikatPengirim, order.distribusiSertifikatPengirimTanggal),
      formatTanggalNamaGabung(order.distribusiSertifikatPenerimaTanggal, order.distribusiSertifikatPenerima),
    ];
  });

  // Create worksheet with just headers first (we'll handle data cells manually)
  const ws = XLSX.utils.aoa_to_sheet([headers]);
  
  // Define styles
  const headerCellStyle = {
    font: { bold: true, color: { rgb: "000000" } },
    fill: { fgColor: { rgb: "FFFF00" } },
    alignment: { wrapText: true, vertical: "center", horizontal: "center" },
    border: {
      top: { style: "thin", color: { auto: 1 } },
      bottom: { style: "thin", color: { auto: 1 } },
      left: { style: "thin", color: { auto: 1 } },
      right: { style: "thin", color: { auto: 1 } }
    }
  };

  const dataCellStyle = {
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    }
  };

  // Get the range for the headers
  const range = XLSX.utils.decode_range(ws['!ref']);
  const headerRowNum = range.s.r; // Usually 0

  // Apply style to header cells
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellRef = XLSX.utils.encode_cell({ r: headerRowNum, c: C });
    if (ws[cellRef]) {
      ws[cellRef].s = headerCellStyle;
    }
  }

  // Manually add data cells with correct types and styles
  data.forEach((row, rowIndex) => {
    row.forEach((cellData, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex });
      
      // Create the cell object with appropriate type and value
      if (typeof cellData === 'object' && cellData !== null) {
        // For cells that already have type and value (like dates and numbers)
        ws[cellRef] = { 
          t: cellData.t,
          v: cellData.v
        };
        
        // Add format string if provided
        if (cellData.z) {
          ws[cellRef].z = cellData.z;
        }
      } else {
        // For simple string cells
        ws[cellRef] = { t: 's', v: cellData };
      }
      
      // Apply style
      ws[cellRef].s = dataCellStyle;
    });
  });

  // Update the worksheet range to include data cells
  ws['!ref'] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: data.length, c: headers.length - 1 }
  });

  // Set column widths
  const columnWidths = headers.map((header, index) => {
    let wch = header.length + 5; // Default width
    // Adjust specific columns
    if(index === 0) wch = 25; // Nama Pelanggan
    else if(index === 1) wch = 25; // Status Order
    else if (index >= 3 && index <= 7) wch = Math.max(header.length, 15) + 2; // D-H
    else if(index === 12) wch = 20; // Nama Tongkang
    else if(index === 13) wch = 20; // Lokasi Pekerjaan
    else if(index === 18) wch = 20; // Nilai Proforma
    else if(index === 22 || index === 23) wch = 25; // Distribusi/Penerimaan
    return { wch: wch };
  });
  ws['!cols'] = columnWidths;

  // Set header row height for wrapped text
  if (!ws['!rows']) ws['!rows'] = [];
  ws['!rows'][headerRowNum] = { hpx: 40 };

  // Create workbook & save
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Laporan Orders");

  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}${(currentDate.getMonth() + 1)
    .toString().padStart(2, '0')}${currentDate.getDate().toString().padStart(2, '0')}`;
  const random = Math.random().toString(36).substring(2, 6);
  const finalFileName = `${fileName}_${formattedDate}_${random}.xlsx`;
  XLSX.writeFile(wb, finalFileName);
};