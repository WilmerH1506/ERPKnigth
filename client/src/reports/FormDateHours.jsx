import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FormDateHours.css";

const SelectDateForHoursReport = () => {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!month || !year) {
      alert("Por favor, selecciona tanto el mes como el año.");
      return;
    }

    const formattedDate = `${month}-${year}`;
    navigate(`/reporte-horas-libres/${formattedDate}`); 
  };

  const handleGoBack = () => {
    navigate(-1); 
  };

  return (
    <div className="free-hours-report-container">
      <h1 className="free-hours-report-title">Seleccionar Fecha para Reporte de Ocupación de horarios</h1>
      <form onSubmit={handleSubmit} className="free-hours-report-form">
        <div className="free-hours-report-group">
          <label htmlFor="month" className="free-hours-report-label">Mes:</label>
          <select
            id="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
            className="free-hours-report-input"
          >
            <option value="">Selecciona un mes</option>
            <option value="01">Enero</option>
            <option value="02">Febrero</option>
            <option value="03">Marzo</option>
            <option value="04">Abril</option>
            <option value="05">Mayo</option>
            <option value="06">Junio</option>
            <option value="07">Julio</option>
            <option value="08">Agosto</option>
            <option value="09">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
          </select>
        </div>

        <div className="free-hours-report-group">
          <label htmlFor="year" className="free-hours-report-label">Año:</label>
          <input
            id="year"
            type="number"
            min="2000"
            max="2100"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Ejemplo: 2024"
            required
            className="free-hours-report-input"
          />
        </div>

        <div className="free-hours-report-group">
          <button type="submit" className="free-hours-report-button">
            Generar Reporte
          </button>
        </div>

        <div className="free-hours-report-group">
          <button
            type="button"
            className="free-hours-report-back-button"
            onClick={handleGoBack}
          >
        Regresar
          </button>
        </div>
      </form>
    </div>
  );
};

export default SelectDateForHoursReport;