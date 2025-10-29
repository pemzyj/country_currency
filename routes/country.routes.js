import { Router } from "express"; 
import { refreshCountries, getAllCountries,getCountryByName, deleteCountry, getStatus, getImage } from "../controllers/country.controller.js";

const router = Router();

router.post('/refresh', refreshCountries);
router.get('/image', getImage);
router.get('/status', getStatus);
router.get('/:name', getCountryByName);
router.delete('/:name', deleteCountry);
router.get('/', getAllCountries);

export default router;

