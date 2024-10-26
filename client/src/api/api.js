import axios from 'axios';

const api = "https://erp-knigth-c00vpx39q-wilmerh1506s-projects.vercel.app/api";

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



