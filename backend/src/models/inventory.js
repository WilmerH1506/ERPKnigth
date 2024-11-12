import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
    Producto: {
        type: String,
        required: true,
    },
    Descripcion: {
        type: String,
        required: true
    },
    Distribuidor: {
        type: String,
        required: true
    },
    Caducidad: {
        type: Date,
        required: true
    },
    Cantidad: {
        type: Number,
        required: true
    },
    Precio: {
        type: Number,
        required: true
    },
    Total: {
        type: Number,
        required: true
    },
},
{
    timestamps: true
});

const Inventory = mongoose.model("Inventory", inventorySchema);
export default Inventory;