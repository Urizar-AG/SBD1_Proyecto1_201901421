import {pool}  from '../config/database.js'

export const consulta1 = async (req, res) => {
    const [result] = await pool.query(
        `SELECT 
            nombre AS Partido,
            (SELECT nombre_completo FROM CANDIDATO WHERE id_cargo = 1 AND PARTIDO.id_partido = id_partido) AS Presidente,
            (SELECT nombre_completo FROM CANDIDATO WHERE id_cargo = 2 AND PARTIDO.id_partido = id_partido) AS Vicepresidente
        FROM PARTIDO 
        WHERE id_partido > -1;
        `
    )
    res.status(200).json({Mensaje: 'Consulta 1 realizada con éxito', Registros: result})
}

export const consulta2 = async(req, res) => {
    const [result] = await pool.query(
        `SELECT 
            nombre AS Partido,
            (SELECT COUNT(id_cargo) FROM CANDIDATO WHERE (id_cargo BETWEEN 3 AND 5) AND PARTIDO.id_partido = id_partido) AS Diputados
        FROM PARTIDO 
        WHERE id_partido > -1;
        `
    )
    res.status(200).json({Mensaje: 'Consulta 2 realizada con éxito', Registros: result})
}

export const consulta3 = async(req, res) => {
    const [result] = await pool.query(
        `SELECT 
            nombre AS Partido,
            (SELECT nombre_completo FROM CANDIDATO WHERE id_cargo = 6 AND PARTIDO.id_partido = id_partido) AS Alcalde
        FROM PARTIDO
        WHERE id_partido > -1;
        `
    )
    res.status(200).json({Mensaje: 'Consulta 3 realizada con éxito', Registros: result})
}

export const consulta4 = async(req, res) => {
    const [result] = await pool.query(
        `SELECT 
            nombre AS Partido,
            COUNT(id_cargo) AS "Total Candidatos"
        FROM PARTIDO
        INNER JOIN CANDIDATO
        ON CANDIDATO.id_partido = PARTIDO.id_partido
        WHERE PARTIDO.id_partido > -1
        GROUP BY Partido;
        `
    )
    res.status(200).json({Mensaje: 'Consulta 4 realizada con éxito', Registros: result})
}
