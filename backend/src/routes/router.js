import {Router} from 'express';
import {patients,registerpatients,deletePatient,editPatient} from '../controllers/controllerpatients.js';
import {inventory,registerProduct,deleteProduct,editProduct} from '../controllers/controllerInventory.js';
import {dates,RegisterDates,DeleteDate,EditDate} from '../controllers/controllerDates.js'

const router = Router();

router.get('/patients',patients);

router.post('/registerpatients',registerpatients);

router.post('/deletepatient',deletePatient);

router.put('/editpatient',editPatient);

router.get('/inventory',inventory);

router.post('/registerproduct',registerProduct);

router.post('/deleteproduct',deleteProduct);

router.put('/editproduct',editProduct);

router.get('/dates',dates)

router.post('/registerdate', RegisterDates)

router.post('/deletedate', DeleteDate)

router.put('/editdate', EditDate)

export default router;