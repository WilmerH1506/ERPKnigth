import Inventory from "../models/inventory.js";

export const inventory = async (req, res) => {
    try {
        const allInventory = await Inventory.find();
        res.status(200).json(allInventory);

    } catch (error) {
        res.status(404).json({message: error.message});
    }
}

export const registerProduct = async (req, res) => {
    
    const {Producto,Categoria,Descripcion,Distribuidor,Caducidad,Cantidad,Precio,Total} = req.body;

    const newInventory = new Inventory({Producto,Categoria,Descripcion,Distribuidor,Caducidad,Cantidad,Precio,Total});

    try {
        await newInventory.save();
        res.status(201).json(newInventory);

    } catch (error) {
        res.status(409).json({message: error.message});
    }
}

export const deleteProduct = async (req, res) => {
    const { id } = req.body;

    try {
        const result = await Inventory.deleteOne({ _id: id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const editProduct = async (req, res) => {
    const { _id, Producto,Categoria,Descripcion,Distribuidor,Caducidad,Cantidad,Precio,Total } = req.body;
    
    try {
        const product = await
        Inventory
            .findByIdAndUpdate(_id, { Producto,Categoria,Descripcion,Distribuidor,Caducidad,Cantidad,Precio,Total }, { new: true });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};