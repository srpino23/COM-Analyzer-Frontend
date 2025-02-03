import React, { useEffect, useState, useRef } from "react";
import { FixedSizeList as List } from "react-window";
import { FaDownload } from "react-icons/fa6";

import styles from "./home.module.css";

const Home = () => {
  const [reports, setReports] = useState([]);
  const [devices, setDevices] = useState([]);
  const [maintenanceCount, setMaintenanceCount] = useState(0);

  const pieCanvasRef = useRef(null);
  const barCanvasRef = useRef(null);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/camera/getCameras`
      );
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      console.error(`Error fetching data:`, error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/report/getReports`
      );
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchReports();
  }, []);

  const processData = () => {
    const statusCount = { online: 0, warning: 0, offline: 0, maintenance: 0 };
    const zoneData = {};

    devices.forEach((device) => {
      const { status, zone } = device;

      // Normalizar zonas (ignorando mayúsculas/minúsculas)
      const normalizedZone = zone.toLowerCase();

      statusCount[status] = (statusCount[status] || 0) + 1;

      if (!zoneData[normalizedZone]) {
        zoneData[normalizedZone] = {
          online: 0,
          warning: 0,
          offline: 0,
          maintenance: 0,
        };
      }
      zoneData[normalizedZone][status] += 1;
    });

    return { statusCount, zoneData };
  };

  useEffect(() => {
    if (devices.length > 0) {
      drawPieChart();
      drawBarChart();
    }
  }, [devices]);

  const drawPieChart = () => {
    const { statusCount } = processData();
    const canvas = pieCanvasRef.current;
    const ctx = canvas.getContext("2d");

    const filteredStatusCount = { ...statusCount };

    const total = Object.values(filteredStatusCount).reduce((a, b) => a + b, 0);
    const colors = ["#4CAF50", "#FFC107", "#F44336", "#2196F3"];
    const statuses = [
      "En linea",
      "Advertencia",
      "Fuera de linea",
      "Mantenimiento",
    ];
    let startAngle = 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar los sectores del gráfico
    Object.keys(filteredStatusCount).forEach((status, index) => {
      if (filteredStatusCount[status] === 0) return; // No dibujar sectores vacíos
      const sliceAngle = (filteredStatusCount[status] / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height / 2); // Centro del círculo
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        100,
        startAngle,
        startAngle + sliceAngle
      );
      ctx.fillStyle = colors[index];
      ctx.fill();
      startAngle += sliceAngle;
    });

    // Función para dibujar un rectángulo redondeado
    const drawRoundedRect = (x, y, width, height, radius) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height
      );
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
    };

    // Dibujar las etiquetas y las líneas
    startAngle = 0;
    const labelX = 10; // Posición fija a la izquierda
    let labelY = 20; // Posición inicial para las etiquetas
    Object.keys(filteredStatusCount).forEach((status, index) => {
      if (filteredStatusCount[status] === 0) return; // No dibujar sectores vacíos
      const sliceAngle = (filteredStatusCount[status] / total) * 2 * Math.PI;
      startAngle += sliceAngle;

      // Calcular el porcentaje
      const percentage = ((filteredStatusCount[status] / total) * 100).toFixed(
        2
      );

      // Agregar etiquetas con el nombre del estado y el porcentaje
      ctx.font = "bold 16px sans-serif";
      const text = `${statuses[index]}: `;
      const percentageText = `${percentage}%`;
      const textWidth = ctx.measureText(text).width;
      const percentageTextWidth = ctx.measureText(percentageText).width;
      const textHeight = 20; // Altura aproximada del texto

      // Dibujar fondo redondeado
      ctx.fillStyle = "rgba(0, 0, 0, 1)"; // Fondo semi-transparente
      drawRoundedRect(
        labelX - 5,
        labelY - textHeight + 5,
        textWidth + percentageTextWidth + 10,
        textHeight,
        5
      );

      // Dibujar texto
      ctx.fillStyle = colors[index]; // Color del texto del estado
      ctx.fillText(text, labelX, labelY);
      ctx.fillStyle = "#fff"; // Color del porcentaje
      ctx.fillText(percentageText, labelX + textWidth, labelY);

      // Dibujar línea desde el centro del círculo hasta la etiqueta
      const midAngle = startAngle - sliceAngle / 2;
      const x = canvas.width / 2 + Math.cos(midAngle) * 100;
      const y = canvas.height / 2 + Math.sin(midAngle) * 100;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height / 2);
      ctx.lineTo(
        labelX + textWidth + percentageTextWidth,
        labelY - textHeight / 2
      ); // Ajustar la línea al final del texto
      ctx.strokeStyle = "#fff";
      ctx.stroke();

      labelY += 90; // Incrementar la posición Y para la siguiente etiqueta
    });
  };

  const drawBarChart = () => {
    const canvas = barCanvasRef.current;
    const ctx = canvas.getContext("2d");

    // Obtener los datos procesados
    const { zoneData } = processData();
    const zones = Object.keys(zoneData); // Nombres de las zonas
    const colors = ["#4CAF50", "#FFC107", "#F44336", "#2196F3"]; // Colores para cada estado
    const statuses = ["online", "warning", "offline", "maintenance"]; // Estados

    // Configuración de dimensiones
    const barWidth = 40; // Ancho de cada barra
    const gap = 0; // Espacio entre barras de un mismo grupo
    const zoneGap = 40; // Espacio entre grupos de zonas
    const margin = 30; // Márgenes más pequeños para evitar el espacio extra
    const canvasHeight = 350; // Altura fija del canvas

    // Encontrar el valor máximo en los datos de todos los estados
    const maxValue = Math.max(
      ...Object.values(zoneData).map((zone) => Math.max(...Object.values(zone)))
    );

    // Calcular el ancho del canvas dinámicamente
    const groupWidth = statuses.length * (barWidth + gap) + zoneGap; // Ancho de un grupo (4 barras + separación)
    const canvasWidth = zones.length * groupWidth + margin;

    // Ajustar el ancho del canvas al contenedor
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Calcular la altura máxima de las barras (ajustado al valor máximo)
    const barMaxHeight = canvasHeight - margin * 2; // Altura máxima de las barras
    const scalingFactor = maxValue > 0 ? barMaxHeight / maxValue : 1; // Factor de escala según el valor máximo

    // Limpiar el canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Dibujar barras
    let x = margin;
    zones.forEach((zone) => {
      statuses.forEach((status, index) => {
        const value = zoneData[zone][status] || 0; // Cantidad de dispositivos en este estado
        const barHeight = value * scalingFactor; // Escalar según el valor máximo
        const y = canvasHeight - margin - barHeight;

        // Dibujar barra
        ctx.fillStyle = colors[index];
        ctx.fillRect(x, y, barWidth, barHeight);

        // Etiqueta del estado
        ctx.fillStyle = "#fff";
        ctx.font = "12px sans-serif;";
        ctx.textAlign = "center";
        ctx.fillText(value, x + barWidth / 2, y - 5);

        // Avanzar al siguiente estado
        x += barWidth + gap;
      });

      // Etiqueta de la zona
      ctx.fillStyle = "#fff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        zone,
        x - (statuses.length * (barWidth + gap)) / 2 - gap / 2,
        canvasHeight - margin + 20
      );

      // Espacio entre zonas
      x += zoneGap - gap;
    });
  };

  // Función para manejar la descarga del reporte
  const handleDownload = async (id, filename) => {
    // Crea la URL para descargar el reporte utilizando el ID
    const downloadUrl = `${
      import.meta.env.VITE_REACT_APP_API_URL
    }/api/report/downloadDailyReport/${id}`;

    try {
      // Realiza la solicitud para obtener el archivo
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error("Error al descargar el archivo");
      }

      // Convierte la respuesta a un Blob
      const blob = await response.blob();
      const link = document.createElement("a");
      const url = window.URL.createObjectURL(blob); // Crea un objeto URL para el Blob
      link.href = url;
      link.download = `${filename}.xlsx`; // Nombre de archivo basado en la base de datos
      document.body.appendChild(link);
      link.click(); // Inicia la descarga
      link.remove(); // Limpia el enlace temporal
      window.URL.revokeObjectURL(url); // Libera el objeto URL
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  // Función para descargar el reporte completo
  const handleFullDownload = async () => {
    const downloadUrl = `${
      import.meta.env.VITE_REACT_APP_API_URL
    }/api/report/generateFullReport`;

    // Obtén la fecha actual
    const date = new Date();

    // Formatea el día, mes y año en formato dd-mm-yyyy
    const day = String(date.getDate()).padStart(2, "0"); // Asegura que el día tenga 2 dígitos
    const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() es 0-indexado, por lo que sumamos 1
    const year = date.getFullYear();

    // Crea el nombre del archivo con la fecha formateada
    const filename = `reporte-completo-${day}-${month}-${year}`;

    try {
      // Realiza la solicitud para obtener el archivo
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error("Error al descargar el archivo");
      }

      // Convierte la respuesta a un Blob
      const blob = await response.blob();
      const link = document.createElement("a");
      const url = window.URL.createObjectURL(blob); // Crea un objeto URL para el Blob
      link.href = url;
      link.download = `${filename}.xlsx`; // Nombre de archivo basado en la base de datos
      document.body.appendChild(link);
      link.click(); // Inicia la descarga
      link.remove(); // Limpia el enlace temporal
      window.URL.revokeObjectURL(url); // Libera el objeto URL
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  // Componente para renderizar cada elemento de la lista
  const Row = ({ index, style }) => (
    <div className={styles.historyItemContainer} style={style}>
      <div
        className={styles.historyItem}
        onClick={() =>
          handleDownload(reports[index]._id, reports[index].filename)
        } // Pasa el ID y el nombre del archivo
        style={{ cursor: "pointer" }} // Cambia el cursor a pointer para indicar que es clickeable
      >
        <p>{reports[index].filename}.xlsx</p>
        <FaDownload />
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        <div className={styles.graphsContainer}>
          <h2>Dashboard</h2>
          <div className={styles.graphs}>
            <div className={styles.shortGraphs}>
              <div className={styles.graph}>
                <canvas ref={pieCanvasRef} width={550} height={300}></canvas>
              </div>
              <div className={styles.graph}>
                <p>
                  En linea:{" "}
                  <span className={styles.green}>
                    {processData().statusCount.online}
                  </span>
                </p>
                <p>
                  Advertencia:{" "}
                  <span className={styles.yellow}>
                    {processData().statusCount.warning}
                  </span>
                </p>
                <p>
                  Fuera de linea:{" "}
                  <span className={styles.red}>
                    {processData().statusCount.offline}
                  </span>
                </p>
                <p>
                  Mantenimiento:{" "}
                  <span className={styles.blue}>
                    {processData().statusCount.maintenance}
                  </span>
                </p>
              </div>
            </div>
            <div className={styles.largeGraphs}>
              <div className={styles.graph}>
                <canvas ref={barCanvasRef} height={350}></canvas>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.history}>
          <h2>Reportes</h2>
          <div className={styles.historyContainer}>
            <List
              height={900}
              itemCount={reports.length}
              itemSize={60}
              width="100%"
            >
              {Row}
            </List>
          </div>
          <div
            className={styles.fullReport}
            onClick={() => handleFullDownload()}
            style={{ cursor: "pointer" }} // Cambia el cursor a pointer para indicar que es clickeable
          >
            <p>Generar reporte</p>
            <FaDownload />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
