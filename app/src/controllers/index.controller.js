import {pool}  from '../config/database.js'
import { leerArchivo, formatoFecha, formatoFechaHora} from '../utils/utils.js'

export const index = (req, res) => {
    res.status(200).json({Mensaje: 'Sistema para el manejo de los resultados electorales'})
}

export const test = async (req, res) => {
    const [result] = await pool.query('SELECT "elecciones_generales" AS resultado')
    res.status(200).json({Mensaje: result[0].resultado})
}

//Carga la información de los archivos csv en tablas
export const cargarTablaTemporal = async (req, res) => {
    const conexion = await pool.getConnection()
    //tablas temporales
    await candidatos(conexion)
    await cargos(conexion)
    await ciudadanos(conexion)
    await departamentos(conexion)
    await mesas(conexion)
    await partidos(conexion)
    await votaciones(conexion) 
    //carga de información de las tablas temporales al modelo
    await cargarModelo(conexion)       
    const[tables] = await conexion.query('SHOW TABLES FROM elecciones_generales')
    conexion.release()
    res.status(200).json({Mensaje:'Carga de datos realizada con éxito', Tablas: tables})
}

//Crea las tablas del modelo
export const crearModelo = async (req, res) => {
    const conexion = await pool.getConnection()

    await conexion.query(
        `CREATE TABLE IF NOT EXISTS CIUDADANO(
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

    await conexion.query(
        `CREATE TABLE IF NOT EXISTS DEPARTAMENTO(
            id_departamento INT NOT NULL AUTO_INCREMENT,
            nombre VARCHAR(25) NOT NULL,
            PRIMARY KEY(id_departamento)
        )`
    )

    await conexion.query(
        `CREATE TABLE IF NOT EXISTS PARTIDO(
            id_partido INT NOT NULL,
            nombre VARCHAR(50) NOT NULL,
            siglas VARCHAR(10) NOT NULL,
            fecha_fundacion DATE NOT NULL,
            PRIMARY KEY(id_partido)
        )`
    )

    await conexion.query(
        `CREATE TABLE IF NOT EXISTS CARGO(
            id_cargo INT NOT NULL,
            cargo VARCHAR(50) NOT NULL,
            PRIMARY KEY(id_cargo)
        )`
    )

    await conexion.query(
        `CREATE TABLE IF NOT EXISTS MESA(
            id_mesa INT NOT NULL AUTO_INCREMENT,
            id_departamento INT NOT NULL,
            PRIMARY KEY(id_mesa),
            FOREIGN KEY(id_departamento) REFERENCES DEPARTAMENTO(id_departamento)
        )`
    )

    await conexion.query(
        `CREATE TABLE IF NOT EXISTS CANDIDATO(
            id_candidato INT NOT NULL,
            nombre_completo VARCHAR(50) NOT NULL,
            fecha_nacimiento DATE NOT NULL,
            id_partido INT NOT NULL,
            id_cargo INT NOT NULL,
            PRIMARY KEY(id_candidato),
            FOREIGN KEY(id_partido) REFERENCES PARTIDO(id_partido),
            FOREIGN KEY(id_cargo) REFERENCES CARGO(id_cargo)
        )`
    )

    await conexion.query(
        `CREATE TABLE IF NOT EXISTS VOTO(
            id_voto INT NOT NULL AUTO_INCREMENT,
            dpi VARCHAR(13) NOT NULL,
            id_mesa INT NOT NULL,
            fecha_hora DATETIME NOT NULL,
            PRIMARY KEY(id_voto),
            FOREIGN KEY(dpi) REFERENCES CIUDADANO(dpi),
            FOREIGN KEY(id_mesa) REFERENCES MESA(id_mesa)
        )`
    )

    await conexion.query(
        `CREATE TABLE IF NOT EXISTS DETALLE_VOTO(
            id_detalle INT NOT NULL AUTO_INCREMENT,
            id_voto INT NOT NULL,
            id_candidato INT NOT NULL,
            PRIMARY KEY(id_detalle),
            FOREIGN KEY(id_voto) REFERENCES VOTO(id_voto),
            FOREIGN KEY(id_candidato) REFERENCES CANDIDATO(id_candidato)
        )`
    )
    
    const [tables] = await conexion.query('SHOW TABLES FROM elecciones_generales')
    conexion.release()
    res.status(200).json({Mensaje: 'Modelo de datos creado con éxito', Tablas: tables})
}

export const eliminarModelo = async (req, res) => {
    const conexion = await pool.getConnection()
    await conexion.query('DROP TABLE IF EXISTS DETALLE_VOTO')
    await conexion.query('DROP TABLE IF EXISTS VOTO')
    await conexion.query('DROP TABLE IF EXISTS CANDIDATO')
    await conexion.query('DROP TABLE IF EXISTS MESA')
    await conexion.query('DROP TABLE IF EXISTS CARGO')
    await conexion.query('DROP TABLE IF EXISTS PARTIDO')
    await conexion.query('DROP TABLE IF EXISTS DEPARTAMENTO')
    await conexion.query('DROP TABLE IF EXISTS CIUDADANO')
    const [tables] = await conexion.query('SHOW TABLES FROM elecciones_generales')
    
    conexion.release()
    res.status(200).json({Mensaje: 'Modelo de datos eliminado correctamente', Tablas: tables})
}

//Carga los datos de las tablas temporales al modelo
async function cargarModelo(conexion){
    await conexion.query('INSERT INTO CIUDADANO SELECT * FROM TMP_CIUDADANO')
    
    await conexion.query('INSERT INTO DEPARTAMENTO(nombre) SELECT nombre FROM TMP_DEPARTAMENTO')
    
    await conexion.query('INSERT INTO PARTIDO SELECT * FROM TMP_PARTIDO')

    await conexion.query('INSERT INTO CARGO SELECT * FROM TMP_CARGO')

    await conexion.query('INSERT INTO MESA(id_departamento) SELECT id_departamento FROM TMP_MESA')

    await conexion.query('INSERT INTO CANDIDATO SELECT * FROM TMP_CANDIDATO')

    await conexion.query('INSERT INTO VOTO(dpi, id_mesa, fecha_hora) SELECT DISTINCT dpi_ciudadano, id_mesa, fecha_hora FROM TMP_VOTACION')
    
    await conexion.query('INSERT INTO DETALLE_VOTO(id_voto, id_candidato) SELECT id_voto, id_candidato FROM TMP_VOTACION')
}

async function candidatos(conexion) {
    const datos = leerArchivo('./src/data/candidatos.csv').map(([id, nombreCompleto, fechaNacimiento, idPartido, idCargo]) => 
        ([parseInt(id), nombreCompleto, formatoFecha(fechaNacimiento), parseInt(idPartido), parseInt(idCargo)])
    )
    await conexion.query(
        `CREATE TEMPORARY TABLE TMP_CANDIDATO(
            id_candidato INT NOT NULL,
            nombre_completo VARCHAR(50) NOT NULL,
            fecha_nacimiento DATE NOT NULL,
            id_partido INT NOT NULL,
            id_cargo INT NOT NULL,
            PRIMARY KEY(id_candidato)
        )`
    )

    await conexion.query('INSERT INTO TMP_CANDIDATO VALUES ?', [datos])
}

async function cargos(conexion) {
    const datos = leerArchivo('./src/data/cargos.csv').map(([idCargo, cargo]) => 
        ([parseInt(idCargo), cargo])
    )
    await conexion.query(
        `CREATE TEMPORARY TABLE TMP_CARGO(
            id_cargo INT NOT NULL,
            cargo VARCHAR(50) NOT NULL,
            PRIMARY KEY(id_cargo)
        )`
    )
    await conexion.query('INSERT INTO TMP_CARGO VALUES ?', [datos])
}

async function ciudadanos(conexion) {
    const datos = leerArchivo('./src/data/ciudadanos.csv').map(([dpi, nombre, apellido, direccion, telefono, edad, genero]) =>
        ([dpi, nombre, apellido, direccion, telefono, parseInt(edad), genero])
    )
    await conexion.query(
        `CREATE TEMPORARY TABLE TMP_CIUDADANO(
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
    await conexion.query('INSERT INTO TMP_CIUDADANO VALUES ?', [datos])
}

async function departamentos(conexion) {
    const datos = leerArchivo('./src/data/departamentos.csv').map(([idDepartamento, nombre]) =>
        ([
            parseInt(idDepartamento), 
            nombre
        ])
    )
    await conexion.query(
        `CREATE TEMPORARY TABLE TMP_DEPARTAMENTO(
            id_departamento INT NOT NULL,
            nombre VARCHAR(25) NOT NULL,
            PRIMARY KEY(id_departamento)
        )`
    )
    await conexion.query('INSERT INTO TMP_DEPARTAMENTO VALUES ?', [datos])
}

async function mesas(conexion) {
    const datos = leerArchivo('./src/data/mesas.csv').map(([idMesa, idDepartamento]) => 
        ([
            parseInt(idMesa), 
            parseInt(idDepartamento)
        ])
    )
    await conexion.query(
        `CREATE TEMPORARY TABLE TMP_MESA(
            id_mesa INT NOT NULL,
            id_departamento INT NOT NULL,
            PRIMARY KEY(id_mesa)
        )`
    )
    await conexion.query('INSERT INTO TMP_MESA VALUES ?', [datos])
}

async function partidos(conexion) {
    const datos = leerArchivo('./src/data/partidos.csv').map(([idPartido, nombre, siglas, fechaFundacion]) => 
        ([
            parseInt(idPartido), 
            nombre, 
            siglas, 
            formatoFecha(fechaFundacion)
        ])
    )
    await conexion.query(
        `CREATE TEMPORARY TABLE TMP_PARTIDO(
            id_partido INT NOT NULL,
            nombre VARCHAR(50) NOT NULL,
            siglas VARCHAR(10) NOT NULL,
            fecha_fundacion DATE NOT NULL,
            PRIMARY KEY(id_partido)
        )`
    )   
    await conexion.query('INSERT INTO TMP_PARTIDO VALUES ?', [datos])
}

async function votaciones(conexion) {
    const datos = leerArchivo('./src/data/votaciones.csv').map(([idVoto, idCandidato, dpiCiudadano, idMesa, fechaHora]) =>
        [
            parseInt(idVoto), 
            parseInt(idCandidato), 
            dpiCiudadano, 
            parseInt(idMesa), 
            formatoFechaHora(fechaHora)
        ]
    )
    await conexion.query(
        `CREATE TEMPORARY TABLE TMP_VOTACION(
            id_votacion INT NOT NULL AUTO_INCREMENT,
            id_voto INT NOT NULL,
            id_candidato INT NOT NULL,
            dpi_ciudadano VARCHAR(13) NOT NULL,
            id_mesa INT NOT NULL,
            fecha_hora DATETIME NOT NULL,
            PRIMARY KEY(id_votacion)
        )`
    )
    await conexion.query('INSERT INTO TMP_VOTACION(id_voto, id_candidato, dpi_ciudadano, id_mesa, fecha_hora) VALUES ?', [datos])
}
