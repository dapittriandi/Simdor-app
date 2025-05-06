// NavigationInstruction.jsx
import { 
    Clock, 
    AlertTriangle,
    ClipboardEdit,
    HardHat,
    FileCheck,
    ClipboardCheck,
    Receipt,
    PackageCheck
  } from "lucide-react";
  
  const NavigationInstruction = ({ currentStatus, userPeran }) => {
    // Function untuk mendapatkan pesan instruksi berdasarkan status dan peran
    const getInstructionMessage = () => {
      if (!currentStatus) return null;
      
      // Case untuk peran customer service
      if (userPeran === "customer service") {
        if (currentStatus === "New Order") {
          return {
            message: "Sekarang giliran Anda untuk melengkapi Order. Silahkan scroll ke bawah dan klik tombol 'Lengkapi Data'.",
            icon: "info",
            color: "blue"
          };
        }
      }
      
      // Case untuk peran admin portofolio
      else if (userPeran === "admin portofolio") {
        if (currentStatus === "Entry") {
          return {
            message: "Order sudah di buka oleh CS. Sekarang giliran Anda untuk Mengisi Data Pekerjaan. Silahkan scroll ke bawah dan klik tombol 'Lengkapi Data'.",
            icon: "info",
            color: "blue"
          };
        } 
        else if (currentStatus === "Diproses - Lapangan") {
          return {
            message: "Pekerjaan sedang diproses di lapangan. Jika sudah selesai, silahkan lengkapi data sertifikat dengan scroll ke bawah dan klik tombol 'Lengkapi Data'.",
            icon: "info",
            color: "blue"
          };
        }
        else if (currentStatus === "Diproses - Sertifikat") {
          return {
            message: "Silahkan Isi Tanggal Closed Order. Silahkan scroll ke bawah dan Klik tombol 'Lengkapi Data'.",
            icon: "info",
            color: "blue"
          };
        }
        else if (currentStatus === "Closed Order") {
          return {
            message: "Silahkan lengkapi data proforma dengan scroll ke bawah dan Klik tombol 'Lengkapi Data'.",
            icon: "info",
            color: "blue"
          };
        }
        else if (currentStatus === "Invoice") {
          return {
            message: "Invoice telah dibuat oleh bagian keuangan. Anda bisa mengisi data distribusi sertifikat dengan scroll ke bawah dan klik tombol 'Lengkapi Data'.",
            icon: "info",
            color: "blue"
          };
        }
      }
      
      // Case untuk peran admin keuangan
      else if (userPeran === "admin keuangan") {
        if (currentStatus === "Penerbitan Proforma") {
          return {
            message: "Proforma Sudah Terbit. Silahkan lengkapi data invoice dan faktur pajak dengan scroll ke bawah dan klik tombol 'Lengkapi Data'.",
            icon: "info",
            color: "blue"
          };
        }
        else 
        if (currentStatus === "Invoice") {
          return {
            message: "Invoice sudah dibuat. Silahkan lengkapi data distribusi sertifikat dengan scroll ke bawah dan klik tombol 'Lengkapi Data'.",
            icon: "info",
            color: "blue"
          };
        }
      }
      
      // Case untuk peran koordinator
      else if (userPeran === "koordinator") {
        return {
          message: "Anda dapat memantau status order saat ini. Hubungi bagian terkait jika perlu tindak lanjut.",
          icon: "info",
          color: "gray"
        };
      }
      
      // Pesan default berdasarkan status order untuk semua peran
      switch (currentStatus) {
        case "New Order":
          return {
            message: "Order baru telah dibuat oleh Admin Ops. Menunggu pengisian oleh Customer Service.",
            icon: "clock",
            color: "gray"
          };
        case "Entry":
          return {
            message: "Order telah di-entry oleh Customer Service. Menunggu pengisian oleh Admin Ops.",
            icon: "clock",
            color: "gray"
          };
        case "Diproses - Lapangan":
          return {
            message: "Order sedang diproses di lapangan oleh Tim Ops.",
            icon: "hardHat",
            color: "blue"
          };
        case "Diproses - Sertifikat":
          return {
            message: "Pekerjaan dilapangan selesai. Menunggu input proforma dan upload sertifikat.",
            icon: "fileCheck",
            color: "purple"
          };
        case "Closed Order":
          return {
            message: "Order di Closed. Menunggu penerbitan proforma oleh Adm Ops.",
            icon: "clipboardCheck",
            color: "orange"
          };
        case "Penerbitan Proforma":
          return {
            message: "Proforma sudah terbit. Menunggu pembuatan invoice oleh Bag. Keuangan.",
            icon: "clipboardCheck",
            color: "orange"
          };
        case "Invoice":
          return {
            message: "Invoice telah dibuat. Menunggu distribusi sertifikat.",
            icon: "receipt",
            color: "yellow"
          };
        case "Selesai":
          return {
            message: "Order telah selesai. Sertifikat sudah didistribusikan ke pelanggan.",
            icon: "packageCheck",
            color: "green"
          };
        default:
          return null;
      }
    };
  
    const instruction = getInstructionMessage();
    
    if (!instruction) return null;
  
    // Mendapatkan ikon berdasarkan jenis instruksi
    const getIcon = () => {
      switch (instruction.icon) {
        case "info":
          return <ClipboardEdit className="w-5 h-5" />;
        case "clock":
          return <Clock className="w-5 h-5" />;
        case "hardHat":
          return <HardHat className="w-5 h-5" />;
        case "fileCheck":
          return <FileCheck className="w-5 h-5" />;
        case "clipboardCheck":
          return <ClipboardCheck className="w-5 h-5" />;
        case "receipt":
          return <Receipt className="w-5 h-5" />;
        case "packageCheck":
          return <PackageCheck className="w-5 h-5" />;
        default:
          return <AlertTriangle className="w-5 h-5" />;
      }
    };
  
    // Mendapatkan kelas warna berdasarkan warna instruksi
    const getColorClass = () => {
      switch (instruction.color) {
        case "blue":
          return "bg-blue-50 border-blue-200 text-blue-800";
        case "green":
          return "bg-green-50 border-green-200 text-green-800";
        case "yellow":
          return "bg-yellow-50 border-yellow-200 text-yellow-800";
        case "orange":
          return "bg-orange-50 border-orange-200 text-orange-800";
        case "purple":
          return "bg-purple-50 border-purple-200 text-purple-800";
        case "gray":
          return "bg-gray-50 border-gray-200 text-gray-800";
        default:
          return "bg-blue-50 border-blue-200 text-blue-800";
      }
    };
  
    return (
      <div className="mb-6 mt-4">
        <div className={`flex items-center p-4 border rounded-lg shadow-sm ${getColorClass()}`}>
          <div className="rounded-full p-2 mr-3 bg-opacity-50">
            {getIcon()}
          </div>
          <div className="flex-1">
            <p className="font-medium">{instruction.message}</p>
          </div>
        </div>
      </div>
    );
  };
  
  // Pastikan ekspor default
  export default NavigationInstruction;