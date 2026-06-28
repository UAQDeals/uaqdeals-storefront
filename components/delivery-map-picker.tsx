"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";

interface Props {
  onConfirm: (address: string, city: string, lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

async function reverseGeocode(lat: number, lng: number): Promise<{ area: string; city: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const d = await res.json();
    const a = d.address ?? {};
    const area =
      a.neighbourhood ?? a.suburb ?? a.quarter ?? a.village ??
      a.town ?? a.city_district ?? a.county ?? "";
    const city =
      a.city ?? a.town ?? a.village ?? a.county ?? "Umm Al Quwain";
    return { area: area || city, city };
  } catch {
    return { area: "", city: "Umm Al Quwain" };
  }
}

const DEFAULT_LAT = 25.5647;
const DEFAULT_LNG = 55.5533;

export function DeliveryMapPicker({ onConfirm, initialLat, initialLng }: Props) {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [lat, setLat] = useState(initialLat ?? DEFAULT_LAT);
  const [lng, setLng] = useState(initialLng ?? DEFAULT_LNG);
  const [area, setArea] = useState("");
  const [city, setCity] = useState("Umm Al Quwain");
  const [geocoding, setGeocoding] = useState(false);
  const [locating, setLocating] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      setGeocoding(true);
      const r = await reverseGeocode(lat, lng);
      setArea(r.area); setCity(r.city);
      setGeocoding(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    import("leaflet").then((mod) => {
      if (cancelled || !containerRef.current) return;
      const L = mod.default ?? mod;
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current, { zoomControl: true }).setView([lat, lng], 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "\u00a9 OpenStreetMap contributors",
      }).addTo(map);

      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);

      async function updatePos(newLat: number, newLng: number) {
        setLat(newLat); setLng(newLng);
        setGeocoding(true);
        const r = await reverseGeocode(newLat, newLng);
        setArea(r.area); setCity(r.city);
        setGeocoding(false);
      }

      marker.on("dragend", () => {
        const { lat: la, lng: ln } = marker.getLatLng();
        updatePos(la, ln);
      });
      map.on("click", (e: any) => {
        const { lat: la, lng: ln } = e.latlng;
        marker.setLatLng([la, ln]);
        updatePos(la, ln);
      });

      mapRef.current = map;
      markerRef.current = marker;
      setReady(true);
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function detectLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const la = pos.coords.latitude, ln = pos.coords.longitude;
        setLat(la); setLng(ln);
        mapRef.current?.setView([la, ln], 16);
        markerRef.current?.setLatLng([la, ln]);
        setGeocoding(true);
        const r = await reverseGeocode(la, ln);
        setArea(r.area); setCity(r.city);
        setGeocoding(false);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function confirm() {
    const addrStr = `${area || city} (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
    onConfirm(addrStr, city, lat, lng);
  }

  const addrDisplay = area ? `${area}, ${city}` : city;

  return (
    <div className="space-y-3">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      <button type="button" onClick={detectLocation} disabled={locating}
        className="inline-flex items-center gap-2 rounded-full border border-[color:var(--brand-maroon)] px-4 py-2 text-sm font-semibold text-[color:var(--brand-maroon)] hover:bg-[color:var(--brand-maroon)] hover:text-white transition disabled:opacity-50">
        {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
        {locating ? "Detecting\u2026" : "Use my location"}
      </button>

      <div className="relative overflow-hidden rounded-xl border border-[color:var(--brand-border)]" style={{ height: 280 }}>
        <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-[color:var(--brand-border)] bg-white px-4 py-3">
        <MapPin className="h-4 w-4 shrink-0 text-[color:var(--brand-maroon)]" />
        <span className="flex-1 text-sm text-neutral-700">
          {geocoding ? <span className="text-neutral-400">Resolving address\u2026</span> : addrDisplay}
        </span>
        {geocoding && <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" />}
      </div>

      <p className="text-xs text-neutral-500">Tap anywhere on the map or drag the pin to set your delivery location.</p>

      <button type="button" onClick={confirm} disabled={geocoding || !ready}
        className="w-full rounded-full bg-[color:var(--brand-maroon)] py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition">
        Confirm Delivery Location
      </button>
    </div>
  );
}
