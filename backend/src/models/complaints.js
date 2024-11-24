import mongoose from "mongoose";

const complaintsSchema = new mongoose.Schema({
    Paciente:
    {
        type: String,
        required: true
    },
    Correo:
    {
        type: String,
        required: true
    },	
    Fecha: {
        type: Date,
        required: true
    },
    Tipo_de_queja:
    {
        type: String,
        required: true
    },
    Razon:
    {
        type: String,
        required: true
    },
   
},
    {
        timestamps: true
    });

const complaint = mongoose.model("Complaints", complaintsSchema)
export default complaint