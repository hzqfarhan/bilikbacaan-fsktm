"use client";

import { useState } from "react";
import { DutyRecord } from "@/utils/csvParser";
import { Calendar } from "lucide-react";
import DutyCard from "./DutyCard";
import { getTodayStr } from "@/utils/dateUtils";

interface DateQueryProps {
  records: DutyRecord[];
}

export default function DateQuery({ records }: DateQueryProps) {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());

  const dutyMatch = records.find((r) => r.date === selectedDate) || null;

  return (
    <div className="w-full mt-12 animate-fade-in" style={{ animationDelay: "0.1s" }}>
      <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-sm flex items-center gap-2">
        <Calendar className="w-6 h-6 text-[#a78bfa]" />
        Check Specific Date
      </h2>
      
      <div className="mb-6">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-lg font-medium shadow-inner focus:outline-none focus:border-[#ffcc33] focus:ring-2 focus:ring-[#ffcc33]/50 transition-all custom-datepicker"
          style={{ colorScheme: "dark" }}
        />
      </div>

      <div className="max-w-3xl">
        <DutyCard 
          title="Searched Result" 
          dateStr={selectedDate} 
          duty={dutyMatch}
        />
      </div>
    </div>
  );
}
