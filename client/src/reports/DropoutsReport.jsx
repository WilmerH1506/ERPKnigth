import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
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
        setDropoutsData(response.data);
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
    const totalPages = Math.ceil(dropoutsData.length / itemsPerPage);

    for (let page = 0; page < totalPages; page++) {
      const startIdx = page * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      const pageItems = dropoutsData.slice(startIdx, endIdx);

      if (page > 0) {
        doc.addPage();
      }

      doc.setFontSize(16);
      doc.text("Reporte de Pacientes Desertores", 14, 20); // Título
      doc.setFontSize(12);
      doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 14, 26);
      doc.text(`Página ${page + 1} de ${totalPages}`, 180, 26, null, null, "right");

      const columns = [
        { header: "ID", dataKey: "id" },
        { header: "Nombre del Paciente", dataKey: "Nombre" },
        { header: "Tratamiento", dataKey: "Tratamiento" },
        { header: "Descripción", dataKey: "Descripcion" },
        { header: "Fecha", dataKey: "Fecha" },
      ];

      const rows = pageItems.map((dropout, index) => ({
        id: startIdx + index + 1,
        Nombre: dropout.Nombre,
        Tratamiento: dropout.Tratamiento,
        Descripcion: dropout.Descripcion,
        Fecha: new Date(dropout.Fecha).toLocaleDateString(),
      }));

      doc.autoTable({
        head: [columns.map((col) => col.header)],
        body: rows.map((row) => columns.map((col) => row[col.dataKey])),
        startY: tableStartY,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 3 },
      });
    }

    doc.save("reporte_desertores.pdf");
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
        <h1 className="date-canceled-titulo">Reporte de Pacientes Desertores</h1>

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
