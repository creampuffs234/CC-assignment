// src/components/MapPicker.jsx
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
});

export default function MapPicker({ onSelect }) {
  const [position, setPosition] = useState(null);

  function LocationSelector() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition({ lat, lng });
        onSelect({ lat, lng });       // <-- THIS SENDS COORDS UP
      },
    });
    return position ? <Marker position={position} icon={markerIcon} /> : null;
  }

  return (
    <MapContainer
      center={[6.9271, 79.8612]}
      zoom={13}
      className="w-full h-64 rounded"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationSelector />
    </MapContainer>
  );
}
