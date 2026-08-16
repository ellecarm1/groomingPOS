import { Link } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";

import { InvoicePreview } from "@/components/InvoicePreview";
import { getBooking, getEstimate, getServices } from "@/lib/catalog";

export default function Invoice() {
  const services = getServices();
  const booking = getBooking();
  const selected = booking?.selected || getEstimate();

  return (
    <main className="invoice-print-page min-h-screen bg-[#f5f3ed] px-5 py-8 text-[#1e352c] sm:px-8 lg:px-12 print:bg-white print:p-0">
      <div className="mx-auto max-w-[780px]">
        <div className="print-controls mb-6 flex items-center justify-between print:hidden">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#819080] transition hover:text-[#234438]"><ArrowLeft className="h-3.5 w-3.5" /> Back to POS</Link>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-[#234438] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#315847]"><Printer className="h-4 w-4" /> {booking ? "Print invoice" : "Print estimate"}</button>
        </div>

        <InvoicePreview services={services} selected={selected} booking={booking} />

        <p className="print-controls mt-5 text-center text-[11px] font-semibold text-[#9aa49a] print:hidden">Ready to print for the client · this invoice includes current POS pricing.</p>
      </div>
    </main>
  );
}
