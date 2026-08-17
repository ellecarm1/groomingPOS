import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LockKeyhole,
  Scissors,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import {
  formatDuration,
  getBookings,
  getEstimate,
  getPetParentMembers,
  getSelectedDuration,
  getServices,
  saveBooking,
  savePetParentMember,
  type PetParentDetails,
  type PetParentMember,
  type Service,
  type SelectedServices,
} from "@/lib/catalog";

export const timeSlots = ["9:00 AM", "10:30 AM", "12:00 PM", "1:30 PM", "3:00 PM", "4:30 PM"];
const endOfDay = 18 * 60;

const pad = (value: number) => String(value).padStart(2, "0");

const formatDateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const parseDateKey = (key: string) => new Date(`${key}T12:00:00`);
const formatShortDate = (key: string) => {
  const date = parseDateKey(key);
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${String(date.getFullYear()).slice(-2)}`;
};
const formatLongDate = (key: string) => parseDateKey(key).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

const startOfWeek = (date: Date) => {
  const result = new Date(date);
  result.setHours(12, 0, 0, 0);
  const day = result.getDay();
  result.setDate(result.getDate() + (day === 0 ? -6 : 1 - day));
  return result;
};

const dateInfo = (date: Date) => ({
  key: formatDateKey(date),
  day: date.toLocaleDateString("en-US", { weekday: "short" }),
  date: date.getDate(),
  month: date.toLocaleDateString("en-US", { month: "short" }),
  label: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
});

const buildWeek = (weekStart: Date) => Array.from({ length: 7 }, (_, index) => {
  const date = new Date(weekStart);
  date.setDate(weekStart.getDate() + index);
  return dateInfo(date);
});

const getBookedAppointments = (dateKey: string) => {
  const day = parseDateKey(dateKey).getDay();
  const demoAppointments = day === 2
    ? [{ time: "12:00 PM", durationMinutes: 90 }, { time: "3:00 PM", durationMinutes: 120 }]
    : day === 4
      ? [{ time: "1:30 PM", durationMinutes: 90 }]
      : day === 6
        ? [{ time: "10:30 AM", durationMinutes: 180 }]
        : [];
  const savedAppointments = getBookings()
    .filter((appointment) => appointment.dateKey === dateKey)
    .map((appointment) => ({ time: appointment.time, durationMinutes: appointment.durationMinutes }));
  return [...demoAppointments, ...savedAppointments];
};

const toMinutes = (time: string) => {
  const [hourPart, minutePart] = time.replace(" AM", "").replace(" PM", "").split(":");
  const isPm = time.includes("PM");
  let hour = Number(hourPart);
  if (isPm && hour !== 12) hour += 12;
  if (!isPm && hour === 12) hour = 0;
  return hour * 60 + Number(minutePart);
};

export function isSlotAvailable(dateKey: string, time: string, durationMinutes: number) {
  const start = toMinutes(time);
  const end = start + durationMinutes;
  if (end > endOfDay) return false;
  return !getBookedAppointments(dateKey).some((appointment) => {
    const bookedStart = toMinutes(appointment.time);
    const bookedEnd = bookedStart + appointment.durationMinutes;
    return start < bookedEnd && end > bookedStart;
  });
}

const emptyPetParent = (appointmentDate: string): PetParentDetails => ({
  firstName: "",
  lastName: "",
  city: "",
  state: "",
  petName: "",
  petBreed: "",
  appointmentDate,
  printedName: "",
  signature: "",
});

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
  const durationMinutes = getSelectedDuration(selected, services);
  const today = useMemo(() => new Date(), []);
  const minimumWeek = useMemo(() => startOfWeek(today), [today]);
  const [selectedDate, setSelectedDate] = useState(formatDateKey(today));
  const [weekStart, setWeekStart] = useState(minimumWeek);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [petParent, setPetParent] = useState<PetParentDetails>(() => emptyPetParent(formatDateKey(today)));
  const [members, setMembers] = useState<PetParentMember[]>(getPetParentMembers);
  const [memberQuery, setMemberQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedPetName, setSelectedPetName] = useState("");
  const [memberStatus, setMemberStatus] = useState("");
  const weekDates = useMemo(() => buildWeek(weekStart), [weekStart]);
  const activeDate = weekDates.find((date) => date.key === selectedDate) || dateInfo(parseDateKey(selectedDate));
  const selectedMember = members.find((member) => member.id === selectedMemberId);
  const matchingMembers = memberQuery.trim()
    ? members.filter((member) => `${member.firstName} ${member.lastName}`.toLowerCase().includes(memberQuery.trim().toLowerCase()))
    : [];
  const todayKey = formatDateKey(today);
  const isPastDate = (dateKey: string) => dateKey < todayKey;
  const isPetParentComplete = Object.values(petParent).every((value) => value.trim().length > 0);
  const canSignUp = [petParent.firstName, petParent.lastName, petParent.city, petParent.state, petParent.petName, petParent.petBreed].every((value) => value.trim().length > 0);

  const chooseDate = (dateKey: string) => {
    if (isPastDate(dateKey)) return;
    setSelectedDate(dateKey);
    setSelectedTime(null);
    setCalendarOpen(false);
    setPetParent((current) => ({ ...current, appointmentDate: dateKey }));
  };

  const moveWeek = (offset: number) => {
    const nextWeek = new Date(weekStart);
    nextWeek.setDate(nextWeek.getDate() + offset * 7);
    if (nextWeek < minimumWeek) return;
    setWeekStart(nextWeek);
  };

  const updatePetParent = (field: keyof PetParentDetails, value: string) => {
    setPetParent((current) => ({ ...current, [field]: value }));
    setMemberStatus("");
    if (field === "petName") setSelectedPetName(value);
  };

  const chooseMember = (member: PetParentMember) => {
    const firstPet = member.pets[0];
    setSelectedMemberId(member.id);
    setMemberQuery(`${member.firstName} ${member.lastName}`);
    setSearchOpen(false);
    setMemberStatus("");
    setSelectedPetName(firstPet?.name || "");
    setPetParent((current) => ({
      ...current,
      firstName: member.firstName,
      lastName: member.lastName,
      city: member.city,
      state: member.state,
      petName: firstPet?.name || "",
      petBreed: firstPet?.breed || "",
      appointmentDate: selectedDate,
    }));
  };

  const clearMemberSearch = () => {
    setMemberQuery("");
    setSearchOpen(false);
    setSelectedMemberId("");
    setSelectedPetName("");
    setPetParent(emptyPetParent(selectedDate));
  };

  const chooseSavedPet = (petName: string) => {
    setSelectedPetName(petName);
    const pet = selectedMember?.pets.find((savedPet) => savedPet.name === petName);
    if (pet) setPetParent((current) => ({ ...current, petName: pet.name, petBreed: pet.breed }));
  };

  const signUpMember = () => {
    if (!canSignUp) {
      setMemberStatus("Complete the parent and pet details above to sign up.");
      return;
    }
    const member = savePetParentMember(petParent);
    setMembers(getPetParentMembers());
    setSelectedMemberId(member.id);
    setMemberQuery(`${member.firstName} ${member.lastName}`);
    setSelectedPetName(petParent.petName);
    setMemberStatus(`${member.firstName} ${member.lastName} is saved for future visits.`);
  };

  const confirmBooking = () => {
    if (!selectedTime || !isPetParentComplete) return;
    saveBooking({ dateKey: selectedDate, dateLabel: activeDate.label, time: selectedTime, durationMinutes, selected, petParent: { ...petParent, appointmentDate: selectedDate } });
    navigate("/invoice");
  };

  return (
    <div className="w-full">
      <section className="relative rounded-[28px] border border-[#e1e2da] bg-[#fbfaf7] p-5 shadow-[0_18px_50px_-35px_rgba(39,74,56,0.4)] sm:p-7" aria-labelledby="pet-parent-heading">
        <div className="mb-6 flex flex-col items-center justify-center gap-4 text-center sm:min-h-[104px] sm:flex-row sm:items-start">
          <div className="max-w-[570px]">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#d2765d]">Step 01 · Pet parent</p>
            <h2 id="pet-parent-heading" className="mt-1 font-display text-2xl font-bold tracking-[-0.045em] text-[#234438]">Welcome back, or meet us.</h2>
            <p className="mt-2 text-sm leading-6 text-[#788278]">Look up a returning pet parent or add their details for a new visit.</p>
          </div>
          <div className="sm:absolute sm:right-7 sm:top-7 rounded-2xl border border-[#dce8d6] bg-[#f1f5ec] px-4 py-3 text-center sm:text-right">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#789073]">Appointment date</p>
            <p className="mt-1 font-display text-xl font-bold tracking-[-0.04em] text-[#315244]">{formatShortDate(selectedDate)}</p>
            <p className="mt-0.5 text-[10px] font-semibold text-[#8b9b89]">Set below in calendar</p>
          </div>
        </div>

        <div className="mx-auto max-w-[760px]">
          <label className="relative block">
            <span className="mb-2 block text-left text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748177]">Find a returning pet parent</span>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-[#8da28b]" />
              <input role="combobox" aria-expanded={searchOpen && memberQuery.trim().length > 0} aria-autocomplete="list" value={memberQuery} onFocus={() => setSearchOpen(true)} onBlur={() => window.setTimeout(() => setSearchOpen(false), 100)} onChange={(event) => { setMemberQuery(event.target.value); setSelectedMemberId(""); setSelectedPetName(""); setMemberStatus(""); setSearchOpen(true); }} placeholder="Type a name to search saved members" className="h-12 w-full rounded-xl border border-[#cbdac4] bg-[#f1f5ec] pl-11 pr-11 text-sm font-bold text-[#315244] outline-none transition placeholder:font-normal placeholder:text-[#9aa99a] focus:border-[#7d9e72] focus:ring-4 focus:ring-[#e6eedf]" />
              {memberQuery && <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={clearMemberSearch} aria-label="Clear member search" className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full text-[#789073] hover:bg-white"><X className="h-3.5 w-3.5" /></button>}
              {searchOpen && memberQuery.trim() && <div role="listbox" className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-[#dce8d6] bg-white p-1.5 text-left shadow-[0_20px_45px_-20px_rgba(39,74,56,0.45)]">{matchingMembers.length > 0 ? matchingMembers.map((member) => <button key={member.id} type="button" role="option" onMouseDown={(event) => event.preventDefault()} onClick={() => chooseMember(member)} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-[#f1f5ec]"><span><span className="block text-sm font-extrabold text-[#315244]">{member.firstName} {member.lastName}</span><span className="mt-0.5 block text-[11px] text-[#89938a]">{member.pets.length} saved {member.pets.length === 1 ? "pet" : "pets"} · {member.city}, {member.state}</span></span><ArrowRight className="h-4 w-4 text-[#9dbb91]" /></button>) : <p className="px-3 py-3 text-xs font-semibold text-[#89938a]">No saved members match that name.</p>}</div>}
            </div>
          </label>

          {selectedMember && <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[#dce8d6] bg-[#f1f5ec] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div className="text-left"><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#789073]">Returning member</p><p className="mt-0.5 text-sm font-bold text-[#315244]">{selectedMember.firstName} {selectedMember.lastName} · {selectedMember.pets.length} saved {selectedMember.pets.length === 1 ? "pet" : "pets"}</p></div><select value={selectedPetName} onChange={(event) => chooseSavedPet(event.target.value)} className="h-10 rounded-xl border border-[#cbdac4] bg-white px-3 text-xs font-bold text-[#315244] outline-none focus:border-[#7d9e72]"><option value="">Choose a saved pet</option>{selectedMember.pets.map((pet) => <option key={pet.name} value={pet.name}>{pet.name} · {pet.breed}</option>)}</select></div>}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {([
              ["firstName", "First name", "Your first name"],
              ["lastName", "Last name", "Your last name"],
              ["city", "City", "Brooklyn"],
              ["state", "State", "NY"],
              ["petName", "Pet’s name", "Their name"],
              ["petBreed", "Pet’s breed", "Golden retriever"],
            ] as const).map(([field, label, placeholder]) => <label key={field} className="block"><span className="mb-2 block text-left text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748177]">{label} <span className="text-[#d2765d]">*</span></span><input required aria-required="true" value={petParent[field]} onChange={(event) => updatePetParent(field, event.target.value)} placeholder={placeholder} className="h-12 w-full rounded-xl border border-[#dfe2da] bg-white px-4 text-sm font-semibold text-[#315244] outline-none transition placeholder:font-normal placeholder:text-[#b0b7ac] focus:border-[#7d9e72] focus:ring-4 focus:ring-[#e6eedf]" /></label>)}
          </div>

          <div className="mt-6 grid gap-5 border-t border-[#e7e8e1] pt-6 sm:grid-cols-2">
            <label className="block"><span className="mb-2 block text-left text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748177]">Pet parent printed name <span className="text-[#d2765d]">*</span></span><input required aria-required="true" value={petParent.printedName} onChange={(event) => updatePetParent("printedName", event.target.value)} placeholder="Print your full name" className="h-12 w-full rounded-xl border border-[#dfe2da] bg-white px-4 text-sm font-semibold text-[#315244] outline-none transition placeholder:font-normal placeholder:text-[#b0b7ac] focus:border-[#7d9e72] focus:ring-4 focus:ring-[#e6eedf]" /></label>
            <label className="block"><span className="mb-2 block text-left text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748177]">Pet parent signature <span className="text-[#d2765d]">*</span></span><input required aria-required="true" value={petParent.signature} onChange={(event) => updatePetParent("signature", event.target.value)} placeholder="Type your signature" className="h-12 w-full rounded-xl border border-[#dfe2da] bg-transparent px-4 font-[cursive] text-lg italic text-[#315244] outline-none transition placeholder:font-normal placeholder:text-[#b0b7ac] focus:border-[#7d9e72] focus:ring-4 focus:ring-[#e6eedf]" /></label>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-[#e7e8e1] pt-5 sm:flex-row"><div className="flex items-center gap-2 text-center text-xs text-[#788278] sm:text-left"><ShieldCheck className="h-4 w-4 shrink-0 text-[#7d9e72]" /><span>{memberStatus || "New members are saved on this device for faster future visits."}</span></div><button type="button" onClick={signUpMember} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#9dbb91] bg-white px-4 py-2.5 text-xs font-extrabold text-[#55734d] transition hover:bg-[#f1f5ec]">Sign up {selectedMember ? "updates saved member" : "new member"}</button></div>
        </div>
      </section>

      <div className="mb-8 mt-10 flex flex-col items-center justify-between gap-4 text-center md:flex-row md:items-end">
        <div className="w-full"><p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#d2765d]">{stepLabel}</p><h2 className="mt-2 font-display text-[clamp(2.4rem,5vw,4.4rem)] font-bold leading-[0.95] tracking-[-0.07em] text-[#234438]">Find a good time.</h2><p className="mx-auto mt-4 max-w-[520px] text-sm leading-6 text-[#6b776e]">We’ll hold enough time for every service in your estimate. Greyed-out times overlap another appointment or run past closing.</p></div><div className="flex shrink-0 items-center gap-2 rounded-full bg-[#e6eedf] px-4 py-2.5 text-xs font-extrabold text-[#5c7848]"><Clock3 className="h-3.5 w-3.5" /> {formatDuration(durationMinutes)} reserved</div>
      </div>

      <div>
        <section className="relative rounded-[28px] border border-[#e1e2da] bg-[#fbfaf7] p-5 shadow-[0_18px_50px_-35px_rgba(39,74,56,0.4)] sm:p-7">
          <div className="flex items-center justify-between gap-4"><div className="text-left"><p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#89938a]">Good availability</p><h3 className="mt-1 font-display text-2xl font-bold tracking-[-0.045em] text-[#234438]">Select a week</h3></div><button type="button" aria-label="Open calendar" aria-haspopup="dialog" aria-expanded={calendarOpen} onClick={() => setCalendarOpen((current) => !current)} className="grid h-10 w-10 place-items-center rounded-full bg-[#f2ead6] text-[#927337] transition hover:bg-[#eadcb9]"><CalendarDays className="h-4 w-4" /></button></div>
          {calendarOpen && <div role="dialog" aria-label="Choose appointment date" className="absolute right-5 top-[76px] z-30 w-[min(92vw,390px)] rounded-2xl border border-[#dce8d6] bg-white p-4 text-[#315244] shadow-[0_22px_55px_-22px_rgba(39,74,56,0.5)] sm:right-7"><div className="flex items-center justify-between"><button type="button" aria-label="Previous week" disabled={weekStart.getTime() <= minimumWeek.getTime()} onClick={() => moveWeek(-1)} className="grid h-8 w-8 place-items-center rounded-lg border border-[#e1e8dc] text-[#55734d] disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button><div className="text-center"><p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#89938a]">Week of</p><p className="mt-0.5 text-sm font-extrabold text-[#315244]">{formatShortDate(weekDates[0].key)} – {formatShortDate(weekDates[6].key)}</p></div><button type="button" aria-label="Next week" onClick={() => moveWeek(1)} className="grid h-8 w-8 place-items-center rounded-lg border border-[#e1e8dc] text-[#55734d]"><ChevronRight className="h-4 w-4" /></button></div><div className="mt-4 grid grid-cols-7 gap-1.5">{weekDates.map((date) => <button key={date.key} type="button" disabled={isPastDate(date.key)} onClick={() => chooseDate(date.key)} className={`rounded-xl px-1 py-2 text-center transition ${isPastDate(date.key) ? "cursor-not-allowed bg-[#f6f6f2] text-[#c4c9c1]" : date.key === selectedDate ? "bg-[#7d9e72] text-white" : "bg-[#f1f5ec] text-[#55734d] hover:bg-[#e6eedf]"}`}><span className="block text-[9px] font-extrabold uppercase">{date.day}</span><span className="mt-1 block text-sm font-bold">{date.date}</span></button>)}</div><button type="button" onClick={() => setCalendarOpen(false)} className="mt-4 flex w-full items-center justify-center gap-2 text-[11px] font-extrabold text-[#789073]"><X className="h-3.5 w-3.5" /> Close calendar</button></div>}

          <div className="mt-7 grid grid-cols-5 gap-2 sm:grid-cols-7">{weekDates.map((date) => <button key={date.key} type="button" disabled={isPastDate(date.key)} onClick={() => chooseDate(date.key)} className={`rounded-2xl border px-1 py-3 text-center transition ${isPastDate(date.key) ? "cursor-not-allowed border-[#ededeb] bg-[#f6f6f2] text-[#c4c9c1]" : date.key === selectedDate ? "border-[#7d9e72] bg-[#7d9e72] text-white shadow-[0_10px_20px_-14px_rgba(55,95,60,0.9)]" : "border-[#e7e7df] bg-white text-[#738076] hover:border-[#b8cab1]"}`}><span className="block text-[10px] font-extrabold uppercase tracking-[0.08em]">{date.day}</span><span className="mt-1 block font-display text-xl font-bold">{date.date}</span><span className={`mt-0.5 block text-[10px] font-semibold ${!isPastDate(date.key) && date.key === selectedDate ? "text-[#dcebd5]" : "text-[#a4aca2]"}`}>{date.month}</span></button>)}</div>
          <div className="mt-9 flex flex-col items-center justify-between gap-3 border-b border-[#e7e8e1] pb-4 text-center sm:flex-row sm:items-end sm:text-left"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#89938a]">Available start times</p><h3 className="mt-1 font-display text-xl font-bold tracking-[-0.04em] text-[#234438]">{activeDate.label}</h3></div><span className="text-[11px] font-semibold text-[#a0a99f]">Studio hours · 9:00 AM – 6:00 PM</span></div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{timeSlots.map((time) => { const available = isSlotAvailable(selectedDate, time, durationMinutes); const active = selectedTime === time; return <button key={time} type="button" disabled={!available} onClick={() => setSelectedTime(time)} className={`group flex min-w-[48px] items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${active ? "border-[#234438] bg-[#234438] text-white" : available ? "border-[#e1e2da] bg-white text-[#315244] hover:border-[#9dbb91] hover:bg-[#f1f5ec]" : "cursor-not-allowed border-[#ededeb] bg-[#f0f0ec] text-[#b8bdb6]"}`}><span className="text-sm font-extrabold">{time}</span>{available ? <span className={`grid h-6 w-6 place-items-center rounded-full ${active ? "bg-[#d2765d] text-white" : "bg-[#e6eedf] text-[#6f905f]"}`}><Check className="h-3.5 w-3.5" /></span> : <LockKeyhole className="h-3.5 w-3.5" />}</button>; })}</div>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-[11px] font-bold text-[#89938a]"><span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#7d9e72]" /> Available</span><span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#d4d6d0]" /> Already booked</span><span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#234438]" /> Your selection</span></div>
        </section>

      </div>

      <div className="mt-6 rounded-[22px] border border-[#cbdac4] bg-[#e9f0e3] p-5 text-center sm:p-6"><div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:text-left"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#6f905f]">Final step</p><p className="mt-1 font-display text-xl font-bold tracking-[-0.04em] text-[#234438]">Ready to confirm this visit?</p><p className="mt-1.5 text-xs leading-5 text-[#6b7d6a]">Choose a time and complete the Pet Parent section above first.</p></div><button type="button" disabled={!selectedTime || !isPetParentComplete} onClick={confirmBooking} className="flex h-[52px] shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#d2765d] px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_12px_22px_-14px_rgba(210,118,93,0.9)] transition hover:bg-[#c66850] disabled:cursor-not-allowed disabled:opacity-50">Confirm appointment <ArrowRight className="h-4 w-4" /></button></div></div>
    </div>
  );
}

export default function Booking() {
  const services = useMemo(() => getServices(), []);
  const selected = useMemo(() => getEstimate(), []);

  return (
    <main className="min-h-screen bg-[#f5f3ed] text-[#1e352c]">
      <div className="mx-auto max-w-[1180px] px-5 pb-12 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-[#dfe1d8] py-6"><Link to="/" className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#234438] text-[#f7f1df]"><Scissors className="h-[19px] w-[19px]" /></div><div><p className="font-display text-[17px] font-bold tracking-[-0.04em] text-[#234438]">good & groomed</p><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#89938a]">Book a visit</p></div></Link><div className="hidden items-center gap-2 text-xs font-bold text-[#7f8a80] sm:flex"><ShieldCheck className="h-4 w-4 text-[#7d9e72]" /> Your estimate is saved</div></header>
        <div className="mb-8 pt-10 text-center sm:pt-14"><Link to="/" className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#819080] transition hover:text-[#234438]"><ArrowLeft className="h-3.5 w-3.5" /> Back to services</Link></div>
        <BookingPanel selected={selected} services={services} />
      </div>
    </main>
  );
}
