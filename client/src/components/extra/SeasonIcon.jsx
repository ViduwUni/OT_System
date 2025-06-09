import { PiSnowflakeBold } from "react-icons/pi";
import { FaSeedling, FaLeaf } from "react-icons/fa";
import { WiDaySunny } from "react-icons/wi";

export default function SeasonIcon({ season }) {
  switch (season) {
    case "winter":
      return <PiSnowflakeBold size={20} color="#0ea5e9" />;
    case "spring":
      return <FaSeedling size={20} color="#22c55e" />;
    case "summer":
      return <WiDaySunny size={20} color="#facc15" />;
    case "autumn":
      return <FaLeaf size={20} color="#f97316" />;
    default:
      return null;
  }
}