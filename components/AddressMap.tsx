"use client";

import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface AddressMapProps {
  address: string;
  height?: number;
}

export default function AddressMap({ address, height = 350 }: AddressMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!address || !mapRef.current) return;

    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
      version: "weekly",
      libraries: [], // no extra libs needed
    });

    loader.load().then(() => {
      // 1) Create the map (with a default center)
      const map = new google.maps.Map(mapRef.current!, {
        center: { lat: 0, lng: 0 },
        zoom: 13,
        mapId: "nextjs_app",
      });

      // 2) Geocode the address
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results && results[0].geometry.location) {
          const location = results[0].geometry.location;

          // 3) Re-center & add marker
          map.setCenter(location);
          new google.maps.Marker({
            map,
            position: location,
          });
        } else {
          console.error("Geocode failed:", status);
        }
      });
    });
  }, [address]);

  return (
    <div
      ref={mapRef}
      style={{ height: `${height}px`, width: "100%" }}
      className="rounded-lg shadow"
    />
  );
}
