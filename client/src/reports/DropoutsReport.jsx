import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import html2pdf from "html2pdf.js";
import "./DropoutsReport.css"; 

const ReporteAbandono = () => {
  const [dropoutsData, setDropoutsData] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    const element = document.getElementById("dropouts-report-container");
    const options = {
      margin: [10, 10],
      filename: `reporte_desertores.pdf`,
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

  const handleBack = () => {
    navigate("/reports"); 
  };

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

      <div id="dropouts-report-container" className="date-canceled-container"> {/* Renombrado el contenedor */}
        <h1 className="date-canceled-titulo">Reporte de Pacientes Desertores</h1>

        <div className="date-canceled-info">
          <p><strong>Fecha de emisión:</strong> {new Date().toLocaleDateString()}</p>
        </div>

        <table className="date-canceled-tabla">
          <thead>
            <tr>
              <th>ID</th> {/* Nueva columna ID */}
              <th>Nombre del Paciente</th>
              <th>Tratamiento</th>
              <th>Descripción</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {dropoutsData.map((dropout, index) => ( 
              <tr key={index}>
                <td>{index + 1}</td> 
                <td>{dropout.Nombre}</td>
                <td>{dropout.Tratamiento}</td>
                <td>{dropout.Descripcion}</td>
                <td>{new Date(dropout.Fecha).toLocaleDateString()}</td> 
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReporteAbandono;