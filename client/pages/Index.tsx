import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Droplets,
  Heart,
  Info,
  Scissors,
  Sparkles,
  Star,
  Printer,
  UserRound,
} from "lucide-react";

import { InvoicePreview } from "@/components/InvoicePreview";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  getEstimate,
  getServices,
  saveEstimate,
  SERVICES_UPDATED_EVENT,
  type Service,
} from "@/lib/catalog";

const iconMap = {
  scissors: Scissors,
  droplets: Droplets,
  heart: Heart,
  sparkles: Sparkles,
};

export default function Index() {
  const [selected, setSelected] = useState<Record<string, number>>(() => {
    const saved = getEstimate();
    return Object.keys(saved).length ? saved : { "full-groom": 1 };
  });
  const [services, setServices] = useState<Service[]>(getServices);

  useEffect(() => {
    const syncServices = () => setServices(getServices());
    window.addEventListener(SERVICES_UPDATED_EVENT, syncServices);
    window.addEventListener("storage", syncServices);
    return () => {
      window.removeEventListener(SERVICES_UPDATED_EVENT, syncServices);
      window.removeEventListener("storage", syncServices);
    };
  }, []);

  useEffect(() => {
    saveEstimate(selected);
  }, [selected]);

  const selectedServices = useMemo(
    () => services.filter((service) => selected[service.id]),
    [selected, services],
  );

  const subtotal = selectedServices.reduce(
    (total, service) => total + service.price * selected[service.id],
    0,
  );
  const totalItems = Object.values(selected).reduce(
    (total, quantity) => total + quantity,
    0,
  );

  const toggleService = (id: string) => {
    setSelected((current) => {
      if (current[id]) {
        const next = { ...current };
        delete next[id];
        return next;
      }
      return { ...current, [id]: 1 };
    });
  };

  const updateQuantity = (id: string, change: number) => {
    setSelected((current) => {
      const nextQuantity = (current[id] || 0) + change;
      if (nextQuantity <= 0) {
        const next = { ...current };
        delete next[id];
        return next;
      }
      return { ...current, [id]: nextQuantity };
    });
  };

  const openBooking = () => {
    saveEstimate(selected);
    window.open("/booking", "_blank", "noopener,noreferrer");
  };

  const printInvoice = () => {
    saveEstimate(selected);
    window.print();
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f3ed] text-[#1e352c]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_2%,rgba(221,120,93,0.12),transparent_22rem),radial-gradient(circle_at_5%_78%,rgba(122,151,95,0.12),transparent_25rem)]" />
      <div className="relative mx-auto max-w-[1440px] px-5 pb-10 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-[#dfe1d8] py-6 lg:py-7">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#234438] text-[#f7f1df] shadow-[0_8px_20px_-12px_rgba(20,48,38,0.8)]">
              <Scissors className="h-[19px] w-[19px]" strokeWidth={2.3} />
            </div>
            <div>
              <p className="font-display text-[17px] font-bold tracking-[-0.04em] text-[#234438]">
                good & groomed
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#89938a]">
                Brooklyn · NY
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-[#6d796e] md:flex" aria-label="Main navigation">
            <Link to="/" className="text-[#234438]">Services</Link>
            <Link to="/booking">How it works</Link>
            <Link to="/admin">Our studio</Link>
          </nav>

          <Link to="/admin" className="flex items-center gap-2 rounded-full border border-[#d6dbd1] bg-[#fbfaf7] px-3 py-2 text-sm font-bold text-[#315244] transition hover:border-[#aebca8] hover:bg-white sm:px-4">
            <UserRound className="h-4 w-4" />
            <span className="hidden sm:inline">My account</span>
          </Link>
        </header>

        <section className="grid gap-10 pb-12 pt-12 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_370px] lg:gap-16 lg:pb-16 lg:pt-[72px] xl:grid-cols-[minmax(0,1fr)_416px]">
          <div>
            <div className="mb-8 max-w-[700px]">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#e6eedf] px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#5c7848]">
                <Sparkles className="h-3.5 w-3.5" />
                Your visit, your way
              </div>
              <h1 className="font-display text-[clamp(2.8rem,6vw,5.25rem)] font-bold leading-[0.94] tracking-[-0.075em] text-[#1e352c]">
                A little more
                <span className="block text-[#d2765d]">love, tailored.</span>
              </h1>
              <p className="mt-6 max-w-[560px] text-base leading-7 text-[#66736a] sm:text-[17px]">
                Build the perfect grooming day for your best friend. Choose a
                service, make it theirs, and see your estimate update as you go.
              </p>
            </div>

            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#89938a]">
                  Step 01
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.045em] text-[#234438]">
                  Pick your services
                </h2>
              </div>
              <p className="pb-1 text-right text-xs font-semibold text-[#89938a]">
                {totalItems} {totalItems === 1 ? "service" : "services"} selected
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {services.map((service) => {
                const Icon = iconMap[service.icon];
                const quantity = selected[service.id] || 0;
                const isSelected = quantity > 0;
                return (
                  <div
                    key={service.id}
                    className={cn(
                      "group relative rounded-[22px] border p-5 transition-all duration-200",
                      isSelected
                        ? "border-[#9dbb91] bg-white shadow-[0_18px_35px_-24px_rgba(39,74,56,0.65)]"
                        : "border-[#e1e2da] bg-[#fbfaf7] hover:-translate-y-0.5 hover:border-[#becdb8] hover:shadow-[0_18px_35px_-28px_rgba(39,74,56,0.55)]",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleService(service.id)}
                      aria-pressed={isSelected}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl", service.tone)}>
                          <Icon className="h-[21px] w-[21px]" strokeWidth={2.1} />
                        </div>
                        <span
                          className={cn(
                            "grid h-6 w-6 place-items-center rounded-full border transition",
                            isSelected
                              ? "border-[#8bae80] bg-[#7d9e72] text-white"
                              : "border-[#ccd5ca] text-transparent group-hover:border-[#9dbb91]",
                          )}
                        >
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </span>
                      </div>
                      <div className="mt-5 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-[18px] font-bold tracking-[-0.035em] text-[#234438]">
                            {service.name}
                          </h3>
                          <p className="mt-1.5 max-w-[235px] text-[13px] leading-5 text-[#788278]">
                            {service.description}
                          </p>
                        </div>
                        <p className="shrink-0 pt-0.5 font-display text-lg font-bold text-[#234438]">
                          {formatCurrency(service.price)}
                        </p>
                      </div>
                    </button>
                    <div className="mt-5 flex items-center justify-between border-t border-[#edf0e9] pt-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#89938a]">
                        <Clock3 className="h-3.5 w-3.5" />
                        {service.durationLabel}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#b0b7ac]">
                        {service.tag}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="mt-4 flex items-center justify-between rounded-xl bg-[#f1f5ec] px-3 py-2">
                        <span className="text-xs font-bold text-[#55734d]">How many?</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(service.id, -1)}
                            aria-label={`Remove one ${service.name}`}
                            className="grid h-7 w-7 place-items-center rounded-lg border border-[#c8d8c1] bg-white text-[#55734d] transition hover:bg-[#e5efdf]"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-4 text-center text-sm font-extrabold text-[#315244]">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(service.id, 1)}
                            aria-label={`Add one ${service.name}`}
                            className="grid h-7 w-7 place-items-center rounded-lg border border-[#c8d8c1] bg-white text-[#55734d] transition hover:bg-[#e5efdf]"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#e5e2d7] bg-[#fbfaf7] px-4 py-4 sm:px-5">
              <div className="mt-0.5 rounded-full bg-[#f3e8c9] p-1.5 text-[#9b7a36]"><Info className="h-3.5 w-3.5" /></div>
              <p className="text-xs leading-5 text-[#7e857b]">
                Prices are estimates based on size and coat condition. We’ll
                confirm the final total with you before we begin.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-5 rounded-[22px] border border-[#cbdac4] bg-[#e9f0e3] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#6f905f]">Step 02 · Find a time</p>
                <h3 className="mt-1 font-display text-xl font-bold tracking-[-0.04em] text-[#234438]">Ready to book their visit?</h3>
                <p className="mt-1.5 text-xs leading-5 text-[#6b7d6a]">No payment needed today · change or cancel anytime</p>
              </div>
              <button
                type="button"
                disabled={selectedServices.length === 0}
                onClick={openBooking}
                className="flex h-[52px] shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#d2765d] px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_12px_22px_-14px_rgba(210,118,93,0.9)] transition hover:bg-[#c66850] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue to booking
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <aside className="relative lg:pt-10">
            <div className="sticky top-6 overflow-hidden rounded-[28px] bg-[#234438] text-[#f8f4e8] shadow-[0_30px_70px_-32px_rgba(20,48,38,0.85)]">
              <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border-[22px] border-[#385b47]/70" />
              <div className="absolute -bottom-28 -left-24 h-52 w-52 rounded-full border-[18px] border-[#d2765d]/20" />
              <div className="relative p-6 sm:p-7 lg:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#a7c39b]">Step 02</p>
                    <h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.045em]">Your estimate</h2>
                  </div>
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[#d2765d] text-[#fff5ed]">
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </div>

                <div className="my-7 h-px bg-[#527060]" />

                <div className="space-y-4">
                  {selectedServices.length > 0 ? (
                    selectedServices.map((service) => (
                      <div key={service.id} className="flex items-start justify-between gap-4 text-sm">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#3e6350] text-[10px] font-extrabold text-[#cfe2c7]">{selected[service.id]}</span>
                          <span className="leading-5 text-[#d4e0d0]">{service.name}</span>
                        </div>
                        <span className="shrink-0 font-semibold text-[#f8f4e8]">{formatCurrency(service.price * selected[service.id])}</span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[#527060] px-4 py-5 text-center text-sm text-[#a7c0ad]">
                      Select a service to start your estimate.
                    </div>
                  )}
                </div>

                <div className="my-7 h-px bg-[#527060]" />
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#a7c0ad]">Estimated total</p>
                    <p className="mt-1 font-display text-[42px] font-bold leading-none tracking-[-0.065em] text-white">{formatCurrency(subtotal)}</p>
                  </div>
                  <p className="pb-1 text-xs font-semibold text-[#a7c0ad]">before tax</p>
                </div>

                <div className="mt-7 flex items-center gap-3 rounded-2xl bg-[#2c5140] px-4 py-3">
                  <CalendarDays className="h-4 w-4 shrink-0 text-[#f0b19d]" />
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#9fbea0]">Next available</p>
                    <p className="mt-0.5 text-sm font-bold text-[#f8f4e8]">Tuesday, April 23</p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-[#a7c39b]" />
                </div>

              </div>
            </div>
          </aside>
        </section>

        <section className="pb-12 pt-2" aria-labelledby="invoice-heading">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#d2765d]">Ready for checkout</p>
              <h2 id="invoice-heading" className="mt-1 font-display text-2xl font-bold tracking-[-0.045em] text-[#234438]">Final invoice preview</h2>
              <p className="mt-2 text-sm text-[#788278]">This is exactly what will appear in the browser print dialog.</p>
            </div>
            <button type="button" onClick={printInvoice} disabled={selectedServices.length === 0} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#234438] px-4 py-3 text-xs font-extrabold text-white transition hover:bg-[#315847] disabled:cursor-not-allowed disabled:opacity-50"><Printer className="h-4 w-4" /> Print final invoice</button>
          </div>
          <InvoicePreview services={services} selected={selected} />
        </section>

        <footer className="flex flex-col gap-3 border-t border-[#dfe1d8] py-6 text-[11px] font-semibold text-[#89938a] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2024 good & groomed</p>
          <div className="flex items-center gap-5">
            <span>Thoughtful care for good dogs.</span>
            <span className="hidden text-[#d2765d] sm:inline">♥</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
