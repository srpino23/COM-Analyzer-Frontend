import React, { useState } from "react";

import styles from "./addPopup.module.css";

const AddPopup = ({
  onClose,
  setShowAddPopup,
  setDevices,
  setServers,
  servers,
}) => {
  const [addItemType, setAddItemType] = useState("camera");
  const inputRefs = {
    name: React.createRef(),
    type: React.createRef(),
    direction: React.createRef(),
    zone: React.createRef(),
    latitude: React.createRef(),
    longitude: React.createRef(),
    username: React.createRef(),
    password: React.createRef(),
    ip: React.createRef(),
    serverId: React.createRef(),
    mainIp: React.createRef(),
    ipsRange: React.createRef(),
    liable: React.createRef(),
  };

  const handleAddSubmit = async () => {
    // Establecer los valores de newItem desde los refs
    const newItemData = {
      name: inputRefs.name.current.value,
      type: addItemType === "camera" ? inputRefs.type.current.value : undefined,
      direction:
        addItemType === "camera"
          ? inputRefs.direction.current.value
          : undefined,
      zone: inputRefs.zone.current.value,
      latitude:
        addItemType === "camera" ? inputRefs.latitude.current.value : undefined,
      longitude:
        addItemType === "camera"
          ? inputRefs.longitude.current.value
          : undefined,
      username: inputRefs.username.current.value,
      password: inputRefs.password.current.value,
      ip: addItemType === "camera" ? inputRefs.ip.current.value : undefined,
      serverId:
        addItemType === "camera" ? inputRefs.serverId.current.value : undefined,
      mainIp:
        addItemType === "server" ? inputRefs.mainIp.current.value : undefined,
      ipsRange:
        addItemType === "server" ? inputRefs.ipsRange.current.value : undefined,
      liable:
        addItemType === "camera" ? inputRefs.liable.current.value : undefined,
    };

    const url =
      addItemType === "camera"
        ? `${import.meta.env.VITE_REACT_APP_API_URL}/api/camera/addCamera`
        : `${import.meta.env.VITE_REACT_APP_API_URL}/api/server/addServer`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItemData),
      });

      if (!response.ok) {
        throw new Error("Error adding new item");
      }

      const data = await response.json();
      console.log("Nueva cámara agregada:", data);

      if (addItemType === "camera") {
        setDevices((prev) => [...prev, data.data.camera]); // Añadir la nueva cámara
      } else {
        setServers((prev) => [...prev, data.data]); // Añadir el nuevo servidor
      }
      setShowAddPopup(false);
    } catch (error) {
      console.error("Error adding new item:", error);
    }
  };

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popup}>
        <div className={styles.popupHeader}>
          <h2>Agregar {addItemType === "camera" ? "Cámara" : "Servidor"}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.popupContent}>
          <select
            value={addItemType}
            onChange={(e) => setAddItemType(e.target.value)}
          >
            <option value="camera">Cámara</option>
            <option value="server">Servidor</option>
          </select>

          <div className={styles.sections}>
            {/* Sección izquierda */}
            <div className={styles.section}>
              <p>
                <strong>Nombre:</strong>
                <input type="text" name="name" ref={inputRefs.name} />
              </p>
              {addItemType === "camera" ? (
                <>
                  <p>
                    <strong>Servidor:</strong>
                    <select name="serverId" ref={inputRefs.serverId}>
                      {servers.map((server) => (
                        <option key={server._id} value={server._id}>
                          {server.name}
                        </option>
                      ))}
                    </select>
                  </p>
                  <p>
                    <strong>Dirección:</strong>
                    <input
                      type="text"
                      name="direction"
                      ref={inputRefs.direction}
                    />
                  </p>
                  <p>
                    <strong>Latitud:</strong>
                    <input
                      type="text"
                      name="latitude"
                      ref={inputRefs.latitude}
                    />
                  </p>
                  <p>
                    <strong>Usuario:</strong>
                    <input
                      type="text"
                      name="latitude"
                      ref={inputRefs.username}
                    />
                  </p>
                  <p>
                    <strong>Responsable:</strong>
                    <select name="liable" ref={inputRefs.liable}>
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
                    <strong>IP:</strong>
                    <input type="text" name="zone" ref={inputRefs.mainIp} />
                  </p>
                  <p>
                    <strong>Usuario:</strong>
                    <input
                      type="text"
                      name="username"
                      ref={inputRefs.username}
                    />
                  </p>
                </>
              )}
            </div>

            {/* Sección derecha */}
            <div className={styles.section}>
              {addItemType === "camera" ? (
                <>
                  <p>
                    <strong>Tipo:</strong>
                    <select name="type" ref={inputRefs.type}>
                      <option value="LPR">LPR</option>
                      <option value="Dome">Domo</option>
                      <option value="Fixed">Fija</option>
                      <option value="Button">Botón</option>
                    </select>
                  </p>
                  <p>
                    <strong>IP:</strong>
                    <input type="text" name="latitude" ref={inputRefs.ip} />
                  </p>
                  <p>
                    <strong>Zona:</strong>
                    <input type="text" name="latitude" ref={inputRefs.zone} />
                  </p>
                  <p>
                    <strong>Longitud:</strong>
                    <input
                      type="text"
                      name="longitude"
                      ref={inputRefs.longitude}
                    />
                  </p>
                  <p>
                    <strong>Contraseña:</strong>
                    <input
                      type="text"
                      name="latitude"
                      ref={inputRefs.password}
                    />
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Zona:</strong>
                    <input type="text" name="zone" ref={inputRefs.zone} />
                  </p>
                  <p>
                    <strong>Rango de IPs:</strong>
                    <input
                      type="text"
                      name="ipsRange"
                      ref={inputRefs.ipsRange}
                    />
                  </p>
                  <p>
                    <strong>Contraseña:</strong>
                    <input
                      type="password"
                      name="password"
                      ref={inputRefs.password}
                    />
                  </p>
                </>
              )}
            </div>
          </div>

          <button onClick={handleAddSubmit}>Agregar</button>
        </div>
      </div>
    </div>
  );
};

export default AddPopup;
