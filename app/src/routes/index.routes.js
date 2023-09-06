import { Router } from "express"
import { index, cargarTablaTemporal, crearModelo, eliminarModelo, test} from "../controllers/index.controller.js"

const router = Router()

router.get('/', index)
router.get('/test', test)
router.get('/cargartabtemp', cargarTablaTemporal)
router.get('/crearmodelo', crearModelo)
router.get('/eliminarModelo', eliminarModelo)

export default router
