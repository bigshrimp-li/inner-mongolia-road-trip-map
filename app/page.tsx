"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  CarFront,
  ChevronDown,
  Compass,
  ExternalLink,
  MapPinned,
  Mountain,
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
};

const stops: Stop[] = [
  { id: "ulanhaote", name: "乌兰浩特", shortName: "乌兰浩特", lat: 46.0698, lng: 122.0873, day: "起点", date: "9/25", stay: "抵达并取车", note: "落地后向西北进入大兴安岭", km: 0, from: "" },
  { id: "aershan", name: "阿尔山市 / 伊尔施", shortName: "阿尔山", lat: 47.1706, lng: 119.9367, day: "D1", date: "9/25", stay: "住 2 晚", note: "住在补给方便的位置，为森林公园留出完整一天", km: 277, from: "乌兰浩特" },
  { id: "aershan-park", name: "阿尔山国家森林公园", shortName: "阿尔山森林公园", lat: 47.288, lng: 120.424, day: "D2", date: "9/26", stay: "往返阿尔山", note: "火山、天池与秋林；当天回到阿尔山住宿", km: 148, from: "阿尔山市", scenic: true },
  { id: "manzhouli", name: "满洲里市区", shortName: "满洲里", lat: 49.5914, lng: 117.4464, day: "D3", date: "9/27", stay: "住 1 晚", note: "全程最长转场日，晚上看边城夜景并补给", km: 489, from: "阿尔山" },
  { id: "heishantou", name: "黑山头镇", shortName: "黑山头", lat: 50.2136, lng: 119.5711, day: "D4", date: "9/28", stay: "住 1 晚", note: "沿边境公路东行，草原日落与骑马体验", km: 200, from: "满洲里" },
  { id: "linjiang", name: "临江屯", shortName: "临江", lat: 51.099, lng: 119.713, day: "D5", date: "9/29", stay: "住 1 晚", note: "走五卡—七卡—九卡，室韦作为住宿备选", km: 257, from: "黑山头" },
  { id: "erguna", name: "额尔古纳市区", shortName: "额尔古纳", lat: 50.2358, lng: 120.1752, day: "D6", date: "9/30", stay: "住 1 晚", note: "经白桦林与湿地后回到市区休整", km: 209, from: "临江" },
  { id: "mordaga", name: "莫尔道嘎镇", shortName: "莫尔道嘎", lat: 51.2657, lng: 120.7716, day: "D7", date: "10/1", stay: "住 2 晚", note: "经根河进入大兴安岭林区", km: 219, from: "额尔古纳" },
  { id: "mordaga-park", name: "莫尔道嘎国家森林公园", shortName: "莫尔道嘎森林公园", lat: 51.4051, lng: 120.7358, day: "D8", date: "10/2", stay: "往返莫尔道嘎", note: "整天留给森林段，晚上仍住镇上", km: 47, from: "莫尔道嘎镇", scenic: true },
  { id: "hailaer", name: "海拉尔市区", shortName: "海拉尔", lat: 49.2321, lng: 119.8172, day: "D9", date: "10/3", stay: "住 1 晚", note: "长途返程，方便还车、吃饭与次日离开", km: 349, from: "莫尔道嘎" },
];

const routePairs = [
  [stops[0], stops[1], "#cc5337", false],
  [stops[1], stops[2], "#e5a935", true],
  [stops[1], stops[3], "#cc5337", false],
  [stops[3], stops[4], "#cc5337", false],
  [stops[4], stops[5], "#cc5337", false],
  [stops[5], stops[6], "#cc5337", false],
  [stops[6], stops[7], "#cc5337", false],
  [stops[7], stops[8], "#e5a935", true],
  [stops[7], stops[9], "#cc5337", false],
] as const;

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
        minZoom: 5,
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

      const allBounds = L.latLngBounds(stops.map((stop) => [stop.lat, stop.lng] as [number, number]));
      map.fitBounds(allBounds, { paddingTopLeft: [46, 60], paddingBottomRight: [46, 60] });

      routePairs.forEach(([from, to, color, scenic]) => {
        const fallback = L.polyline([[from.lat, from.lng], [to.lat, to.lng]], {
          color,
          weight: scenic ? 3 : 4,
          opacity: scenic ? 0.72 : 0.9,
          dashArray: scenic ? "7 8" : undefined,
          lineCap: "round",
        }).addTo(map);

        const midpoint = L.latLng((from.lat + to.lat) / 2, (from.lng + to.lng) / 2);
        const distance = scenic ? `${to.km} km 往返` : `${to.km} km`;
        L.marker(midpoint, {
          interactive: false,
          icon: L.divIcon({
            className: "distance-icon",
            html: `<span>${distance}</span>`,
            iconSize: [92, 25],
            iconAnchor: [46, 12],
          }),
        }).addTo(map);

        const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=simplified&geometries=geojson`;
        void fetch(url)
          .then((response) => response.json())
          .then((data) => {
            const coordinates = data?.routes?.[0]?.geometry?.coordinates;
            if (!Array.isArray(coordinates)) return;
            const roadLine = coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
            fallback.setLatLngs(roadLine);
          })
          .catch(() => undefined);
      });

      stops.forEach((stop) => {
        const label = stop.scenic
          ? `<div class="map-stop scenic-stop"><b>${stop.day}</b><span>${stop.shortName}</span></div>`
          : `<div class="map-stop"><b>${stop.day}</b><span>${stop.shortName}</span></div>`;
        const marker = L.marker([stop.lat, stop.lng], {
          icon: L.divIcon({ className: "stop-icon", html: label, iconSize: [160, 34], iconAnchor: [17, 17] }),
          keyboard: true,
          title: `${stop.date} ${stop.name}`,
        }).addTo(map);
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
  const activeStop = stops.find((stop) => stop.id === activeId) ?? stops[1];
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
          <span><CarFront size={17} />约 2,195 km</span>
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
            <span><i className="route-swatch" /> 城市转场</span>
            <span><i className="scenic-swatch" /> 当日往返</span>
          </div>
        </div>

        <div className="map-shell">
          <div className="map-area">
            <MapView activeId={activeId} onSelect={setActiveId} />
            <div className="map-caption"><MapPinned size={16} /> 按真实地理位置与公路走向绘制</div>
          </div>

          <aside className="map-detail" aria-live="polite">
            <div className="detail-topline">
              <span>{activeStop.day}</span>
              <strong>{activeStop.date}</strong>
            </div>
            <div className="detail-distance">
              <small>{activeStop.scenic ? "当天往返" : activeStop.from ? `${activeStop.from} 出发` : "旅程起点"}</small>
              <b>{activeStop.km ? activeStop.km : "—"}<em>{activeStop.km ? " km" : ""}</em></b>
            </div>
            <h3>{activeStop.name}</h3>
            <p>{activeStop.note}</p>
            <div className="stay-pill"><Mountain size={15} /> {activeStop.stay}</div>
            <div className="stop-list" role="list" aria-label="选择某一天查看详情">
              {itinerary.map((stop) => (
                <button
                  key={stop.id}
                  type="button"
                  className={activeId === stop.id ? "active" : ""}
                  onClick={() => setActiveId(stop.id)}
                  aria-pressed={activeId === stop.id}
                >
                  <span>{stop.date}</span>
                  <b>{stop.shortName}</b>
                  <em>{stop.km} km</em>
                </button>
              ))}
            </div>
          </aside>
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
