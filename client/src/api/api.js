import axios from 'axios';

const api = "http://localhost:3000/api";

export const getPatients = async () => {
    const response = await axios.get(`${api}/patients`);
    return response.data; 
  };

export const registerPatients = async (data) => {
    const response = await axios.post(`${api}/registerpatients`, data);
    return response.data;
  }

  export const deletePatient = async (id) => {
    const response = await axios.post(`${api}/deletepatient`, { id }); 
    return response.data;
};

export const editPatient = async (data) => {
    const response = await axios.put(`${api}/editPatient`, data);
    return response.data;
  }

export const getInventory = async () => {
    const response = await axios.get(`${api}/inventory`);
    return response.data;
}

export const registerProduct = async (data) => {
    const response = await axios.post(`${api}/registerproduct`, data);
    return response.data;
}

export const deleteProduct = async (id) => {
    const response = await axios.post(`${api}/deleteproduct`, { id });
    return response.data;
}

export const editProduct = async (data) => {
    const response = await axios.put(`${api}/editproduct`, data);
    return response.data;
}
