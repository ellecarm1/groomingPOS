import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  LockKeyhole,
  Scissors,
  ShieldCheck,
} from "lucide-react";

import {
  formatCurrency,
  formatDuration,
  getEstimate,
  getSelectedDuration,
  getServices,
  saveBooking,
  type Service,
  type SelectedServices,
} from "@/lib/catalog";

const startOfCalendar = new Date(2024, 3, 22);
const dates = Array.from({ length: 10 }, (_, index) => {
  const date = new Date(startOfCalendar);
  date.setDate(startOfCalendar.getDate() + index);
  return {
    key: date.toISOString().slice(0, 10),
    day: date.toLocaleDateString("en-US", { weekday: "short" }),
    date: date.getDate(),
    month: date.toLocaleDateString("en-US", { month: "short" }),
    label: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
  };
});

const timeSlots = ["9:00 AM", "10:30 AM", "12:00 PM", "1:30 PM", "3:00 PM", "4:30 PM"];
const bookedAppointments: Record<string, { time: string; durationMinutes: number }[]> = {
  "2024-04-22": [{ time: "10:30 AM", durationMinutes: 120 }],
  "2024-04-23": [
    { time: "12:00 PM", durationMinutes: 90 },
    { time: "3:00 PM", durationMinutes: 120 },
  ],
  "2024-04-24": [{ time: "9:00 AM", durationMinutes: 60 }],
  "2024-04-25": [{ time: "1:30 PM", durationMinutes: 90 }],
  "2024-04-27": [{ time: "10:30 AM", durationMinutes: 180 }],
};

const toMinutes = (time: string) => {
  const [hourPart, minutePart] = time.replace(" AM", "").replace(" PM", "").split(":");
  const isPm = time.includes("PM");
  let hour = Number(hourPart);
  if (isPm && hour !== 12) hour += 12;
  if (!isPm && hour === 12) hour = 0;
  return hour * 60 + Number(minutePart);
};

const endOfDay = 18 * 60;

function isSlotAvailable(dateKey: string, time: string, durationMinutes: number) {
  const start = toMinutes(time);
  const end = start + durationMinutes;
  if (end > endOfDay) return false;
  return !(bookedAppointments[dateKey] || []).some((appointment) => {
    const bookedStart = toMinutes(appointment.time);
    const bookedEnd = bookedStart + appointment.durationMinutes;
    return start < bookedEnd && end > bookedStart;
  });
}

type BookingPanelProps = {
  selected?: SelectedServices;
  services?: Service[];
  stepLabel?: string;
};

