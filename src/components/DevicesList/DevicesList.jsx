import { FixedSizeList as List } from "react-window";

import styles from "./devicesList.module.css";

const DevicesList = ({
  deviceType,
  filteredDevices,
  filteredServers,
  iconTypes,
  translatedTypes,
  setSelectedItem,
  role,
}) => {
  const Row = ({ index, style, itemType, items }) => {
    const item = items[index];

    return (
      <div
        className={styles.deviceContainer}
        key={index}
        style={style}
        onClick={role === "admin" ? () => setSelectedItem(item) : null}
      >
        <div className={styles.device}>
          <div className={styles.basicInfo}>
            {itemType === "device" && (
              <div className={styles.type}>
                <img src={iconTypes[item.type]} alt={item.type} />
              </div>
            )}
            <div className={styles.deviceInfo}>
              <div className={styles.name}>{item.name}</div>
              <div className={styles.deviceSubInfo}>
                <p className={styles.zone}>Zona: {item.zone}</p>
                <p>|</p>
                {itemType === "device" ? (
                  <>
                    <p className={styles.deviceType}>
                      Tipo: {translatedTypes[item.type]}
                    </p>
                    <p>|</p>
                    <p className={styles.direction}>
                      Dirección: {item.direction}
                    </p>
                    <p>|</p>
                    <p className={styles.ip}>IP: {item.ip}</p>
                    <p>|</p>
                    <p className={styles.liable}>Responsable: {item.liable}</p>
                  </>
                ) : (
                  <>
                    <p className={styles.mainIp}>IP Principal: {item.mainIp}</p>
                    <p>|</p>
                    <p className={styles.ipsRange}>
                      Rango de IPs: {item.ipsRange}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className={`${styles.state} ${styles[item.status]}`}></div>
        </div>
      </div>
    );
  };

  return (
    <List
      height={900}
      width={"100%"}
      itemSize={70}
      itemCount={deviceType ? filteredServers.length : filteredDevices.length}
    >
      {({ index, style }) => (
        <Row
          index={index}
          style={style}
          itemType={deviceType ? "server" : "device"}
          items={deviceType ? filteredServers : filteredDevices}
        />
      )}
    </List>
  );
};

export default DevicesList;
