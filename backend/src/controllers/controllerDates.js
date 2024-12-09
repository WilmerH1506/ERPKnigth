import Dates from '../models/dates.js'

export const dates = async (req,res) => {
     try {
        const allDates = await Dates.find()
        res.status(200).json(allDates)  
     } catch (error){
        res.status(400).json({message: error.message})
     }
}

export const RegisterDates = async (req,res) => {
   try {
     const {Fecha, Hora_Ingreso,Hora_Salida,Paciente, Tratamiento,Cantidad,Descripcion,Odontologo,Estado} = req.body
     
     const Newdate =  new Dates({Fecha,Hora_Ingreso,Hora_Salida,Paciente,Tratamiento,Cantidad,Descripcion,Odontologo,Estado})
     
     await Newdate.save()
     res.status(201).json(Newdate)

   } catch (error) {
     res.status(409).json({message: error.message})
   }
}

export const DeleteDate = async (req,res) => 
{
   try {
     const {id} = req.body
     
     const result = await Dates.deleteOne({_id : id})

     if (result.deletedCount === 0)
     {
        return res.status(404).json({message : 'Date not found'})
     }

     res.status(200).json({message: 'Date deleted successfully'})

   } catch (error) {
      res.status(400).json({message: error.message})
   }
}

export const EditDate = async (req,res) =>
{
    try {
        const {_id,Fecha, Hora_Ingreso,Hora_Salida,Paciente, Tratamiento,Cantidad,Descripcion,Odontologo,Estado} = req.body
        const date = await 
        Dates.findByIdAndUpdate(_id,{Fecha, Hora_Ingreso,Hora_Salida,Paciente, Tratamiento,Cantidad,Descripcion,Odontologo,Estado},{new: true})

        if(!date )
        {
            return res.status(404).json({message : 'Date not found'})
        }
      
      res.status(200).json(date)
       
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

export const getDate = async (req, res) => {
   try {
      const { Fecha, Hora_Ingreso, Hora_Salida, Odontologo } = req.body;
      const Estado = 'Pendiente';

      // Buscar citas en la misma fecha con solapamiento en horario
      const date = await Dates.find({
         Fecha,
         Odontologo,
         Estado,
         $or: [
            { 
               Hora_Ingreso: { $lt: Hora_Salida }, // La cita inicia antes de que termine la nueva cita
               Hora_Salida: { $gt: Hora_Ingreso }  // Y termina después de que inicie la nueva cita
            }
         ]
      });

      // Si el array está vacío, no hay solapamiento y el horario está disponible
      res.status(200).json(date);
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
};