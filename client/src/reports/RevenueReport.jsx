import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import "./RevenueReport.css";
import logo from '../assets/Logo.jpg';

const ReportesServicios = () => {
  const { date } = useParams();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 
  const navigate = useNavigate();
  const [totalRevenue, setTotalRevenue] = useState(0);

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/services/${date}`);
      const data = await response.json();

      if (data.revenue) {
        let idCounter = 1;
        let revenueSum = 0; 
        const formattedData = Object.entries(data.revenue)
          .map(([servicio, details]) =>
            details.pacientes.map((paciente, i) => {
              const costo = details.total / details.pacientes.length;
              revenueSum += costo;
              return {
                id: idCounter++,
                servicio,
                paciente,
                costo,
                fecha: details.fechas[i],
                cantidad: 1,
                total: costo,
              };
            })
          )
          .flat();

        setReportData(formattedData);
        setTotalRevenue(revenueSum); 
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
    const doc = new jsPDF("p", "mm", "letter");
    const tableStartY = 30;
    const totalPages = Math.ceil(reportData.length / itemsPerPage);

    for (let page = 0; page < totalPages; page++) {
      const startIdx = page * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      const pageItems = reportData.slice(startIdx, endIdx);

      if (page > 0) {
        doc.addPage();
      }

      doc.setFontSize(16);
      doc.text("Reporte de Servicios", 14, 20);
      doc.addImage(logo, "JPEG", 180, 10, 20, 20);
      doc.setFontSize(12);
      doc.text(`Fecha de emisión: ${new Date().toLocaleDateString("es-ES")}`, 14, 26);
      doc.text(`Página ${page + 1} de ${totalPages}`, 180, 26, null, null, "right");

      const columns = [
        { header: "Servicio ID", dataKey: "id" },
        { header: "Nombre Paciente", dataKey: "paciente" },
        { header: "Servicio", dataKey: "servicio" },
        { header: "Fecha", dataKey: "fecha" },
        { header: "Costo", dataKey: "costo" },
        { header: "Cantidad", dataKey: "cantidad" },
        { header: "Total", dataKey: "total" },
      ];

      const rows = pageItems.map((item) => ({
        id: item.id,
        paciente: item.paciente,
        servicio: item.servicio,
        fecha: item.fecha
          ? new Date(item.fecha).toLocaleDateString("es-ES")
          : "Fecha no disponible",
        costo: item.costo.toLocaleString("es-HN", {
          style: "currency",
          currency: "HNL",
        }),
        cantidad: item.cantidad,
        total: item.total.toLocaleString("es-HN", {
          style: "currency",
          currency: "HNL",
        }),
      }));

      doc.autoTable({
        head: [columns.map((col) => col.header)],
        body: rows.map((row) => columns.map((col) => row[col.dataKey])),
        startY: tableStartY,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 3 },
      });
    }

    doc.save(`reporte_servicios_${date}.pdf`);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reportData.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return <p>Cargando datos...</p>;

  return (
    <div>
      <div className="buttons-container">
        <button className="btn exit-btn" onClick={() => navigate(-1)}>
          ← Regresar
        </button>
        <button className="btn save-btn" onClick={handleDownloadPDF}>
          Guardar como PDF
        </button>
      </div>

      <div id="reportes-servicios-container" className="reportes-container">
      <h1 className="free-report-header">
          <span className="free-report-title">Reporte de servicios</span>
          <img src={logo} alt="Logo" className="free-logo" />
      </h1>
        <p>Fecha de emisión: {new Date().toLocaleDateString("es-ES")}</p>
        <p>
            Total generado:{" "}
            {totalRevenue.toLocaleString("es-HN", {
              style: "currency",
              currency: "HNL",
            })}
        </p>

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
            {currentItems.map((item, index) => (
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

        <div className="pagination-container inventory-pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn inventory-pagination-button"
          >
            Anterior
          </button>
          <span className="pagination-info ">Página {currentPage}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === Math.ceil(reportData.length / itemsPerPage)}
            className="pagination-btn inventory-pagination-button"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportesServicios;
