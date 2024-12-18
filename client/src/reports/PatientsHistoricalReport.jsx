import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Bar } from "react-chartjs-2";
import logo from '../assets/Logo.jpg';
import "./NewPatients.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReporteCrecimiento = () => {
  const { date } = useParams(); 
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [month, year] = date?.split("-") || [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!year || !month) {
          throw new Error("No se encontraron los parámetros de año o mes en la URL.");
        }

        const weeklyResponse = await axios.get(
          `http://localhost:3000/api/Newpatients/${month}-${year}`
        );
        const monthlyResponse = await axios.get(
          `http://localhost:3000/api/NewYpatients/${year}`
        );
        setWeeklyData(weeklyResponse.data);
        setMonthlyData(monthlyResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error al cargar los datos.");
        setLoading(false);
      }
    };

    fetchData();
  }, [month, year]);

  const handleDownloadPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const totalPagesExp = "{total_pages_count_string}";
  
    // Encabezado
    pdf.setFontSize(16);
    pdf.text("Reporte Estadístico de Nuevos Pacientes", 14, 20);
    pdf.addImage(logo, "JPEG", 180, 10, 20, 20); // Logo
    pdf.setFontSize(12);
    pdf.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 14, 26);
    pdf.text(
      `Estadística del mes: ${new Date(year, month - 1).toLocaleString("es-ES", {
        month: "long",
        year: "numeric",
      })}`,
      14,
      32
    );
  
    // Preparar datos de la tabla
    const rows = weeklyData.map((item) => [
      item.Semana,
      new Date(item.FechaInicio).toLocaleDateString(),
      new Date(item.FechaFin).toLocaleDateString(),
      item.CantidadPacientesNuevos,
    ]);
  
    // Generar tabla con pie de página
    pdf.autoTable({
      startY: 40,
      head: [["Semana", "Fecha Inicio", "Fecha Fin", "Nuevos Pacientes"]],
      body: rows,
      foot: [
        [
          { content: "Total", colSpan: 3, styles: { halign: "right" } },
          weeklyData.reduce((sum, item) => sum + item.CantidadPacientesNuevos, 0),
        ],
      ],
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 3,
        halign: "center",
        valign: "middle",
      },
      headStyles: {
        fillColor: [21, 153, 155],
        textColor: 255,
        halign: "center",
      },
      bodyStyles: {
        textColor: 50,
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      footStyles: {
        fillColor: [160, 199, 200],
        textColor: 255,
        fontStyle: "bold",
      },
      didDrawPage: (data) => {
        const pageCount = pdf.internal.getNumberOfPages();
        const currentPage = data.pageNumber;
        const footerText = `Página ${currentPage} de ${totalPagesExp}`;
        pdf.setFontSize(10);
        pdf.text(footerText, data.settings.margin.left, pdf.internal.pageSize.height - 10);
      },
    });
  
    // Agregar gráfico
    const canvas = await html2canvas(document.querySelector(".reporte-crecimiento-grafico"), {
      scale: 2,
    });
    const imgData = canvas.toDataURL("image/png");
    const chartStartY = pdf.autoTable.previous.finalY + 10;
    const pageHeight = pdf.internal.pageSize.height;
  
    if (chartStartY + 90 > pageHeight) {
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 15, 20, 180, 90);
    } else {
      pdf.addImage(imgData, "PNG", 15, chartStartY, 180, 90);
    }
  
    // Agregar pie de página a todas las páginas
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      const footerText = `Página ${i} de ${totalPagesExp}`;
      pdf.setFontSize(10);
      pdf.text(footerText, 14, pdf.internal.pageSize.height - 10);
    }
  
    // Reemplazar marcador de total de páginas
    if (typeof pdf.putTotalPages === "function") {
      pdf.putTotalPages(totalPagesExp);
    }
  
    // Descargar el PDF
    const pdfFileName = `reporte_estadistico_pacientesNuevos_${month}-${year}.pdf`;
    pdf.save(pdfFileName);
  };
  

  const chartData = {
    labels: monthlyData.map((item) => item.Mes),
    datasets: [
      {
        label: "Pacientes Nuevos",
        data: monthlyData.map((item) => item.CantidadPacientesNuevos),
        backgroundColor: "rgb(0, 128, 0)",
        borderColor: "rgba(0, 128, 0, 0.8)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      title: {
        display: true,
        text: "Crecimiento Mensual de Pacientes",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Mes",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Cantidad de Pacientes Nuevos",
        },
      },
    },
  };

  if (loading) return <p className="reporte-crecimiento-cargando">Cargando datos...</p>;
  if (error) return <p className="reporte-crecimiento-error">{error}</p>;

  return (
    <div>
      <div className="reporte-crecimiento-botones">
        <button onClick={() => navigate(-1)} className="reporte-crecimiento-boton-salir">
          ← Salir
        </button>
        <button onClick={handleDownloadPDF} className="reporte-crecimiento-boton-descargar">
          Guardar como PDF
        </button>
      </div>

      <div id="reporte-crecimiento-contenedor" className="reporte-crecimiento-contenedor">
       <h1 className="free-report-header">
        <span className="free-report-title">Reporte Estadistico de Nuevos Pacientes</span>
        <img src={logo} alt="Logo" className="free-logo" />
      </h1>
        <p>
          <strong>Fecha de emisión:</strong> {new Date().toLocaleDateString()}
        </p>
        <p>
          <strong>Crecimiento del mes:</strong>{" "}
          {new Date(year, month - 1).toLocaleString("es-ES", { month: "long", year: "numeric" })}
        </p>

        <table className="reporte-crecimiento-tabla">
          <thead>
            <tr>
              <th>Semana</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Número de Pacientes Nuevos</th>
            </tr>
          </thead>
          <tbody>
            {weeklyData.map((item, index) => (
              <tr key={index}>
                <td>{item.Semana}</td>
                <td>{new Date(item.FechaInicio).toLocaleDateString()}</td>
                <td>{new Date(item.FechaFin).toLocaleDateString()}</td>
                <td>{item.CantidadPacientesNuevos}</td>
              </tr>
            ))}
            <tr>
              <td colSpan="3" style={{ textAlign: "right" }}>
                <strong>Total</strong>
              </td>
              <td>
                {weeklyData.reduce(
                  (sum, item) => sum + item.CantidadPacientesNuevos,
                  0
                )}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="reporte-crecimiento-grafico">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default ReporteCrecimiento;