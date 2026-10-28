import { Alert, Spin } from "antd";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { env } from "@/shared/config/env";
import { TASHKENT } from "../lib/map";

/* The small part of the Yandex Maps 2.1 API this picker uses. */
interface YPlacemark {
  geometry: {
    getCoordinates: () => [number, number];
    setCoordinates: (c: [number, number]) => void;
  };
  events: { add: (name: string, handler: () => void) => void };
}
interface YMap {
  geoObjects: { add: (object: YPlacemark) => void };
  events: {
    add: (
      name: string,
      handler: (event: { get: (key: string) => [number, number] }) => void,
    ) => void;
  };
  setCenter: (center: [number, number], zoom?: number) => void;
  destroy: () => void;
}
interface YMaps {
  ready: (callback: () => void) => void;
  Map: new (element: HTMLElement, options: object) => YMap;
  Placemark: new (coordinates: [number, number], properties: object, options: object) => YPlacemark;
}
declare global {
  interface Window {
    ymaps?: YMaps;
  }
}

let loader: Promise<YMaps> | null = null;

/** Loads the Yandex Maps script once for the whole session. */
function loadYandexMaps(key: string): Promise<YMaps> {
  loader ??= new Promise<YMaps>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(key)}&lang=ru_RU`;
    script.async = true;
    script.onload = () => {
      const ymaps = window.ymaps;
      if (ymaps) ymaps.ready(() => resolve(ymaps));
      else reject(new Error("ymaps"));
    };
    script.onerror = () => {
      loader = null;
      reject(new Error("ymaps"));
    };
    document.head.appendChild(script);
  });
  return loader;
}

const round = (value: number) => Math.round(value * 1e6) / 1e6;

interface Props {
  latitude: number | null;
  longitude: number | null;
  /** a click on the map or a drag of the point */
  onPick: (latitude: number, longitude: number) => void;
}

/** The point of the store: created on the first need, then only moved. */
function ensurePlacemark(
  ymaps: YMaps,
  map: YMap,
  current: YPlacemark | null,
  coordinates: [number, number],
  onDrag: (latitude: number, longitude: number) => void,
): YPlacemark {
  if (current) {
    current.geometry.setCoordinates(coordinates);
    return current;
  }
  const mark = new ymaps.Placemark(coordinates, {}, { draggable: true });
  mark.events.add("dragend", () => {
    const [a, b] = mark.geometry.getCoordinates();
    onDrag(round(a), round(b));
  });
  map.geoObjects.add(mark);
  return mark;
}

/**
 * Yandex map with one draggable point: a click puts it, a drag moves it. The fields next to it
 * (latitude / longitude) move the point too, so the map and the numbers always agree.
 * Without `VITE_YANDEX_MAPS_KEY` there is no map — the coordinates are typed by hand.
 */
export function StoreMapPicker({ latitude, longitude, onPick }: Props) {
  const { t } = useTranslation();
  const element = useRef<HTMLDivElement>(null);
  const map = useRef<YMap | null>(null);
  const maps = useRef<YMaps | null>(null);
  const placemark = useRef<YPlacemark | null>(null);
  /** the point the map opened with */
  const start = useRef({ latitude, longitude });
  /** the latest handler, so the listeners that are created once never go stale */
  const pick = useRef(onPick);
  useEffect(() => {
    pick.current = onPick;
  });
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const hasKey = env.yandexMapsKey !== "";

  // the map is created once
  useEffect(() => {
    if (!hasKey) return;
    let cancelled = false;
    loadYandexMaps(env.yandexMapsKey).then(
      (ymaps) => {
        if (cancelled || !element.current) return;
        maps.current = ymaps;
        const { latitude: lat, longitude: lng } = start.current;
        const point: [number, number] = lat !== null && lng !== null ? [lat, lng] : TASHKENT;
        const created = new ymaps.Map(element.current, {
          center: point,
          zoom: lat !== null ? 16 : 11,
          controls: ["zoomControl"],
        });
        map.current = created;
        const onDrag = (a: number, b: number) => pick.current(a, b);
        if (lat !== null && lng !== null) {
          placemark.current = ensurePlacemark(ymaps, created, null, point, onDrag);
        }
        created.events.add("click", (event) => {
          const [a, b] = event.get("coords");
          placemark.current = ensurePlacemark(ymaps, created, placemark.current, [a, b], onDrag);
          pick.current(round(a), round(b));
        });
        setState("ready");
      },
      () => !cancelled && setState("failed"),
    );
    return () => {
      cancelled = true;
      map.current?.destroy();
      map.current = null;
      placemark.current = null;
    };
  }, [hasKey]);

  // the numbers were typed: the point follows them
  useEffect(() => {
    const created = map.current;
    const ymaps = maps.current;
    if (!created || !ymaps || latitude === null || longitude === null) return;
    const known = placemark.current?.geometry.getCoordinates();
    if (known && round(known[0]) === latitude && round(known[1]) === longitude) return;
    placemark.current = ensurePlacemark(
      ymaps,
      created,
      placemark.current,
      [latitude, longitude],
      (a, b) => pick.current(a, b),
    );
    created.setCenter([latitude, longitude], 16);
  }, [latitude, longitude, state]);

  if (!hasKey) {
    return <Alert type="info" showIcon title={t("stores.map.noKey")} />;
  }
  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-slate-200">
        <div ref={element} className="h-72 w-full bg-slate-100" />
        {state === "loading" && (
          <div className="absolute inset-0 grid place-items-center bg-slate-50/70">
            <Spin />
          </div>
        )}
      </div>
      {state === "failed" ? (
        <Alert className="mt-2" type="warning" showIcon title={t("stores.map.failed")} />
      ) : (
        <div className="mt-1 text-xs text-slate-500">{t("stores.map.hint")}</div>
      )}
    </div>
  );
}
