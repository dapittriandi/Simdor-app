import * as XLSX from "xlsx-js-style";

const formatDate = (timestamp) => {
  if (!timestamp) return null;

  if (timestamp.seconds) {
    const date = new Date(timestamp.seconds * 1000);
    return isNaN(date.getTime()) ? null : date;
  }

  try {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};



const formatCurrency = (value) => {
  // This function might not be directly used for cell value if using number format 'z',
  // but can be useful for display elsewhere or if direct string formatting is needed.
  if (value === null || value === undefined || value === '') return 0; // Handle null/undefined/empty string
  const numValue = parseFloat(value);
  // Return the number itself for XLSX, the formatting is handled by 'z'
  return isNaN(numValue) ? 0 : numValue;
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0; // Handle null/undefined/empty string
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
    "Nama Pelanggan", // A
    "Status Order - Tanggal Status", // B
    "Porotofolio",
    "Nomor Order", // C
    "Tanggal Serah Order ke CS", // D
    "Tanggal Order", // E
    "Tanggal Pekerjaan", // F
    "Proforma ke OPS", // G
    "Proforma ke DUKBIS", // H
    "Sertifikat PM06", // I
    "Jenis Sertifikat", // J
    "SI/SPK", // K
    "Jenis Pekerjaan", // L
    "Nama Tongkang/Vessel", // M
    "Lokasi Pekerjaan", // N
    "Estimasi Tonase", // O
    "Tonase DS", // P
    "Tanggal Pengiriman Invoice", // Q
    "Tanggal Pengiriman Faktur Pajak", // R
    "Nilai Proforma", // S
    "Dokumen Selesai-INV", // T
    "Nomor Invoice", // U
    "Faktur Pajak", // V
    "Distribusi Sertifikat (Pengirim - Tanggal)", // W
    "Penerimaan Sertifikat (Tanggal - Penerima)" // X
  ];

  // Convert orders data to array format with explicit types and formats
  const data = orders.map((order) => {

    const formatNamaTanggalGabung = (nama, tanggal) => {
      const namaOrDash = nama || "-";
      const dateObj = formatDate(tanggal);
      const tanggalFormatted =
        dateObj instanceof Date
          ? dateObj.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "-";
      return `${namaOrDash} - ${tanggalFormatted}`;
    };

    const formatTanggalNamaGabung = (tanggal, nama) => {
      const dateObj = formatDate(tanggal);
      const tanggalFormatted =
        dateObj instanceof Date
          ? dateObj.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "-";
      const namaOrDash = nama || "-";
      return `${tanggalFormatted} - ${namaOrDash}`;
    };    
    
      // Helper to safely format date and return object for XLSX
      const getDateCell = (timestamp) => {
          const dateValue = formatDate(timestamp);
          // Use 'd' for date type, 's' for string placeholder if invalid/null
          return dateValue instanceof Date ? { t: 'd', v: dateValue, z: 'dd/mm/yyyy' } : { t: 's', v: '-' };
      };

      return [
          order.pelanggan || "-", // t: 's' (string) - will be inferred
          `${order.statusOrder || " - "} - ${order.tanggalStatusOrder ? formatDate(order.tanggalStatusOrder)?.toLocaleDateString("id-ID", { day: '2-digit', month: '2-digit', year: 'numeric' }) || '-' : '-'}`, // t: 's' - Construct string manually
          order.portofolio,
          order.nomorOrder || "-", // t: 's'
          getDateCell(order.tanggalSerahOrderKeCs),
          getDateCell(order.tanggalOrder),
          getDateCell(order.tanggalPekerjaan),
          getDateCell(order.proformaSerahKeOps),
          getDateCell(order.proformaSerahKeDukbis),
          order.noSertifikatPM06 || "-", // t: 's'
          order.jenisSertifikat || "-", // t: 's'
          order.noSiSpk || "-", // t: 's'
          order.jenisPekerjaan || "-", // t: 's'
          order.namaTongkang || "-", // t: 's'
          order.lokasiPekerjaan || "-", // t: 's'
          { t: 'n', v: formatNumber(order.estimasiTonase), z: '#,##0' }, // t: 'n' (number)
          { t: 'n', v: formatNumber(order.tonaseDs), z: '#,##0' }, // t: 'n'
          getDateCell(order.tanggalPengirimanInvoice),
          getDateCell(order.tanggalPengirimanFaktur),
          { t: 'n', v: formatCurrency(order.nilaiProforma), z: '"Rp"#,##0.00' }, // t: 'n', Currency format
          order.dokumenSelesaiInv || "-", // t: 's'
          order.nomorInvoice || "-", // t: 's'
          order.fakturPajak || "-", // t: 's'
          formatNamaTanggalGabung(order.distribusiSertifikatPengirim, order.distribusiSertifikatPengirimTanggal),
          formatTanggalNamaGabung(order.distribusiSertifikatPenerimaTanggal, order.distribusiSertifikatPenerima),



      ];
  });


  // Create worksheet data including headers
  // We manually handle cell objects later, so a simple array is fine here initially.
  const ws_data = [headers, ...data.map(row => row.map(cell => cell && typeof cell === 'object' ? cell.v : cell))]; // Extract values for aoa_to_sheet

  // Create worksheet using aoa_to_sheet
  const ws = XLSX.utils.aoa_to_sheet(ws_data);

  // --- APPLY STYLES AND FORMATS ---

  // Define the style for ALL header cells
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

   // Define a basic border style for data cells
   const dataCellStyle = {
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
       }
   };

  // Get worksheet range
  const range = XLSX.utils.decode_range(ws['!ref']);
  const headerRowNum = range.s.r; // Header row number (usually 0)

  // Apply style to ALL header cells
  for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: headerRowNum, c: C });
      if (ws[cellRef]) {
          ws[cellRef].s = headerCellStyle;
          ws[cellRef].t = 's'; // Ensure header type is string
      }
  }

  

  // Apply types, formats, and border styles to data cells
  data.forEach((row, rowIndex) => {
    row.forEach((cellData, colIndex) => {
      // rowIndex in 'data' maps to rowIndex + 1 in the sheet (because header is row 0)
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex });
      if (!ws[cellRef]) {
          // If aoa_to_sheet didn't create a cell (e.g., for null/undefined), create it minimally
           ws[cellRef] = { t: 's', v: '-' }; // Default to string '-'
      }

      // Apply type and format from the original 'data' array if it was an object
      if (cellData && typeof cellData === 'object') {
          ws[cellRef].t = cellData.t; // Set type (n, d, s)
          if(cellData.z) {
             ws[cellRef].z = cellData.z; // Set format string
          }
           // Ensure the value is correctly set (aoa_to_sheet might have missed it if original was complex object)
           ws[cellRef].v = cellData.v instanceof Date ? cellData.v : cellData.v;
      }

       // Handle cases where aoa_to_sheet might have set 'n' for null/NaN implicitly
       if(ws[cellRef].t === 'n' && (ws[cellRef].v === null || isNaN(ws[cellRef].v))) {
           ws[cellRef].v = 0; // Standardize null/NaN numbers to 0
       }
        // Handle cases where aoa_to_sheet might have set 'd' for null dates
       if(ws[cellRef].t === 'd' && ws[cellRef].v === null) {
           ws[cellRef].t = 's';
           ws[cellRef].v = '-';
           delete ws[cellRef].z;
       }


      // Apply basic border style to all data cells, merging with existing styles
      ws[cellRef].s = {
          ...(ws[cellRef].s || {}), // Keep existing style properties (like 'z' format)
          ...dataCellStyle // Add/overwrite with border style
      };
    });
  });

  // // Set column widths (opsional, biar kolomnya nggak sempit)
  // const colWidths = headers.map(() => ({ wch: 20 })); // 20 karakter lebar kolom
  // ws['!cols'] = colWidths;

  // --- END STYLES AND FORMATS ---


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
  ws['!rows'][headerRowNum] = { hpx: 40 }; // Adjust height in pixels as needed


  // / Create workbook & save
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Laporan Orders");

  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}${(currentDate.getMonth() + 1)
    .toString().padStart(2, '0')}${currentDate.getDate().toString().padStart(2, '0')}`;
    const random = Math.random().toString(36).substring(2, 6);
  const finalFileName = `${fileName}_${formattedDate}_${random}.xlsx`;
  XLSX.writeFile(wb, finalFileName);
};

// Contoh penggunaan (jika Anda ingin menguji):
/*
const sampleOrders = [
 { pelanggan: 'PT ABC', statusOrder: 'Selesai', tanggalStatusOrder: { seconds: 1711990800 }, nomorOrder: 'ORD123', tanggalSerahOrderKeCs: { seconds: 1711804800 }, tanggalOrder: { seconds: 1711718400 }, tanggalPekerjaan: { seconds: 1711900800 }, proformaSerahKeOps: { seconds: 1711900800 }, proformaSerahKeDukbis: { seconds: 1711987200 }, sertifikatPm06: 'Ada', jenisSertifikat: 'Kuantitas', siSpk: 'SPK001', jenisPekerjaan: 'Draft Survey', namaTongkang: 'BG MAJU JAYA', lokasiPekerjaan: 'Pelabuhan X', estimasiTonase: 5000, tonaseDs: 4985.5, tanggalPengirimanInvoice: { seconds: 1712073600 }, tanggalPengirimanFaktur: { seconds: 1712073600 }, nilaiProforma: 15000000, dokumenSelesaiInv: 'Lengkap', nomorInvoice: 'INV/2025/001', fakturPajak: 'FP/2025/001', distribusiSertifikatPengirimTanggal: { seconds: 1712160000 }, distribusiSertifikatPenerimaTanggal: { seconds: 1712246400 } },
 { pelanggan: 'CV XYZ', statusOrder: 'Proses', tanggalStatusOrder: { seconds: 1712246400 }, nomorOrder: 'ORD124', tanggalSerahOrderKeCs: null, tanggalOrder: { seconds: 1712073600 }, tanggalPekerjaan: { seconds: 1712160000 }, proformaSerahKeOps: null, proformaSerahKeDukbis: null, sertifikatPm06: null, jenisSertifikat: 'Kualitas', siSpk: 'SI002', jenisPekerjaan: 'Sampling', namaTongkang: 'TB SEJAHTERA', lokasiPekerjaan: 'Pelabuhan Y', estimasiTonase: 1000, tonaseDs: null, tanggalPengirimanInvoice: null, tanggalPengirimanFaktur: null, nilaiProforma: 5000000, dokumenSelesaiInv: null, nomorInvoice: null, fakturPajak: null, distribusiSertifikatPengirimTanggal: null, distribusiSertifikatPenerimaTanggal: null }
];

// Panggil fungsi export (misalnya dari event handler tombol)
// exportToExcel(sampleOrders, 'Laporan_Contoh');
*/