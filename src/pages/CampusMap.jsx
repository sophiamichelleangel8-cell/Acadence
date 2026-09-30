import { MapContainer, ImageOverlay, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import mapImg from "../assets/your-map.png"; // 👈 this image

// ✅ PUT IT HERE (outside the component)
const locations = {
  blockVI: [600, 200],
  blockV: [550, 350],
  blockIV: [500, 600],
  blockIII: [450, 750],

  gym: [520, 500],
  meditation: [650, 250],
  playground: [650, 300],

  stationary: [480, 650],
  busStop: [900, 800],
  mainGate: [950, 500],
};

const bounds = [
  [0, 0],
  [700, 1500]
];

const CampusMap = () => {

  const route = [
    [900, 500],
    [800, 500],
    [700, 500],
    [650, 450],
    [600, 400],
    [550, 350],
  ];

  return (
    <MapContainer
      bounds={bounds}
      style={{ height: "100vh", width: "100%" }}
      crs={L.CRS.Simple}
    >
      <ImageOverlay url={mapImg} bounds={bounds} />
      {Object.entries(locations).map(([name, pos]) => (
  <Marker key={name} position={pos} />
))}

      {/* Example Route */}
      <Polyline positions={route} color="blue" weight={5} />

    </MapContainer>
  );
};

export default CampusMap;