import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./ReportHours.css";
import logo from '../assets/Logo.jpg';

const FreeHoursReport = () => {
  const { date } = useParams(); 
  const navigate = useNavigate(); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const month = date.split("-")[0];
  const year = date.split("-")[1];

  const itemsPerPage = 7;

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const monthName = months[parseInt(month) - 1];

  useEffect(() => {
    const fetchFreeHours = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/freeHours/${date}`);
        const fetchedData = response.data;

        if (Array.isArray(fetchedData)) {
          const filteredData = fetchedData.map((doctorData) => ({
            ...doctorData,
            dates: doctorData.dates.filter((day) => {
              const [dayYear, dayMonth] = day.date.split("-").map(Number);
              return dayYear === parseInt(year) && dayMonth === parseInt(month);
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

  const calculateTotals = (dates) =>
    dates.reduce(
      (acc, day) => {
        acc.occupied += 10 - day.freeHours.length;
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
      ).map((day) => ({
        ...day,
        occupiedHours: Array.from({ length: 10 }, (_, i) => {
          const hour = `${8 + i}:00`;
          return day.freeHours.includes(hour) ? null : hour;
        }).filter(Boolean),
      })),
    }));

  const handleDownloadPDF = async () => {
    const container = document.getElementById("inventory-report-container");

    html2canvas(container, { scale: 2 }).then((canvas) => {
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 10, 10, 190, 0); 
      pdf.save(`reporte_horas_libres_${date}.pdf`);
    });
  };

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>{error}</p>;

  // Función para formatear las fechas al formato dd/mm/yyyy
  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

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

      <h1 className="free-report-header">
        <span className="free-report-title">Reporte de Horas Libres</span>
        <img src={logo} alt="Logo" className="free-logo" />
      </h1>
      <p className="inventory-report-info">
        <strong>Fecha de reporte:</strong> {new Date().toLocaleDateString()}
      </p>
      <p className="inventory-report-info">
        <strong>Mes generado:</strong> {monthName}
      </p>

      {/* Tabla */}
      <table className="inventory-report-table">
        <thead>
          <tr>
            <th>Doctora</th>
            <th>Fecha</th>
            <th>Horas Libres</th>
            <th>Horas Ocupadas</th>
            <th>Horarios Libres</th>
            <th>Horarios Ocupados</th> {/* Nueva columna */}
          </tr>
        </thead>
        <tbody>
          {itemsToShow.map((doctorData, doctorIndex) =>
            doctorData.dates.map((day, dayIndex) => (
              <tr key={`${doctorIndex}-${dayIndex}`}>
                <td>{dayIndex === 0 ? doctorData.doctor : ""}</td>
                <td>{formatDate(day.date)}</td>
                <td>{day.freeHours.length}</td>
                <td>{day.occupiedHours.length}</td>
                <td>{day.freeHours.join(", ")}</td>
                <td>{day.occupiedHours.join(", ")}</td> {/* Nueva celda */}
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
              const totalHours = totals.occupied + totals.free;

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

             const pieOptions = {
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function (tooltipItem) {
                        const value = tooltipItem.raw;
                        const percentage = ((value / totalHours) * 100).toFixed(2);
                        return `${tooltipItem.label}: ${percentage}%`;
                      },
                    },
                  },
                },
              };
            return (
              <div key={index} className="free-report-chart-item">
                <h4>{doctorData.doctor}</h4>
                <Pie data={pieData} options={pieOptions} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FreeHoursReport;
