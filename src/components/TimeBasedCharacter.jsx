import { useEffect, useState } from "react";
import "./Character.css";

import morning from "../assets/morning.png";
import work from "../assets/work.png";
import relax from "../assets/relax.png";
import study from "../assets/study.png";
import nightWork from "../assets/night-work.png";
import sleep from "../assets/sleep.png";

function getCurrentState() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const time = hour + minute / 60;

  if (time >= 6.5 && time < 9.33) return "morning";
  if (time >= 9.33 && time < 16.33) return "work";
  if (time >= 16.33 && time < 18) return "relax";
  if (time >= 18 && time < 22) return "study";
  if (time >= 22 && time < 23.5) return "night";
  return "sleep";
}

const images = {
  morning,
  work,
  relax,
  study,
  night: nightWork,
  sleep
};

export default function TimeBasedCharacter({ onStateChange }) {
  const [state, setState] = useState(getCurrentState());

  useEffect(() => {
    const update = () => {
      const newState = getCurrentState();
      setState(newState);

      if (onStateChange) {
        onStateChange(newState);
      }
    };

    update(); // ✅ sync immediately

    const interval = setInterval(update, 60000);

    return () => clearInterval(interval);
  }, [onStateChange]);

  return (
    <div className={`character-wrapper ${state}`}>
      <img src={images[state]} alt="character" className="character-image" />
    </div>
  );
}