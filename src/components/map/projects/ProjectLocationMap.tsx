"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { creators } from "@/data/creators";

interface Location {
  lat: number;
  lng: number;
  name?: string;
}

const LocationPicker = ({ onAddLocation }: { onAddLocation: (loc: Location) => void }) => {
  useMapEvents({
    click(e) {
      onAddLocation({ lat: e.latlng.lat, lng: e.latlng.lng, name: `Location ${Math.floor(Math.random() * 100)}` });
    },
  });
  return null;
};

export default function ProjectLocationMap({ 
  locations, 
  setLocations, 
  radius 
}: { 
  locations: Location[], 
  setLocations: (locs: Location[]) => void,
  radius: number
}) {
  const customIcon = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return new L.Icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }, []);

  const creatorIcon = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return L.divIcon({
      className: "custom-marker",
      html: `<div class="marker-pulse-purple"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  }, []);

  const removeLocation = (index: number) => {
    const newLocs = [...locations];
    newLocs.splice(index, 1);
    setLocations(newLocs);
  };

  return (
    <MapContainer 
      center={[19.0760, 72.8777]} 
      zoom={12} 
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      
      <LocationPicker onAddLocation={(loc) => setLocations([...locations, loc])} />

      {locations.map((loc, i) => (
        <React.Fragment key={i}>
          {customIcon && (
            <Marker position={[loc.lat, loc.lng]} icon={customIcon}>
              <Popup>
                <div className="text-black">
                  <p className="font-bold">{loc.name}</p>
                  <button 
                    onClick={() => removeLocation(i)}
                    className="text-red-500 text-xs mt-1 underline"
                  >
                    Remove Pin
                  </button>
                </div>
              </Popup>
            </Marker>
          )}
          <Circle 
            center={[loc.lat, loc.lng]} 
            radius={radius * 1000} 
            pathOptions={{ color: "#a855f7", fillColor: "#a855f7", fillOpacity: 0.1 }} 
          />
        </React.Fragment>
      ))}

      {/* Preview nearby creators */}
      {creators.map((c) => (
        creatorIcon && (
          <Marker 
            key={c.id} 
            position={[c.location.lat, c.location.lng]} 
            icon={creatorIcon}
          >
            <Popup>
              <div className="text-black text-xs font-bold">{c.name} (Nearby)</div>
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
}
