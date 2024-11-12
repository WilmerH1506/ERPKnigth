import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
    Nombre: {
        type: String,
        required: true,
        trim : true
    },
    Sexo: {
        type: String,
        required: true
    },
    DNI: {
        type: String,
        required: true
    },
    Telefono: {
        type: String,
        required: true
    },
    Correo: {
        type: String,
        required: true
    },
},
{
    timestamps: true
});

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;