"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  CarFront,
  ChevronDown,
  Compass,
  ExternalLink,
  MapPinned,
  Route,
} from "lucide-react";

type Stop = {
  id: string;
  name: string;
  shortName: string;
  lat: number;
  lng: number;
  day: string;
  date: string;
  stay: string;
  note: string;
  km: number;
  from: string;
  scenic?: boolean;
  labelDirection: "top" | "bottom" | "left" | "right";
  labelOffset?: [number, number];
};

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

const stops: Stop[] = [
  { id: "ulanhaote", name: "乌兰浩特", shortName: "乌兰浩特", lat: 46.0698, lng: 122.0873, day: "起点", date: "9/25", stay: "抵达并取车", note: "落地后向西北进入大兴安岭", km: 0, from: "", labelDirection: "right", labelOffset: [10, 0] },
  { id: "aershan", name: "阿尔山市 / 伊尔施", shortName: "阿尔山", lat: 47.1706, lng: 119.9367, day: "D1", date: "9/25", stay: "住 2 晚", note: "住在补给方便的位置，为森林公园留出完整一天", km: 277, from: "乌兰浩特", labelDirection: "left", labelOffset: [-10, 0] },
  { id: "aershan-park", name: "阿尔山国家森林公园", shortName: "阿尔山森林公园", lat: 47.288, lng: 120.424, day: "景区", date: "9/26", stay: "往返阿尔山", note: "火山、天池与秋林；当天回到阿尔山住宿", km: 148, from: "阿尔山市", scenic: true, labelDirection: "right", labelOffset: [11, -3] },
  { id: "manzhouli", name: "满洲里市区", shortName: "满洲里", lat: 49.5914, lng: 117.4464, day: "D2", date: "9/27", stay: "住 1 晚", note: "经新巴尔虎左旗、呼伦湖转场；出发前确认 S203 路况", km: 489, from: "阿尔山", labelDirection: "left", labelOffset: [-10, 0] },
  { id: "heishantou", name: "黑山头镇", shortName: "黑山头", lat: 50.2136, lng: 119.5711, day: "D3", date: "9/28", stay: "住 1 晚", note: "沿边境公路东行，草原日落与骑马体验", km: 200, from: "满洲里", labelDirection: "left", labelOffset: [-11, 8] },
  { id: "linjiang", name: "临江屯", shortName: "临江", lat: 51.399338, lng: 119.968781, day: "D4", date: "9/29", stay: "住 1 晚", note: "沿卡线经五卡—七卡—九卡到室韦，再向东北抵达临江", km: 176, from: "黑山头", labelDirection: "left", labelOffset: [-11, -6] },
  { id: "mordaga", name: "莫尔道嘎镇", shortName: "莫尔道嘎", lat: 51.2657, lng: 120.7716, day: "D5", date: "9/30", stay: "住 2 晚", note: "临江晨景后经太平镇进入林区；傍晚看龙岩山与林城", km: 98, from: "临江", labelDirection: "right", labelOffset: [12, 10] },
  { id: "mordaga-park", name: "莫尔道嘎国家森林公园", shortName: "莫尔道嘎森林公园", lat: 51.4051, lng: 120.7358, day: "D6", date: "10/1", stay: "往返莫尔道嘎", note: "完整一天乘森林小火车、走林间步道；白鹿岛视路况决定", km: 47, from: "莫尔道嘎镇", scenic: true, labelDirection: "top", labelOffset: [0, -34] },
  { id: "erguna", name: "额尔古纳市区", shortName: "额尔古纳", lat: 50.2358, lng: 120.1752, day: "D7", date: "10/2", stay: "住 1 晚", note: "沿林区公路南下，下午游额尔古纳湿地并等日落", km: 219, from: "莫尔道嘎", labelDirection: "right", labelOffset: [11, 12] },
  { id: "hailaer", name: "海拉尔市区", shortName: "海拉尔", lat: 49.2321, lng: 119.8172, day: "D8", date: "10/3", stay: "住 1 晚", note: "短途抵达海拉尔，留足时间还车、逛博物馆与吃饭", km: 131, from: "额尔古纳", labelDirection: "right", labelOffset: [11, 0] },
];

const notePositions: Record<string, { lat: number; lng: number; side: "left" | "right"; title: string }> = {
  aershan: { lat: 46.78, lng: 119.18, side: "left", title: "乌兰浩特 → 阿尔山" },
  "aershan-park": { lat: 47.5, lng: 121.18, side: "right", title: "阿尔山森林公园" },
  manzhouli: { lat: 49.18, lng: 116.7, side: "left", title: "阿尔山 → 呼伦湖 → 满洲里" },
  heishantou: { lat: 49.45, lng: 120.85, side: "right", title: "满洲里 → 黑山头" },
  linjiang: { lat: 50.72, lng: 118.58, side: "left", title: "黑山头 → 临江" },
  erguna: { lat: 50.35, lng: 121.18, side: "right", title: "莫尔道嘎 → 额尔古纳" },
  mordaga: { lat: 51.25, lng: 121.62, side: "right", title: "临江 → 莫尔道嘎" },
  "mordaga-park": { lat: 51.6, lng: 119.55, side: "left", title: "莫尔道嘎森林公园" },
  hailaer: { lat: 48.5, lng: 120.85, side: "right", title: "额尔古纳 → 海拉尔" },
};

const routePairs = [
  [stops[0], stops[1], "#cc5337", false],
  [stops[1], stops[2], "#e5a935", true],
  [stops[1], stops[3], "#cc5337", false],
  [stops[3], stops[4], "#cc5337", false],
  [stops[4], stops[5], "#cc5337", false],
  [stops[5], stops[6], "#cc5337", false],
  [stops[6], stops[7], "#e5a935", true],
  [stops[6], stops[8], "#cc5337", false],
  [stops[8], stops[9], "#cc5337", false],
] as const;

const fallbackRouteLines: Record<string, [number, number][]> = {
  "aershan-manzhouli": [
    [47.1706, 119.9367],
    [48.212, 118.27],
    [48.668, 116.815],
    [48.8388199, 116.97577],
    [49.5914, 117.4464],
  ],
};

const routeLandmarks: { day: string; label: string; lat: number; lng: number; direction: "left" | "right" | "top" | "bottom"; offset?: [number, number] }[] = [
  { day: "D1", label: "乌兰毛都草原", lat: 46.3177, lng: 120.717, direction: "left" },
  { day: "景区", label: "不冻河", lat: 47.2876016, lng: 120.426854, direction: "bottom" },
  { day: "景区", label: "阿尔山天池", lat: 47.317072, lng: 120.4045397, direction: "left" },
  { day: "D3", label: "186彩带河", lat: 49.9646659, lng: 119.02543, direction: "left" },
  { day: "D4", label: "五卡", lat: 50.457964, lng: 119.2609405, direction: "right" },
  { day: "D4", label: "七卡", lat: 50.746585, lng: 119.5248556, direction: "right" },
  { day: "D4", label: "九卡", lat: 50.9719947, lng: 119.6150636, direction: "left" },
  { day: "D4", label: "室韦", lat: 51.338436, lng: 119.9004692, direction: "right", offset: [60, 5] },
  { day: "D5", label: "老鹰嘴", lat: 51.4899278, lng: 120.026139, direction: "top" },
  { day: "D5", label: "太平镇", lat: 51.4977138, lng: 120.2859756, direction: "right", offset: [22, -18] },
  { day: "D6", label: "红豆坡", lat: 51.3502759, lng: 120.8010721, direction: "left", offset: [-25, 18] },
  { day: "D7", label: "恩和", lat: 50.8205638, lng: 119.9134872, direction: "right", offset: [45, -15] },
  { day: "D7", label: "白桦林", lat: 50.5428513, lng: 120.1344697, direction: "right" },
  { day: "D8", label: "额尔古纳湿地", lat: 50.2470445, lng: 120.1438875, direction: "bottom", offset: [0, 45] },
];

