import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Users, Award, Ticket, MapPin, Clock, Building } from 'lucide-react';
import { CmsSettings } from '../types.ts';

interface StatsSectionProps {
  cms: CmsSettings | null;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ cms }) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  if (cms && cms.showStatsSection === false) {
    return null;
  }

  const eventsVal = cms?.statsEventsOrganized ?? '250+';
  const attendeesVal = cms?.statsHappyAttendees ?? '50,000+';
  const organizersVal = cms?.statsVerifiedOrganizers ?? '120+';
  const ticketsVal = cms?.statsTicketsIssued ?? '85,000+';
  const citiesVal = cms?.statsCitiesReached ?? '12+';
  const yearsVal = cms?.statsYearsOfService ?? '5+';
  const partnersVal = cms?.statsPartnerOrgs ?? '45+';

  const stats = [
    { key: 'events', label: 'Events Organized', value: eventsVal, icon: Calendar, show: cms?.showStatsEventsOrganized !== false },
    { key: 'attendees', label: 'Happy Attendees', value: attendeesVal, icon: Users, show: cms?.showStatsHappyAttendees !== false },
    { key: 'organizers', label: 'Verified Organizers', value: organizersVal, icon: Award, show: cms?.showStatsVerifiedOrganizers !== false },
    { key: 'tickets', label: 'Tickets Issued', value: ticketsVal, icon: Ticket, show: cms?.showStatsTicketsIssued !== false },
    { key: 'cities', label: 'Cities Reached', value: citiesVal, icon: MapPin, show: cms?.showStatsCitiesReached !== false },
    { key: 'years', label: 'Years of Service', value: yearsVal, icon: Clock, show: cms?.showStatsYearsOfService === true },
    { key: 'partners', label: 'Partner Organizations', value: partnersVal, icon: Building, show: cms?.showStatsPartnerOrgs === true },
  ].filter(s => s.show);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="stats" ref={sectionRef} className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-800/60 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10 relative z-10">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase tracking-widest">
            Platform Statistics & Metrics
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Proven Impact Across Ethiopia
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time platform metrics demonstrating event reach, audience engagement, and organizer trust.
          </p>
        </div>

        <div className={`grid grid-cols-2 md:grid-cols-${Math.min(stats.length, 5)} gap-4 text-center relative z-10`}>
          {stats.map((stat, idx) => {
            const IconComp = stat.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/5 backdrop-blur border border-white/10 hover:border-indigo-500/40 transition group"
              >
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 group-hover:scale-110 transition-transform">
                  <IconComp className="h-5 w-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[11px] font-semibold text-slate-300 mt-1">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
