import React, { useState } from 'react';
import { FaEdit, FaTrashAlt, FaPlus, FaTimes } from 'react-icons/fa';
import Modal from './ModalInput'; 
import './Inventory.css';

const initialInventoryData = [
  { id: 1, Producto: 'Pasta Dental', Cantidad: 15, Precio: '50 Lps' },
  { id: 2, Producto: 'Cepillo', Cantidad: 30, Precio: '30 Lps' },
];

const Inventory = () => {
  const [inventory, setInventory] = useState(initialInventoryData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentProduct, setCurrentProduct] = useState({ id: null, Producto: '', Cantidad: '', Precio: '' });

  const handleInputChange = (e) => {
    setCurrentProduct({ ...currentProduct, [e.target.name]: e.target.value });
  };

  const openModal = (product = null) => {
    if (product) {
      setModalTitle('Editar Producto');
      setCurrentProduct(product);
    } else {
      setModalTitle('Producto Nuevo');
      setCurrentProduct({ id: null, Producto: '', Cantidad: '', Precio: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentProduct.id) {
      setInventory(inventory.map((item) => (item.id === currentProduct.id ? currentProduct : item)));
    } else {
      setInventory([...inventory, { ...currentProduct, id: inventory.length + 1 }]);
    }
    closeModal();
  };

  const inputs = [
    {
      label: 'Producto',
      name: 'Producto',
      value: currentProduct.Producto,
      onChange: handleInputChange,
      placeholder: 'Ingrese el nombre del producto',
    },
    {
      label: 'Cantidad',
      name: 'Cantidad',
      value: currentProduct.Cantidad,
      onChange: handleInputChange,
      placeholder: 'Ingrese la cantidad',
    },
    {
      label: 'Precio',
      name: 'Precio',
      value: currentProduct.Precio,
      onChange: handleInputChange,
      placeholder: 'Ingrese el precio',
    },
  ];

  return (
    <div className="inventory-container">
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
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id}>
                <td>{item.Producto}</td>
                <td>{item.Cantidad}</td>
                <td>{item.Precio}</td>
                <td>
                  <button className="edit-button" onClick={() => openModal(item)}>
                    <FaEdit /> Editar
                  </button>
                  <button className="delete-button" onClick={() => setInventory(inventory.filter(i => i.id !== item.id))}>
                    <FaTrashAlt /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para agregar/editar productos */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        inputs={inputs}
        title={modalTitle}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Inventory;
