import { Truck, ShieldCheck, BadgeCheck, Coins, Headphones, MapPin } from "lucide-react";

const ITEMS = [
  { icon: Truck,       title: "Fast Local Delivery",   desc: "Same-day across Umm Al Quwain" },
  { icon: ShieldCheck, title: "Secure Payments",       desc: "Cash on delivery & protected checkout" },
  { icon: BadgeCheck,  title: "Verified Vendors",      desc: "Every seller manually reviewed" },
  { icon: Coins,       title: "UAQ Coins Rewards",     desc: "Earn on every order, redeem anytime" },
  { icon: Headphones,  title: "Local Support",         desc: "Real people, Arabic & English" },
  { icon: MapPin,      title: "Made for UAQ",          desc: "Hyperlocal — built for our emirate" },
];

export function TrustBand() {
  return (
    <section className="bg-gradient-to-b from-white to-neutral-50 border-t border-neutral-100">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-12 md:py-16">
        <div className="text-center mb-10">
          <p className="text-[11px] font-bold tracking-[3px] uppercase text-[#C72931] mb-2">Why UAQ Deals</p>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900">
            The trusted way to shop in Umm Al Quwain
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
          {ITEMS.map(({ icon: Icon, title, desc }) => (
            <div key={title}
              className="group relative flex flex-col items-center text-center gap-3 p-5 rounded-2xl bg-white border border-neutral-100 hover:border-[#8E1B3A]/20 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl text-white transition-transform duration-300 group-hover:scale-110"
                style={{ background: "linear-gradient(135deg, #C72931, #8E1B3A)" }}>
                <Icon className="w-6 h-6" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-[13px] font-extrabold text-neutral-900 leading-tight">{title}</p>
                <p className="mt-1 text-[11px] text-neutral-500 leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
