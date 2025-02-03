import React, { useState, useEffect } from "react";

import styles from "./editpopup.module.css";

const EditPopup = ({ item, onClose, onUpdate, setDevices, setServers, setSelectedItem }) => {
  const [editedItem, setEditedItem] = useState(item);

  useEffect(() => {
    setEditedItem(item);
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleAction = async (action) => {
    const url = item.type
      ? `${import.meta.env.VITE_REACT_APP_API_URL}/api/camera/${action}Camera/${item._id}`
      : `${import.meta.env.VITE_REACT_APP_API_URL}/api/server/${action}Server/${item._id}`;

    try {
      const method = action === "update" ? "PUT" : "DELETE";
      console.log(editedItem);
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedItem),
      });

      if (!response.ok) {
        throw new Error(
          `Error ${action === "update" ? "updating" : "deleting"} item`
        );
      }

      if (action === "update") {
        onUpdate(editedItem);
      } else {
        setDevices((prevDevices) =>
          prevDevices.filter((device) => device._id !== item._id)
        );
        setServers((prevServers) =>
          prevServers.filter((server) => server._id !== item._id)
        );
        setSelectedItem(null);
      }
      onClose();
    } catch (error) {
      console.error(
        `Error ${action === "update" ? "updating" : "deleting"} item:`,
        error
      );
    }
  };

  if (!item) return null;

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popup}>
        <div className={styles.popupHeader}>
          <h2>Editar {item.type ? "Cámara" : "Servidor"}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.popupContent}>
          <div className={styles.sections}>
            {/* Sección izquierda */}
            <div className={styles.section}>
              <p>
                <strong>Nombre:</strong>
                <input
                  type="text"
                  name="name"
                  value={editedItem.name}
                  onChange={handleChange}
                />
              </p>
              <p>
                <strong>IP:</strong>
                <input
                  type="text"
                  name="ip"
                  value={item.type ? editedItem.ip : editedItem.mainIp}
                  onChange={handleChange}
                />
              </p>
              {item.type ? (
                <>
                  <p>
                    <strong>Dirección:</strong>
                    <input
                      type="text"
                      name="direction"
                      value={editedItem.direction}
                      onChange={handleChange}
                    />
                  </p>
                  <p>
                    <strong>Latitud:</strong>
                    <input
                      type="text"
                      name="latitude"
                      value={editedItem.latitude}
                      onChange={handleChange}
                    />
                  </p>
                  <p>
                    <strong>Usuario:</strong>
                    <input
                      type="text"
                      name="username"
                      value={editedItem.username}
                      onChange={handleChange}
                    />
                  </p>
                  <p>
                    <strong>Responsable:</strong>
                    <select
                      name="liable"
                      value={editedItem.liable}
                      onChange={handleChange}
                    >
                      <option value="EQ COM 1">EQ COM 1</option>
                      <option value="EQ COM 2">EQ COM 2</option>
                      <option value="EXANET">EXANET</option>
                      <option value="AXON">AXON</option>
                      <option value="COM">COM</option>
                    </select>
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Zona:</strong>
                    <input
                      type="text"
                      name="zone"
                      value={editedItem.zone}
                      onChange={handleChange}
                    />
                  </p>
                  <p>
                    <strong>Contraseña:</strong>
                    <input
                      type="text"
                      name="password"
                      value={editedItem.password}
                      onChange={handleChange}
                    />
                  </p>
                </>
              )}
            </div>

            {/* Sección derecha */}
            <div className={styles.section}>
              {item.type ? (
                <>
                  <p>
                    <strong>Tipo:</strong>
                    <select
                      name="type"
                      value={editedItem.type}
                      onChange={handleChange}
                    >
                      <option value="LPR">LPR</option>
                      <option value="Dome">Domo</option>
                      <option value="Fixed">Fija</option>
                      <option value="Button">Botón</option>
                    </select>
                  </p>
                  <p>
                    <strong>Estado:</strong>
                    <select
                      name="status"
                      value={editedItem.status}
                      onChange={handleChange}
                    >
                      <option value="online">En línea</option>
                      <option value="offline">Fuera de línea</option>
                      <option value="warning">Advertencia</option>
                      <option value="maintenance">Mantenimiento</option>
                    </select>
                  </p>
                  <p>
                    <strong>Zona:</strong>
                    <input
                      type="text"
                      name="zone"
                      value={editedItem.zone}
                      onChange={handleChange}
                    />
                  </p>
                  <p>
                    <strong>Longitud:</strong>
                    <input
                      type="text"
                      name="longitude"
                      value={editedItem.longitude}
                      onChange={handleChange}
                    />
                  </p>
                  <p>
                    <strong>Contraseña:</strong>
                    <input
                      type="text"
                      name="password"
                      value={editedItem.password}
                      onChange={handleChange}
                    />
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Estado:</strong>
                    <select
                      name="status"
                      value={editedItem.status}
                      onChange={handleChange}
                    >
                      <option value="online">En línea</option>
                      <option value="offline">Fuera de línea</option>
                      <option value="warning">Advertencia</option>
                      <option value="maintenance">Mantenimiento</option>
                    </select>
                  </p>
                  <p>
                    <strong>Rango de IPs :</strong>
                    <input
                      type="text"
                      name="username"
                      value={editedItem.ipsRange}
                      onChange={handleChange}
                    />
                  </p>
                  <p>
                    <strong>Usuario:</strong>
                    <input
                      type="text"
                      name="username"
                      value={editedItem.username}
                      onChange={handleChange}
                    />
                  </p>
                </>
              )}
            </div>
          </div>

          <button onClick={() => handleAction("update")}>Actualizar</button>
          <button
            className={styles.deleteButton}
            onClick={() => {
              const isConfirmed = window.confirm(
                "¿Estás seguro de que deseas eliminar este dispositivo?"
              );

              if (isConfirmed) {
                handleAction("delete");
              }
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPopup;