import Dates from '../models/dates.js';
import Patients from '../models/patient.js';
import Treatments from '../models/treatments.js';

export const DatesperPatient = async (req, res) => {
  try {
    const { id } = req.params; 
   
    const patient = await Patients.findById(id);
    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado.' });
    }

    const dates = await Dates.find({Paciente: patient.Nombre});

    const result = {
      ...patient._doc,
      dates, 
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Error al obtener las citas:', error);
    res.status(400).json({ message: error.message });
  }
};

export const DatesCanceled = async (req, res) => {
    try {
        const dates = await Dates.find({Estado: 'Cancelada'});
        res.status(200).json(dates);
    } catch (error) {
        console.error('Error al obtener las citas:', error);
        res.status(400).json({ message: error.message });
    }
};

export const serviceRevenue = async (req, res) => {
    try {
        const { date } = req.params; // Ejemplo de month_year: "11-2024"
        const [month, year] = date.split("-").map(Number);

        if (!month || !year) {
            return res.status(400).json({ message: "El parámetro month_year es inválido. Usa el formato MM-YYYY." });
        }

        const dates = await Dates.find({
            Estado: "Realizada", 
            Fecha: {
                $gte: new Date(year, month - 1, 1), 
                $lt: new Date(year, month, 1), 
            },
        });

        if (!dates.length) {
            return res.status(404).json({ message: "No hay citas finalizadas para el mes y año especificados." });
        }

        const treatments = await Treatments.find();

        // Procesar los ingresos por servicio
        const revenue = dates.reduce((acc, date) => {
            const treatment = treatments.find((t) => t.Nombre === date.Tratamiento);
            if (!treatment) return acc; 

            const price = Number(treatment.Precio);
            if (!acc[date.Tratamiento]) {
                acc[date.Tratamiento] = {
                    total: 0,
                    pacientes: [],
                };
            }

            acc[date.Tratamiento].total += price;
            acc[date.Tratamiento].pacientes.push(date.Paciente);

            return acc;
        }, {});

        res.status(200).json({
            message: "Ingresos por servicio calculados correctamente.",
            revenue,
        });
    } catch (error) {
        console.error("Error al obtener los ingresos:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};
