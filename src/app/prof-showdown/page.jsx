import ProfShowdownClient from "./ProfShowdownClient";

export const metadata = {
  title: "Prof Showdown: The Great CGPA Fight | DTU Connect",
  description:
    "An arcade fighting parody game inspired by FightKaro. Battle through iconic DTU professors — Dean of Detain, Dr. Math Matrix, Mech-C Lathe Master, and the DSA Wizard — across campus stages with combos and Shakti super moves!",
  keywords: [
    "DTU Game",
    "Prof Showdown",
    "FightKaro",
    "DTU Connect Fight Game",
    "Arcade Fighter",
    "Dean of Detain",
    "Wind Point OAT Fight",
  ],
  openGraph: {
    title: "Prof Showdown: The Great CGPA Fight | DTU Connect",
    description:
      "Arcade-style fighting game starring DTU professors across campus stages. Play vs CPU or Local 2-Player!",
    url: "https://dtu-connect.netlify.app/prof-showdown",
    siteName: "DTU Connect",
    type: "website",
  },
};

export default function ProfShowdownPage() {
  return <ProfShowdownClient />;
}
