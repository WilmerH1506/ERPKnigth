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
    const dates = await Dates.find({ Paciente: patient.Nombre });

    const enhancedDates = await Promise.all(
      dates.map(async (date) => {
        if (date.Estado === "Realizada") {
          
          const treatment = await Treatments.findOne({ Nombre: date.Tratamiento });

          const totalPagado = treatment ? parseFloat(treatment.Precio) : 0;
          return { ...date._doc, Total_Pagado: totalPagado };
        } else {
          return { ...date._doc, Total_Pagado: 0 }; 
        }
      })
    );

    const result = {
      ...patient._doc,
      dates: enhancedDates,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Error al obtener las citas:', error);
    res.status(400).json({ message: error.message });
  }
};

export const DatesCanceled = async (req, res) => {
    const { date } = req.params;
    const [month, year] = date.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    try {
        const dates = await Dates.find({
            Estado: "Cancelada",
            Fecha: { $gte: startDate, $lte: endDate },
        });

        res.status(200).json(dates);
    }
    catch (error) {
        console.error('Error al obtener las citas canceladas:', error);
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
            const quantity = Number(date.Cantidad) || 0;

            if (!acc[date.Tratamiento]) {
                acc[date.Tratamiento] = {
                    total: 0,
                    procedimientos: 0,
                    pacientes: [],
                    fechas: [],
                };
            }

            acc[date.Tratamiento].total += price * quantity; 
            acc[date.Tratamiento].procedimientos += quantity; 
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
              },
          },
          {
              $group: {
                  _id: "$Paciente", 
                  lastAppointment: { $max: "$Fecha" }, 
                  treatment: { $first: "$Tratamiento" }, 
                  description: { $first: "$Descripcion" },
                  Odontologo: { $first: "$Odontologo"}, 
              },
          },
      ]);

      const patientsWithoutRecentAppointments = patientsWithRecentAppointments.filter(
          (p) => new Date(p.lastAppointment) < sixMonthsAgo
      );

      const recentPatients = patientsWithRecentAppointments.map((p) => p._id);

     
      const patientsWithoutAppointments = await Patients.find({
          Nombre: { $nin: recentPatients },
      });

      const dropouts = [];

      for (let patient of patientsWithoutAppointments) {
          const lastAppointment = await Dates.findOne({
              Paciente: patient.Nombre,
              Estado: "Realizada",
          }).sort({ Fecha: -1 });

          if (lastAppointment) {
              dropouts.push({
                  Nombre: patient.Nombre,
                  Correo: patient.Correo || "No disponible",
                  Tratamiento: lastAppointment.Tratamiento,
                  Descripcion: lastAppointment.Descripcion,
                  Fecha: lastAppointment.Fecha,
                  Odontologo: lastAppointment.Odontologo,
              });
          }
      }

      for (let patient of patientsWithoutRecentAppointments) {
          dropouts.push({
              Nombre: patient._id,
              Correo: patient.Correo || "No disponible",
              Tratamiento: patient.treatment,
              Descripcion: patient.description,
              Odontologo: patient.Odontologo,
              Fecha: patient.lastAppointment,
          });
      }

      res.status(200).json(dropouts);
  } catch (error) {
      console.error("Error al obtener los pacientes desertores:", error);
      res.status(400).json({ message: error.message });
  }
};

export const NewPatients = async (req, res) => {
    const { date } = req.params;

    if (!/^\d{2}-\d{4}$/.test(date)) {
        return res.status(400).json({ error: 'Formato de fecha inválido. Utiliza MM-YYYY.' });
    }

    const [month, year] = date.split('-').map(Number);
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    

    const weeks = [
        { Semana: 'Semana 1', FechaInicio: new Date(year, month - 1, 1), FechaFin: new Date(year, month - 1, 7), CantidadPacientesNuevos: 0 },
        { Semana: 'Semana 2', FechaInicio: new Date(year, month - 1, 8), FechaFin: new Date(year, month - 1, 14), CantidadPacientesNuevos: 0 },
        { Semana: 'Semana 3', FechaInicio: new Date(year, month - 1, 15), FechaFin: new Date(year, month - 1, 21), CantidadPacientesNuevos: 0 },
        { Semana: 'Semana 4', FechaInicio: new Date(year, month - 1, 22), FechaFin: endOfMonth, CantidadPacientesNuevos: 0 }
    ];

    try {
        const patients = await Patients.find({
            createdAt: {
                $gte: startOfMonth,
                $lte: endOfMonth
            }
        });

        patients.forEach(patient => {
            const createdDate = new Date(patient.createdAt);
            weeks.forEach(week => {
                if (createdDate >= week.FechaInicio && createdDate <= week.FechaFin) {
                    week.CantidadPacientesNuevos++;
                }
            });
        });

        res.json(weeks);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los pacientes.' });
    }
};


export const NewPatientsByYear = async (req, res) => {
  try {
    
    const { year } = req.params;

    if (!/^(\d{4})$/.test(year)) {
      return res.status(400).json({ error: 'El formato del año no es válido. Use el formato YYYY.' });
    }

    const result = [];

    for (let month = 0; month < 12; month++) {
     
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999); 

     
      const patientCount = await Patients.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      });

      
      result.push({
        Mes: startDate.toLocaleString('es-ES', { month: 'long' }), 
        CantidadPacientesNuevos: patientCount
      });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al recuperar los datos de pacientes nuevos por mes.' });
  }
};

export const FreeHoursPerDoctor = async (req, res) => {
  try {
    const { date } = req.params;

    const [month, year] = date.split('-').map(Number);

    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ message: "Por favor, proporcione 'date' en el formato 'MM-YYYY'." });
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    const doctors = await Dates.distinct("Odontologo");

    const workingHours = Array.from({ length: 10 }, (_, i) => `${8 + i}:00`);

    const totalDaysInMonth = endDate.getUTCDate();
    const monthDates = Array.from({ length: totalDaysInMonth }, (_, i) => {
      const date = new Date(Date.UTC(year, month - 1, i + 1));
      return date.toISOString().split('T')[0];
    });

    const appointments = await Dates.find({
      Estado: "Pendiente",
      Fecha: { $gte: startDate, $lte: endDate },
    });

    const groupedAppointments = appointments.reduce((acc, appointment) => {
      const dateKey = appointment.Fecha.toISOString().split("T")[0];
      const doctor = appointment.Odontologo;

      if (!acc[doctor]) acc[doctor] = {};
      if (!acc[doctor][dateKey]) acc[doctor][dateKey] = new Set();

      const [startHour, startMinute] = appointment.Hora_Ingreso.split(":").map(Number);
      const [endHour, endMinute] = appointment.Hora_Salida.split(":").map(Number);

      for (let hour = startHour; hour < endHour; hour++) {
        acc[doctor][dateKey].add(`${hour}:00`);
      }
      if (endMinute > 0) {
        acc[doctor][dateKey].add(`${endHour}:00`);
      }

      return acc;
    }, {});

    const result = doctors.map((doctor) => {
      const dates = monthDates.map((date) => {
        const busyHours = Array.from(groupedAppointments[doctor]?.[date] || []);
        const freeHours = workingHours.filter(hour => !busyHours.includes(hour));
        return { date, freeHours };
      });

      return { doctor, dates };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las horas libres.", error: error.message });
  }
};
