CREATE DATABASE IF NOT EXISTS elecciones_generales;

USE elecciones_generales;

--------------------------------------------------------------- TABLAS TEMPORALES ---------------------------------------------------------------
CREATE TEMPORARY TABLE TMP_CANDIDATO(
	id_candidato INT NOT NULL,
    nombre_completo VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    id_partido INT NOT NULL,
    id_cargo INT NOT NULL,
    PRIMARY KEY(id_candidato)
);

CREATE TEMPORARY TABLE TMP_CARGO(
	id_cargo INT NOT NULL,
    cargo VARCHAR(50) NOT NULL,
    PRIMARY KEY(id_cargo)
);

CREATE TEMPORARY TABLE TMP_CIUDADANO(
    dpi VARCHAR(13) NOT NULL,
    nombre VARCHAR(25) NOT NULL,
    apellido VARCHAR(25) NOT NULL,
    direccion VARCHAR(50) NOT NULL,
    telefono VARCHAR(10) NOT NULL,
    edad INT NOT NULL,
    genero CHAR(1) NOT NULL,
    PRIMARY KEY(dpi)
);

CREATE TEMPORARY TABLE TMP_DEPARTAMENTO(
    id_departamento INT NOT NULL,
    nombre VARCHAR(25) NOT NULL,
    PRIMARY KEY(id_departamento)
);

CREATE TEMPORARY TABLE TMP_MESA(
    id_mesa INT NOT NULL,
    id_departamento INT NOT NULL,
    PRIMARY KEY(id_mesa)
);

CREATE TEMPORARY TABLE TMP_PARTIDO(
    id_partido INT NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    siglas VARCHAR(10) NOT NULL,
    fecha_fundacion DATE NOT NULL,
    PRIMARY KEY(id_partido)
);

CREATE TEMPORARY TABLE TMP_VOTACION(
    id_votacion INT NOT NULL,
    id_voto INT NOT NULL,
    id_candidato INT NOT NULL,
    dpi_ciudadano VARCHAR(13) NOT NULL,
    id_mesa INT NOT NULL,
    fecha_hora DATETIME NOT NULL,
    PRIMARY KEY(id_votacion)
);

DROP TABLE IF EXISTS TMP_CANDIDATO;
DROP TABLE IF EXISTS TMP_CARGO;
DROP TABLE IF EXISTS TMP_CIUDADANO;
DROP TABLE IF EXISTS TMP_DEPARTAMENTO;
DROP TABLE IF EXISTS TMP_MESA;
DROP TABLE IF EXISTS TMP_PARTIDO;
DROP TABLE IF EXISTS TMP_VOTACION;

--------------------------------------------------------------------- MODELO --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS CIUDADANO(
    dpi VARCHAR(13) NOT NULL,
    nombre VARCHAR(25) NOT NULL,
    apellido VARCHAR(25) NOT NULL,
    direccion VARCHAR(50) NOT NULL,
    telefono VARCHAR(10) NOT NULL,
    edad INT NOT NULL,
    genero CHAR(1) NOT NULL,
    PRIMARY KEY(dpi)
);

CREATE TABLE IF NOT EXISTS DEPARTAMENTO(
    id_departamento INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(25) NOT NULL,
    PRIMARY KEY(id_departamento)
);

CREATE TABLE IF NOT EXISTS PARTIDO(
    id_partido INT NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    siglas VARCHAR(10) NOT NULL,
    fecha_fundacion DATE NOT NULL,
    PRIMARY KEY(id_partido)
);

CREATE TABLE IF NOT EXISTS CARGO(
	id_cargo INT NOT NULL,
    cargo VARCHAR(50) NOT NULL,
    PRIMARY KEY(id_cargo)
);

CREATE TABLE IF NOT EXISTS MESA(
    id_mesa INT NOT NULL AUTO_INCREMENT,
    id_departamento INT NOT NULL,
    PRIMARY KEY(id_mesa),
    FOREIGN KEY(id_departamento) REFERENCES DEPARTAMENTO(id_departamento)
);

CREATE TABLE IF NOT EXISTS CANDIDATO(
	id_candidato INT NOT NULL,
    nombre_completo VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    id_partido INT NOT NULL,
    id_cargo INT NOT NULL,
    PRIMARY KEY(id_candidato),
    FOREIGN KEY(id_partido) REFERENCES PARTIDO(id_partido),
    FOREIGN KEY(id_cargo) REFERENCES CARGO(id_cargo)
);

CREATE TABLE IF NOT EXISTS VOTO(
    id_voto INT NOT NULL AUTO_INCREMENT,
    dpi VARCHAR(13) NOT NULL,
    id_mesa INT NOT NULL,
    fecha_hora DATETIME NOT NULL,
    PRIMARY KEY(id_voto),
    FOREIGN KEY(dpi) REFERENCES CIUDADANO(dpi),
    FOREIGN KEY(id_mesa) REFERENCES MESA(id_mesa)
);

CREATE TABLE IF NOT EXISTS DETALLE_VOTO(
    id_detalle INT NOT NULL AUTO_INCREMENT,
    id_voto INT NOT NULL,
    id_candidato INT NOT NULL,
    PRIMARY KEY(id_detalle),
    FOREIGN KEY(id_voto) REFERENCES VOTO(id_voto),
    FOREIGN KEY(id_candidato) REFERENCES CANDIDATO(id_candidato)
);

