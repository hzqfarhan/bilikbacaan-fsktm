"use client";

import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="glass-nav">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-black text-white flex items-center gap-3 drop-shadow-md cursor-pointer pointer-events-auto">
          <Image 
            src="/logoitc.png" 
            alt="ITC Logo" 
            width={40} 
            height={40} 
            className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-[0_0_15px_rgba(255,204,51,0.3)]"
          />
          ITCtable
        </Link>
      </div>
    </nav>
  );
}
