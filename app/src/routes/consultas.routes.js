import { Router } from "express"
import { consulta } from "../controllers/consultas.controller.js"

const router = Router()

router.get('/consulta', consulta)

export default router
