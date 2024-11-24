import Dates from '../models/dates.js';
import Patients from '../models/patient.js';
import Treatments from '../models/treatments.js';
import complaint from '../models/complaints.js';


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
        const { date } = req.params; 
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

        const revenue = dates.reduce((acc, date) => {
            const treatment = treatments.find((t) => t.Nombre === date.Tratamiento);
            if (!treatment) return acc; 

            const price = Number(treatment.Precio);
            if (!acc[date.Tratamiento]) {
                acc[date.Tratamiento] = {
                    total: 0,
                    pacientes: [],
                    fechas: [],
                };
            }

            acc[date.Tratamiento].total += price;
            acc[date.Tratamiento].pacientes.push(date.Paciente);
            acc[date.Tratamiento].fechas.push(date.Fecha);

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

export const getComplaints = async (req, res) => {
    try {
        const complaints = await complaint.find();
        res.status(200).json(complaints);
    } catch (error) {
        console.error("Error al obtener las quejas:", error);
        res.status(400).json({ message: error.message });
    }
}

export const registerComplaint = async (req, res) => {
    try {
        const { Paciente, Correo, Fecha , Tipo_de_queja, Razon } = req.body;
        const newComplaint = new complaint({ Paciente, Correo, Fecha , Tipo_de_queja , Razon });
        await newComplaint.save();
        res.status(201).json(newComplaint);
    } catch (error) {
        console.error("Error al registrar la queja:", error);
        res.status(400).json({ message: error.message });
    }
}

export const getComplaintsPerMonth = async (req, res) => {
    try {
        const { date } = req.params;
    
       
        const [month, year] = date.split('-').map(Number);
    
        
        if (!month || !year || month < 1 || month > 12) {
          return res.status(400).json({ error: 'Formato de mes y año inválido. Debe ser MM-YYYY.' });
        }
    
        const startDate = new Date(year, month - 1, 1); 
        const endDate = new Date(year, month, 1); 
    
        const Complaints = await complaint.find({
          Fecha: { $gte: startDate, $lte: endDate }
        });
    
        res.status(200).json(Complaints);
      } catch (error) {
        console.error('Error al recuperar las quejas:', error);
        res.status(500).json({ error: 'Error al recuperar las quejas.', message: error.message });
      }
}

export const PatientsDropouts = async (req, res) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const patientsWithRecentAppointments = await Dates.aggregate([
            {
                $match: {
                    Estado: "Realizada",
                    Fecha: { $gte: sixMonthsAgo } 
                }
            },
            {
                $group: {
                    _id: "$Paciente", 
                    lastAppointment: { $max: "$Fecha" }, 
                    treatment: { $first: "$Tratamiento" }, 
                    description: { $first: "$Descripcion" } 
                }
            }
        ]);

       
        const patientsWithoutAppointments = await Patients.find({
            Nombre: { $nin: patientsWithRecentAppointments.map(p => p._id) }
        });

        const dropouts = [];

        
        for (let patient of patientsWithoutAppointments) {
            const lastAppointment = await Dates.findOne({
                Paciente: patient.Nombre,
                Estado: "Realizada"
            }).sort({ Fecha: -1 });

            if (lastAppointment) {
                dropouts.push({
                    Nombre: patient.Nombre,
                    Tratamiento: lastAppointment.Tratamiento,
                    Descripcion: lastAppointment.Descripcion,
                    Fecha: lastAppointment.Fecha
                });
            } 
        }

        res.status(200).json(dropouts);

    } catch (error) {
        console.error("Error al obtener los pacientes desertores:", error);
        res.status(400).json({ message: error.message });
    }
}