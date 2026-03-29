"use client";

import { DutyRecord } from "@/utils/csvParser";
import { formatDateDisplay } from "@/utils/dateUtils";

interface DutyCardProps {
  title: string;
  duty: DutyRecord | null;
  dateStr: string;
}

export default function DutyCard({ title, duty, dateStr }: DutyCardProps) {
  return (
    <div className="glass-card flex flex-col items-start gap-4 p-6 relative">
      <div className="z-10 w-full flex justify-between items-center mb-2">
        <h2 className="text-xl md:text-2xl font-black text-white m-0 tracking-tight drop-shadow-md">
          {title}
        </h2>
        <span className="text-xs font-bold uppercase tracking-widest text-[#a78bfa] border border-[#a78bfa]/30 bg-[#1a0b2e]/50 px-3 py-1 rounded-full">
          {formatDateDisplay(dateStr)}
        </span>
      </div>

      {duty ? (
        <div className="z-10 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
            <h3 className="text-[#a78bfa] text-xs font-bold uppercase tracking-wider mb-1 m-0">
              Open Duty
            </h3>
            <p className="text-white font-semibold m-0 text-sm md:text-base">
              {duty.openDuty}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
            <h3 className="text-[#ffcc33] text-xs font-bold uppercase tracking-wider mb-1 m-0">
              Close Duty
            </h3>
            <p className="text-white font-semibold m-0 text-sm md:text-base">
              {duty.closeDuty}
            </p>
          </div>
        </div>
      ) : (
        <div className="z-10 w-full py-6 text-center bg-white/5 border border-white/10 rounded-2xl">
          <p className="text-white/60 text-sm m-0">No duty record for this date.</p>
        </div>
      )}
    </div>
  );
}
