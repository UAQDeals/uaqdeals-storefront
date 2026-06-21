import Link from "next/link";
import { ArrowRight, Store, Coins, Globe, Truck } from "lucide-react";

export const metadata = {
  title: "About Us",
  description:
    "UAQ Deals is Umm Al Quwain's hyperlocal super-app — connecting residents with local businesses across grocery, pharmacy, food, services and more.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--brand-maroon)]">
        About UAQ Deals
      </p>
      <h1 className="text-brand-gradient mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
        Umm Al Quwain&apos;s hyperlocal super-app
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-700">
        UAQ Deals brings the entire local economy — grocery, pharmacy,
        restaurants, retail, services, real estate, automotive and more — into a
        single, easy-to-use platform that connects residents directly with the
        businesses around them.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <Card icon={<Store className="h-5 w-5" />} title="Hyperlocal focus">
          Built only for Umm Al Quwain — not a generic national app. That means
          faster deliveries, fairer prices, and genuinely local vendors.
        </Card>
        <Card icon={<Globe className="h-5 w-5" />} title="Everything in one place">
          Shop, dine, hire, sell and browse from a single login — across six core
          categories and more than thirty vendor types.
        </Card>
        <Card icon={<Coins className="h-5 w-5" />} title="Rewards on every order">
          Our built-in coinback system turns everyday spending into real savings,
          keeping value within the community.
        </Card>
        <Card icon={<Truck className="h-5 w-5" />} title="Local delivery">
          Fast, reliable delivery from businesses in your own community, with
          transparent pricing and no hidden costs.
        </Card>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="text-lg font-bold text-[color:var(--brand-maroon)]">Our Vision</h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-700">
            To become the most trusted digital marketplace in Umm Al Quwain — the
            first place every resident opens when they need anything, and the
            platform every local business relies on to grow.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-bold text-[color:var(--brand-maroon)]">Our Mission</h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-700">
            To empower local businesses with digital tools, visibility, and
            customers — while giving residents a faster, fairer, and more
            rewarding way to shop and access services within their own community.
          </p>
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] p-6 text-center">
        <p className="text-lg font-bold text-[color:var(--brand-maroon)]">
          Trust &bull; Community &bull; Our Promise
        </p>
        <p className="mt-1 text-sm text-neutral-600">
          Every deal begins with trust, every customer becomes family.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/deals" className="bg-brand-gradient inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white">
            Shop Deals <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-[color:var(--brand-maroon)] px-5 py-2.5 text-sm font-semibold text-[color:var(--brand-maroon)] hover:bg-[color:var(--brand-maroon)] hover:text-white">
            Get in touch
          </Link>
        </div>
      </div>
    </div>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
      <span className="bg-brand-gradient inline-flex h-10 w-10 items-center justify-center rounded-full text-white">
        {icon}
      </span>
      <h3 className="mt-3 text-base font-bold text-neutral-900">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-neutral-600">{children}</p>
    </div>
  );
}
