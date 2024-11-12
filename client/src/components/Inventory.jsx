import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import Modal from './ModalInput'; 
import { getInventory, registerProduct, editProduct, deleteProduct } from '../api/api.js';
import ConfirmationModal from './confirmModal'; 
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import './Inventory.css';
import { set } from 'mongoose';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentProduct, setCurrentProduct] = useState({
    Producto: '',
    Descripcion: '',
    Distribuidor: '',
    Caducidad: '',
    Cantidad: '',
    Precio: '',
  });
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await getInventory(); 
        setInventory(data);
      } catch (error) {
        console.error('Error al obtener los productos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const openModal = (product = null) => {
    if (product) {
      setModalTitle('Editar Producto');
      setCurrentProduct(product);
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
        toast.success('Producto editado con éxito!');
      } else {
        const newProduct = await registerProduct(data);
        setInventory([...inventory, newProduct]);
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

  const inputs = [
    {
      label: 'Producto',
      name: 'Producto',
      placeholder: 'Ingrese el nombre del producto',
    },
    {
      label: 'Descripción',
      name: 'Descripcion',
      placeholder: 'Ingrese una descripción',
    },
    {
      label: 'Distribuidor',
      name: 'Distribuidor',
      placeholder: 'Ingrese el nombre del distribuidor',
    },
    {
      label: 'Caducidad',
      name: 'Caducidad',
      type: 'date',  
      placeholder: 'Ingrese la fecha de caducidad',
    },
    {
      label: 'Cantidad',
      name: 'Cantidad',
      placeholder: 'Ingrese la cantidad',
    },
    {
      label: 'Precio',
      name: 'Precio',
      placeholder: 'Ingrese el precio',
    },
  ];

  return (
    <div className="inventory-container">
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={true} />

      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}

      <div className="header">
        <h1>Inventario</h1>
        <button className="new-product-button" onClick={() => openModal()}>
          <FaPlus className="plus-icon" /> Producto Nuevo
        </button>
      </div>

      <div className="inventory-table">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
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
            {inventory.map((product) => (
              <tr key={product._id}>
                <td>{product.Producto}</td>
                <td>{product.Descripcion}</td>
                <td>{product.Distribuidor}</td>
                <td>{product.Caducidad}</td>
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

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        inputs={inputs}
        title={modalTitle}
        onSubmit={handleSubmit} 
        currentPatient={currentProduct}
      />

      <ConfirmationModal 
        isOpen={isConfirmationOpen} 
        onClose={closeConfirmation} 
        onConfirm={handleDelete} 
      />
    </div>
  );
};


export default Inventory
