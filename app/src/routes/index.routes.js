import { Router } from "express"
import { index, cargarTablaTemporal, test} from "../controllers/index.controller.js"

const router = Router()

router.get('/', index)
router.get('/test', test)
router.get('/cargartabtemp', cargarTablaTemporal)

export default router
