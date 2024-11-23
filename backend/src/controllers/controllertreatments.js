import treatment from '../models/treatments.js';

export const treatments = async (req, res) => {
    try {
        const allTreatments = await treatment.find();
        res.status(200).json(allTreatments);

    } catch (error) {
        res.status(404).json({message: error.message});
    }
}

export const registerTreatments = async (req, res) => {
    
    const {Nombre,Precio} = req.body;

    const newTreatment = new treatment({Nombre,Precio});

    try {
        await newTreatment.save();
        res.status(201).json(newTreatment);

    } catch (error) {
        res.status(409).json({message: error.message});
    }
}