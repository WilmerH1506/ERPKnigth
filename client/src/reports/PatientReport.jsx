import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf"; 
import "jspdf-autotable"; 
import "./PatientReport.css";

const ReporteCitas = () => {
  const { id } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/patients/${id}`);
        setPatientData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar los datos del paciente:", err);
        setError("No se pudieron cargar los datos del paciente.");
        setLoading(false);
      }
    };

    if (id) {
      fetchPatientData();
    } else {
      setError("El ID del paciente no se encontró en la URL.");
      setLoading(false);
    }
  }, [id]);

  const handleSavePDF = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const rowsPerPage = 5;
    const totalRows = patientData.dates.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    doc.setFontSize(16);
    doc.text("Reporte de Citas por Paciente", 14, 20);
    doc.setFontSize(12);
    doc.text(`Paciente: ${patientData.Nombre}`, 14, 30);
    doc.text(`ID: ${patientData.DNI}`, 14, 40);
    doc.text(`Sexo: ${patientData.Sexo}`, 14, 50);
    doc.text(`Correo: ${patientData.Correo}`, 14, 60);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 14, 70);

    const tableStartY = 80;
    const columns = ["Cita ID", "Fecha de cita", "Hora", "Razón", "Odontólogo", "Estado", "Total Pagado"];
    const rows = patientData.dates.map((cita, index) => [
      index + 1,
      new Date(cita.Fecha).toLocaleDateString(),
      `${cita.Hora_Ingreso} - ${cita.Hora_Salida}`,
      cita.Tratamiento,
      cita.Odontologo,
      cita.Estado,
      cita.Total_Pagado || "Pendiente de Pago"
    ]);

    
    const tableOptions = {
      startY: tableStartY,
      head: [columns],
      body: rows.slice(0, rowsPerPage),
      theme: "grid",
      margin: { top: 10 },
    };
    
    doc.autoTable(tableOptions);

    let currentPageNum = 1;
    while (currentPageNum < totalPages) {
      doc.addPage();
      const rowsToAdd = rows.slice(currentPageNum * rowsPerPage, (currentPageNum + 1) * rowsPerPage);
      doc.autoTable({ 
        startY: 20,
        head: [columns],
        body: rowsToAdd,
        theme: "grid",
      });
      currentPageNum++;
    }

    const pdfFileName = `reporte_citas_${patientData.Nombre.replace(/\s+/g, '_')}_${new Date().toLocaleDateString()}.pdf`;
    doc.save(pdfFileName);
  };

  const handleExit = () => {
    navigate("/reports");
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = patientData?.dates.slice(indexOfFirstItem, indexOfLastItem) || [];

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="reporte-container">
      {/* Botones fuera de la tabla y encima del título */}
      <div className="buttons-container">
        <button className="btn exit-btn" onClick={handleExit}>← Salir</button>
        <button className="btn save-btn" onClick={handleSavePDF}>Guardar como PDF</button>
      </div>

      <div id="reporte-content">
        <div style={{ height: "15px" }}></div>
        <h1 className="reporte-titulo">Reporte de Citas por Paciente</h1>

        {/* Información del Paciente */}
        <div className="reporte-info">
          <div className="info-row">
            <p><strong>Paciente:</strong> {patientData.Nombre}</p>
            <p><strong>ID:</strong> {patientData.DNI}</p>
            <p><strong>Sexo:</strong> {patientData.Sexo}</p>
          </div>
          <div className="info-row">
            <p><strong>Fecha de emisión:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Correo:</strong> {patientData.Correo}</p>
          </div>
        </div>

        {/* Tabla de citas */}
        <table className="reporte-tabla">
          <thead>
            <tr>
              <th>Cita ID</th>
              <th>Fecha de cita</th>
              <th>Hora</th>
              <th>Razón</th>
              <th>Odontólogo</th>
              <th>Estado</th>
              <th>Total Pagado</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((cita, index) => (
              <tr key={cita._id}>
                <td>{index + 1 + indexOfFirstItem}</td>
                <td>{new Date(cita.Fecha).toLocaleDateString()}</td>
                <td>{cita.Hora_Ingreso} - {cita.Hora_Salida}</td>
                <td>{cita.Tratamiento}</td>
                <td>{cita.Odontologo}</td>
                <td>{cita.Estado}</td>
                <td>{cita.Total_Pagado || "Pendiente de Pago"}</td>
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
            disabled={currentPage === Math.ceil(patientData.dates.length / itemsPerPage)}
            className="pagination-btn inventory-pagination-button"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReporteCitas;
