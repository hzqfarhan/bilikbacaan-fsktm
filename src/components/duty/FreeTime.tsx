"use client";

import { useEffect, useState, useMemo } from "react";
import { Users, ChevronDown, ChevronUp } from "lucide-react";

interface TimetableData {
  people: string[];
  days: string[];
  timeSlots: string[];
  timetable: Record<string, Record<string, Record<string, string>>>;
  peopleDetails: Record<string, { fullname: string; exco: string }>;
}

const DAY_LABELS: Record<string, string> = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
};

const AVATAR_COLORS = [
  "from-amber-400 to-orange-500",
  "from-violet-400 to-purple-600",
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-blue-500",
  "from-rose-400 to-pink-500",
  "from-lime-400 to-green-500",
  "from-fuchsia-400 to-purple-500",
  "from-cyan-400 to-teal-500",
];

const EXCO_COLORS: Record<string, string> = {
  "TEKNOUSAHAWAN": "bg-orange-500/20 text-orange-400 border border-orange-500/20",
  "KEBAJIKAN & KEROHANIAN": "bg-blue-500/20 text-blue-400 border border-blue-500/20",
  "PEMBANGUNAN PELAJAR": "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20",
  "MULTIMEDIA & PUBLISITI": "bg-purple-500/20 text-purple-400 border border-purple-500/20",
  "SUKAN & KEBUDAYAAN": "bg-pink-500/20 text-pink-400 border border-pink-500/20",
  "MAJLIS TERTINGGI": "bg-red-500/20 text-red-400 border border-red-500/20",
};

function getExcoColor(exco: string) {
  const key = exco.trim().toUpperCase();
  // Try to find an exact match, or fallback
  return EXCO_COLORS[key] || "bg-slate-500/20 text-slate-400";
}

export default function FreeTime() {
  const [data, setData] = useState<TimetableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDay, setSelectedDay] = useState<string>("MON");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedExco, setSelectedExco] = useState<string>("ALL");
  
  // Collapsible states
  const [isExcoOpen, setIsExcoOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(true);

  useEffect(() => {
    async function loadTimetable() {
      try {
        const res = await fetch("/api/timetable?_t=" + Date.now(), { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch timetable");
        const json = await res.json();
        setData(json);
        if (json.timeSlots?.length > 0) {
          setSelectedSlot(json.timeSlots[0]);
        }
      } catch (err) {
        setError("Failed to load timetable data");
      } finally {
        setLoading(false);
      }
    }
    loadTimetable();
  }, []);

  const uniqueExcos = useMemo(() => {
    if (!data?.peopleDetails) return ["ALL"];
    const excos = new Set<string>();
    for (const person of data.people) {
      if (data.peopleDetails[person]?.exco) {
        excos.add(data.peopleDetails[person].exco);
      }
    }
    return ["ALL", ...Array.from(excos)];
  }, [data]);

  const filteredPeople = useMemo(() => {
    if (!data) return [];
    if (selectedExco === "ALL") return data.people;
    return data.people.filter(
      (person) => data.peopleDetails[person]?.exco === selectedExco
    );
  }, [data, selectedExco]);

  // Compute free/busy people for the selected day + slot
  const results = useMemo(() => {
    if (!data || !selectedDay || !selectedSlot) return { free: [], busy: [] };
    const free: string[] = [];
    const busy: string[] = [];
    for (const person of filteredPeople) {
      const status = data.timetable[person]?.[selectedDay]?.[selectedSlot];
      if (status === "FREE") {
        free.push(person);
      } else {
        busy.push(person);
      }
    }
    return { free, busy };
  }, [data, selectedDay, selectedSlot, filteredPeople]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#ffcc33] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/60 font-semibold tracking-widest text-sm uppercase">
            Loading Timetables...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-8 text-center glass-card">
          <p className="text-red-400 font-bold text-lg mb-2">Error</p>
          <p className="text-white/80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in relative z-10 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 overflow-hidden">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Users className="w-7 h-7 sm:w-8 sm:h-8 text-[#ffcc33]" />
            Free Time Checker
          </h2>
          <p className="text-white/50 text-sm mt-1">
            {filteredPeople.length} people tracked · View their full details below
          </p>
        </div>
        {/* Day Selector Chips (Squeeze to fit mobile) */}
        <div className="flex gap-1 sm:gap-2 w-full md:w-auto self-start md:self-auto bg-white/5 border border-white/10 p-1 sm:p-1.5 rounded-3xl md:rounded-[2rem]">
          {data.days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-1 md:flex-none px-1 py-2 sm:px-5 sm:py-2.5 rounded-2xl font-bold text-[10px] sm:text-sm tracking-wider transition-all duration-300 ${
                selectedDay === day
                  ? "bg-gradient-to-r from-[#ffcc33] to-[#ffdb66] text-black shadow-lg shadow-[#ffcc33]/30 scale-[1.02]"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="hidden sm:inline">{DAY_LABELS[day] || day}</span>
              <span className="sm:hidden uppercase">{day}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid wrapper for collapsible filters to save vertical space on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Exco Selector Chips (Collapsible) */}
        <div className="glass-card !mb-0 !p-4 h-fit">
          <button 
            onClick={() => setIsExcoOpen(!isExcoOpen)}
            className="w-full flex justify-between items-center group"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-white/60 text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">
                Filter by EXCO
              </h3>
              {selectedExco !== "ALL" && !isExcoOpen && (
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              )}
            </div>
            {isExcoOpen ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
          </button>
          
          <div className={`transition-all duration-300 overflow-hidden ${isExcoOpen ? "max-h-[500px] opacity-100 mt-3 pt-3 border-t border-white/5" : "max-h-0 opacity-0"}`}>
            <div className="flex gap-2 flex-wrap">
              {uniqueExcos.map((exco) => (
                <button
                  key={exco}
                  onClick={() => setSelectedExco(exco)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs tracking-wide transition-all duration-300 ${
                    selectedExco === exco
                      ? "bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-lg shadow-blue-500/30 scale-105"
                      : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20"
                  }`}
                >
                  {exco}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Time Slot Selector (Collapsible) */}
        <div className="glass-card !mb-0 !p-4 h-fit">
          <button 
            onClick={() => setIsTimeOpen(!isTimeOpen)}
            className="w-full flex justify-between items-center group"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-white/60 text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">
                Select Time Slot
              </h3>
              {!isTimeOpen && selectedSlot && (
                <span className="text-[10px] text-[#ffcc33] font-bold">{selectedSlot}</span>
              )}
            </div>
            {isTimeOpen ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
          </button>
          
          <div className={`transition-all duration-300 overflow-hidden ${isTimeOpen ? "max-h-[500px] opacity-100 mt-3 pt-3 border-t border-white/5" : "max-h-0 opacity-0"}`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {data.timeSlots.map((slot) => {
                // Count free people for visual indicator
                const freeCount = filteredPeople.filter(
                  (p) => data.timetable[p]?.[selectedDay]?.[slot] === "FREE"
                ).length;
                const allFree = freeCount > 0 && freeCount === filteredPeople.length;

                return (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`relative px-3 py-3 rounded-xl font-semibold text-xs tracking-wide transition-all duration-300 flex flex-col items-center gap-1 ${
                      selectedSlot === slot
                        ? "bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] text-white shadow-lg shadow-[#a78bfa]/30 scale-[1.03] border border-[#a78bfa]/50"
                        : "bg-white/5 border border-white/8 text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="text-[11px] font-bold">{slot}</span>
                    <span
                      className={`text-[10px] font-black ${
                        allFree
                          ? "text-emerald-400"
                          : freeCount > 0
                          ? "text-amber-300"
                          : "text-red-400"
                      }`}
                    >
                      {freeCount}/{filteredPeople.length} free
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {selectedSlot && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Free People */}
          <div className="glass-card !mb-0 border-l-4 !border-l-emerald-400">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
              <h3 className="text-emerald-400 text-sm font-black uppercase tracking-widest">
                Available ({results.free.length})
              </h3>
            </div>
            {results.free.length > 0 ? (
              <div className="flex flex-col gap-2">
                {results.free.map((name, i) => {
                  const details = data.peopleDetails[name];
                  const exco = details?.exco || 'UNKNOWN';
                  return (
                    <div
                      key={name}
                      className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 transition-all hover:bg-emerald-500/15"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <div
                        className={`w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-br ${
                          AVATAR_COLORS[data.people.indexOf(name) % AVATAR_COLORS.length]
                        } flex items-center justify-center text-white font-black text-sm shadow-lg`}
                      >
                        {name.charAt(0)}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-white font-black text-base tracking-wide truncate">
                          {name}
                        </span>
                        <div className="flex flex-wrap items-center mt-1.5 gap-1.5">
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full leading-none shrink-0 ${getExcoColor(exco)}`}>
                            {exco}
                          </span>
                          <span
                            className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full leading-none text-white/50 bg-white/5 border border-white/10"
                            title={details?.fullname || name}
                          >
                            {details?.fullname || name}
                          </span>
                        </div>
                      </div>
                      <span className="ml-2 text-emerald-400 text-xs font-bold whitespace-nowrap self-start mt-1">
                        ✓ FREE
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-white/40 text-sm italic text-center py-4">
                No one is free at this time 😢
              </p>
            )}
          </div>

          {/* Busy People */}
          <div className="glass-card !mb-0 border-l-4 !border-l-red-400/60">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-red-400"></span>
              <h3 className="text-red-400/80 text-sm font-black uppercase tracking-widest">
                Busy ({results.busy.length})
              </h3>
            </div>
            {results.busy.length > 0 ? (
              <div className="flex flex-col gap-2">
                {results.busy.map((name, i) => {
                  const globalIdx = data.people.indexOf(name);
                  const details = data.peopleDetails[name];
                  const exco = details?.exco || 'UNKNOWN';
                  return (
                    <div
                      key={name}
                      className="flex items-center gap-3 bg-red-500/5 border border-red-500/10 rounded-xl px-4 py-3 opacity-60 transition-all hover:opacity-100"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <div
                        className={`w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-br ${
                          AVATAR_COLORS[globalIdx % AVATAR_COLORS.length]
                        } flex items-center justify-center text-white font-black text-sm shadow-lg grayscale transition-all group-hover:grayscale-0`}
                      >
                        {name.charAt(0)}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-white/80 font-black text-base tracking-wide truncate">
                          {name}
                        </span>
                        <div className="flex flex-wrap items-center mt-1.5 gap-1.5">
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full leading-none shrink-0 ${getExcoColor(exco)}`}>
                            {exco}
                          </span>
                          <span
                            className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full leading-none text-white/50 bg-white/5 border border-white/10"
                            title={details?.fullname || name}
                          >
                            {details?.fullname || name}
                          </span>
                        </div>
                      </div>
                      <span className="ml-2 text-red-400/60 text-xs font-bold whitespace-nowrap self-start mt-1">
                        ✗ BUSY
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-emerald-400 text-sm font-bold text-center py-4">
                Everyone is free! 🎉
              </p>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredPeople.map((person, i) => {
          // Count total free slots for this person on selected day
          const freeSlots = data.timeSlots.filter(
            (s) => data.timetable[person]?.[selectedDay]?.[s] === "FREE"
          ).length;
          const pct = Math.round((freeSlots / data.timeSlots.length) * 100);
          const details = data.peopleDetails[person];
          const exco = details?.exco || 'UNKNOWN';

          return (
            <div
              key={person}
              className="glass-card !mb-0 !p-3 flex items-start gap-3 transition-transform"
            >
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                  AVATAR_COLORS[data.people.indexOf(person) % AVATAR_COLORS.length]
                } flex items-center justify-center text-white font-black text-sm shadow-lg flex-shrink-0 mt-1`}
              >
                {person.charAt(0)}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-white font-black text-base tracking-wide truncate">
                  {person}
                </p>
                <div className="flex flex-wrap items-center mt-1.5 gap-1.5">
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full leading-none shrink-0 ${getExcoColor(exco)}`}>
                    {exco}
                  </span>
                  <span
                    className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full leading-none text-white/50 bg-white/5 border border-white/10"
                    title={details?.fullname || person}
                  >
                    {details?.fullname || person}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2.5 gap-2">
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-emerald-400/80 font-bold whitespace-nowrap">
                    {freeSlots}/{data.timeSlots.length} free
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
