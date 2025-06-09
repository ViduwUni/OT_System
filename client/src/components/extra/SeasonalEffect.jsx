import { useEffect, useState } from "react";
import SeasonIcon from "./SeasonIcon";
import "./css/SeasonalEffect.css";

function getSeason(date = new Date()) {
  const month = date.getMonth() + 1;
  if (month === 12 || month <= 2) return "winter";
  if (month >= 3 && month <= 6) return "spring";
  if (month >= 7 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

export default function SeasonalEffect() {
  const [season, setSeason] = useState(getSeason());

  // Create an array to render multiple falling icons
  const flakes = Array.from({ length: 30 });

  useEffect(() => {
    const interval = setInterval(() => {
      setSeason(getSeason());
    }, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`seasonal-container ${season}`}>
      {/* Falling seasonal icons */}
      <div className="falling-icons">
        {flakes.map((_, i) => (
          <div
            key={i}
            className="falling-icon"
            style={{
              left: `${Math.random() * 100}vw`,
              animationDuration: `${5 + Math.random() * 5}s`,
              animationDelay: `${Math.random() * 5}s`,
              fontSize: `${20 + Math.random() * 20}px`,
            }}
          >
            <SeasonIcon season={season} />
          </div>
        ))}
      </div>
    </div>
  );
}