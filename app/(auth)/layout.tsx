import { Building2 } from "lucide-react";

const features = [
  "Track rental assets in real-time",
  "Manage bookings and prevent conflicts",
  "Auto-generate invoices and payments",
  "Multi-user team collaboration",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col px-12 py-16 text-white relative overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700">
        <div className="absolute -top-32 -right-32 h-[32rem] w-[32rem] rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-purple-800/50 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 pointer-events-none blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-xl tracking-tight">RMS</div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest font-medium">
              Rental System
            </div>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center mt-16">
          <h1 className="text-4xl font-bold leading-snug tracking-tight mb-4">
            Manage your rentals<br />with confidence.
          </h1>
          <p className="text-white/65 text-base leading-relaxed max-w-xs">
            Assets, bookings, customers, and invoices — unified in one clean workspace.
          </p>

          <ul className="mt-10 space-y-3.5">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-white/80">
                <div className="h-5 w-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="2,5 4.5,7.5 8,3" />
                  </svg>
                </div>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/30">
          &copy; {new Date().getFullYear()} RMS. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg tracking-tight">RMS</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
