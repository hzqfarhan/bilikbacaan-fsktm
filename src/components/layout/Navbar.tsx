"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function Navbar() {
  const [timeStr, setTimeStr] = useState("SYNCING CLOCK...");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      // Format specifically for Asia/Kuala_Lumpur
      const formatted = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kuala_Lumpur",
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(now);
      
      // Cleanup to look like "Thu, 9 Apr • 01:22:15 pm"
      const refined = formatted.replace(",", " •");
      setTimeStr(refined);
      setMounted(true);
    };
    
    tick(); // Initial tick
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="glass-nav">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">
        <Link href="/" className="text-xl md:text-2xl font-black text-white flex items-center gap-2 md:gap-3 drop-shadow-md cursor-pointer pointer-events-auto shrink-0">
          <Image 
            src="/logoitc.png" 
            alt="ITC Logo" 
            width={40} 
            height={40} 
            className="w-7 h-7 md:w-10 md:h-10 object-contain drop-shadow-[0_0_15px_rgba(255,204,51,0.3)]"
          />
          ITCtable
        </Link>

        {/* Live Clock MYT */}
        {mounted && (
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 border border-white/10 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl pointer-events-auto shadow-inner ml-2 shrink-0 animate-fade-in">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-[#ffcc33] animate-pulse" />
            <span 
              className="text-white/80 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase tabular-nums min-w-[130px] sm:min-w-[170px] text-center" 
            >
              {timeStr}
            </span>
          </div>
        )}
      </div>
    </nav>
  );
}
