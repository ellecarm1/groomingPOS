import { CalendarDays, CheckCircle2, Scissors } from "lucide-react";

import {
  formatCurrency,
  formatDuration,
  type Booking,
  type SelectedServices,
  type Service,
} from "@/lib/catalog";

type InvoicePreviewProps = {
  services: Service[];
  selected: SelectedServices;
  booking?: Booking | null;
};

export function InvoicePreview({ services, selected, booking = null }: InvoicePreviewProps) {
  const selectedServices = services.filter((service) => selected[service.id]);
  const subtotal = selectedServices.reduce(
    (total, service) => total + service.price * selected[service.id],
    0,
  );
  const tax = subtotal * 0.08875;
  const total = subtotal + tax;
  const invoiceNumber = booking
    ? `GG-${booking.dateKey.split("-").join("")}-01`
    : "GG-ESTIMATE-01";

  return (
    <section className="invoice-print-target overflow-hidden rounded-[28px] border border-[#e1e2da] bg-[#fbfaf7] shadow-[0_24px_70px_-38px_rgba(39,74,56,0.5)] print:rounded-none print:border-0 print:shadow-none">
      <div className="flex flex-col justify-between gap-6 bg-[#234438] p-7 text-[#f8f4e8] sm:flex-row sm:items-start sm:p-10">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#d2765d] text-[#fff5ed]"><Scissors className="h-[19px] w-[19px]" /></div>
            <p className="font-display text-xl font-bold tracking-[-0.04em]">good & groomed</p>
          </div>
          <p className="mt-5 text-xs font-semibold leading-5 text-[#bcd0ba]">Thoughtful care for good dogs.<br />Brooklyn · NY</p>
        </div>
        <div className="sm:text-right">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#a7c39b]">{booking ? "Final invoice" : "Estimate"}</p>
          <p className="mt-2 font-display text-2xl font-bold tracking-[-0.05em]">{invoiceNumber}</p>
          <p className="mt-1 text-xs text-[#bcd0ba]">Prepared April 2024</p>
        </div>
      </div>

      <div className="p-7 sm:p-10">
        <div className="flex items-start justify-between gap-4 border-b border-[#e7e8e1] pb-7">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#d2765d]">Client visit</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.06em] text-[#234438]">Grooming services</h2>
          </div>
          <CheckCircle2 className="h-7 w-7 shrink-0 text-[#7d9e72]" />
        </div>

        {booking && (
          <div className="mt-7 flex items-center gap-3 rounded-2xl bg-[#f1f5ec] px-4 py-3 text-sm font-bold text-[#315244]">
            <CalendarDays className="h-4 w-4 text-[#6f905f]" />
            {booking.dateLabel} at {booking.time}
            <span className="ml-auto hidden text-xs font-semibold text-[#789073] sm:inline">{formatDuration(booking.durationMinutes)}</span>
          </div>
        )}

        <div className="mt-8 divide-y divide-[#edf0e9]">
          {selectedServices.map((service) => (
            <div key={service.id} className="flex items-start justify-between gap-4 py-4 first:pt-0">
              <div>
                <p className="font-bold text-[#315244]">{selected[service.id]} × {service.name}</p>
                <p className="mt-1 text-xs text-[#89938a]">{service.durationLabel}</p>
              </div>
              <p className="font-display text-lg font-bold text-[#234438]">{formatCurrency(service.price * selected[service.id])}</p>
            </div>
          ))}
        </div>

        {!selectedServices.length && <p className="py-6 text-sm text-[#89938a]">No services have been selected yet. Return to the POS to build an estimate.</p>}

        <div className="mt-4 border-t-2 border-[#234438] pt-5">
          <div className="ml-auto max-w-[290px] space-y-3 text-sm">
            <div className="flex justify-between text-[#788278]"><span>Subtotal</span><span className="font-bold text-[#315244]">{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-[#788278]"><span>NY sales tax</span><span className="font-bold text-[#315244]">{formatCurrency(tax)}</span></div>
            <div className="flex items-end justify-between pt-2"><span className="font-extrabold text-[#234438]">Total</span><span className="font-display text-3xl font-bold tracking-[-0.06em] text-[#d2765d]">{formatCurrency(total)}</span></div>
          </div>
        </div>

        <div className="mt-9 border-t border-[#e7e8e1] pt-5 text-[11px] leading-5 text-[#89938a]">Thank you for trusting good & groomed. Final pricing is confirmed after we meet your pup and assess their coat.</div>
      </div>
    </section>
  );
}
