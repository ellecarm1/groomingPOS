import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CircleDollarSign,
  Clock3,
  LogOut,
  Mail,
  Plus,
  Save,
  Scissors,
  Settings2,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  authenticateUser,
  clearCurrentUser,
  deleteBooking,
  deletePetParentMember,
  getBookings,
  getCurrentUser,
  getEmployees,
  getPetParentMembers,
  getServices,
  saveCurrentUser,
  saveEmployee,
  savePetParentMembers,
  saveServices,
  type Appointment,
  type PetParentMember,
  type Service,
  type ServiceIcon,
  type StudioUser,
} from "@/lib/catalog";

const iconOptions: { value: ServiceIcon; label: string }[] = [
  { value: "scissors", label: "Scissors" },
  { value: "droplets", label: "Droplets" },
  { value: "heart", label: "Heart" },
  { value: "sparkles", label: "Sparkles" },
];

const newService = {
  name: "",
  description: "",
  price: "",
  durationMinutes: "",
  durationLabel: "",
  tag: "New service",
  icon: "heart" as ServiceIcon,
};

const newEmployee = { name: "", email: "", password: "" };

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const signIn = (event: FormEvent) => {
    event.preventDefault();
    const user = authenticateUser(email, password);
    if (!user) {
      setError("That email and password do not match a studio login.");
      return;
    }
    saveCurrentUser(user);
    window.location.reload();
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f3ed] px-5 text-[#1e352c]">
      <div className="w-full max-w-[440px]">
        <Link to="/" className="mb-9 flex items-center justify-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#234438] text-[#f7f1df]"><Scissors className="h-[19px] w-[19px]" /></div><span className="font-display text-lg font-bold tracking-[-0.04em] text-[#234438]">good & groomed</span></Link>
        <div className="rounded-[28px] border border-[#e1e2da] bg-[#fbfaf7] p-7 shadow-[0_24px_70px_-42px_rgba(39,74,56,0.55)] sm:p-9">
          <div className="mb-7 text-center"><p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#d2765d]">Studio access</p><h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.06em] text-[#234438]">Welcome back.</h1><p className="mt-3 text-sm leading-6 text-[#788278]">Sign in to manage services, pet parents, appointments, and your studio team.</p></div>
          <form className="space-y-4" onSubmit={signIn}>
            <label className="block"><span className="mb-2 block text-left text-xs font-extrabold uppercase tracking-[0.1em] text-[#748177]">Email</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@goodandgroomed.com" className="h-12 w-full rounded-xl border border-[#dfe2da] bg-white px-4 text-sm text-[#234438] outline-none transition placeholder:text-[#b0b7ac] focus:border-[#7d9e72] focus:ring-4 focus:ring-[#e6eedf]" /></label>
            <label className="block"><span className="mb-2 block text-left text-xs font-extrabold uppercase tracking-[0.1em] text-[#748177]">Password</span><input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" className="h-12 w-full rounded-xl border border-[#dfe2da] bg-white px-4 text-sm text-[#234438] outline-none transition placeholder:text-[#b0b7ac] focus:border-[#7d9e72] focus:ring-4 focus:ring-[#e6eedf]" /></label>
            {error && <p className="text-xs font-bold text-[#bd604e]">{error}</p>}
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#234438] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#315847]">Sign in to studio <ArrowLeft className="h-4 w-4 rotate-180" /></button>
          </form>
          <p className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] font-semibold leading-5 text-[#9aa49a]"><Settings2 className="h-3.5 w-3.5" /> Demo workspace · credentials and records stay in this browser</p>
        </div>
      </div>
    </main>
  );
}

const inputClass = "h-10 w-full rounded-xl border border-[#dfe2da] bg-white px-3 text-sm font-bold text-[#315244] outline-none transition focus:border-[#7d9e72] focus:ring-4 focus:ring-[#e6eedf]";

export default function Admin() {
  const [currentUser, setCurrentUser] = useState<StudioUser | null>(getCurrentUser);
  const [services, setServices] = useState<Service[]>(getServices);
  const [members, setMembers] = useState<PetParentMember[]>(getPetParentMembers);
  const [appointments, setAppointments] = useState<Appointment[]>(getBookings);
  const [employees, setEmployees] = useState<StudioUser[]>(getEmployees);
  const [showAddService, setShowAddService] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [draft, setDraft] = useState(newService);
  const [employeeDraft, setEmployeeDraft] = useState(newEmployee);
  const [saved, setSaved] = useState(false);
  const [employeeStatus, setEmployeeStatus] = useState("");

  const totalValue = useMemo(() => services.reduce((sum, service) => sum + service.price, 0), [services]);

  if (!currentUser) return <Login />;

  const updateService = (id: string, field: "price" | "durationMinutes", value: string) => {
    setSaved(false);
    setServices((current) => current.map((service) => {
      if (service.id !== id) return service;
      if (field === "durationMinutes") return { ...service, durationMinutes: Number(value), durationLabel: `${value} min` };
      return { ...service, price: Number(value) };
    }));
  };

  const addService = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim() || !draft.price || !draft.durationMinutes) return;
    const id = `${draft.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    setServices((current) => [...current, { ...draft, id, price: Number(draft.price), durationMinutes: Number(draft.durationMinutes), durationLabel: draft.durationLabel || `${draft.durationMinutes} min`, tone: "bg-[#f2ead6] text-[#927337]" }]);
    setDraft(newService);
    setShowAddService(false);
    setSaved(false);
  };

  const removeService = (id: string) => {
    setSaved(false);
    setServices((current) => current.filter((service) => service.id !== id));
  };

  const updateMember = (id: string, field: "firstName" | "lastName" | "city" | "state", value: string) => {
    setMembers((current) => current.map((member) => member.id === id ? { ...member, [field]: value } : member));
  };

  const updateMemberPet = (id: string, field: "name" | "breed", value: string) => {
    setMembers((current) => current.map((member) => member.id === id ? { ...member, pets: member.pets.map((pet, index) => index === 0 ? { ...pet, [field]: value } : pet) } : member));
  };

  const addEmployee = (event: FormEvent) => {
    event.preventDefault();
    if (!employeeDraft.name.trim() || !employeeDraft.email.trim() || !employeeDraft.password.trim()) return;
    saveEmployee(employeeDraft);
    setEmployees(getEmployees());
    setEmployeeDraft(newEmployee);
    setShowAddEmployee(false);
    setEmployeeStatus("Employee login created and ready to use.");
  };

  const saveAll = () => {
    saveServices(services);
    savePetParentMembers(members);
    setSaved(true);
  };

  const removeAppointment = (id: string) => {
    deleteBooking(id);
    setAppointments(getBookings());
  };

  const signOut = () => {
    clearCurrentUser();
    setCurrentUser(null);
  };

  return (
    <main className="min-h-screen bg-[#f5f3ed] text-[#1e352c]">
      <div className="mx-auto max-w-[1180px] px-5 pb-12 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-[#dfe1d8] py-6"><Link to="/" className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#234438] text-[#f7f1df]"><Scissors className="h-[19px] w-[19px]" /></div><div><p className="font-display text-[17px] font-bold tracking-[-0.04em] text-[#234438]">good & groomed</p><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#89938a]">Studio admin</p></div></Link><button type="button" onClick={signOut} className="flex items-center gap-2 rounded-full border border-[#d6dbd1] bg-[#fbfaf7] px-3 py-2 text-xs font-extrabold text-[#315244] transition hover:bg-white sm:px-4"><LogOut className="h-3.5 w-3.5" /> Sign out</button></header>

        <div className="flex flex-col items-center justify-between gap-5 pb-8 pt-10 text-center sm:flex-row sm:items-end sm:text-left sm:pt-14"><div><Link to="/" className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#819080] transition hover:text-[#234438]"><ArrowLeft className="h-3.5 w-3.5" /> POS dashboard</Link><h1 className="mt-5 font-display text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[0.95] tracking-[-0.07em] text-[#234438]">Hello {currentUser.name}.</h1><p className="mt-4 max-w-[510px] text-sm leading-6 text-[#6b776e]">Your studio control room for services, pet parents, appointments, and team access.</p></div><div className="flex items-center gap-3 rounded-2xl bg-[#e6eedf] px-4 py-3"><UserRound className="h-4 w-4 text-[#6f905f]" /><div className="text-left"><p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#769269]">Signed in as</p><p className="text-sm font-bold text-[#315244]">{currentUser.email}</p><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#789073]">{currentUser.role}</p></div></div></div>

        <div className="mb-5 grid gap-3 sm:grid-cols-4"><div className="rounded-2xl border border-[#e1e2da] bg-[#fbfaf7] p-4 text-center"><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#9aa49a]">Active services</p><p className="mt-1 font-display text-2xl font-bold text-[#234438]">{services.length}</p></div><div className="rounded-2xl border border-[#e1e2da] bg-[#fbfaf7] p-4 text-center"><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#9aa49a]">Pet parents</p><p className="mt-1 font-display text-2xl font-bold text-[#234438]">{members.length}</p></div><div className="rounded-2xl border border-[#e1e2da] bg-[#fbfaf7] p-4 text-center"><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#9aa49a]">Appointments</p><p className="mt-1 font-display text-2xl font-bold text-[#234438]">{appointments.length}</p></div><div className="rounded-2xl border border-[#e1e2da] bg-[#fbfaf7] p-4 text-center"><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#9aa49a]">POS status</p><p className="mt-1 flex items-center justify-center gap-2 font-display text-2xl font-bold text-[#6d8c5d]"><span className="h-2 w-2 rounded-full bg-[#7d9e72]" /> Live</p></div></div>

        <section className="overflow-hidden rounded-[28px] border border-[#e1e2da] bg-[#fbfaf7] shadow-[0_18px_50px_-35px_rgba(39,74,56,0.4)]"><div className="flex flex-col items-center justify-between gap-4 border-b border-[#e7e8e1] p-5 text-center sm:flex-row sm:items-center sm:p-7 sm:text-left"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#d2765d]">Menu editor</p><h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.045em] text-[#234438]">Services shown on POS</h2></div><div className="flex gap-2"><button type="button" onClick={() => setShowAddService((current) => !current)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#ccd8c7] bg-white px-4 py-2.5 text-xs font-extrabold text-[#55734d] transition hover:bg-[#f1f5ec]"><Plus className="h-4 w-4" /> Add service</button><button type="button" onClick={saveAll} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#234438] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#315847]"><Save className="h-4 w-4" /> {saved ? "Saved" : "Save changes"}</button></div></div>
          {showAddService && <form onSubmit={addService} className="grid gap-3 border-b border-[#e7e8e1] bg-[#f1f5ec] p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-4"><input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Service name" className={inputClass} /><input required value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Short description" className={inputClass} /><input required type="number" min="0" step="1" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} placeholder="Price" className={inputClass} /><input required type="number" min="1" step="1" value={draft.durationMinutes} onChange={(event) => setDraft({ ...draft, durationMinutes: event.target.value })} placeholder="Minutes" className={inputClass} /><input value={draft.durationLabel} onChange={(event) => setDraft({ ...draft, durationLabel: event.target.value })} placeholder="Duration label (optional)" className={`${inputClass} sm:col-span-2`} /><select value={draft.icon} onChange={(event) => setDraft({ ...draft, icon: event.target.value as ServiceIcon })} className={inputClass}>{iconOptions.map((option) => <option key={option.value} value={option.value}>{option.label} icon</option>)}</select><button type="submit" className="h-10 rounded-xl bg-[#d2765d] px-4 text-sm font-extrabold text-white transition hover:bg-[#c66850]">Add to menu</button></form>}
          <div className="divide-y divide-[#e7e8e1]">{services.map((service) => <div key={service.id} className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_150px_150px_44px] sm:items-center sm:p-7"><div><div className="flex items-center gap-3"><div className={`grid h-10 w-10 place-items-center rounded-xl ${service.tone}`}><Scissors className="h-4 w-4" /></div><div><h3 className="font-display text-lg font-bold tracking-[-0.035em] text-[#234438]">{service.name}</h3><p className="mt-0.5 text-xs text-[#89938a]">{service.description}</p></div></div></div><label><span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#9aa49a]">Price</span><div className="relative"><CircleDollarSign className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#9aa49a]" /><input type="number" min="0" step="1" value={service.price} onChange={(event) => updateService(service.id, "price", event.target.value)} className="h-10 w-full rounded-xl border border-[#dfe2da] bg-white pl-9 pr-3 text-sm font-bold text-[#315244] outline-none focus:border-[#7d9e72]" /></div></label><label><span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#9aa49a]">Minutes</span><div className="relative"><Clock3 className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#9aa49a]" /><input type="number" min="1" step="1" value={service.durationMinutes} onChange={(event) => updateService(service.id, "durationMinutes", event.target.value)} className="h-10 w-full rounded-xl border border-[#dfe2da] bg-white pl-9 pr-3 text-sm font-bold text-[#315244] outline-none focus:border-[#7d9e72]" /></div></label><button type="button" onClick={() => removeService(service.id)} aria-label={`Remove ${service.name}`} className="grid h-10 w-10 place-items-center rounded-xl border border-[#f0d8d1] text-[#bd6a58] transition hover:bg-[#fff0eb]"><Trash2 className="h-4 w-4" /></button></div>)}</div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[28px] border border-[#e1e2da] bg-[#fbfaf7] shadow-[0_18px_50px_-35px_rgba(39,74,56,0.4)]"><div className="flex flex-col items-center justify-between gap-3 border-b border-[#e7e8e1] p-5 text-center sm:flex-row sm:p-7 sm:text-left"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#d2765d]">Member directory</p><h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.045em] text-[#234438]">Pet parents and pets</h2></div><button type="button" onClick={() => { savePetParentMembers(members); setSaved(true); }} className="inline-flex items-center gap-2 rounded-xl bg-[#234438] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#315847]"><Save className="h-4 w-4" /> Save directory</button></div><div className="divide-y divide-[#e7e8e1]">{members.length ? members.map((member) => <div key={member.id} className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px] sm:p-7"><div className="grid gap-3 sm:grid-cols-2"><input aria-label={`${member.firstName} first name`} value={member.firstName} onChange={(event) => updateMember(member.id, "firstName", event.target.value)} className={inputClass} /><input aria-label={`${member.lastName} last name`} value={member.lastName} onChange={(event) => updateMember(member.id, "lastName", event.target.value)} className={inputClass} /><input aria-label={`${member.firstName} city`} value={member.city} onChange={(event) => updateMember(member.id, "city", event.target.value)} className={inputClass} /><input aria-label={`${member.firstName} state`} value={member.state} onChange={(event) => updateMember(member.id, "state", event.target.value)} className={inputClass} /></div><div className="grid gap-3 sm:grid-cols-2"><input aria-label={`${member.firstName} pet name`} value={member.pets[0]?.name || ""} onChange={(event) => updateMemberPet(member.id, "name", event.target.value)} className={inputClass} /><input aria-label={`${member.firstName} pet breed`} value={member.pets[0]?.breed || ""} onChange={(event) => updateMemberPet(member.id, "breed", event.target.value)} className={inputClass} /><p className="text-xs font-semibold text-[#89938a] sm:col-span-2">{member.pets.length} saved {member.pets.length === 1 ? "pet" : "pets"}</p></div><button type="button" onClick={() => { deletePetParentMember(member.id); setMembers(getPetParentMembers()); }} aria-label={`Delete ${member.firstName} ${member.lastName}`} className="grid h-10 w-10 place-items-center rounded-xl border border-[#f0d8d1] text-[#bd6a58] transition hover:bg-[#fff0eb]"><Trash2 className="h-4 w-4" /></button></div>) : <p className="p-7 text-center text-sm text-[#89938a]">No saved pet parents yet.</p>}</div></section>

        <section className="mt-6 overflow-hidden rounded-[28px] border border-[#e1e2da] bg-[#fbfaf7] shadow-[0_18px_50px_-35px_rgba(39,74,56,0.4)]"><div className="flex flex-col items-center justify-between gap-3 border-b border-[#e7e8e1] p-5 text-center sm:flex-row sm:p-7 sm:text-left"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#d2765d]">Appointment book</p><h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.045em] text-[#234438]">Saved appointments</h2></div><span className="rounded-full bg-[#e6eedf] px-3 py-2 text-[11px] font-extrabold text-[#5c7848]">{appointments.length} total</span></div><div className="divide-y divide-[#e7e8e1]">{appointments.length ? appointments.map((appointment) => <div key={appointment.id} className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-7"><div><p className="font-display text-lg font-bold tracking-[-0.035em] text-[#234438]">{appointment.dateLabel} · {appointment.time}</p><p className="mt-1 text-xs text-[#788278]">{appointment.petParent ? `${appointment.petParent.firstName} ${appointment.petParent.lastName} · ${appointment.petParent.petName}` : "Guest appointment"} · {appointment.durationMinutes} minutes</p></div><button type="button" onClick={() => removeAppointment(appointment.id)} className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[#f0d8d1] px-3 py-2 text-xs font-extrabold text-[#bd6a58] transition hover:bg-[#fff0eb] sm:self-auto"><Trash2 className="h-3.5 w-3.5" /> Delete appointment</button></div>) : <p className="p-7 text-center text-sm text-[#89938a]">No saved appointments yet.</p>}</div></section>

        {currentUser.role === "admin" && <section className="mt-6 overflow-hidden rounded-[28px] border border-[#e1e2da] bg-[#fbfaf7] shadow-[0_18px_50px_-35px_rgba(39,74,56,0.4)]"><div className="flex flex-col items-center justify-between gap-3 border-b border-[#e7e8e1] p-5 text-center sm:flex-row sm:p-7 sm:text-left"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#d2765d]">Team access</p><h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.045em] text-[#234438]">Employee logins</h2></div><button type="button" onClick={() => setShowAddEmployee((current) => !current)} className="inline-flex items-center gap-2 rounded-xl border border-[#ccd8c7] bg-white px-4 py-2.5 text-xs font-extrabold text-[#55734d] transition hover:bg-[#f1f5ec]"><Plus className="h-4 w-4" /> Add employee login</button></div>{showAddEmployee && <form onSubmit={addEmployee} className="grid gap-3 border-b border-[#e7e8e1] bg-[#f1f5ec] p-5 sm:grid-cols-3 sm:p-7"><input required value={employeeDraft.name} onChange={(event) => setEmployeeDraft({ ...employeeDraft, name: event.target.value })} placeholder="Employee name" className={inputClass} /><input required type="email" value={employeeDraft.email} onChange={(event) => setEmployeeDraft({ ...employeeDraft, email: event.target.value })} placeholder="Employee email" className={inputClass} /><input required type="password" value={employeeDraft.password} onChange={(event) => setEmployeeDraft({ ...employeeDraft, password: event.target.value })} placeholder="Temporary password" className={inputClass} /><button type="submit" className="h-10 rounded-xl bg-[#d2765d] px-4 text-sm font-extrabold text-white transition hover:bg-[#c66850] sm:col-span-3">Create employee login</button></form>}<div className="divide-y divide-[#e7e8e1]">{employees.length ? employees.map((employee) => <div key={employee.id} className="flex items-center justify-between gap-3 p-5 sm:p-7"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e6edf5] text-[#49647f]"><UsersRound className="h-4 w-4" /></div><div><p className="font-bold text-[#315244]">{employee.name}</p><p className="mt-0.5 flex items-center gap-1 text-xs text-[#89938a]"><Mail className="h-3 w-3" /> {employee.email}</p></div></div><span className="rounded-full bg-[#e6eedf] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#6f905f]">Employee</span></div>) : <p className="p-7 text-center text-sm text-[#89938a]">No employee logins yet.</p>}</div>{employeeStatus && <p className="border-t border-[#e7e8e1] p-4 text-center text-xs font-bold text-[#6f905f]">{employeeStatus}</p>}</section>}

        <p className="mt-5 flex items-center justify-center gap-2 text-center text-[11px] font-semibold text-[#9aa49a]"><Check className="h-3.5 w-3.5 text-[#7d9e72]" /> Services, records, and employee accounts are stored in this browser for this demo workspace.</p>
      </div>
    </main>
  );
}
