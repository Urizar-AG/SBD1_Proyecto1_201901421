import {pool}  from '../config/database.js'
import { leerArchivo, formatoFecha, formatoFechaHora} from '../utils/utils.js'

export const index = (req, res) => {
    res.status(200).json({Mensaje: 'Sistema para el manejo de los resultados electorales'})
}

export const test = async (req, res) => {
    const [result] = await pool.query('SELECT "elecciones_generales" AS resultado')
    res.status(200).json({Mensaje: result[0].resultado})
}

//Carga la información de los archivos csv en tablas temporales
export const cargarTablaTemporal = async (req, res) => {
   
    await candidatos()
    await cargos()
    await ciudadanos()
    await departamentos()
    await mesas()
    await partidos()
    await votaciones()        
    const[tables] = await pool.query('SHOW TABLES FROM elecciones_generales')
    res.status(200).json({Mensaje:'Carga de datos realizada con éxito', Tablas: tables})
}

//Elimina las tablas temporales
export const eliminarTablaTemporal = async (req, res) => {
    
    await pool.query('DROP TABLE IF EXISTS TMP_CANDIDATO')
    await pool.query('DROP TABLE IF EXISTS TMP_CARGO')
    await pool.query('DROP TABLE IF EXISTS TMP_CIUDADANO')
    await pool.query('DROP TABLE IF EXISTS TMP_DEPARTAMENTO')
    await pool.query('DROP TABLE IF EXISTS TMP_MESA')
    await pool.query('DROP TABLE IF EXISTS TMP_PARTIDO')
    await pool.query('DROP TABLE IF EXISTS TMP_VOTACION')

    const [tables] = await pool.query('SHOW TABLES FROM elecciones_generales')
    res.status(200).json({Mensaje: 'Tablas temporales eliminadas correctamente', Tablas: tables})
}

async function candidatos() {
    const datos = leerArchivo('./src/data/candidatos.csv').map(([id, nombreCompleto, fechaNacimiento, idPartido, idCargo]) => 
        ([parseInt(id), nombreCompleto, formatoFecha(fechaNacimiento), parseInt(idPartido), parseInt(idCargo)])
    )
    await pool.query(
        `CREATE TABLE IF NOT EXISTS TMP_CANDIDATO(
            id_candidato INT NOT NULL,
            nombre_completo VARCHAR(50) NOT NULL,
            fecha_nacimiento DATE NOT NULL,
            id_partido INT NOT NULL,
            id_cargo INT NOT NULL,
            PRIMARY KEY(id_candidato)
        )`
    )

    await pool.query('INSERT INTO TMP_CANDIDATO VALUES ?', [datos])
}

async function cargos() {
    const datos = leerArchivo('./src/data/cargos.csv').map(([idCargo, cargo]) => 
        ([parseInt(idCargo), cargo])
    )
    await pool.query(
        `CREATE TABLE IF NOT EXISTS TMP_CARGO(
            id_cargo INT NOT NULL,
            cargo VARCHAR(50) NOT NULL,
            PRIMARY KEY(id_cargo)
        )`
    )
    await pool.query('INSERT INTO TMP_CARGO VALUES ?', [datos])
}

async function ciudadanos() {
    const datos = leerArchivo('./src/data/ciudadanos.csv').map(([dpi, nombre, apellido, direccion, telefono, edad, genero]) =>
        ([dpi, nombre, apellido, direccion, telefono, parseInt(edad), genero])
    )
    await pool.query(
        `CREATE TABLE IF NOT EXISTS TMP_CIUDADANO(
            dpi VARCHAR(13) NOT NULL,
            nombre VARCHAR(25) NOT NULL,
            apellido VARCHAR(25) NOT NULL,
            direccion VARCHAR(50) NOT NULL,
            telefono VARCHAR(10) NOT NULL,
            edad INT NOT NULL,
            genero CHAR(1) NOT NULL,
            PRIMARY KEY(dpi)
        )`
    )
    await pool.query('INSERT INTO TMP_CIUDADANO VALUES ?', [datos])
}

async function departamentos() {
    const datos = leerArchivo('./src/data/departamentos.csv').map(([idDepartamento, nombre]) =>
        ([
            parseInt(idDepartamento), 
            nombre
        ])
    )
    await pool.query(
        `CREATE TABLE IF NOT EXISTS TMP_DEPARTAMENTO(
            id_departamento INT NOT NULL,
            nombre VARCHAR(25) NOT NULL,
            PRIMARY KEY(id_departamento)
        )`
    )
    await pool.query('INSERT INTO TMP_DEPARTAMENTO VALUES ?', [datos])
}

async function mesas() {
    const datos = leerArchivo('./src/data/mesas.csv').map(([idMesa, idDepartamento]) => 
        ([
            parseInt(idMesa), 
            parseInt(idDepartamento)
        ])
    )
    await pool.query(
        `CREATE TABLE IF NOT EXISTS TMP_MESA(
            id_mesa INT NOT NULL,
            id_departamento INT NOT NULL,
            PRIMARY KEY(id_mesa)
        )`
    )
    await pool.query('INSERT INTO TMP_MESA VALUES ?', [datos])
}

async function partidos() {
    const datos = leerArchivo('./src/data/partidos.csv').map(([idPartido, nombre, siglas, fechaFundacion]) => 
        ([
            parseInt(idPartido), 
            nombre, 
            siglas, 
            formatoFecha(fechaFundacion)
        ])
    )
    await pool.query(
        `CREATE TABLE IF NOT EXISTS TMP_PARTIDO(
            id_partido INT NOT NULL,
            nombre VARCHAR(50) NOT NULL,
            siglas VARCHAR(10) NOT NULL,
            fecha_fundacion DATE NOT NULL,
            PRIMARY KEY(id_partido)
        )`
    )   
    await pool.query('INSERT INTO TMP_PARTIDO VALUES ?', [datos])
}

async function votaciones() {
    const datos = leerArchivo('./src/data/votaciones.csv').map(([idVoto, idCandidato, dpiCiudadano, idMesa, fechaHora]) =>
        [
            parseInt(idVoto), 
            parseInt(idCandidato), 
            dpiCiudadano, 
            parseInt(idMesa), 
            formatoFechaHora(fechaHora)
        ]
    )
    await pool.query(
        `CREATE TABLE IF NOT EXISTS TMP_VOTACION(
            id_votacion INT NOT NULL AUTO_INCREMENT,
            id_voto INT NOT NULL,
            id_candidato INT NOT NULL,
            dpi_ciudadano VARCHAR(13) NOT NULL,
            id_mesa INT NOT NULL,
            fecha_hora DATETIME NOT NULL,
            PRIMARY KEY(id_votacion)
        )`
    )
    await pool.query('INSERT INTO TMP_VOTACION(id_voto, id_candidato, dpi_ciudadano, id_mesa, fecha_hora) VALUES ?', [datos])
}
