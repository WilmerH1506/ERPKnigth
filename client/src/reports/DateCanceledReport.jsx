import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
import logo from '../assets/Logo.jpg';
import "jspdf-autotable"; 
import "./DateCanceledReport.css";

const DateCanceledReport = () => {
  const [datesData, setDatesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Número de elementos por página
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCanceledDates = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/dates/canceled");
        setDatesData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar las fechas canceladas:", err);
        setError("No se pudieron cargar las fechas canceladas.");
        setLoading(false);
      }
    };

    fetchCanceledDates();
  }, []);

  const handleDownloadPDF = () => {
    const doc = new jsPDF("p", "mm", "letter"); // Formato carta
    const tableStartY = 30;
  
    // Configuración del título y encabezado
    doc.setFontSize(16);
    doc.text("Reporte de cancelación de citas", 14, 20);
    doc.addImage(logo, "JPEG", 180, 10, 20, 20); // Logo
    doc.setFontSize(12);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 14, 26);
  
    // Configuración de columnas y datos
    const columns = [
      { header: "Citas ID", dataKey: "id" },
      { header: "Fecha", dataKey: "Fecha" },
      { header: "Paciente", dataKey: "Paciente" },
      { header: "Tratamiento", dataKey: "Tratamiento" },
      { header: "Descripción", dataKey: "Descripcion" },
    ];
  
    const rows = datesData.map((date, index) => ({
      id: index + 1,
      Fecha: new Date(date.Fecha).toLocaleDateString(),
      Paciente: date.Paciente,
      Tratamiento: date.Tratamiento,
      Descripcion: date.Descripcion,
    }));
  
    // Generar tabla con todos los datos
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
        fillColor: [21, 153, 155], 
        textColor: 255, 
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        textColor: 50, 
        valign: "middle",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245], // Color de fondo alternado
      },
    });
  
    // Guardar el PDF
    doc.save("reporte_cancelaciones.pdf");
  };

  const handleBack = () => {
    navigate("/reports");
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = datesData.slice(indexOfFirstItem, indexOfLastItem);

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

      <div id="date-canceled-report-container" className="date-canceled-container">
      <h1 className="free-report-header">
        <span className="free-report-title">Reporte de cancelación de citas</span>
        <img src={logo} alt="Logo" className="free-logo" />
      </h1>

        <div className="date-canceled-info">
          <p><strong>Fecha de emisión:</strong> {new Date().toLocaleDateString()}</p>
        </div>

        <table className="date-canceled-tabla">
          <thead>
            <tr>
              <th>Citas ID</th>
              <th>Fecha</th>
              <th>Paciente</th>
              <th>Tratamiento</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((date, index) => (
              <tr key={index}>
                <td>{index + 1 + indexOfFirstItem}</td>
                <td>{new Date(date.Fecha).toLocaleDateString()}</td>
                <td>{date.Paciente}</td>
                <td>{date.Tratamiento}</td>
                <td>{date.Descripcion}</td>
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
            disabled={currentPage === Math.ceil(datesData.length / itemsPerPage)}
            className="pagination-btn inventory-pagination-button"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateCanceledReport;
