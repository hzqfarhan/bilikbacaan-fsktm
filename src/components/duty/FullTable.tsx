"use client";

import { useState, useMemo, useEffect } from "react";
import { DutyRecord } from "@/utils/csvParser";
import { Search, X, Calendar } from "lucide-react";
import { formatDateDisplay, getTodayStr } from "@/utils/dateUtils";

interface FullTableProps {
  records: DutyRecord[];
}

export default function FullTable({ records }: FullTableProps) {
  const [search, setSearch] = useState("");
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const today = getTodayStr();

  // Filter records based on search
  const filteredRecords = useMemo(() => {
    if (!search) return records;
    return records.filter(
      (r) =>
        r.openDuty.toLowerCase().includes(search.toLowerCase()) ||
        r.closeDuty.toLowerCase().includes(search.toLowerCase()) ||
        r.date.includes(search) ||
        r.exco.toLowerCase().includes(search.toLowerCase()) ||
        r.week.toLowerCase().includes(search.toLowerCase())
    );
  }, [records, search]);

  // Group by week
  const groupedByWeek = useMemo(() => {
    return filteredRecords.reduce((acc, record) => {
      if (!acc[record.week]) {
        acc[record.week] = { exco: record.exco, duties: [], hasToday: false };
      }
      acc[record.week].duties.push(record);
      if (record.date === today) {
        acc[record.week].hasToday = true;
      }
      return acc;
    }, {} as Record<string, { exco: string; duties: DutyRecord[]; hasToday: boolean }>);
  }, [filteredRecords, today]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedWeek) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [selectedWeek]);

  const weeksKeys = Object.keys(groupedByWeek);

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 animate-fade-in">
        <h2 className="text-2xl font-bold text-white mb-0 drop-shadow-sm flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#a78bfa]" />
          Full Schedule
        </h2>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Search name or exco..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#11081e]/80 border border-white/10 text-white rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#ffcc33] focus:ring-1 focus:ring-[#ffcc33] transition-all"
          />
        </div>
      </div>

      {/* Strict 3x5 Grid for Weeks */}
      <div 
        className="gap-3 md:gap-5 mt-6 w-full"
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))" 
        }}
      >
        {weeksKeys.length > 0 ? (
          weeksKeys.map((week, index) => {
            const data = groupedByWeek[week];
            const hasToday = data.hasToday;

            return (
              <button 
                key={week} 
                onClick={() => setSelectedWeek(week)}
                className={`glass-card flex flex-col items-center justify-center p-2 sm:p-6 transition-all duration-300 hover:scale-[1.03] group ${
                  hasToday ? 'border-[#ffcc33]/80 shadow-[0_0_20px_rgba(255,204,51,0.2)]' : 'hover:bg-white/10'
                }`}
                style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s`, margin: 0, minHeight: '100px' }}
              >
                <div className="flex flex-col items-center justify-center w-full h-full text-center">
                   <h3 className={`font-black text-2xl sm:text-3xl m-0 drop-shadow-md transition-colors ${hasToday ? 'text-[#ffcc33]' : 'text-white group-hover:text-[#a78bfa]'}`}>
                     {week.replace('WEEK ', 'W')}
                   </h3>
                   {hasToday && (
                     <span className="text-black bg-[#ffcc33] text-[10px] sm:text-xs px-2 py-0.5 rounded-full uppercase font-black tracking-widest mt-2 block shadow-[0_0_10px_rgba(255,204,51,0.5)]">
                       CURRENT
                     </span>
                   )}
                </div>
              </button>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center text-white/50 bg-white/5 border border-white/10 rounded-3xl animate-fade-in flex flex-col items-center justify-center gap-2">
            <Search className="w-8 h-8 text-white/20 mb-2" />
            <p className="text-lg">No duty records found matching "{search}"</p>
          </div>
        )}
      </div>

      {/* Modal / Dialog for Detailed Week View */}
      {selectedWeek && groupedByWeek[selectedWeek] && (
        <div 
          className="animate-fade-in overflow-y-auto"
          style={{ 
             position: 'fixed', 
             top: 0, left: 0, right: 0, bottom: 0, 
             width: '100vw', height: '100vh', 
             zIndex: 999999,
             display: 'flex', flexDirection: 'column',
             backgroundColor: '#0b0514' /* Bulletproof background */
          }}
        >
          
          {/* Header Bar */}
          <div className="w-full max-w-5xl mx-auto flex justify-between items-start md:items-center p-6 md:p-10 border-b border-white/5 sticky top-0 z-20" style={{ backgroundColor: '#0b0514' }}>
             <div className="flex flex-col gap-1">
                <h2 className="text-4xl md:text-5xl font-black text-white m-0 drop-shadow-lg">
                   {selectedWeek}
                </h2>
                <p className="text-[#a78bfa] text-xs md:text-sm font-bold uppercase tracking-widest mt-1">
                   EXCO: <span className="text-white font-black">{groupedByWeek[selectedWeek].exco}</span>
                </p>
             </div>
             
             <button 
               onClick={() => setSelectedWeek(null)}
               className="p-3 bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 rounded-2xl text-white/80 transition-all shadow-lg"
             >
               <X className="w-6 h-6 md:w-8 md:h-8" />
             </button>
          </div>

          {/* Body (Main List View) */}
          <div className="w-full max-w-5xl mx-auto p-6 md:p-10 flex flex-col gap-6 pb-32">
             {groupedByWeek[selectedWeek].duties.map((r, i) => {
                     const isCurrent = r.date === today;
                     
                     return (
                       <div 
                         key={i} 
                         className={`bg-[#11081e]/80 border rounded-3xl p-5 md:p-6 flex flex-col gap-5 relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl ${
                           isCurrent 
                             ? 'border-[#ffcc33]/80 shadow-[0_0_20px_rgba(255,204,51,0.2)]' 
                             : 'border-white/10 hover:border-white/30'
                         }`}
                       >
                         {/* Date Header inside card */}
                         <div className="w-full flex justify-between items-center border-b border-white/10 pb-4">
                           <span className={`font-black text-lg md:text-xl drop-shadow-md ${isCurrent ? 'text-[#ffcc33]' : 'text-white'}`}>
                             {formatDateDisplay(r.date)}
                           </span>
                           {isCurrent && (
                              <span className="text-[10px] font-black tracking-widest text-[#11081e] bg-[#ffcc33] px-3 py-1 rounded-full shadow-[0_0_10px_rgba(255,204,51,0.5)]">
                                TODAY
                              </span>
                           )}
                         </div>
                         
                         {/* Open/Close Flex container */}
                         <div className="flex flex-col gap-3">
                           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                             <span className="text-[#a78bfa] text-[10px] font-black uppercase tracking-widest shrink-0">Open</span>
                             <span className="text-white font-medium text-sm md:text-base sm:text-right">{r.openDuty}</span>
                           </div>
                           <div className="h-px bg-white/5 w-full"></div>
                           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                             <span className="text-[#ffcc33] text-[10px] font-black uppercase tracking-widest shrink-0">Close</span>
                             <span className="text-white font-medium text-sm md:text-base sm:text-right">{r.closeDuty}</span>
                           </div>
                         </div>
                       </div>
                     );
             })}
           </div>
          
        </div>
      )}
    </div>
  );
}
