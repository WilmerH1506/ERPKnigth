import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";  
import "./RevenueReport.css";

const ReportesServicios = () => {
  const { date } = useParams(); 
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/services/${date}`);
        const data = await response.json();

        if (data.revenue) {
          let idCounter = 1; 
          const formattedData = Object.entries(data.revenue)
            .map(([servicio, details]) =>
              details.pacientes.map((paciente, i) => ({
                id: idCounter++, 
                servicio, 
                paciente, 
                costo: details.total / details.pacientes.length, 
                fecha: details.fechas[i], 
                cantidad: 1, 
                total: details.total / details.pacientes.length, 
              }))
            )
            .flat(); 

          setReportData(formattedData);
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
    const element = document.getElementById("reportes-servicios-container");  
    const options = {
      margin: [10, 10],
      filename: `reporte_servicios_${date}.pdf`, 
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

  if (loading) return <p>Cargando datos...</p>;

  return (
    <div>
      <div className="buttons-container">
        <button className="btn exit-btn" onClick={() => navigate(-1)}>
          ← Regresar
        </button>
        <button
          className="btn save-btn"
          onClick={handleDownloadPDF} 
        >
          Guardar como PDF
        </button>
      </div>

      <div id="reportes-servicios-container" className="reportes-container">
        <h1 className="reportes-titulo">Reporte de Servicios</h1>
        <p>Fecha de emisión: {new Date().toLocaleDateString("es-ES")}</p>

        {/* Tabla de datos */}
        <table className="reportes-tabla">
          <thead>
            <tr>
              <th>Servicio ID</th>
              <th>Nombre Paciente</th>
              <th>Servicio</th>
              <th>Fecha</th>
              <th>Costo</th>
              <th>Cantidad</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((item, index) => (
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
      </div>
    </div>
  );
};

export default ReportesServicios;
