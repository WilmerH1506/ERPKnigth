import React from 'react';
import { FaUserFriends, FaCalendarAlt, FaMoneyBillWave, FaBox } from 'react-icons/fa';
import './DashboardsCards.css';

const cards = [
    {
        title: 'Pacientes Totales',
        value: '1,234',
        icon: <FaUserFriends />,
    },
    {
        title: 'Citas Hoy',
        value: '12',
        icon: <FaCalendarAlt />,
    },
    {
        title: 'Productos Con Poca Existencia',
        value: '3',
        icon: <FaBox />,
    },
    ];


const DashboardCards = () => {
    return (
      <div className="dashboard-cards">
        {cards.map((card, index) => (
          <div className="dcard" key={index}>
            <div className="dcard-content">
              <span>{card.title}</span>
              <h2>{card.value}</h2>
            </div>
            <div className="dcard-icon">
              {card.icon}
            </div>
          </div>
        ))}
      </div>
    );
  };

export default DashboardCards;