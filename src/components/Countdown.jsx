import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/30 rounded-xl p-3">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-cyan-400" />
        <span className="text-cyan-400 font-bold text-xs">COMIENZA EN</span>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <div className="text-2xl font-black text-white">{timeLeft.days}</div>
          <div className="text-xs text-gray-400">días</div>
        </div>
        <div>
          <div className="text-2xl font-black text-white">{timeLeft.hours}</div>
          <div className="text-xs text-gray-400">hrs</div>
        </div>
        <div>
          <div className="text-2xl font-black text-white">{timeLeft.minutes}</div>
          <div className="text-xs text-gray-400">min</div>
        </div>
        <div>
          <div className="text-2xl font-black text-white">{timeLeft.seconds}</div>
          <div className="text-xs text-gray-400">seg</div>
        </div>
      </div>
    </div>
  );
}