function MapView({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  const mapNode = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<Record<string, import("leaflet").Marker>>({});

  useEffect(() => {
    if (!mapNode.current || mapRef.current) return;
    let cancelled = false;

    void import("leaflet").then(async (L) => {
      if (cancelled || !mapNode.current) return;

      const map = L.map(mapNode.current, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        minZoom: 4,
        zoomSnap: 0.25,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 15,
        crossOrigin: true,
      }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.control.attribution({ prefix: false, position: "bottomleft" })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>')
        .addTo(map);

      map.createPane("cityBoundaries").style.zIndex = "330";
      map.createPane("countryBoundaries").style.zIndex = "350";
      map.createPane("travelRoute").style.zIndex = "400";
      map.createPane("featuredRoute").style.zIndex = "420";
      map.createPane("noteLines").style.zIndex = "430";

      void Promise.all([
        fetch(assetUrl("data/country-borders.geojson")).then((response) => response.json()),
        fetch(assetUrl("data/city-borders.geojson")).then((response) => response.json()),
      ]).then(([countryBorders, cityBorders]) => {
        L.geoJSON(cityBorders, {
          pane: "cityBoundaries",
          interactive: false,
          style: { color: "#d06454", weight: 1.15, opacity: 0.74, dashArray: "5 5", fillOpacity: 0 },
        }).addTo(map);
        L.geoJSON(countryBorders, {
          pane: "countryBoundaries",
          interactive: false,
          style: { color: "#a9362b", weight: 1.8, opacity: 0.92, lineCap: "round", fillOpacity: 0 },
        }).addTo(map);
      }).catch(() => undefined);

      const allBounds = L.latLngBounds([
        ...stops.map((stop) => [stop.lat, stop.lng] as [number, number]),
        ...Object.values(notePositions).map((note) => [note.lat, note.lng] as [number, number]),
      ]);
      requestAnimationFrame(() => {
        map.invalidateSize();
        map.fitBounds(allBounds, { paddingTopLeft: [245, 82], paddingBottomRight: [245, 82] });
      });

      const routeLayers: Record<string, { halo: import("leaflet").Polyline; route: import("leaflet").Polyline }> = {};

      routePairs.forEach(([from, to, _color, scenic]) => {
        const routeKey = `${from.id}-${to.id}`;
        const isHulunLakeRoute = routeKey === "aershan-manzhouli";
        const initialLine = fallbackRouteLines[routeKey] ?? [[from.lat, from.lng], [to.lat, to.lng]];
        const routeHalo = L.polyline(initialLine, {
          pane: isHulunLakeRoute ? "featuredRoute" : "travelRoute",
          color: "#fffdf7",
          weight: isHulunLakeRoute ? 8 : scenic ? 4.8 : 5.6,
          opacity: isHulunLakeRoute ? 0.96 : 0.8,
          dashArray: scenic ? "7 8" : undefined,
          lineCap: "round",
          className: `travel-route-halo route-${routeKey}`,
        }).addTo(map);
        const route = L.polyline(initialLine, {
          pane: isHulunLakeRoute ? "featuredRoute" : "travelRoute",
          color: isHulunLakeRoute ? "#0f7655" : "#2f6b57",
          weight: isHulunLakeRoute ? 4.4 : scenic ? 2.4 : 3,
          opacity: isHulunLakeRoute ? 1 : scenic ? 0.78 : 0.94,
          dashArray: scenic ? "7 8" : undefined,
          lineCap: "round",
          className: `travel-route route-${routeKey}`,
        }).addTo(map);
        routeLayers[routeKey] = { halo: routeHalo, route };
      });

      void fetch(assetUrl("data/travel-routes.geojson"))
        .then((response) => {
          if (!response.ok) throw new Error(`Route data failed: ${response.status}`);
          return response.json();
        })
        .then((data) => {
          const features = Array.isArray(data?.features) ? data.features : [];
          features.forEach((feature: { properties?: { fromId?: string; toId?: string }; geometry?: { coordinates?: [number, number][] } }) => {
            const fromId = feature.properties?.fromId;
            const toId = feature.properties?.toId;
            const coordinates = feature.geometry?.coordinates;
            if (!fromId || !toId || !Array.isArray(coordinates)) return;
            const layers = routeLayers[`${fromId}-${toId}`];
            if (!layers) return;
            const roadLine = coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
            layers.halo.setLatLngs(roadLine);
            layers.route.setLatLngs(roadLine);
          });
        })
        .catch(() => undefined);

      const hulunLake = L.marker([48.8388199, 116.97577], {
        interactive: false,
        keyboard: false,
        icon: L.divIcon({
          className: "via-place-icon",
          html: '<div class="via-place-marker">湖</div>',
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        }),
      }).addTo(map);
      hulunLake.bindTooltip("呼伦湖", {
        permanent: true,
        direction: "bottom",
        offset: L.point(0, 12),
        className: "place-label via-place-label",
        opacity: 1,
      });

      [
        { lat: 48.212, lng: 118.27, label: "新巴尔虎左旗" },
        { lat: 48.668, lng: 116.815, label: "新巴尔虎右旗" },
      ].forEach((place) => {
        const marker = L.circleMarker([place.lat, place.lng], {
          pane: "markerPane",
          radius: 5,
          color: "#fffdf7",
          weight: 3,
          fillColor: "#0f7655",
          fillOpacity: 1,
          interactive: false,
        }).addTo(map);
        marker.bindTooltip(place.label, {
          permanent: true,
          direction: "right",
          offset: L.point(7, 0),
          className: "place-label via-route-label",
          opacity: 1,
        });
      });

      routeLandmarks.forEach((place) => {
        const marker = L.circleMarker([place.lat, place.lng], {
          pane: "markerPane",
          radius: 4.5,
          color: "#fffdf7",
          weight: 2.5,
          fillColor: "#2f6b57",
          fillOpacity: 1,
          interactive: false,
        }).addTo(map);
        const verticalOffset = place.offset?.[1] ?? (place.direction === "top" ? -7 : place.direction === "bottom" ? 7 : 0);
        const horizontalOffset = place.offset?.[0] ?? (place.direction === "left" ? -7 : place.direction === "right" ? 7 : 0);
        marker.bindTooltip(place.label, {
          permanent: true,
          direction: place.direction,
          offset: L.point(horizontalOffset, verticalOffset),
          className: "place-label route-landmark-label",
          opacity: 1,
        });
      });

      stops.slice(1).forEach((stop) => {
        const note = notePositions[stop.id];
        if (!note) return;
        L.polyline([[stop.lat, stop.lng], [note.lat, note.lng]], {
          pane: "noteLines",
          color: "#24483d",
          weight: 1.2,
          opacity: 0.68,
          dashArray: "3 5",
          lineCap: "round",
        }).addTo(map);
        L.circleMarker([note.lat, note.lng], {
          pane: "noteLines",
          radius: 2.5,
          color: "#24483d",
          weight: 1,
          fillColor: "#24483d",
          fillOpacity: 1,
          interactive: false,
        }).addTo(map);

        const noteHtml = `
          <article class="map-note-card note-${note.side}">
            <header><b>${stop.day}</b><span>${stop.date}</span><em>${stop.km} km${stop.scenic ? " 往返" : ""}</em></header>
            <strong>${note.title}</strong>
            <p>${stop.note}</p>
          </article>`;
        L.marker([note.lat, note.lng], {
          interactive: false,
          keyboard: false,
          icon: L.divIcon({
            className: "map-note-icon",
            html: noteHtml,
            iconSize: [224, 82],
            iconAnchor: note.side === "left" ? [224, 41] : [0, 41],
          }),
        }).addTo(map);
      });

      stops.forEach((stop) => {
        const marker = L.marker([stop.lat, stop.lng], {
          icon: L.divIcon({
            className: "stop-icon",
            html: `<div class="map-day-marker${stop.scenic ? " scenic-marker" : ""}">${stop.day}</div>`,
            iconSize: [42, 42],
            iconAnchor: [21, 21],
          }),
          keyboard: true,
          title: `${stop.date} ${stop.name}`,
        }).addTo(map);
        if (stop.id === "ulanhaote") {
          marker.bindTooltip(stop.shortName, {
            permanent: true,
            direction: "right",
            offset: L.point(10, 0),
            className: "place-label start-label",
            opacity: 1,
          });
        }
        marker.on("click", () => onSelect(stop.id));
        markerRef.current[stop.id] = marker;
      });
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = {};
    };
  }, [onSelect]);

  useEffect(() => {
    const marker = markerRef.current[activeId];
    if (!marker) return;
    const el = marker.getElement();
    Object.values(markerRef.current).forEach((item) => item.getElement()?.classList.remove("is-active"));
    el?.classList.add("is-active");
  }, [activeId]);

  return <div ref={mapNode} className="map-canvas" aria-label="呼伦贝尔与阿尔山行程地图" />;
}

export default function Home() {
  const [activeId, setActiveId] = useState("aershan");
  const itinerary = stops.slice(1);

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="回到顶部">
          <span className="brand-mark"><Compass size={18} /></span>
          <span>北境秋行</span>
        </a>
        <div className="header-meta">
          <span><CalendarDays size={16} />9/25—10/3</span>
          <span><CarFront size={17} />约 1,800 km</span>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow"><span /> 9 天 · 8 夜 · 内蒙古东北部自驾</div>
        <h1>从火山秋林，<br />一路开到边境草原。</h1>
        <p className="hero-copy">乌兰浩特出发，经阿尔山、满洲里与额尔古纳河，深入大兴安岭，最后抵达海拉尔。</p>
        <a href="#route-map" className="down-link">看完整路线 <ChevronDown size={18} /></a>
      </section>

      <section className="route-section" id="route-map">
        <div className="section-heading">
          <div>
            <span className="section-kicker">ROUTE AT A GLANCE</span>
            <h2>一张图，看懂整趟行程</h2>
          </div>
          <div className="legend">
            <span><i className="route-swatch" /> 行程路线</span>
            <span><i className="country-swatch" /> 国界</span>
            <span><i className="city-swatch" /> 城市边界</span>
          </div>
        </div>

        <div className="map-shell">
          <div className="map-area">
            <MapView activeId={activeId} onSelect={setActiveId} />
            <div className="map-caption"><MapPinned size={16} /> 真实方位 · 公路走向 · 边界示意</div>
            <div className="map-stamp"><b>9/25—10/3</b><span>约 1,800 km</span></div>
          </div>
        </div>
        <p className="map-note">地图公里数按常用公路路线估算；景区内部游览、临时绕行与住宿点接驳未计入，出发前请按实时导航复核。</p>
      </section>

      <section className="journey-section">
        <div className="journey-intro">
          <span className="section-kicker">DAY BY DAY</span>
          <h2>每天住哪儿，<br />为什么这样走</h2>
          <p>把长距离转场放在住宿条件更好的城市收尾；边境与森林段则留足白天，不赶夜路。</p>
        </div>
        <div className="day-grid">
          {itinerary.map((stop) => (
            <article key={stop.id} className={stop.scenic ? "day-card scenic-day" : "day-card"}>
              <div className="card-head">
                <span>{stop.date}</span>
                <small>{stop.day}</small>
              </div>
              <h3>{stop.name}</h3>
              <p>{stop.note}</p>
              <div className="card-foot">
                <span><Route size={16} /> {stop.km} km{stop.scenic ? " 往返" : ""}</span>
                <span>{stop.stay}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer>
        <div>
          <span className="footer-mark"><Compass size={20} /></span>
          <b>北境秋行 · 路线地图</b>
        </div>
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">地图数据说明 <ExternalLink size={14} /></a>
      </footer>
    </main>
  );
}
