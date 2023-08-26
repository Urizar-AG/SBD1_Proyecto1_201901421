import express from 'express'
import consultasRoutes from './src/routes/consultas.routes.js'
import indexRoutes from './src/routes/index.routes.js'

const app = express()
app.disable('x-powered-by')

app.use(indexRoutes)
app.use(consultasRoutes)

app.use((req, res, next) => {
    res.status(404).json({
        message: '404 - No se encontró el recurso solicitado'
    })
})

app.listen(3000, () => {
    console.log('Server running on port 3000')
})
