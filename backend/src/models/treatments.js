import mongoose from "mongoose";

const treatmentSchema = new mongoose.Schema({
    Nombre: {
        type: String,
        required: true,
        trim : true
    },
    Precio: {
        type: String,
        required: true
    },
},
{
    timestamps: true
});

const treatment = mongoose.model("treatments", treatmentSchema)
export default treatment