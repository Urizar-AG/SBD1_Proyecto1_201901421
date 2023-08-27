import {pool}  from '../config/database.js'

export const index = (req, res) => {
    res.json({
        title: 'Proyecto 1',
        message: 'Sistema para el manejo de los resultados electorales'
    })
}

export const test = async (req, res) => {
    const [result] = await pool.query('SELECT "elecciones_generales" AS resultado')
    res.json(result[0])
}
