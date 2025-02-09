import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
import logo from '../assets/Logo.jpg';
import "jspdf-autotable"; 
import "./DropoutsReport.css";

const ReporteAbandono = () => {
  const [dropoutsData, setDropoutsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Número de elementos por página
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDropouts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/dropouts");
        const orderedDropouts = response.data.sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha));
        setDropoutsData(orderedDropouts);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar los pacientes desertores:", err);
        setError("No se pudieron cargar los pacientes desertores.");
        setLoading(false);
      }
    };

    fetchDropouts();
  }, []);

  const handleDownloadPDF = () => {
    const doc = new jsPDF("p", "mm", "letter"); // Formato carta
    const tableStartY = 30;
    const totalPagesExp = "{total_pages_count_string}";
  
    // Encabezado del documento
    doc.setFontSize(16);
    doc.text("Reporte de Pacientes Desertores", 14, 20);
    doc.addImage(logo, "JPEG", 180, 10, 20, 20); // Logo
    doc.setFontSize(12);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 14, 26);
  
    // Configuración de columnas y datos
    const rows = dropoutsData.map((dropout, index) => ({
      id: index + 1,
      Nombre: dropout.Nombre,
      Tratamiento: dropout.Tratamiento,
      Descripcion: dropout.Descripcion,
      Correo: dropout.Correo || "No disponible", // Mostrar correo o "No disponible"
      Fecha: new Date(dropout.Fecha).toLocaleDateString(),
    }));
    
    const columns = [
      { header: "ID", dataKey: "id" },
      { header: "Nombre del Paciente", dataKey: "Nombre" },
      { header: "Tratamiento", dataKey: "Tratamiento" },
      { header: "Descripción", dataKey: "Descripcion" },
      { header: "Correo", dataKey: "Correo" },
      { header: "Fecha", dataKey: "Fecha" },
    ];
  
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
        fillColor: [21, 153, 155], // Color #15999B en formato RGB
        textColor: 255, // Texto blanco
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        textColor: 50, // Texto negro
        valign: "middle",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245], // Color de fondo alternado
      },
      didDrawPage: (data) => {
        // Pie de página
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
  
    // Descargar el archivo PDF
    const pdfFileName = `reporte_desertores_${new Date().toLocaleDateString()}.pdf`;
    doc.save(pdfFileName);
  };
  
  

  const handleBack = () => {
    navigate("/reports");
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = dropoutsData.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <div className="date-canceled-buttons-container">
        <button onClick={handleBack} className="date-canceled-btn-back">
          ← Salir
        </button>
        <button onClick={handleDownloadPDF} className="date-canceled-btn-download">
          Guardar como PDF
        </button>
      </div>

      <div id="dropouts-report-container" className="date-canceled-container">
      <h1 className="free-report-header">
          <span className="free-report-title">Reporte de Pacientes Desertores</span>
          <img src={logo} alt="Logo" className="free-logo" />
      </h1>
        <div className="date-canceled-info">
          <p><strong>Fecha de emisión:</strong> {new Date().toLocaleDateString()}</p>
        </div>

        <table className="date-canceled-tabla">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre del Paciente</th>
              <th>Tratamiento</th>
              <th>Descripción</th>
              <th>Correo</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
              {currentItems.map((dropout, index) => (
                <tr key={index}>
                  <td>{index + 1 + indexOfFirstItem}</td>
                  <td>{dropout.Nombre}</td>
                  <td>{dropout.Tratamiento}</td>
                  <td>{dropout.Descripcion}</td>
                  <td>{dropout.Correo || "No disponible"}</td> {/* Mostrar correo o "No disponible" */}
                  <td>{new Date(dropout.Fecha).toLocaleDateString()}</td>
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
            disabled={currentPage === Math.ceil(dropoutsData.length / itemsPerPage)}
            className="pagination-btn inventory-pagination-button"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReporteAbandono;
