import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "jspdf-autotable";  
import logo from '../assets/Logo.jpg';
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import "./InventoryReport.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const InventoryReport = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/inventory");
        setInventoryData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar los datos de inventario:", err);
        setError("No se pudieron cargar los datos de inventario.");
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  const handleDownloadPDF = async () => {
    const container = document.getElementById("inventory-report-container");

    html2canvas(container, { scale: 5 }).then((canvas) => {
      const pdf = new jsPDF("p", "mm", "a4");

      // Agregar la gráfica en la primera página
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 10, 10, 180, 250); 

      const rowsPerPage = 5;
      const totalPages = Math.ceil(inventoryData.length / rowsPerPage);

      const addTableToPDF = (page) => {
        const startIndex = (page - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const rows = inventoryData.slice(startIndex, endIndex);

        if (rows.length > 0 || page > 1) {
          pdf.autoTable({
            startY: page === 1 ? 290 : 20,  
            head: [["ID", "Producto", "Categoría", "Descripción", "Distribuidor", "Caducidad", "Cantidad"]],
            body: rows.map((item, index) => [
              index + 1 + startIndex,
              item.Producto,
              item.Categoria,
              item.Descripcion,
              item.Distribuidor,
              new Date(item.Caducidad).toLocaleDateString(),
              item.Cantidad,
            ]),
            margin: { top: 10 },
            theme: "grid",
            showHead: "everyPage", 
          });

          if (page < totalPages) {
            pdf.addPage(); 
          }
        }
      };

      for (let i = 1; i <= totalPages; i++) {
        addTableToPDF(i);
      }

      pdf.save("reporte_inventario.pdf");
    });
  };

  const handleBack = () => {
    navigate("/reports");
  };

  const categories = Array.from(new Set(inventoryData.map(item => item.Categoria)));
  const categoryData = categories.map(category => {
    return inventoryData
      .filter(item => item.Categoria === category)
      .reduce((acc, item) => acc + item.Cantidad, 0);
  });

  const chartData = {
    labels: categories,
    datasets: [
      {
        label: "Cantidad",
        data: categoryData,
        backgroundColor: "rgb(0, 77, 102)", 
        borderColor: "rgba(0, 77, 102, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "black", 
          font: {
            size: 16, 
          },
        },
      },
      title: {
        display: true,
        text: "Cantidad por categoría",
        color: "black", 
        font: {
          size: 18, 
          weight: "bold",
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Categorías",
          color: "black",
          font: {
            size: 14,
          },
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Cantidad",
          color: "black",
          font: {
            size: 14,
          },
        },
      },
    },
  };

  // Función de paginación
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = inventoryData.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <div className="inventory-report-buttons-container">
        <button onClick={handleBack} className="inventory-report-btn-back">
          ← Salir
        </button>
        <button onClick={handleDownloadPDF} className="inventory-report-btn-download">
          Guardar como PDF
        </button>
      </div>

      <div id="inventory-report-container" className="inventory-report-container">
      <h1 className="inventory-report-header">
        <span className="inventory-report-title">Reporte de inventario de insumos</span>
        <img src={logo} alt="Logo" className="free-logo" />
      </h1>

        <div className="inventory-report-info">
          <p>
            <strong>Fecha de emisión:</strong> {new Date().toLocaleDateString()}
          </p>
        </div>

        <table className="inventory-report-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Descripción</th>
              <th>Distribuidor</th>
              <th>Caducidad</th>
              <th>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={index}>
                <td>{index + 1 + indexOfFirstItem}</td>
                <td>{item.Producto}</td>
                <td>{item.Categoria}</td>
                <td>{item.Descripcion}</td>
                <td>{item.Distribuidor}</td>
                <td>{new Date(item.Caducidad).toLocaleDateString()}</td>
                <td>{item.Cantidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="inventory-pagination">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inventory-pagination-button"
                >
                    Anterior
                </button>
                <span className="inventory-page-info">Página {currentPage}</span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === Math.ceil(inventoryData.length / itemsPerPage)}
                    className="inventory-pagination-button"
                >
                    Siguiente
                </button> 
        </div>
        <div className="inventory-report-chart">
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default InventoryReport;