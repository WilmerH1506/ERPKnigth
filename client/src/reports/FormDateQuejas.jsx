import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FormDateQuejas.css";

const SelectDateForComplaints = () => {
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
    navigate(`/reporte-quejas/${formattedDate}`); 
  };

  const handleGoBack = () => {
    navigate(-1); 
  };

  return (
    <div className="select-date-complaints-container">
      <h1 className="select-date-complaints-title">Seleccionar Fecha para Reportes de queja</h1>
      <form onSubmit={handleSubmit} className="select-date-complaints-form">
        <div className="select-date-complaints-group">
          <label htmlFor="month" className="select-date-complaints-label">Mes:</label>
          <select
            id="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
            className="select-date-complaints-input"
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

        <div className="select-date-complaints-group">
          <label htmlFor="year" className="select-date-complaints-label">Año:</label>
          <input
            id="year"
            type="number"
            min="2000"
            max="2100"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Ejemplo: 2024"
            required
            className="select-date-complaints-input"
          />
        </div>

        <div className="select-date-complaints-group">
          <button type="submit" className="select-date-complaints-button">
            Generar Reporte
          </button>
        </div>

        <div className="select-date-complaints-group">
          <button
            type="button"
            className="select-date-complaints-back-button"
            onClick={handleGoBack}
          >
            Regresar
          </button>
        </div>
      </form>
    </div>
  );
};

export default SelectDateForComplaints;