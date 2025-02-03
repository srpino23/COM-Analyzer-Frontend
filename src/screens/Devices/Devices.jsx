import React, { useState, useEffect, useMemo } from "react";
import { BiSolidFilePdf } from "react-icons/bi";
import * as XLSX from "xlsx";

import ButtonIcon from "../../assets/deviceIcons/Button-online.svg";
import DomeIcon from "../../assets/deviceIcons/Dome-online.svg";
import FixedIcon from "../../assets/deviceIcons/Fixed-online.svg";
import LprIcon from "../../assets/deviceIcons/Lpr-online.svg";

import styles from "./devices.module.css";

import DevicesList from "../../components/DevicesList/DevicesList";
import EditPopup from "../../components/EditPopup/EditPopup";
import AddPopup from "../../components/AddPopup/AddPopup";

const Devices = () => {
  const [deviceType, setDeviceType] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [devices, setDevices] = useState([]);
  const [servers, setServers] = useState([]);
  const [zones, setZones] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [role, setRole] = useState("");

  const getUser = async () => {
    const localUser = localStorage.getItem("user");
    const userData = JSON.parse(localUser);
    if (userData && userData.data) {
      setRole(userData.data.role);
    }
  };

  const fetchData = async (url, setData) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
    }
  };

  const handleUpdate = (updatedItem) => {
    const updateItems = (items, setItems) =>
      setItems((prevItems) =>
        prevItems.map((item) =>
          item._id === updatedItem._id ? updatedItem : item
        )
      );

    updateItems(devices, setDevices);
    updateItems(servers, setServers);
  };

  const fetchAllData = async () => {
    await Promise.all([
      fetchData(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/camera/getCameras`,
        setDevices
      ),
      fetchData(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/server/getServers`,
        setServers
      ),
    ]);
  };

  const fetchAllZones = () => {
    const uniqueZones = Array.from(
      new Set(devices.map((device) => device.zone?.toLowerCase()))
    ).filter(Boolean);
    setZones(uniqueZones);
  };

  useEffect(() => {
    fetchAllData();
    getUser();
  }, []);

  useEffect(() => {
    if (devices.length > 0) {
      fetchAllZones();
    }
  }, [devices]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const filterItems = (
    items,
    searchTerms,
    statusFilter,
    typeFilter,
    zoneFilter
  ) =>
    items
      .filter((item) => {
        // Filtrar por estado si no es "all"
        const statusMatch =
          statusFilter === "all" || item.status === statusFilter;

        // Filtrar por tipo si no es "all"
        const typeMatch = typeFilter === "all" || item.type === typeFilter;

        // Filtrar por zona si no es "all"
        const zoneMatch =
          zoneFilter === "all" ||
          item.zone.toLowerCase() === zoneFilter.toLowerCase();

        return statusMatch && typeMatch && zoneMatch; // Todos los filtros deben coincidir
      })
      .filter((item) =>
        searchTerms.every((term) =>
          Object.values(item).some((field) =>
            field.toString().toLowerCase().includes(term)
          )
        )
      );

  const filteredDevices = useMemo(() => {
    const searchTerms = debouncedSearchTerm
      .toLowerCase()
      .split(" ")
      .filter(Boolean);

    return filterItems(
      devices,
      searchTerms,
      statusFilter,
      typeFilter,
      zoneFilter
    );
  }, [debouncedSearchTerm, devices, statusFilter, typeFilter, zoneFilter]);

  const filteredServers = useMemo(() => {
    const searchTerms = debouncedSearchTerm
      .toLowerCase()
      .split(" ")
      .filter(Boolean);

    return filterItems(servers, searchTerms, statusFilter, "all", "all");
  }, [debouncedSearchTerm, servers, statusFilter]);

  const translatedTypes = {
    LPR: "LPR",
    Dome: "Domo",
    Fixed: "Fija",
    Button: "Botón",
    Local: "Fija",
  };

  const iconTypes = {
    LPR: LprIcon,
    Dome: DomeIcon,
    Fixed: FixedIcon,
    Button: ButtonIcon,
    Local: FixedIcon,
  };

  const handleGenerateReport = () => {
    const data = deviceType
      ? filteredServers.map((server) => ({
          Nombre: server.name,
          Tipo: translatedTypes[server.type],
          Dirección: server.direction,
          Estado:
            server.status === "online"
              ? "En línea"
              : server.status === "offline"
              ? "Fuera de línea"
              : server.status === "warning"
              ? "Advertencia"
              : server.status === "maintenance"
              ? "Mantenimiento"
              : server.status,
          Longitud: server.longitude,
          Latitud: server.latitude,
          Ip: server.ip,
          Responsable: server.liable,
        }))
      : filteredDevices.map((device) => ({
          Nombre: device.name,
          Tipo: translatedTypes[device.type],
          Dirección: device.direction,
          Estado:
            device.status === "online"
              ? "En línea"
              : device.status === "offline"
              ? "Fuera de línea"
              : device.status === "warning"
              ? "Advertencia"
              : device.status === "maintenance"
              ? "Mantenimiento"
              : device.status,
          Longitud: device.longitude,
          Latitud: device.latitude,
          Ip: device.ip,
          Responsable: device.liable,
        }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");

    // Agregar la fecha de hoy al nombre del archivo
    const fechaHoy = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    XLSX.writeFile(wb, `Reporte_${fechaHoy}.xlsx`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.devices}>
          <button
            className={!deviceType ? styles.active : ""}
            onClick={() => setDeviceType(false)}
          >
            Dispositivos
          </button>
          <button
            className={deviceType ? styles.active : ""}
            onClick={() => {
              setTypeFilter("all");
              setDeviceType(true);
            }}
          >
            Servidores
          </button>
          {role === "admin" ? (
            <button onClick={() => setShowAddPopup(true)}>Agregar</button>
          ) : (
            <></>
          )}
        </div>
        <div className={styles.filters}>
          {deviceType ? null : (
            <>
              <div className={styles.filter}>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">Tipos</option>
                  <option value="Fixed">Fija</option>
                  <option value="Dome">Domo</option>
                  <option value="LPR">LPR</option>
                  <option value="Button">Boton</option>
                </select>
              </div>
              <div className={styles.filter}>
                <select
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                >
                  <option value="all">Zonas</option>
                  {zones.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone.charAt(0).toUpperCase() + zone.slice(1)}{" "}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div className={styles.filter}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Estados</option>
              <option value="online">En línea</option>
              <option value="offline">Fuera de línea</option>
              <option value="warning">Advertencia</option>
              <option value="maintenance">Mantenimiento</option>
            </select>
          </div>
          <div className={styles.search}>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      <hr />
      <div className={styles.devicesContainer}>
        <div className={styles.devicesList}>
          <DevicesList
            deviceType={deviceType}
            filteredDevices={filteredDevices}
            filteredServers={filteredServers}
            iconTypes={iconTypes}
            translatedTypes={translatedTypes}
            setSelectedItem={setSelectedItem}
            role={role}
          />
        </div>
      </div>
      {selectedItem && (
        <EditPopup
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdate={handleUpdate}
          setDevices={setDevices}
          setServers={setServers}
          setSelectedItem={setSelectedItem}
        />
      )}
      {showAddPopup && (
        <AddPopup
          onClose={() => setShowAddPopup(false)}
          setShowAddPopup={setShowAddPopup}
          setDevices={setDevices}
          setServers={setServers}
          servers={servers}
        />
      )}
      <div
        className={styles.generateFilteredReportBtn}
        onClick={handleGenerateReport}
      >
        <p>
          <BiSolidFilePdf size={35} />
        </p>
      </div>
    </div>
  );
};

export default Devices;
