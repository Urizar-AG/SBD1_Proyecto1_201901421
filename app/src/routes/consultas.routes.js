import { Router } from "express"
import { consulta1, consulta2, consulta3, consulta4 } from "../controllers/consultas.controller.js"

const router = Router()

router.get('/consulta1', consulta1)
router.get('/consulta2', consulta2)
router.get('/consulta3', consulta3)
router.get('/consulta4', consulta4)

export default router
