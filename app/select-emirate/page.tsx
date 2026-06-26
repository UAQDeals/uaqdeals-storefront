import { ALL_EMIRATES } from "@/lib/emirate";
import { EmirateGrid } from "./grid";

export const metadata = { title: "Choose Your Emirate — UAQ Deals" };

export default function SelectEmiratePage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&h=1000&fit=crop&auto=format"
          alt="UAE"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(142,27,58,0.92) 0%, rgba(199,41,49,0.88) 55%, rgba(242,71,50,0.85) 100%)" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <div className="text-center text-white mb-10">
          <p className="text-[12px] font-bold tracking-[3px] uppercase text-white/60 mb-2">UAQ Deals</p>
          <h1 className="text-[30px] sm:text-[40px] font-extrabold leading-tight">
            Welcome to Umm Al Quwain&apos;s<br className="hidden sm:block" /> hyperlocal super-app
          </h1>
          <p className="text-white/75 text-[14px] sm:text-[16px] mt-3">Which emirate would you like to explore?</p>
        </div>

        <EmirateGrid emirates={ALL_EMIRATES} />

        <p className="text-center text-white/55 text-[12px] mt-8">
          Shop &amp; Classifieds available in Umm Al Quwain &amp; Al Hamriyah · Services available everywhere
        </p>
      </div>
    </div>
  );
}
