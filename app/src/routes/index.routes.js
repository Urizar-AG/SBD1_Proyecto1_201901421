import { Router } from "express"
import { index, test } from "../controllers/index.controller.js"

const router = Router()

router.get('/', index)
router.get('/test', test)

export default router
