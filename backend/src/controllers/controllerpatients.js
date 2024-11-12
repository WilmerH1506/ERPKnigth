import Patient from '../models/patient.js';

export const patients = async (req, res) => {
    try {
        const allPatients = await Patient.find();
        res.status(200).json(allPatients);

    } catch (error) {
        res.status(404).json({message: error.message});
    }
}

export const registerpatients = async (req, res) => {
    
    const {Nombre,Sexo,DNI,Telefono,Correo} = req.body;

    const newPatient = new Patient({Nombre,Sexo,DNI,Telefono,Correo});

    try {
        await newPatient.save();
        res.status(201).json(newPatient);

    } catch (error) {
        res.status(409).json({message: error.message});
    }
}

export const deletePatient = async (req, res) => {
    const { id } = req.body;

    try {
        const result = await Patient.deleteOne({ _id: id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.status(200).json({ message: 'Patient deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const editPatient = async (req, res) => {
    const { _id, Nombre,Sexo ,DNI, Telefono, Correo } = req.body;
    
    try {
        const patient = await
        Patient
            .findByIdAndUpdate(_id, { Nombre, Sexo ,DNI, Telefono, Correo }, { new: true });

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.status(200).json(patient);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};