import mongoose from "mongoose";

const datesSchema = new mongoose.Schema({
    Fecha: {
        type: Date,
        required: true
    },
    Hora_Ingreso: 
    {
        type: String,
        required: true
    },
    Hora_Salida : 
    {
        type : String,
        required: true
    },
    Paciente:
    {
        type: String,
        required: true
    },
    Tratamiento: 
    {
        type: String,
        required: true
    },
    Cantidad:
    {
        type: Number,
        required: true
    },
    Descripcion:
    {
        type: String,
        required: true
    },
    Odontologo:
    {
        type: String,
        required: true
    },
    Estado:
    {
        type: String,
        required: true
    },
},
    {
        timestamps: true
    });

const date = mongoose.model("Dates", datesSchema)
export default date