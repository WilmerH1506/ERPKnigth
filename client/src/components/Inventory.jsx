import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import Modal from './ModalInput'; 
import { getInventory, registerProduct, editProduct, deleteProduct } from '../api/api.js';
import ConfirmationModal from './confirmModal'; 
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import './Inventory.css';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredProduct, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentProduct, setCurrentProduct] = useState({
    Producto: '',
    Categoria: '',
    Descripcion: '',
    Distribuidor: '',
    Caducidad: '',
    Cantidad: '',
    Precio: '',
  });
  const [productToDelete, setProductToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await getInventory(); 
        setInventory(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Error al obtener los productos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInventory();
  }, []);


  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = inventory.filter(product => 
      product.Categoria.toLowerCase().includes(term.toLowerCase()) || 
      product.Distribuidor.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredProducts(filtered);
    setCurrentPage(1);    
  };

  const openModal = (product = null) => {
    if (product) {
      setModalTitle('Editar Producto');
      setCurrentProduct({
        ...product,
        Caducidad: formatDate(product.Caducidad),
      });
    } else {
      setModalTitle('Producto Nuevo');
      setCurrentProduct({
        Producto: '',
        Descripcion: '',
        Distribuidor: '',
        Caducidad: '',
        Cantidad: '',
        Precio: '',
      });
    }
    setIsModalOpen(true);
  }

  const closeModal = () => {
    setIsModalOpen(false);
  }

  const openConfirmation = (id) => {
    setProductToDelete(id);
    setIsConfirmationOpen(true);
  }
  
  const closeConfirmation = () => {
    setIsConfirmationOpen(false);
    setProductToDelete(null);
  }

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      await deleteProduct(productToDelete);
      setInventory(inventory.filter(p => p._id !== productToDelete));
      setFilteredProducts(filteredProduct.filter(p => p._id !== productToDelete));
      toast.success('Producto eliminado con éxito!');
      closeConfirmation();
    }
    catch (error) {
      console.error('Error al eliminar el producto:', error);
      toast.error('Error al eliminar el producto.');
    }
    finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (data) => {
    try {
      setIsLoading(true);
      const total = data.Cantidad * data.Precio;
      data.Total = total;

      if (currentProduct._id) {
        const updatedProduct = await editProduct({ ...data, _id: currentProduct._id });
        setInventory(
          inventory.map((product) => (product._id === updatedProduct._id ? updatedProduct : product))
        );
        setFilteredProducts( 
          filteredProduct.map((product) => (product._id === updatedProduct._id ? updatedProduct : product))
        );
        toast.success('Producto editado con éxito!');
      } else {
        const newProduct = await registerProduct(data);
        setInventory([...inventory, newProduct]);
        setFilteredProducts([...filteredProduct, newProduct]);
        toast.success('Producto agregado con éxito!');
      }
      closeModal();
    } catch (error) {
      console.error('Error al agregar o editar el producto:', error);
      toast.error('Error al guardar el producto.');
    }
    finally {
      setIsLoading(false);
    }
  }

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProduct.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProduct.length / itemsPerPage);

  const inputs = [
    {
      label: 'Producto',
      name: 'Producto',
      placeholder: 'Ingrese el nombre del producto',
      validation: {
        required: 'Este campo es requerido',
        minLength: { value: 3, message: 'El nombre del producto debe tener al menos 3 caracteres' },
        maxLength: { value: 50, message: 'El nombre del producto debe tener menos de 50 caracteres' },
      },
    },
    {
      label: 'Categoria',
      name: 'Categoria',
      placeholder: 'Ingrese la categoria del producto',
      type: 'select',
      options: ['Protección Personal', 'Material de Curación', 'Equipo y instrumentos', 'Medicamentos','Otros'],
      validation: {
        required: 'Este campo es requerido',
      },
    },
    {
      label: 'Descripción',
      name: 'Descripcion',
      placeholder: 'Ingrese una descripción',
      validation: {
        required: 'Este campo es requerido',
        minLength: { value: 3, message: 'La descripción debe tener al menos 3 caracteres' },
        maxLength: { value: 100, message: 'La descripción debe tener menos de 100 caracteres' },
      },
    },
    {
      label: 'Distribuidor',
      name: 'Distribuidor',
      placeholder: 'Ingrese el nombre del distribuidor',
      validation: {
        required: 'Este campo es requerido',
        minLength: { value: 5, message: 'El nombre del distribuidor debe tener al menos 5 caracteres' },
        maxLength: { value: 50, message: 'El nombre del distribuidor debe tener menos de 50 caracteres' },
      },
    },
    {
      label: 'Caducidad',
      name: 'Caducidad',
      type: 'date',  
      placeholder: 'Ingrese la fecha de caducidad',
      validation: {
        required: 'Este campo es requerido',
        min: { value: new Date().toISOString().split('T')[0], message: 'La fecha de caducidad no puede ser anterior a la fecha actual' },
        
    }
    },
    {
      label: 'Cantidad',
      name: 'Cantidad',
      placeholder: 'Ingrese la cantidad',
      type: 'number',
      validation: {
        required: 'Este campo es requerido',
        min: { value: 1, message: 'La cantidad debe ser mayor a 0' },
      },
    },
    {
      label: 'Precio',
      name: 'Precio',
      placeholder: 'Ingrese el precio',
      type: 'number',
      validation: {
        required: 'Este campo es requerido',
        min: { value: 1, message: 'El precio debe ser mayor a 0' },
        max : { value: 100000, message: 'El precio no puede ser mayor a 100,000'},
    },
    }
  ];

  return (
    <div className="inventory-container">
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={true} />

      {isLoading ? (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      ) : (
        <div>
          <div className="header">
            <h1>Inventario</h1>
            <button className="new-product-button" onClick={() => openModal()}>
              <FaPlus className="plus-icon" /> Producto Nuevo
            </button>
          </div>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar por categoria o distribuidor"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="inventory-table">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoria</th>
                  <th>Descripcion</th>
                  <th>Distribuidor</th>
                  <th>Caducidad</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((product) => (
                  <tr key={product._id}>
                    <td>{product.Producto}</td>
                    <td>{product.Categoria}</td>
                    <td>{product.Descripcion}</td>
                    <td>{product.Distribuidor}</td>
                    <td>{formatDate(product.Caducidad)}</td>
                    <td>{product.Cantidad}</td>
                    <td>{product.Precio}</td>
                    <td>{(product.Cantidad * product.Precio).toFixed(2)}</td>
                    <td>
                      <button className="edit-button" onClick={() => openModal(product)}>
                        <FaEdit /> Editar
                      </button>
                      <button className="delete-button" onClick={() => openConfirmation(product._id)}>
                        <FaTrashAlt /> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="pagination-container inventory-pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn inventory-pagination-button"
            >
              &laquo; Anterior
            </button>
            <span className="pagination-info">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="pagination-btn inventory-pagination-button"
            >
              Siguiente &raquo;
            </button>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        inputs={inputs}
        title={modalTitle}
        onSubmit={handleSubmit} 
        currentData={currentProduct}
      />

      <ConfirmationModal 
        isOpen={isConfirmationOpen} 
        onClose={closeConfirmation} 
        onConfirm={handleDelete} 
        message="¿Estás seguro de que deseas eliminar este producto?, esta acción no se puede deshacer."
      />
    </div>
  );
};

export default Inventory;
