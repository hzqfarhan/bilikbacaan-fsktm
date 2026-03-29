"use client";

import { useEffect, useState } from "react";
import { fetchDutyData, DutyRecord } from "@/utils/csvParser";
import { getTodayStr, getTomorrowStr, dayjs } from "@/utils/dateUtils";
import DutyCard from "@/components/duty/DutyCard";
import DateQuery from "@/components/duty/DateQuery";
import FullTable from "@/components/duty/FullTable";

export default function Home() {
  const [records, setRecords] = useState<DutyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "schedule">("dashboard");

  const today = getTodayStr();
  const tomorrow = getTomorrowStr();

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchDutyData();
        setRecords(data);
      } catch (err) {
        setError("Failed to load duty schedule");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#ffcc33] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/60 font-semibold tracking-widest text-sm uppercase">Loading Schedule...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-8 text-center glass-card">
          <p className="text-red-400 font-bold text-lg mb-2">Error</p>
          <p className="text-white/80">{error}</p>
        </div>
      </div>
    );
  }

  const todayDuty = records.find((r) => r.date === today) || null;
  const tomorrowDuty = records.find((r) => r.date === tomorrow) || null;

  const currentOrUpcomingRecord = records.find(r => dayjs(r.date).isSame(dayjs(), 'day') || dayjs(r.date).isAfter(dayjs(), 'day'));
  const currentWeek = currentOrUpcomingRecord?.week || "No Upcoming";
  const currentExco = currentOrUpcomingRecord?.exco || "None";
  
  const nextWeekRecord = records.find(r => dayjs(r.date).isAfter(dayjs(), 'day') && r.week !== currentWeek);
  const nextWeek = nextWeekRecord?.week || "None";
  const nextExco = nextWeekRecord?.exco || "None";

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-20">
      <header className="text-center md:text-left mb-2 animate-fade-in flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2 drop-shadow-lg">
            Duty Tracker
          </h1>
          <p className="text-[#a78bfa] text-lg font-bold opacity-90 uppercase tracking-widest">
            Bilik Bacaan, FSKTM
          </p>
        </div>
        <div className="flex gap-3 justify-center md:justify-end">
           <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-inner">
             <span className="w-2 h-2 rounded-full bg-[#a78bfa] animate-pulse"></span>
             <span className="text-white text-xs font-black uppercase tracking-widest">OPEN: 9AM</span>
           </div>
           <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-inner">
             <span className="w-2 h-2 rounded-full bg-red-400"></span>
             <span className="text-white text-xs font-black uppercase tracking-widest">CLOSE: 5PM</span>
           </div>
        </div>
      </header>

      {/* TABS */}
      <div className="flex gap-4 justify-center md:justify-start mb-6 border-b border-white/10 pb-2 animate-fade-in z-10 relative">
        <button 
          onClick={() => setActiveTab("dashboard")}
          className={`px-4 py-2 font-bold tracking-wide transition-all ${
            activeTab === "dashboard" 
              ? "text-white border-b-2 border-[#ffcc33] drop-shadow-[0_0_10px_rgba(255,204,51,0.5)]" 
              : "text-white/50 hover:text-white"
          }`}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setActiveTab("schedule")}
          className={`px-4 py-2 font-bold tracking-wide transition-all ${
            activeTab === "schedule" 
              ? "text-white border-b-2 border-[#ffcc33] drop-shadow-[0_0_10px_rgba(255,204,51,0.5)]" 
              : "text-white/50 hover:text-white"
          }`}
        >
          Full Schedule
        </button>
      </div>

      {activeTab === "dashboard" && (
        <div className="flex flex-col gap-6 animation-fade-in">
          {/* EXCO Overview Row */}
          <div className="grid grid-cols-2 gap-4 md:gap-6 animate-fade-in z-10 relative" style={{ animationDelay: "0.05s" }}>
            <div className="glass-card flex flex-col items-center justify-center p-4 mb-0 text-center shadow-lg border-b-4 border-b-[#ffcc33]">
              <h3 className="text-white/60 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">
                THIS WEEK'S EXCO
              </h3>
              <p className="text-[#ffcc33] font-bold text-xs md:text-sm uppercase leading-tight drop-shadow-md">
                {currentExco}
              </p>
            </div>
            <div className="glass-card flex flex-col items-center justify-center p-4 mb-0 text-center shadow-lg border-b-4 border-b-[#a78bfa]">
              <h3 className="text-white/60 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">
                NEXT WEEK'S EXCO
              </h3>
              <p className="text-[#a78bfa] font-bold text-xs md:text-sm uppercase leading-tight drop-shadow-md">
                {nextExco}
              </p>
            </div>
          </div>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 w-full max-w-full">
            <div className="animate-fade-in w-full" style={{ animationDelay: "0.1s" }}>
              <DutyCard title="Today's Duty" dateStr={today} duty={todayDuty} />
            </div>
            <div className="animate-fade-in w-full" style={{ animationDelay: "0.2s" }}>
              <DutyCard title="Tomorrow's Duty" dateStr={tomorrow} duty={tomorrowDuty} />
            </div>
          </section>

          {/* Moved DateQuery ABOVE FullSchedule (now located entirely in Dashboard context) */}
          <section className="relative z-10 w-full bg-black/20 p-6 md:p-8 rounded-3xl border border-white/5 shadow-inner mt-2 animate-fade-in">
            <DateQuery records={records} />
          </section>
        </div>
      )}

      {activeTab === "schedule" && (
        <section className="relative z-10 w-full">
          <FullTable records={records} />
        </section>
      )}

    </div>
  );
}
