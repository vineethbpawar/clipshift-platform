"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface ProjectLocationPickerProps {
  position: [number, number] | null;
  setPosition: (lat: number, lng: number) => void;
  center?: [number, number];
}

const LocationMarker = ({ position, setPosition }: { position: [number, number] | null, setPosition: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng.lat, e.latlng.lng);
    },
  });

  const customIcon = L.divIcon({
    className: "custom-marker",
    html: `<div class="marker-pulse-purple"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon}></Marker>
  );
};

const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

export default function ProjectLocationPicker({ position, setPosition, center }: ProjectLocationPickerProps) {
  const defaultCenter: [number, number] = [19.0760, 72.8777]; // Mumbai

  return (
    <div className="w-full h-[300px] rounded-[32px] overflow-hidden border border-white/10 relative z-0">
      <MapContainer 
        center={center || position || defaultCenter} 
        zoom={12} 
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <LocationMarker position={position} setPosition={setPosition} />
        {center && <ChangeView center={center} />}
      </MapContainer>
    </div>
  );
}
