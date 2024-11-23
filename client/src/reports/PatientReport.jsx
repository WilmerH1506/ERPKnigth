import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import html2pdf from "html2pdf.js"; 
import "./PatientReport.css";

const ReporteCitas = () => {
  const { id } = useParams(); 
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  
    const element = document.getElementById("reporte-content");

    const pdfFileName = `reporte_citas_${patientData.Nombre.replace(/\s+/g, '_')}_${new Date().toLocaleDateString()}.pdf`;

    const options = {
      margin: [20, 20, 20, 20],
      filename: pdfFileName, 
      html2canvas: { scale: 4},
      jsPDF: { unit: 'mm', format: 'letter', orientation: 'p' }
    };

    html2pdf().from(element).set(options).save();
  };

  const handleExit = () => {
    navigate("/reports"); 
  };

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="reporte-container">
      {/* Botones fuera de la tabla y encima del título */}
      <div className="buttons-container">
        <button className="btn exit-btn" onClick={handleExit}>← Salir</button>
        <button className="btn save-btn" onClick={handleSavePDF}>Guardar como PDF</button>
      </div>

      <div id="reporte-content"> {/* Contenido que se convertirá en PDF */}
        
        <div style={{ height: "15px" }}></div> 
        <h1 className="reporte-titulo">Reporte de Citas por Paciente</h1>

        {/* Información del Paciente en Formato Solicitado */}
        <div className="reporte-info">
            <div className="info-row">
              <p><strong>Paciente:</strong> {patientData.Nombre}</p>
              <p><strong>ID:</strong> {patientData.DNI}</p>
              <p><strong>Sexo:</strong> {patientData.Sexo}</p>
            </div>
            <div className="info-row">
              <p><strong>Fecha de emisión:</strong> {new Date().toLocaleDateString()}</p>
              <p><strong>Correo:</strong> {patientData.Correo}</p>
              <p><strong></strong></p>
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
            {patientData.dates.map((cita, index) => (
              <tr key={cita._id}>
                <td>{index + 1}</td>
                <td>{new Date(cita.Fecha).toLocaleDateString()}</td>
                <td>
                  {cita.Hora_Ingreso} - {cita.Hora_Salida}
                </td>
                <td>{cita.Tratamiento}</td>
                <td>{cita.Odontologo}</td>
                <td>{cita.Estado}</td>
                <td>{cita.Total_Pagado || "Pendiente de Pago"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReporteCitas;
