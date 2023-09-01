import { Router } from "express"
import { index, cargarTablaTemporal, eliminarTablaTemporal, crearModelo, test} from "../controllers/index.controller.js"

const router = Router()

router.get('/', index)
router.get('/test', test)
router.get('/cargartabtemp', cargarTablaTemporal)
router.get('/eliminartabtemp', eliminarTablaTemporal)
router.get('/crearmodelo', crearModelo)

export default router