DROP TABLE IF EXISTS DETALLE_VOTO;
DROP TABLE IF EXISTS VOTO;
DROP TABLE IF EXISTS CANDIDATO;
DROP TABLE IF EXISTS MESA;
DROP TABLE IF EXISTS CARGO;
DROP TABLE IF EXISTS PARTIDO;
DROP TABLE IF EXISTS DEPARTAMENTO;
DROP TABLE IF EXISTS CIUDADANO;

----------------------------------------------------------------- CARGA DE DATOS ----------------------------------------------------------------
INSERT INTO CIUDADANO 
SELECT * 
FROM TMP_CIUDADANO;

INSERT INTO DEPARTAMENTO(nombre) 
SELECT nombre 
FROM TMP_DEPARTAMENTO;

INSERT INTO PARTIDO 
SELECT * 
FROM TMP_PARTIDO;

INSERT INTO CARGO 
SELECT * 
FROM TMP_CARGO;

INSERT INTO MESA(id_departamento) 
SELECT id_departamento 
FROM TMP_MESA;

INSERT INTO CANDIDATO 
SELECT * 
FROM TMP_CANDIDATO;

INSERT INTO VOTO(dpi, id_mesa, fecha_hora) 
SELECT DISTINCT dpi_ciudadano, id_mesa, fecha_hora 
FROM TMP_VOTACION;

INSERT INTO DETALLE_VOTO(id_voto, id_candidato) 
SELECT id_voto, id_candidato 
FROM TMP_VOTACION;

------------------------------------------------------------------- CONSULTAS ------------------------------------------------------------------

-- consulta 1
SELECT 
	nombre AS Partido,
	(SELECT nombre_completo FROM CANDIDATO WHERE id_cargo = 1 AND PARTIDO.id_partido = id_partido) AS Presidente,
    (SELECT nombre_completo FROM CANDIDATO WHERE id_cargo = 2 AND PARTIDO.id_partido = id_partido) AS Vicepresidente
FROM PARTIDO 
WHERE id_partido > -1;

-- consulta 2
SELECT 
	nombre AS Partido,
    (SELECT COUNT(id_cargo) FROM CANDIDATO WHERE (id_cargo BETWEEN 3 AND 5) AND PARTIDO.id_partido = id_partido) AS Diputados
FROM PARTIDO 
WHERE id_partido > -1;

-- consulta 3
SELECT 
	nombre AS Partido,
    (SELECT nombre_completo FROM CANDIDATO WHERE id_cargo = 6 AND PARTIDO.id_partido = id_partido) AS Alcalde
FROM PARTIDO
WHERE id_partido > -1;

-- consulta 4
SELECT 
	nombre AS Partido,
	COUNT(id_cargo) AS "Total Candidatos"
FROM PARTIDO
INNER JOIN CANDIDATO
ON CANDIDATO.id_partido = PARTIDO.id_partido
WHERE PARTIDO.id_partido > -1
GROUP BY Partido;

-- consulta 5
SELECT 
	nombre AS Departamento,
	CAST(SUM((SELECT COUNT(id_mesa) FROM VOTO WHERE MESA.id_mesa = id_mesa)) AS UNSIGNED) AS Votos
FROM MESA
INNER JOIN DEPARTAMENTO 
ON DEPARTAMENTO.id_departamento = MESA.id_departamento
GROUP BY nombre;

-- consulta 6
SELECT COUNT(DISTINCT id_voto) AS "Votos Nulos"
FROM DETALLE_VOTO
WHERE id_candidato = -1;

-- consulta 7
SELECT 
	edad AS Edad,
	COUNT(edad) AS Votantes
FROM CIUDADANO
GROUP BY edad
ORDER BY Votantes DESC
LIMIT 10;

-- consulta 8
SELECT 
	nombre_completo AS Presidente,
	(SELECT nombre_completo FROM CANDIDATO C WHERE CANDIDATO.id_partido = C.id_partido AND C.id_cargo = 2) AS Vicepresidente,
	COUNT(DETALLE_VOTO.id_candidato) AS Votos
FROM DETALLE_VOTO
INNER JOIN CANDIDATO
ON CANDIDATO.id_candidato = DETALLE_VOTO.id_candidato
WHERE CANDIDATO.id_cargo = 1
GROUP BY DETALLE_VOTO.id_candidato
ORDER BY Votos DESC
LIMIT 10;

-- consulta 9
SELECT 
	id_mesa AS "No.Mesa", 
	nombre AS Departamento,
	(SELECT COUNT(id_mesa) FROM VOTO WHERE MESA.id_mesa = id_mesa) AS Votantes
FROM MESA
INNER JOIN DEPARTAMENTO 
ON DEPARTAMENTO.id_departamento = MESA.id_departamento
ORDER BY Votantes DESC
LIMIT 5;

-- consulta 10
SELECT 
	TIME_FORMAT(TIME(fecha_hora), '%H:%i') AS Hora,
	COUNT(fecha_hora) AS Votantes
FROM VOTO
GROUP BY fecha_hora
ORDER BY Votantes DESC
LIMIT 5;

-- consulta 11
SELECT 
	genero AS Genero,
	COUNT(id_voto) AS "Cantidad Votantes"
FROM VOTO
INNER JOIN CIUDADANO
ON CIUDADANO.dpi = VOTO.dpi
GROUP BY genero;
