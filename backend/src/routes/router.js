import {Router} from 'express';
import {getUsers,registerUser } from '../controllers/controllerUser.js'; 
import {patients,registerpatients,deletePatient,editPatient} from '../controllers/controllerpatients.js';
import {inventory,registerProduct,deleteProduct,editProduct} from '../controllers/controllerInventory.js';
import {dates,RegisterDates,DeleteDate,EditDate,getDate} from '../controllers/controllerDates.js'
import {treatments,registerTreatments} from '../controllers/controllertreatments.js';
import {DatesperPatient,DatesCanceled,serviceRevenue,getComplaints,
    registerComplaint,getComplaintsPerMonth,PatientsDropouts,
    NewPatients, NewPatientsByYear, FreeHoursPerDoctor} from '../controllers/controllerReports.js';


const router = Router();

router.post('/users',getUsers);

router.post('/registeruser',registerUser);

router.get('/patients',patients);

router.get('/patients/:id',DatesperPatient);

router.get('/Newpatients/:date',NewPatients);

router.get('/NewYpatients/:year',NewPatientsByYear);

router.post('/registerpatients',registerpatients);

router.post('/deletepatient',deletePatient);

router.put('/editpatient',editPatient);

router.get('/inventory',inventory);

router.post('/registerproduct',registerProduct);

router.post('/deleteproduct',deleteProduct);

router.put('/editproduct',editProduct);

router.get('/dates',dates)

router.get('/dates/canceled',DatesCanceled)

router.post('/dates/especificDate', getDate )

router.get('/freeHours/:date', FreeHoursPerDoctor)

router.post('/registerdate', RegisterDates)

router.post('/deletedate', DeleteDate)

router.put('/editdate', EditDate)

router.get('/treatments',treatments)

router.post('/registertreatments',registerTreatments)

router.get("/services/:date", serviceRevenue);

router.get("/complaints", getComplaints);

router.get("/complaints/:date", getComplaintsPerMonth);

router.post("/registercomplaint", registerComplaint);

router.get("/dropouts", PatientsDropouts);

export default router;