"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { type Creator } from "@/data/creators";
import { CreatorPopup } from "./CreatorPopup";

// Dynamic imports
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

interface MapViewProps {
  creators: Creator[];
  center?: [number, number];
  zoom?: number;
}

import type LType from "leaflet";

export const MapView = ({ creators, center = [19.0760, 72.8777], zoom = 12 }: MapViewProps) => {
  const [L, setL] = useState<typeof LType | null>(null);

  useEffect(() => {
    import("leaflet").then(mod => {
      setL(mod.default);
    });
  }, []);

  if (!L) return <div className="w-full h-full bg-surface animate-pulse flex items-center justify-center text-gray-500 uppercase tracking-widest text-xs font-bold">Initializing Discovery Map...</div>;

  const customIcon = L.divIcon({
    className: "custom-marker",
    html: `<div class="marker-pulse-purple"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {creators.map((creator) => (
          <Marker
            key={creator.id}
            position={[creator.location.lat, creator.location.lng]}
            icon={customIcon}
          >
            <Popup>
              <CreatorPopup creator={creator} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
