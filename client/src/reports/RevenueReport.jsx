import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import "./RevenueReport.css";
import logo from '../assets/Logo.jpg';

const ReportesServicios = () => {
  const { date } = useParams();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 
  const navigate = useNavigate();
  const [totalRevenue, setTotalRevenue] = useState(0);
  const month = date.split("-")[0];
  const year = date.split("-")[1];

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const monthName = months[parseInt(month) - 1];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/services/${date}`);
        const data = await response.json();
    
        if (data.revenue) {
          let revenueSum = 0; 
          const formattedData = Object.entries(data.revenue)
            .flatMap(([servicio, details]) => {
              const costoPorProcedimiento = details.total / details.procedimientos; // Costo unitario
              return details.pacientes.map((paciente, i) => {
                const cantidad = details.procedimientos; // Procedimientos totales por servicio
                const total = costoPorProcedimiento * cantidad;
                revenueSum += total;
                return {
                  servicio,
                  paciente,
                  costo: costoPorProcedimiento,
                  fecha: details.fechas[i],
                  cantidad,
                  total,
                };
              });
            });
    
          const orderPerPrice = formattedData.sort((a, b) => b.total - a.total);
    
          const orderedDataWithIds = orderPerPrice.map((item, index) => ({
            ...item,
            id: index + 1,
          }));
    
          setReportData(orderedDataWithIds);
          setTotalRevenue(revenueSum);
        }
    
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [date]);
  const handleDownloadPDF = () => {
    const doc = new jsPDF("p", "mm", "letter"); // Formato carta
    const tableStartY = 40;
    const totalPagesExp = "{total_pages_count_string}";
  
    // Configuración del título y encabezado
    doc.setFontSize(16);
    doc.text("Reporte de Servicios", 14, 20);
    doc.addImage(logo, "JPEG", 180, 10, 20, 20); // Logo
    doc.setFontSize(12);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString("es-ES")}`, 14, 26);
    doc.text(`Mes del reporte: ${monthName}`, 14, 32);
    doc.text(
      `Ingreso generado: ${totalRevenue.toLocaleString("es-HN", {
        style: "currency",
        currency: "HNL",
      })}`,
      14,
      37
    );
  
    // Configuración de columnas y filas
    const columns = [
      { header: "Servicio ID", dataKey: "id" },
      { header: "Nombre Paciente", dataKey: "paciente" },
      { header: "Servicio", dataKey: "servicio" },
      { header: "Fecha", dataKey: "fecha" },
      { header: "Ingreso", dataKey: "costo" },
      { header: "Cantidad", dataKey: "cantidad" },
      { header: "Total", dataKey: "total" },
    ];
  
    const rows = reportData.map((item) => ({
      id: item.id,
      paciente: item.paciente,
      servicio: item.servicio,
      fecha: item.fecha
        ? new Date(item.fecha).toLocaleDateString("es-ES")
        : "Fecha no disponible",
      costo: item.costo.toLocaleString("es-HN", {
        style: "currency",
        currency: "HNL",
      }),
      cantidad: item.cantidad,
      total: item.total.toLocaleString("es-HN", {
        style: "currency",
        currency: "HNL",
      }),
    }));
  
    // Generar tabla con pie de página
    doc.autoTable({
      head: [columns.map((col) => col.header)],
      body: rows.map((row) => columns.map((col) => row[col.dataKey])),
      startY: tableStartY,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 3,
        halign: "center", // Centrar contenido
        valign: "middle",
      },
      headStyles: {
        fillColor: [21, 153, 155], // Color #15999B
        textColor: 255, // Texto blanco
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        textColor: 50,
        valign: "center",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245], // Color de fondo alternado
      },
      didDrawPage: (data) => {
        // Pie de página
        const pageCount = doc.internal.getNumberOfPages();
        const footerText = `Página ${data.pageNumber} de ${totalPagesExp}`;
        doc.setFontSize(10);
        doc.text(footerText, data.settings.margin.left, doc.internal.pageSize.height - 10);
      },
    });
  
    // Agregar pie de página a todas las páginas
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const footerText = `Página ${i} de ${totalPagesExp}`;
      doc.setFontSize(10);
      doc.text(footerText, 14, doc.internal.pageSize.height - 10);
    }
  
    // Reemplazar marcador de total de páginas
    if (typeof doc.putTotalPages === "function") {
      doc.putTotalPages(totalPagesExp);
    }
  
    // Guardar el PDF
    const pdfFileName = `reporte_servicios_${new Date().toLocaleDateString("es-ES")}.pdf`;
    doc.save(pdfFileName);
  };
  


  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reportData.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return <p>Cargando datos...</p>;

  return (
    <div>
      <div className="buttons-container">
        <button className="btn exit-btn" onClick={() => navigate(-1)}>
          ← Salir
        </button>
        <button className="btn save-btn" onClick={handleDownloadPDF}>
          Guardar como PDF
        </button>
      </div>

      <div id="reportes-servicios-container" className="reportes-container">
      <h1 className="free-report-header">
          <span className="free-report-title">Reporte de servicios</span>
          <img src={logo} alt="Logo" className="free-logo" />
      </h1>
        <p>
          <strong>Fecha de reporte:</strong> {new Date().toLocaleDateString()}
        </p>
        <p>
          <strong>Mes del reporte:</strong> {monthName}
        </p>
        <p>
          <strong>Ingreso generado:</strong> {totalRevenue.toLocaleString("es-HN", {
            style: "currency",
            currency: "HNL",
          })}
        </p>

        <table className="reportes-tabla">
          <thead>
            <tr>
              <th>Servicio ID</th>
              <th>Nombre Paciente</th>
              <th>Servicio</th>
              <th>Fecha</th>
              <th>Ingreso</th>
              <th>Cantidad</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={index}>
                <td>{item.id}</td>
                <td>{item.paciente}</td>
                <td>{item.servicio}</td>
                <td>
                  {item.fecha
                    ? new Date(item.fecha).toLocaleDateString("es-ES")
                    : "Fecha no disponible"}
                </td>
                <td>
                  {item.costo.toLocaleString("es-HN", {
                    style: "currency",
                    currency: "HNL",
                  })}
                </td>
                <td>{item.cantidad}</td>
                <td>
                  {item.total.toLocaleString("es-HN", {
                    style: "currency",
                    currency: "HNL",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination-container inventory-pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn inventory-pagination-button"
          >
            Anterior
          </button>
          <span className="pagination-info ">Página {currentPage}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === Math.ceil(reportData.length / itemsPerPage)}
            className="pagination-btn inventory-pagination-button"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportesServicios;