export function BookingPanel({
  selected: selectedProp,
  services: servicesProp,
  stepLabel = "Step 03 · Pick a time",
}: BookingPanelProps) {
  const navigate = useNavigate();
  const defaultServices = useMemo(() => getServices(), []);
  const defaultSelected = useMemo(() => getEstimate(), []);
  const services = servicesProp || defaultServices;
  const selected = selectedProp || defaultSelected;
  const selectedServices = services.filter((service) => selected[service.id]);
  const durationMinutes = getSelectedDuration(selected, services);
  const subtotal = selectedServices.reduce(
    (total, service) => total + service.price * selected[service.id],
    0,
  );
  const [selectedDate, setSelectedDate] = useState(dates[1].key);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const activeDate = dates.find((date) => date.key === selectedDate) || dates[1];

  useEffect(() => {
    setSelectedTime(null);
  }, [durationMinutes]);

  const chooseDate = (dateKey: string) => {
    setSelectedDate(dateKey);
    setSelectedTime(null);
  };

  const confirmBooking = () => {
    if (!selectedTime) return;
    saveBooking({
      dateKey: selectedDate,
      dateLabel: activeDate.label,
      time: selectedTime,
      durationMinutes,
      selected,
    });
    navigate("/invoice");
  };

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#d2765d]">{stepLabel}</p>
          <h2 className="mt-2 font-display text-[clamp(2.4rem,5vw,4.4rem)] font-bold leading-[0.95] tracking-[-0.07em] text-[#234438]">Find a good time.</h2>
          <p className="mt-4 max-w-[520px] text-sm leading-6 text-[#6b776e]">We’ll hold enough time for every service in your estimate. Greyed-out times overlap another appointment or run past closing.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-[#e6eedf] px-4 py-2.5 text-xs font-extrabold text-[#5c7848]"><Clock3 className="h-3.5 w-3.5" /> {formatDuration(durationMinutes)} reserved</div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-[28px] border border-[#e1e2da] bg-[#fbfaf7] p-5 shadow-[0_18px_50px_-35px_rgba(39,74,56,0.4)] sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div><p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#89938a]">Good availability</p><h3 className="mt-1 font-display text-2xl font-bold tracking-[-0.045em] text-[#234438]">April 2024</h3></div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#f2ead6] text-[#927337]"><CalendarDays className="h-4 w-4" /></div>
          </div>

          <div className="mt-7 grid grid-cols-5 gap-2 sm:grid-cols-10">
            {dates.map((date) => {
              const active = date.key === selectedDate;
              return <button key={date.key} type="button" onClick={() => chooseDate(date.key)} className={`rounded-2xl border px-1 py-3 text-center transition ${active ? "border-[#7d9e72] bg-[#7d9e72] text-white shadow-[0_10px_20px_-14px_rgba(55,95,60,0.9)]" : "border-[#e7e7df] bg-white text-[#738076] hover:border-[#b8cab1]"}`}><span className="block text-[10px] font-extrabold uppercase tracking-[0.08em]">{date.day}</span><span className="mt-1 block font-display text-xl font-bold">{date.date}</span><span className={`mt-0.5 block text-[10px] font-semibold ${active ? "text-[#dcebd5]" : "text-[#a4aca2]"}`}>{date.month}</span></button>;
            })}
          </div>

          <div className="mt-9 flex items-end justify-between gap-3 border-b border-[#e7e8e1] pb-4"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#89938a]">Available start times</p><h3 className="mt-1 font-display text-xl font-bold tracking-[-0.04em] text-[#234438]">{activeDate.label}</h3></div><span className="text-right text-[11px] font-semibold text-[#a0a99f]">Studio hours<br />9:00 AM – 6:00 PM</span></div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {timeSlots.map((time) => {
              const available = isSlotAvailable(selectedDate, time, durationMinutes);
              const active = selectedTime === time;
              return <button key={time} type="button" disabled={!available} onClick={() => setSelectedTime(time)} className={`group flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${active ? "border-[#234438] bg-[#234438] text-white" : available ? "border-[#e1e2da] bg-white text-[#315244] hover:border-[#9dbb91] hover:bg-[#f1f5ec]" : "cursor-not-allowed border-[#ededeb] bg-[#f0f0ec] text-[#b8bdb6]"}`}><span className="text-sm font-extrabold">{time}</span>{available ? <span className={`grid h-6 w-6 place-items-center rounded-full ${active ? "bg-[#d2765d] text-white" : "bg-[#e6eedf] text-[#6f905f]"}`}><Check className="h-3.5 w-3.5" /></span> : <LockKeyhole className="h-3.5 w-3.5" />}</button>;
            })}
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-[11px] font-bold text-[#89938a]"><span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#7d9e72]" /> Available</span><span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#d4d6d0]" /> Already booked</span><span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#234438]" /> Your selection</span></div>
        </section>

        <aside className="h-fit rounded-[28px] bg-[#234438] p-6 text-[#f8f4e8] shadow-[0_30px_70px_-32px_rgba(20,48,38,0.85)] sm:p-7 lg:sticky lg:top-6">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#a7c39b]">Your visit</p>
          <h3 className="mt-1 font-display text-2xl font-bold tracking-[-0.045em]">Almost there.</h3>
          <div className="my-6 h-px bg-[#527060]" />
          <div className="space-y-3">{selectedServices.map((service: Service) => <div key={service.id} className="flex items-start justify-between gap-3 text-sm"><span className="text-[#d4e0d0]">{selected[service.id]} × {service.name}</span><span className="font-semibold">{formatCurrency(service.price * selected[service.id])}</span></div>)}</div>
          <div className="my-6 h-px bg-[#527060]" />
          <div className="flex items-end justify-between"><div><p className="text-xs font-semibold text-[#a7c0ad]">Estimated total</p><p className="mt-1 font-display text-4xl font-bold tracking-[-0.06em] text-white">{formatCurrency(subtotal)}</p></div><p className="pb-1 text-xs font-semibold text-[#a7c0ad]">before tax</p></div>
          <div className="mt-6 rounded-2xl bg-[#2c5140] px-4 py-3 text-xs leading-5 text-[#bcd0ba]"><span className="font-extrabold text-[#f8f4e8]">{activeDate.label}</span>{selectedTime ? <><br />Arrive at <span className="font-extrabold text-[#f8f4e8]">{selectedTime}</span></> : <><br />Choose a start time to continue.</>}</div>
          <button type="button" disabled={!selectedTime} onClick={confirmBooking} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d2765d] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#c66850] disabled:cursor-not-allowed disabled:opacity-50">Confirm appointment <ArrowRight className="h-4 w-4" /></button>
          <p className="mt-4 text-center text-[11px] leading-5 text-[#93b19b]">We’ll confirm final pricing in person.</p>
        </aside>
      </div>
    </div>
  );
}

export default function Booking() {
  const services = useMemo(() => getServices(), []);
  const selected = useMemo(() => getEstimate(), []);

  return (
    <main className="min-h-screen bg-[#f5f3ed] text-[#1e352c]">
      <div className="mx-auto max-w-[1180px] px-5 pb-12 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-[#dfe1d8] py-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#234438] text-[#f7f1df]"><Scissors className="h-[19px] w-[19px]" /></div>
            <div><p className="font-display text-[17px] font-bold tracking-[-0.04em] text-[#234438]">good & groomed</p><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#89938a]">Book a visit</p></div>
          </Link>
          <div className="hidden items-center gap-2 text-xs font-bold text-[#7f8a80] sm:flex"><ShieldCheck className="h-4 w-4 text-[#7d9e72]" /> Your estimate is saved</div>
        </header>

        <div className="mb-8 pt-10 sm:pt-14">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#819080] transition hover:text-[#234438]"><ArrowLeft className="h-3.5 w-3.5" /> Back to services</Link>
        </div>
        <BookingPanel selected={selected} services={services} />
      </div>
    </main>
  );
}
