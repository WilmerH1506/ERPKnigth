import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";  
import "./ComplaintReport.css";

const ReporteQuejas = () => {
  const { date } = useParams(); 
  const [complaintsData, setComplaintsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/complaints/${date}`);
        const data = await response.json();
        setComplaintsData(data);
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
    const element = document.getElementById("complaints-report-container");  
    const options = {
      margin: [10, 10],
      filename: `reporte_quejas_${date}.pdf`, 
      html2canvas: {
        scale: 2,
      },
      jsPDF: {
        unit: "mm",
        format: "letter",
        orientation: "portrait",
      },
    };

    html2pdf().set(options).from(element).save();  
  };

  const handleGoBack = () => {
    navigate("/reports");
  };

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <div className="complaints-buttons-container">
        <button className="btn exit-btn" onClick={handleGoBack}>
          ← Regresar
        </button>
        <button
          className="btn save-btn"
          onClick={handleDownloadPDF} 
        >
          Guardar como PDF
        </button>
      </div>

      <div id="complaints-report-container" className="complaints-container">
        <h1 className="complaints-titulo">Reporte de Quejas</h1>
        <p>Fecha de emisión: {new Date().toLocaleDateString("es-ES")}</p>

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
            {complaintsData.map((queja, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{queja.Paciente}</td>
                <td>{queja.Correo}</td>
                <td>{new Date(queja.Fecha).toLocaleDateString("es-ES")}</td>
                <td>{queja.Tipo_de_queja}</td>
                <td>{queja.Razon}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReporteQuejas;