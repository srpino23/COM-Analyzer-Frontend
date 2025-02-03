import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
mapboxgl.accessToken =
  "pk.eyJ1Ijoic3JwaW5vMjMiLCJhIjoiY20weTJ2OW9rMGl2czJucHFnYzdnOXd0eCJ9.ROcEsj7ffoAr6alk-UCoFw";

const GenerateMap = ({
  setDevice,
  translatedStatus,
  translatedTypes,
  onMapReady,
  showZones,
  setMapClickData,
  selectedDeviceType,
}) => {
  const mapContainer = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-58.6106, -34.6038],
      zoom: 12,
    });

    map.addControl(new mapboxgl.NavigationControl());

    onMapReady(map);

    const geojsonUrl = "/tres_de_febrero_limits.geojson";

    const customMarkers = [];
    const zoneMarkers = [];
    let devicePositions = [];
    const createCustomIcon = (status, type, size) => {
      const el = document.createElement("div");
      el.className = "custom-marker";

      const iconBaseUrl = "mapIcons/";
      const icons = {
        online: {
          LPR: "Lpr-online.svg",
          Dome: "Dome-online.svg",
          Fixed: "Fixed-online.svg",
          Button: "Button-online.svg",
        },
        offline: {
          LPR: "Lpr-offline.svg",
          Dome: "Dome-offline.svg",
          Fixed: "Fixed-offline.svg",
          Button: "Button-offline.svg",
        },
        warning: {
          LPR: "Lpr-warning.svg",
          Dome: "Dome-warning.svg",
          Fixed: "Fixed-warning.svg",
          Button: "Button-warning.svg",
        },
        maintenance: {
          LPR: "Lpr-maintenance.svg",
          Dome: "Dome-maintenance.svg",
          Fixed: "Fixed-maintenance.svg",
          Button: "Button-maintenance.svg",
        },
      };

      el.style.backgroundImage = `url('${iconBaseUrl}${
        icons[status][type] || "Fixed-default.svg"
      }')`;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.backgroundSize = "100%";
      return el;
    };

    const updateMarkerSize = (zoom) => {
      let size = 15 + (zoom - 10) * 2;
      size = Math.max(size, 15);
      size = Math.min(size, 40);
      return size;
    };

    const addCustomMarkers = () => {
      const bounds = map.getBounds();
      const coordinateOffsets = {};

      devicePositions.forEach((device) => {
        if (
          bounds.contains(device.coordinates) &&
          (selectedDeviceType === "all" || device.type === selectedDeviceType)
        ) {
          const coordKey = `${device.coordinates[0]},${device.coordinates[1]}`;
          coordinateOffsets[coordKey] = (coordinateOffsets[coordKey] || 0) + 1;

          const offsetDistance = 0.00005 * coordinateOffsets[coordKey];
          const angle = (Math.PI / 4) * (coordinateOffsets[coordKey] - 1);
          const offsetLng = offsetDistance * Math.cos(angle);
          const offsetLat = offsetDistance * Math.sin(angle);

          const adjustedCoordinates = [
            device.coordinates[0] + offsetLng,
            device.coordinates[1] + offsetLat,
          ];

          const iconSize = updateMarkerSize(map.getZoom());

          const marker = new mapboxgl.Marker({
            element: createCustomIcon(device.status, device.type, iconSize),
          })
            .setLngLat(adjustedCoordinates)
            .setPopup(
              new mapboxgl.Popup({ offset: 10 }).setHTML(`
              <div class="popup-content">
                <h3>${device.name}</h3>
                <p>Estado: <span class="${device.status}">${
                translatedStatus[device.status] || "Desconocido"
              }</span></p>
                <p>Tipo: ${translatedTypes[device.type] || "Desconocido"}</p>
                <button class="popup-link" data-device-id="${
                  device._id
                }">Detalles</button>
            `)
            )
            .addTo(map);

          marker.getPopup().on("open", () => {
            const popupElement = document.querySelector(".popup-content");
            if (popupElement) {
              const detailsButton = popupElement.querySelector(".popup-link");
              if (detailsButton) {
                detailsButton.addEventListener("click", () => {
                  setDevice(device);
                });
              }
            }
          });

          customMarkers.push(marker);
        }
      });
    };

    const removeCustomMarkers = () => {
      customMarkers.forEach((marker) => marker.remove());
      customMarkers.length = 0;
    };

    const updateMarkersVisibility = () => {
      removeCustomMarkers();
      addCustomMarkers();
    };

    const addZones = () => {
      const zones = {};
      devicePositions.forEach((device) => {
        if (!zones[device.zone]) {
          zones[device.zone] = {
            online: 0,
            warning: 0,
            offline: 0,
            maintenance: 0,
          };
        }
        zones[device.zone][device.status] =
          (zones[device.zone][device.status] || 0) + 1;
      });

      Object.keys(zones).forEach((zone) => {
        const coordinates = devicePositions
          .filter((device) => device.zone === zone)
          .map((device) => device.coordinates);
        const sumLng = coordinates.reduce((acc, coord) => acc + coord[0], 0);
        const sumLat = coordinates.reduce((acc, coord) => acc + coord[1], 0);
        const avgLng = sumLng / coordinates.length;
        const avgLat = sumLat / coordinates.length;

        const pieData = [
          { name: "Online", value: zones[zone].online },
          { name: "Warning", value: zones[zone].warning },
          { name: "Offline", value: zones[zone].offline },
        ];

        const canvas = document.createElement("canvas");
        canvas.width = 150;
        canvas.height = 150;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const colors = {
          Online: "#39ff14",
          Warning: "#f7ff00",
          Offline: "#ff073a",
        };

        let startAngle = 0;
        pieData.forEach((entry) => {
          const angle =
            (entry.value / pieData.reduce((acc, curr) => acc + curr.value, 0)) *
            2 *
            Math.PI;
          ctx.beginPath();
          ctx.arc(
            canvas.width / 2,
            canvas.height / 2,
            45,
            startAngle,
            startAngle + angle
          );
          ctx.lineTo(canvas.width / 2, canvas.height / 2);
          ctx.fillStyle = colors[entry.name];
          ctx.globalAlpha = 0.8; // Se agrega transparencia al gráfico
          ctx.fill();
          ctx.globalAlpha = 1; // Se restaura la transparencia para el texto
          startAngle += angle;
        });

        // Agrega el nombre de la zona arriba del gráfico
        ctx.font = "bold 14px Arial"; // Se establece la fuente para el nombre de la zona
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(zone, canvas.width / 2, 10);

        // Agrega un recuadro negro con bordes redondeados para el texto
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.fillStyle = "rgba(0,0,0,0.5)"; // Se agrega transparencia al recuadro
        ctx.roundRect(
          canvas.width / 2 - 40,
          canvas.height / 2 - 15,
          80,
          30,
          5 // Radio de curvatura para los bordes
        );
        ctx.fill();

        ctx.fillStyle = "#fff";
        const text = `${zones[zone].online} | ${zones[zone].warning} | ${zones[zone].offline}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          text,
          canvas.width / 2,
          canvas.height / 2 + ctx.lineWidth / 2
        );

        const marker = new mapboxgl.Marker({
          element: canvas,
        })
          .setLngLat([avgLng, avgLat])
          .setPopup(
            new mapboxgl.Popup({ offset: 10 }).setHTML(`
            <div class="popup-content">
              <h3>Zona: ${zone}</h3>
              <p>En linea: ${zones[zone].online}</p>
              <p>Advertencia: ${zones[zone].warning}</p>
              <p>Fuera de línea: ${zones[zone].offline}</p>
            </div>
          `)
          )
          .addTo(map);
        zoneMarkers.push(marker);
      });
    };

    const removeZones = () => {
      zoneMarkers.forEach((marker) => marker.remove());
      zoneMarkers.length = 0;
    };

    const updateZonesVisibility = () => {
      removeZones();
      addZones();
    };

    const updateDevices = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/camera/getCameras`
        );
        const devices = await response.json();

        devicePositions = devices
          .filter(
            (device) =>
              selectedDeviceType === "all" || device.type === selectedDeviceType
          )
          .map((device) => ({
            coordinates: [device.longitude, device.latitude],
            status: device.status,
            type: device.type,
            name: device.name,
            _id: device._id,
            direction: device.direction,
            zone: device.zone.toLowerCase(),
            longitude: device.longitude,
            latitude: device.latitude,
            ip: device.ip,
            liable: device.liable,
            username: device.username,
            password: device.password,
          }));

        if (showZones) {
          updateZonesVisibility();
        } else {
          updateMarkersVisibility();
        }
        if (!map.getSource("geojson-source")) {
          map.addSource("geojson-source", {
            type: "geojson",
            data: geojsonUrl,
          });

          map.addLayer({
            id: "geojson-fill-layer",
            type: "fill",
            source: "geojson-source",
            paint: {
              "fill-color": "#00ff7f",
              "fill-opacity": 0.02,
            },
          });

          map.addLayer({
            id: "geojson-line-layer",
            type: "line",
            source: "geojson-source",
            paint: {
              "line-color": "#00ff7f",
              "line-width": 3,
              "line-opacity": 0.8,
            },
          });
        }

        // Secretro

        const points = [
          { coordinates: [100, 60], text: "S" },
          { coordinates: [105, 60], text: "r" },
          { coordinates: [110, 60], text: "P" },
          { coordinates: [115, 60], text: "i" },
          { coordinates: [120, 60], text: "n" },
          { coordinates: [125, 60], text: "o" },
          { coordinates: [130, 60], text: "2" },
          { coordinates: [135, 60], text: "3" },
        ];

        map.addSource("srpino23-points", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: points.map((point, index) => ({
              type: "Feature",
              properties: { id: index, text: point.text },
              geometry: {
                type: "Point",
                coordinates: point.coordinates,
              },
            })),
          },
        });

        map.addLayer({
          id: "srpino23-layer",
          type: "symbol",
          source: "srpino23-points",
          layout: {
            "text-field": ["get", "text"],
            "text-size": 50, // Tamaño del texto grande
            "text-offset": [0, 0.5], // Ajustar desplazamiento
            "text-anchor": "top",
          },
          paint: {
            "text-color": "#00ff7f", // Color del texto (rojo)
          },
        });

        if (showZones) {
          map.on("zoomend", updateZonesVisibility);
          map.on("moveend", updateZonesVisibility);
        } else {
          map.on("zoomend", updateMarkersVisibility);
          map.on("moveend", updateMarkersVisibility);
        }
      } catch (error) {
        console.error("Error actualizando dispositivos:", error);
      }
    };

    updateDevices();

    map.on("contextmenu", (e) => {
      setMapClickData(e.lngLat);
    });

    map.on("load", () => {
      if (showZones) {
        map.on("zoomend", updateZonesVisibility);
        map.on("moveend", updateZonesVisibility);
      } else {
        map.on("zoomend", updateMarkersVisibility);
        map.on("moveend", updateMarkersVisibility);
      }

      setInterval(updateDevices, 5000);

      return () => {
        if (showZones) {
          map.off("zoomend", updateZonesVisibility);
          map.off("moveend", updateZonesVisibility);
          removeZones();
        } else {
          map.off("zoomend", updateMarkersVisibility);
          map.off("moveend", updateMarkersVisibility);
          removeCustomMarkers();
        }
        map.remove();
      };
    });
  }, [showZones, selectedDeviceType]);

  return <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />;
};

export default GenerateMap;
