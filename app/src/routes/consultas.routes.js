import { Router } from "express"
import { consulta1 } from "../controllers/consultas.controller.js"

const router = Router()

router.get('/consulta1', consulta1)

export default router
