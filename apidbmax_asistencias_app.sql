-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: mysql-apidbmax.alwaysdata.net
-- Generation Time: Aug 07, 2025 at 06:09 PM
-- Server version: 10.11.13-MariaDB
-- PHP Version: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `apidbmax_asistencias_app`
--

-- --------------------------------------------------------

--
-- Table structure for table `asistencias`
--

CREATE TABLE `asistencias` (
  `id` int(11) NOT NULL,
  `invitadoId` varchar(100) NOT NULL,
  `eventoId` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `asistio` tinyint(4) DEFAULT 1,
  `nombreUsuario` varchar(100) DEFAULT NULL,
  `empresa` varchar(100) DEFAULT NULL,
  `noEntradas` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `asistencias`
--

INSERT INTO `asistencias` (`id`, `invitadoId`, `eventoId`, `fecha`, `asistio`, `nombreUsuario`, `empresa`, `noEntradas`) VALUES
(1, 'JanetSantos-CentroAgropecuarioEspecializado-4', 4, '2025-08-06 00:00:00', 0, 'Janet Santos', 'Centro Agropecuario Especializado', 1),
(2, 'HugoGarciaRojas-AsadosCalli-4', 4, '2025-08-06 00:00:00', 0, 'Hugo García Rojas', 'Asados Calli', 2),
(3, 'PatriciadelCarmenGamboaDichi-LaNaranjita-4', 4, '2025-08-06 00:00:00', 0, 'Patricia del Carmen Gamboa Dichi', 'La Naranjita', 2),
(4, 'RafaelRodriguezGarcia-Pintusayer-4', 4, '2025-08-06 00:00:00', 0, 'Rafael Rodriguez Garcia', 'Pintusayer', 2),
(5, 'SamuelMoralesJuarez-VinosyLicores-4', 4, '2025-08-06 00:00:00', 0, 'Samuel Morales Juarez', 'Vinos y Licores', 2),
(6, 'JavierMontesGuerrero-MariaSabina-4', 4, '2025-08-06 00:00:00', 0, 'Javier Montes Guerrero', 'María Sabina', 1),
(7, 'GuadalupeCruzSantos-AbarrotesLaEsperancita-4', 4, '2025-08-06 00:00:00', 0, 'Guadalupe Cruz Santos', 'Abarrotes La Esperancita', 2),
(8, 'ManuelSuarez-Barberia2Hermanos-4', 4, '2025-08-06 00:00:00', 0, 'Manuel Suárez', 'Barbería 2 Hermanos', 1),
(9, 'MariaBelemHerreradeJesus-Abastecedora-4', 4, '2025-08-06 00:00:00', 0, 'María Bélem Herrera de Jesus', 'Abastecedora', 2),
(10, 'SaraAguilarNava-PolleriaAgilar-4', 4, '2025-08-06 00:00:00', 0, 'Sara Aguilar Nava', 'Pollería Agilar', 1),
(11, 'MariaDelCarmen-BRUGBESTRONG-4', 4, '2025-08-06 17:12:53', 0, 'María Del Carmen', 'BRUG BE STRONG', 5),
(12, 'MarianaBenitez-GRUPOSERVIEXPRESDETEXMELUCANSADVECV-4', 4, '2025-08-06 00:00:00', 0, 'Mariana Benitez', 'GRUPO SERVIEXPRES DE TEXMELUCAN S.A  DE C.V', 3),
(13, 'RaulIxtlapalePerez-Lumbreras-4', 4, '2025-08-06 00:00:00', 0, 'Raúl Ixtlapale Pérez', 'Lumbreras', 1),
(14, 'BeatrizTzompaHernandez-Contadora-4', 4, '2025-08-06 00:00:00', 0, 'Beatriz Tzompa Hernández', 'Contadora', 3),
(15, 'AristeoGoiz-VeladorasSanFrancisco-4', 4, '2025-08-06 00:00:00', 0, 'Aristeo Goiz', 'Veladoras San Francisco', 1),
(21, 'Lo_Que_la_Inteligencia_Artificial_Puede_Hacer_por_Tu_Negocio…_¡Te_Sorprenderá!_Cecilia_Cante_Morales', 4, '2025-08-06 20:31:24', 0, 'Cecilia Cante Morales', 'Agricola y Servicios CAMO', 2),
(22, 'Lo_Que_la_Inteligencia_Artificial_Puede_Hacer_por_Tu_Negocio…_¡Te_Sorprenderá!_Demo_2__Prueba_', 4, '2025-08-07 16:07:37', 0, 'Demo 2 ', 'Prueba ', 1);

-- --------------------------------------------------------

--
-- Table structure for table `eventos`
--

CREATE TABLE `eventos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `fecha` date NOT NULL,
  `activo` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `eventos`
--

INSERT INTO `eventos` (`id`, `nombre`, `fecha`, `activo`) VALUES
(4, 'Lo Que la Inteligencia Artificial Puede Hacer por Tu Negocio… ¡Te Sorprenderá!', '2025-08-12', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `asistencias`
--
ALTER TABLE `asistencias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `eventoId` (`eventoId`);

--
-- Indexes for table `eventos`
--
ALTER TABLE `eventos`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `asistencias`
--
ALTER TABLE `asistencias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `eventos`
--
ALTER TABLE `eventos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `asistencias`
--
ALTER TABLE `asistencias`
  ADD CONSTRAINT `asistencias_ibfk_1` FOREIGN KEY (`eventoId`) REFERENCES `eventos` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
