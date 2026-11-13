import CampusGameClient from "./CampusGameClient";

export const metadata = {
  title: "3D DTU Campus Tour & Interactive Game",
  description:
    "Explore the authentic 164-acre Delhi Technological University (DTU) campus in 3D. Roam the iconic B.R. Ambedkar Auditorium, Central Library, Wind Point, Mech-C, and Raj Soin Hall.",
  keywords: [
    "DTU 3D Campus",
    "DTU Virtual Tour",
    "Delhi Technological University 3D Map",
    "DTU Campus Game",
  ],
};

export default function CampusGamePage() {
  return <CampusGameClient />;
}
