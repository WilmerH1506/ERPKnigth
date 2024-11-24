import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import html2pdf from "html2pdf.js";
import "./DateCanceledReport.css";

const DateCanceledReport = () => {
  const [datesData, setDatesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    const element = document.getElementById("date-canceled-report-container");
    const options = {
      margin: [10, 10],
      filename: `reporte_cancelaciones.pdf`,
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

      <div id="date-canceled-report-container" className="date-canceled-container">
        <h1 className="date-canceled-titulo">Reporte de cancelación de citas</h1>

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
            {datesData.map((date, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{new Date(date.Fecha).toLocaleDateString()}</td>
                <td>{date.Paciente}</td>
                <td>{date.Tratamiento}</td>
                <td>{date.Descripcion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DateCanceledReport;
