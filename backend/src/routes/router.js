import {Router} from 'express';
import {patients,registerpatients,deletePatient,editPatient} from '../controllers/controllerpatients.js';

const router = Router();

router.get('/patients',patients);

router.post('/registerpatients',registerpatients);

router.post('/deletepatient',deletePatient);

router.put('/editpatient',editPatient);




export default router;