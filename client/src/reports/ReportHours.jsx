import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./ReportHours.css";

const FreeHoursReport = () => {
  const { date } = useParams(); 
  const navigate = useNavigate(); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 7; 

  useEffect(() => {
    const fetchFreeHours = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/freeHours/${date}`);
        const fetchedData = response.data;

        if (Array.isArray(fetchedData)) {
          const [month, year] = date.split("-").map(Number);

          // Filtrar datos para incluir solo el mes solicitado
          const filteredData = fetchedData.map((doctorData) => ({
            ...doctorData,
            dates: doctorData.dates.filter((day) => {
              const [dayYear, dayMonth] = day.date.split("-").map(Number);
              return dayYear === year && dayMonth === month;
            }),
          }));

          setData(filteredData);
        } else {
          throw new Error("La respuesta de la API no tiene el formato esperado.");
        }

        setLoading(false);
      } catch (err) {
        console.error("Error al cargar las horas libres:", err);
        setError("No se pudieron cargar las horas libres.");
        setLoading(false);
      }
    };

    fetchFreeHours();
  }, [date]);

  // Calcular totales para las gráficas
  const calculateTotals = (dates) =>
    dates.reduce(
      (acc, day) => {
        acc.occupied += 10 - day.freeHours.length; // 10 horas laborales por día
        acc.free += day.freeHours.length;
        return acc;
      },
      { occupied: 0, free: 0 }
    );

  const itemsToShow = data.map((doctorData) => ({
    ...doctorData,
    dates: doctorData.dates.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ),
  }));

  // Obtener rango de fechas para la página actual
  const currentDates = itemsToShow[0]?.dates || [];
  const startDate = currentDates[0]?.date.split("-")[2];
  const endDate = currentDates[currentDates.length - 1]?.date.split("-")[2];
  const dateRange = startDate && endDate ? `${startDate}-${endDate}` : "";

  const handleDownloadPDF = async () => {
    const container = document.getElementById("inventory-report-container");

    html2canvas(container, { scale: 2 }).then((canvas) => {
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 10, 10, 190, 0); // Ajustar para que quepa en una página
      pdf.save(`reporte_horas_libres_${date}.pdf`);
    });
  };

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div id="inventory-report-container" className="inventory-report-container">
      {/* Botones */}
      <div className="inventory-report-buttons">
        <button
          className="inventory-report-button-back"
          onClick={() => navigate("/reports")}
        >
         ← Salir
        </button>
        
      </div>

      <h1 className="inventory-report-title">Reporte de Horas Libres</h1>
      <p className="inventory-report-info">
        <strong>Fecha de reporte:</strong> {new Date().toLocaleDateString()}
      </p>

      {/* Tabla */}
      <table className="inventory-report-table">
        <thead>
          <tr>
            <th>Fecha (Intervalo: {dateRange})</th>
            <th>Doctora</th>
            <th>Horas Libres</th>
            <th>Horas Ocupadas</th>
          </tr>
        </thead>
        <tbody>
          {itemsToShow.map((doctorData, doctorIndex) =>
            doctorData.dates.map((day, dayIndex) => (
              <tr key={`${doctorIndex}-${dayIndex}`}>
                <td>{dayIndex === 0 ? dateRange : ""}</td>
                <td>{dayIndex === 0 ? doctorData.doctor : ""}</td>
                <td>{day.freeHours.length}</td>
                <td>{10 - day.freeHours.length}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="inventory-pagination">
        <button
          className="inventory-pagination-button"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <span className="inventory-page-info">Página {currentPage}</span>
        <button
          className="inventory-pagination-button"
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(prev + 1, Math.ceil(data[0]?.dates.length / itemsPerPage))
            )
          }
          disabled={currentPage === Math.ceil(data[0]?.dates.length / itemsPerPage)}
        >
          Siguiente
        </button>
      </div>

      {/* Gráficas */}
      <div className="free-report-charts-container">
        <h3>Distribución de Horas por Doctora</h3>
        <div className="free-report-charts-row">
          {data.map((doctorData, index) => {
            const totals = calculateTotals(doctorData.dates);
            const pieData = {
              labels: ["Horas Ocupadas", "Horas Libres"],
              datasets: [
                {
                  data: [totals.occupied, totals.free],
                  backgroundColor: ["#FF6384", "#36A2EB"],
                  hoverBackgroundColor: ["#FF6384", "#36A2EB"],
                },
              ],
            };

            return (
              <div key={index} className="free-report-chart-item">
                <h4>{doctorData.doctor}</h4>
                <Pie data={pieData} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FreeHoursReport;
