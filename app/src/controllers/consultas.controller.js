import {pool}  from '../config/database.js'

export const consulta1 = async (req, res) => {
    const [result] = await pool.query(
        `SELECT 
            nombre AS Partido,
            (SELECT nombre_completo FROM CANDIDATO WHERE id_cargo = 1 AND PARTIDO.id_partido = id_partido) AS Presidente,
            (SELECT nombre_completo FROM CANDIDATO WHERE id_cargo = 2 AND PARTIDO.id_partido = id_partido) AS Vicepresidente
        FROM PARTIDO 
        WHERE id_partido > -1;`
    )
    res.status(200).json({Mensaje: 'Consulta 1 realizada con éxito', Registros: result})
}
