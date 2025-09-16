import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const machineData = [
  {
    machineId: '3434',
    status: 'active',
    longitude: '34.34N',
    latitude: '23.233W',
  },
  {
    machineId: '3435',
    status: 'inactive',
    longitude: '35.55N',
    latitude: '24.444W',
  },
];

const MachineMap = () => {
  const position = [28.6139, 77.2090]; // Coordinates for India (New Delhi)

  // Function to get the color of the marker based on status
  const getMarkerColor = (status) => {
    return status === 'active' ? 'green' : 'red';
  };

  // Function to convert machine data into proper latitude and longitude
  const convertCoordinates = (lat, lon) => {
    const latValue = parseFloat(lat.split('N')[0]);
    const lonValue = parseFloat(lon.split('W')[0]);
    return [latValue, lonValue];
  };

  return (
    <MapContainer center={position} zoom={5} style={{ height: '100vh', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {machineData.map((machine, index) => {
        const [lat, lon] = convertCoordinates(machine.latitude, machine.longitude);
        return (
          <Marker
            key={index}
            position={[lat, lon]}
            icon={new L.Icon({
              iconUrl: `https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-${getMarkerColor(machine.status)}.png`,
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowAnchor: [4, 62],
              shadowSize: [41, 41],
            })}
          >
            <Popup>
              <div>
                <h4>Machine ID: {machine.machineId}</h4>
                <p>Status: {machine.status}</p>
                <p>Longitude: {machine.longitude}</p>
                <p>Latitude: {machine.latitude}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MachineMap;
