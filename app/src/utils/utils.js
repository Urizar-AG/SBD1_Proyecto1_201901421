import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'

export const leerArchivo = function (ruta) {
    const contenido = readFileSync(ruta, 'utf-8')
    const csv = parse(contenido, {
        trim: true,
    })
    csv.shift()
    return csv
}

export const formatoFecha = function (fecha) {
    return fecha.split('/').reverse().join('-')
}

export const formatoFechaHora = function (fechaHora) {
    const [fecha, hora] = fechaHora.split(' ')
    return [formatoFecha(fecha), hora.padStart(5, '0')].join(' ').concat(':00')
}
