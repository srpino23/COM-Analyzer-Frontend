import React, { useEffect, useState, useMemo } from "react";
import {
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoSearchSharp,
  IoEye,
  IoEyeOff,
} from "react-icons/io5";
import { FixedSizeList as List } from "react-window";

import GenerateMap from "../../components/GenerateMap/GenerateMap";
import Button from "../../assets/deviceIcons/Button-online.svg";
import Dome from "../../assets/deviceIcons/Dome-online.svg";
import Fixed from "../../assets/deviceIcons/Fixed-online.svg";
import Lpr from "../../assets/deviceIcons/Lpr-online.svg";

import styles from "./map.module.css";

function Map() {
  const [devices, setDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [hideMenu, setHideMenu] = useState(false);
  const [showList, setShowList] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [serverName, setServerName] = useState(null);
  const [showZones, setShowZones] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedDeviceType, setSelectedDeviceType] = useState("all");
  const [mapClickData, setMapClickData] = useState([]);

  const translatedStatus = {
    online: "En línea",
    offline: "Fuera de línea",
    warning: "Advertencia",
    maintenance: "Mantenimiento",
  };

  const translatedTypes = {
    LPR: "LPR",
    Dome: "Domo",
    Fixed: "Fija",
    Button: "Boton",
    Local: "Fija",
  };

  const iconTypes = {
    LPR: Lpr,
    Dome: Dome,
    Fixed: Fixed,
    Button: Button,
    Local: Fixed,
  };

  // Función para obtener dispositivos
  const fetchDevices = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/camera/getCameras`
      );
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  // useEffect para obtener dispositivos
  useEffect(() => {
    // Llamar a la API inmediatamente cuando se monta el componente
    fetchDevices();
  }, []); // Solo se ejecuta una vez al montar el componente

  // Función para manejar el clic del botón y ejecutar el flyTo
  const flyToRandomLocation = (Lng, Lat) => {
    if (mapInstance) {
      mapInstance.flyTo({ center: [Lng, Lat], zoom: 18, essential: true });
    }
  };

  // Llamada cuando el mapa está listo
  const handleMapReady = (map) => {
    setMapInstance(map); // Guardamos la instancia del mapa
  };

  // useEffect para manejar el debounce del término de búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Memorizar la lista de dispositivos filtrados para evitar recalcular en cada renderizado
  const filteredDevices = useMemo(() => {
    // Dividir el término de búsqueda en términos individuales
    const searchTerms = debouncedSearchTerm
      .toLowerCase()
      .split(" ")
      .filter((term) => term); // Filtra cualquier término vacío

    return devices.filter((device) => {
      // Para cada término, verificar si coincide con alguno de los campos
      return searchTerms.every((term) =>
        [
          device.name,
          device.type,
          device.status,
          device.zone,
          device.direction,
          device.latitude,
          device.longitude,
          device.ip,
        ].some((field) => field.toString().toLowerCase().includes(term))
      );
    });
  }, [debouncedSearchTerm, devices]);

  // Componente que renderiza cada fila de dispositivos
  const Row = ({ index, style }) => {
    const device = filteredDevices[index];

    return (
      <div className={styles.deviceContainer} key={index} style={style}>
        <div className={styles.device} onClick={() => setDevice(device)}>
          <div className={styles.basicInfo}>
            <div className={styles.type}>
              <img src={iconTypes[device.type]} alt={device.type} />
            </div>
            <div className={styles.deviceInfo}>
              <div className={styles.name}>{device.name}</div>
              <div className={styles.deviceSubInfo}>
                <p className={styles.deviceType}>
                  Tipo: {translatedTypes[device.type]}
                </p>
                <p>|</p>
                <p className={styles.direction}>
                  Direccion: {device.direction}
                </p>
                <p>|</p>
                <p className={styles.zone}>Zona: {device.zone}</p>
              </div>
            </div>
          </div>
          <div className={`${styles.state} ${styles[device.status]}`}></div>
        </div>
      </div>
    );
  };

  const setDevice = async (device) => {
    setSelectedDevice(device);
    const serverNameResult = await findServer(device._id);
    setServerName(serverNameResult);
    setShowList(true);
    setHideMenu(false);
  };

  const findServer = async (deviceId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/server/getServers`
      );
      const data = await response.json();

      // Recorrer cada servidor en los datos
      for (const server of data) {
        // Verificar si hay cámaras en el servidor
        if (Array.isArray(server.cameras)) {
          // Buscar la cámara con el cameraId dentro del array cameras
          const foundCamera = server.cameras.find(
            (camera) => camera === deviceId
          );

          if (foundCamera) {
            // Si se encuentra la cámara, devolver el nombre del servidor
            return server.name;
          }
        }
      }

      console.log("No se encontró una cámara con la ID:", cameraId);
      return null;
    } catch (error) {
      console.error("Error fetching servers:", error);
      return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.floatingMenu}>
        <div className={styles.floatingMenuBtns}>
          <div
            className={styles.hideMenu}
            onClick={() => setHideMenu(!hideMenu)}
          >
            {hideMenu ? <IoChevronForwardOutline /> : <IoChevronBackOutline />}
            <p>{hideMenu ? "Mostrar menu" : "Ocultar menu"}</p>
          </div>
          <div
            className={styles.hideMenu}
            onClick={() => setShowZones(!showZones)}
          >
            {showZones ? <IoEye /> : <IoEyeOff />}
            <p>Zonas</p>
          </div>
          <div className={styles.hideFilterMenu}>
            <select
              value={selectedDeviceType}
              onChange={(e) => setSelectedDeviceType(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="Fixed">Fija</option>
              <option value="Dome">Domo</option>
              <option value="LPR">LPR</option>
              <option value="Button">Boton</option>
            </select>
          </div>
        </div>
        {hideMenu ? null : (
          <>
            <div className={styles.search}>
              <IoSearchSharp />
              <input
                type="text"
                placeholder="Buscar dispositivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className={styles.devices}>
              <div className={styles.options}>
                <ul>
                  <li
                    className={showList ? styles.active : null}
                    onClick={() => setShowList(true)}
                  >
                    Dispositivo
                  </li>
                  <li
                    className={showList ? null : styles.active}
                    onClick={() => setShowList(false)}
                  >
                    Lista
                  </li>
                </ul>
              </div>
              <div className={styles.info}>
                {showList ? (
                  selectedDevice ? (
                    <>
                      <div className={styles.selectedDevice}>
                        <div className={styles.deviceInfo}>
                          <div className={styles.basicInfo}>
                            <div className={styles.icon}>
                              <img src={iconTypes[selectedDevice.type]} />
                              {selectedDevice.name}
                            </div>
                            <div
                              className={`${styles.status} ${
                                styles[selectedDevice.status]
                              }`}
                            ></div>
                          </div>
                          <div className={styles.fullInfo}>
                            <hr />
                            <p>
                              <span>Direccion:</span> {selectedDevice.direction}
                            </p>
                            <p>
                              <span>Zona:</span> {selectedDevice.zone}
                            </p>
                            <p>
                              <span>Tipo:</span>{" "}
                              {translatedTypes[selectedDevice.type]}
                            </p>
                            <p>
                              <span>Longitud:</span> {selectedDevice.longitude}
                            </p>
                            <p>
                              <span>Latitud:</span> {selectedDevice.latitude}
                            </p>
                            <p>
                              <span>Servidor:</span> {serverName}
                            </p>
                            <p>
                              <span>IP:</span> {selectedDevice.ip}
                            </p>
                            <p>
                              <span>Usuario:</span> {selectedDevice.username}
                            </p>
                            <p>
                              <span>Contraseña:</span> {selectedDevice.password}
                            </p>
                            <p>
                              <span>Responsable:</span> {selectedDevice.liable}
                            </p>
                            <button
                              onClick={() => {
                                flyToRandomLocation(
                                  selectedDevice.longitude,
                                  selectedDevice.latitude
                                );
                              }}
                            >
                              Ubicar dispositivo
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>Seleccione un dispositivo</p>
                    </>
                  )
                ) : filteredDevices.length > 0 ? (
                  <List
                    height={1440} // Altura del contenedor
                    itemCount={filteredDevices.length} // Número total de dispositivos filtrados
                    itemSize={60} // Altura de cada fila (puedes ajustarla según sea necesario)
                    width={"100%"} // Ancho del contenedor
                  >
                    {Row}
                  </List>
                ) : (
                  <p>No se encontraron dispositivos</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <div className={styles.mapContainer}>
        <GenerateMap
          setDevice={setDevice}
          translatedStatus={translatedStatus}
          translatedTypes={translatedTypes}
          onMapReady={handleMapReady}
          showZones={showZones}
          setMapClickData={setMapClickData}
          selectedDeviceType={selectedDeviceType}
        />
      </div>
    </div>
  );
}

export default Map;
