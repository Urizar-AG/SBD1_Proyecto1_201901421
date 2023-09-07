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

export const consulta6 = async(req, res) => {
    const [result] = await pool.query(
        `SELECT COUNT(id_candidato) AS "Votos Nulos"
        FROM DETALLE_VOTO
        WHERE id_candidato = -1;
        `
    )
    res.status(200).json({Mensaje: 'Consulta 6 realizada con éxito', Registros: result})
}

export const consulta7 = async(req, res) => {
    const [result] = await pool.query(
        `SELECT 
            edad AS Edad,
            COUNT(edad) AS Votantes
        FROM CIUDADANO
        GROUP BY edad
        ORDER BY Votantes DESC
        LIMIT 10;
        `
    )
    res.status(200).json({Mensaje: 'Consulta 7 realizada con éxito', Registros: result})
}
