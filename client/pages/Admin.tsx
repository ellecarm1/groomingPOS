import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CircleDollarSign,
  Clock3,
  LogOut,
  Plus,
  Save,
  Scissors,
  Settings2,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  getServices,
  saveServices,
  type Service,
  type ServiceIcon,
} from "@/lib/catalog";

const ADMIN_SESSION_KEY = "good-groomed-admin-session";

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

function isAdminSignedIn() {
  return typeof window !== "undefined" && window.localStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const signIn = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password to continue.");
      return;
    }
    window.localStorage.setItem(ADMIN_SESSION_KEY, "true");
    window.location.reload();
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f3ed] px-5 text-[#1e352c]">
      <div className="w-full max-w-[440px]">
        <Link to="/" className="mb-9 flex items-center justify-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#234438] text-[#f7f1df]"><Scissors className="h-[19px] w-[19px]" /></div><span className="font-display text-lg font-bold tracking-[-0.04em] text-[#234438]">good & groomed</span></Link>
        <div className="rounded-[28px] border border-[#e1e2da] bg-[#fbfaf7] p-7 shadow-[0_24px_70px_-42px_rgba(39,74,56,0.55)] sm:p-9">
          <div className="mb-7"><p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#d2765d]">Studio access</p><h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.06em] text-[#234438]">Welcome back.</h1><p className="mt-3 text-sm leading-6 text-[#788278]">Sign in to manage services, prices and appointment lengths.</p></div>
          <form className="space-y-4" onSubmit={signIn}>
            <label className="block"><span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.1em] text-[#748177]">Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@goodandgroomed.com" className="h-12 w-full rounded-xl border border-[#dfe2da] bg-white px-4 text-sm text-[#234438] outline-none transition placeholder:text-[#b0b7ac] focus:border-[#7d9e72] focus:ring-4 focus:ring-[#e6eedf]" /></label>
            <label className="block"><span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.1em] text-[#748177]">Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" className="h-12 w-full rounded-xl border border-[#dfe2da] bg-white px-4 text-sm text-[#234438] outline-none transition placeholder:text-[#b0b7ac] focus:border-[#7d9e72] focus:ring-4 focus:ring-[#e6eedf]" /></label>
            {error && <p className="text-xs font-bold text-[#bd604e]">{error}</p>}
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#234438] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#315847]">Sign in to studio <ArrowLeft className="h-4 w-4 rotate-180" /></button>
          </form>
          <p className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] font-semibold leading-5 text-[#9aa49a]"><Settings2 className="h-3.5 w-3.5" /> Demo workspace · changes stay in this browser</p>
        </div>
      </div>
    </main>
  );
}

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(isAdminSignedIn);
  const [services, setServices] = useState<Service[]>(getServices);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState(newService);
  const [saved, setSaved] = useState(false);

  const totalValue = useMemo(() => services.reduce((sum, service) => sum + service.price, 0), [services]);

  if (!authenticated) return <Login />;

  const updateService = (id: string, field: "price" | "durationMinutes", value: string) => {
    setSaved(false);
    setServices((current) => current.map((service) => {
      if (service.id !== id) return service;
      if (field === "durationMinutes") {
        return { ...service, durationMinutes: Number(value), durationLabel: `${value} min` };
      }
      return { ...service, price: Number(value) };
    }));
  };

  const removeService = (id: string) => {
    setSaved(false);
    setServices((current) => current.filter((service) => service.id !== id));
  };

  const addService = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim() || !draft.price || !draft.durationMinutes) return;
    const id = `${draft.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    setServices((current) => [...current, { ...draft, id, price: Number(draft.price), durationMinutes: Number(draft.durationMinutes), durationLabel: draft.durationLabel || `${draft.durationMinutes} min`, tone: "bg-[#f2ead6] text-[#927337]" }]);
    setDraft(newService);
    setShowAdd(false);
    setSaved(false);
  };

  const saveChanges = () => {
    saveServices(services);
    setSaved(true);
  };

  const signOut = () => {
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
    setAuthenticated(false);
  };

  return (
    <main className="min-h-screen bg-[#f5f3ed] text-[#1e352c]">
      <div className="mx-auto max-w-[1180px] px-5 pb-12 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-[#dfe1d8] py-6"><Link to="/" className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#234438] text-[#f7f1df]"><Scissors className="h-[19px] w-[19px]" /></div><div><p className="font-display text-[17px] font-bold tracking-[-0.04em] text-[#234438]">good & groomed</p><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#89938a]">Studio admin</p></div></Link><button type="button" onClick={signOut} className="flex items-center gap-2 rounded-full border border-[#d6dbd1] bg-[#fbfaf7] px-3 py-2 text-xs font-extrabold text-[#315244] transition hover:bg-white sm:px-4"><LogOut className="h-3.5 w-3.5" /> Sign out</button></header>

        <div className="flex flex-col justify-between gap-5 pb-8 pt-10 sm:flex-row sm:items-end sm:pt-14"><div><Link to="/" className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#819080] transition hover:text-[#234438]"><ArrowLeft className="h-3.5 w-3.5" /> POS dashboard</Link><h1 className="mt-5 font-display text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[0.95] tracking-[-0.07em] text-[#234438]">Shape your menu.</h1><p className="mt-4 max-w-[510px] text-sm leading-6 text-[#6b776e]">Keep services and pricing current for every associate on the floor.</p></div><div className="flex items-center gap-3 rounded-2xl bg-[#e6eedf] px-4 py-3"><UserRound className="h-4 w-4 text-[#6f905f]" /><div><p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#769269]">Signed in as</p><p className="text-sm font-bold text-[#315244]">Studio admin</p></div></div></div>

        <div className="mb-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-[#e1e2da] bg-[#fbfaf7] p-4"><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#9aa49a]">Active services</p><p className="mt-1 font-display text-2xl font-bold text-[#234438]">{services.length}</p></div><div className="rounded-2xl border border-[#e1e2da] bg-[#fbfaf7] p-4"><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#9aa49a]">Menu value</p><p className="mt-1 font-display text-2xl font-bold text-[#234438]">${totalValue.toFixed(0)}</p></div><div className="rounded-2xl border border-[#e1e2da] bg-[#fbfaf7] p-4"><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#9aa49a]">POS status</p><p className="mt-1 flex items-center gap-2 font-display text-2xl font-bold text-[#6d8c5d]"><span className="h-2 w-2 rounded-full bg-[#7d9e72]" /> Live</p></div></div>

        <section className="overflow-hidden rounded-[28px] border border-[#e1e2da] bg-[#fbfaf7] shadow-[0_18px_50px_-35px_rgba(39,74,56,0.4)]"><div className="flex flex-col justify-between gap-4 border-b border-[#e7e8e1] p-5 sm:flex-row sm:items-center sm:p-7"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#d2765d]">Menu editor</p><h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.045em] text-[#234438]">Services shown on POS</h2></div><div className="flex gap-2"><button type="button" onClick={() => setShowAdd((current) => !current)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#ccd8c7] bg-white px-4 py-2.5 text-xs font-extrabold text-[#55734d] transition hover:bg-[#f1f5ec]"><Plus className="h-4 w-4" /> Add service</button><button type="button" onClick={saveChanges} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#234438] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#315847]"><Save className="h-4 w-4" /> {saved ? "Saved" : "Save changes"}</button></div></div>
          {showAdd && <form onSubmit={addService} className="grid gap-3 border-b border-[#e7e8e1] bg-[#f1f5ec] p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-4"><input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Service name" className="h-11 rounded-xl border border-[#d5dfd0] bg-white px-3 text-sm outline-none focus:border-[#7d9e72]" /><input required value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Short description" className="h-11 rounded-xl border border-[#d5dfd0] bg-white px-3 text-sm outline-none focus:border-[#7d9e72]" /><input required type="number" min="0" step="1" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} placeholder="Price" className="h-11 rounded-xl border border-[#d5dfd0] bg-white px-3 text-sm outline-none focus:border-[#7d9e72]" /><input required type="number" min="1" step="1" value={draft.durationMinutes} onChange={(event) => setDraft({ ...draft, durationMinutes: event.target.value })} placeholder="Minutes" className="h-11 rounded-xl border border-[#d5dfd0] bg-white px-3 text-sm outline-none focus:border-[#7d9e72]" /><input value={draft.durationLabel} onChange={(event) => setDraft({ ...draft, durationLabel: event.target.value })} placeholder="Duration label (optional)" className="h-11 rounded-xl border border-[#d5dfd0] bg-white px-3 text-sm outline-none focus:border-[#7d9e72] sm:col-span-2" /><select value={draft.icon} onChange={(event) => setDraft({ ...draft, icon: event.target.value as ServiceIcon })} className="h-11 rounded-xl border border-[#d5dfd0] bg-white px-3 text-sm outline-none focus:border-[#7d9e72]"><option value="heart">Heart icon</option>{iconOptions.filter((option) => option.value !== "heart").map((option) => <option key={option.value} value={option.value}>{option.label} icon</option>)}</select><button type="submit" className="h-11 rounded-xl bg-[#d2765d] px-4 text-sm font-extrabold text-white transition hover:bg-[#c66850]">Add to menu</button></form>}
          <div className="divide-y divide-[#e7e8e1]">{services.map((service) => <div key={service.id} className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_150px_180px_44px] sm:items-center sm:p-7"><div><div className="flex items-center gap-3"><div className={`grid h-10 w-10 place-items-center rounded-xl ${service.tone}`}><Scissors className="h-4 w-4" /></div><div><h3 className="font-display text-lg font-bold tracking-[-0.035em] text-[#234438]">{service.name}</h3><p className="mt-0.5 text-xs text-[#89938a]">{service.description}</p></div></div></div><label><span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#9aa49a]">Price</span><div className="relative"><CircleDollarSign className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#9aa49a]" /><input type="number" min="0" step="1" value={service.price} onChange={(event) => updateService(service.id, "price", event.target.value)} className="h-10 w-full rounded-xl border border-[#dfe2da] bg-white pl-9 pr-3 text-sm font-bold text-[#315244] outline-none focus:border-[#7d9e72]" /></div></label><label><span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#9aa49a]">Minutes</span><div className="relative"><Clock3 className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#9aa49a]" /><input type="number" min="1" step="1" value={service.durationMinutes} onChange={(event) => updateService(service.id, "durationMinutes", event.target.value)} className="h-10 w-full rounded-xl border border-[#dfe2da] bg-white pl-9 pr-3 text-sm font-bold text-[#315244] outline-none focus:border-[#7d9e72]" /></div></label><button type="button" onClick={() => removeService(service.id)} aria-label={`Remove ${service.name}`} className="grid h-10 w-10 place-items-center rounded-xl border border-[#f0d8d1] text-[#bd6a58] transition hover:bg-[#fff0eb]"><Trash2 className="h-4 w-4" /></button></div>)}</div>
        </section>
        <p className="mt-5 flex items-center justify-center gap-2 text-center text-[11px] font-semibold text-[#9aa49a]"><Check className="h-3.5 w-3.5 text-[#7d9e72]" /> Save changes to publish the updated menu to the associate POS.</p>
      </div>
    </main>
  );
}
