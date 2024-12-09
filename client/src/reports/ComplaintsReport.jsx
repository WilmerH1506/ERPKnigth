import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import logo from '../assets/Logo.jpg';
import "jspdf-autotable";
import "./ComplaintReport.css";

const ReporteQuejas = () => {
  const { date } = useParams(); 
  const [complaintsData, setComplaintsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); 
  const itemsPerPage = 5; 
  const navigate = useNavigate();
  const month = date.split("-")[0];
  
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const monthName = months[parseInt(month) - 1];

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/complaints/${date}`);
        const data = await response.json();
        const orderedDates = data.sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));        
        setComplaintsData(orderedDates);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar las quejas:", err);
        setError("No se pudieron cargar las quejas.");
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [date]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF("p", "mm", "letter"); // Formato carta
    const tableStartY = 38;
    const totalPagesExp = "{total_pages_count_string}";
  
    // Encabezado del documento
    doc.setFontSize(16);
    doc.text("Reporte de Quejas", 14, 20);
    doc.addImage(logo, "JPEG", 180, 10, 20, 20); // Logo
    doc.setFontSize(12);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString("es-ES")}`, 14, 28);
    doc.text(`Mes generado: ${monthName}`, 14, 34);
  
    // Configuración de columnas y datos
    const columns = [
      { header: "Queja ID", dataKey: "id" },
      { header: "Paciente", dataKey: "Paciente" },
      { header: "Correo", dataKey: "Correo" },
      { header: "Fecha de la Queja", dataKey: "Fecha" },
      { header: "Tipo de Queja", dataKey: "Tipo_de_queja" },
      { header: "Razón", dataKey: "Razon" },
    ];
  
    const rows = complaintsData.map((queja, index) => ({
      id: index + 1,
      Paciente: queja.Paciente,
      Correo: queja.Correo,
      Fecha: new Date(queja.Fecha).toLocaleDateString("es-ES"),
      Tipo_de_queja: queja.Tipo_de_queja,
      Razon: queja.Razon,
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
        halign: "center",
        valign: "middle",
      },
      headStyles: {
        fillColor: [21, 153, 155], // Color del encabezado
        textColor: 255, // Texto blanco
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        textColor: 50, // Texto negro
        valign: "middle",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245], // Color alternado
      },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        const currentPage = data.pageNumber;
        const footerText = `Página ${currentPage} de ${totalPagesExp}`;
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
  
    // Descargar el PDF
    const pdfFileName = `reporte_quejas_${new Date().toLocaleDateString("es-ES")}.pdf`;
    doc.save(pdfFileName);
  };
  
  

  const handleGoBack = () => {
    navigate(-1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = complaintsData.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <div className="complaints-buttons-container">
        <button className="btn exit-btn" onClick={handleGoBack}>
          ← Salir
        </button>
        <button className="btn save-btn" onClick={handleDownloadPDF}>
          Guardar como PDF
        </button>
      </div>

      <div id="complaints-report-container" className="complaints-container">
        <h1 className="free-report-header">
        <span className="free-report-title">Reporte de quejas</span>
        <img src={logo} alt="Logo" className="free-logo" />
      </h1>
        <p>
          <strong>Fecha de emisión:</strong> {new Date().toLocaleDateString("es-ES")}
        </p>
        <p>
          <strong>Mes generado:</strong> {monthName}
        </p>

        <table className="complaints-tabla">
          <thead>
            <tr>
              <th>Queja ID</th>
              <th>Paciente</th>
              <th>Correo</th>
              <th>Fecha de la Queja</th>
              <th>Tipo de Queja</th>
              <th>Razón</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((queja, index) => (
              <tr key={index + indexOfFirstItem}>
                <td>{index + 1 + indexOfFirstItem}</td>
                <td>{queja.Paciente}</td>
                <td>{queja.Correo}</td>
                <td>{new Date(queja.Fecha).toLocaleDateString("es-ES")}</td>
                <td>{queja.Tipo_de_queja}</td>
                <td>{queja.Razon}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginación */}
        <div className="pagination-container inventory-pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn inventory-pagination-button"
          >
            Anterior
          </button>
          <span className="pagination-info">Página {currentPage}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === Math.ceil(complaintsData.length / itemsPerPage)}
            className="pagination-btn inventory-pagination-button"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReporteQuejas;
