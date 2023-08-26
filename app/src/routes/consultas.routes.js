import { Router } from "express"
import { consulta } from "../controllers/consultas.controllers.js"

const router = Router()

router.get('/consulta', consulta)

export default router
