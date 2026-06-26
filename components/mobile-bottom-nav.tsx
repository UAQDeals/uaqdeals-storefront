"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Flame, Search, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";

// Brand phoenix mark (white, tinted via currentColor) for the Deals tab
const DEALS_MASK =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAOt0lEQVR42u2deZBcVRXGf6+nZ2ISSMKmJMGEJWwRDCCgIG4ou1BYspTiAgiUUmipILK5AyoRLURLKRHFQnZKtAzgAlEDYgRUQkAQIgKRPQRIQsiku49/vO9Wn1zfdL/ueTPTM+lb9aqT7vu28917zneWeycxM7pt5FqpK4IuAF0Aum10ApB0xTeyAFh3Bo0cAH3AJkCtC8LIzYArgK0EQk9XlMMHQAnoBzYA5gFTgGoXhOEFAOBGYEfgFmBjgVDuinRoAPD9avq8AVgFvBn4LTAdqHRBGBoAvJ4P//4P8FN99ybgdmA3B0KXpubh8jliQROBGcA/Jfia8wMmA38HXi8wVwEnAVeqT49UU7cNYgasBa4DTnDCDKN7OXAEsEbAjAd+DlwEvKZrFwYPQFmM5x7gR8BcnRP4fw9wN3AYsFrfrQE+BSyQaqoIsC5LynRnzRodPfo8yOptgZntqO9LZtanf7/FzJaqz2p9vmpmZ5pZWX3KZpY0ued6deTpVJLg7jWztRLsy2b2CddnnD5fb2a3qk9Fh5nZQjPby/Uvd4WfH4AwC/Z1ozq035nZLhmAnWNma9QnfFbN7Ltmtpn6Je7aXQBygvBNJ9SK+/c3zGzj6JxdzewWB1aYPU+Y2QkCKgBW6gLQ+PCj9SoJst+BYGb2uJmdYmYTo3OPNrNF9v9toZkdHM2cUheAxiAEIV0iIdYiXW9m9pDswyR37ngzO8nMHswAYp6Z7b2+AtHqCYljMac5wa+VjvdA/NvMzjCzGe7810j93BWBUDGz6yJDXVofbEQ7J3l1tLeZ3RPp+RiI5Wb2EzN7R3SdQ8zsRkdZw4y63sz2ifqOWfo6mJPLjoKebWYvREBUnOEN7R4zO8vMtnfXmWFmX8tQT/MEUkwGhlI9JaMJAK8qMLOZZvZ9M1s1ABA1932/mc03s1PNbEt3rb3N7Idm9rTre7+ZnWhmkzPU01AIrKzrJw1UcMkdg3qGPMG4ZoG6VdF3Oygg9xGlLUMEtRaFOEKrAvcBNyvH8DeFLfYBDgeOBF6nfpcD31cfXMDPouu3G5ZJMoKHicuBD9TafoZ2AQhRzjOAPSSYBQrOhTYdOAb4ALBLJHAbAAyAFxTa/g3wF+BZRVsPFiDbCLDLlZN4JhKiNRFWphz0TlcqtnUz8CiwMiMXPknHBMW/ntQnLk425ACEUbG58gJ9wFLgNuAXwJ8kyNDeLSDeq9Hs8wzVCNg4QPg0sFDH/QruvVGBvg2AfwC/Vlj8lZzP7o9w3zXABcDnFIB8XuCvVZ9xCr9P1n3L+u0Jve/XgX+1CsJgVFCYBQcBN0W/PQX8UenKWwVOGO0HA0cD7wSmRedV9fDmRmUpY4bcBywGlgG9Es7jAukh4GWdb+56zfITMwXg74A5bchjmWbo7a2AMFgbEF7oBIWrqzr6XJ+VCmf/Vi93l/ttL+BQ4D3ArhnqqOZACfeL+wQ18ATwbwFzgwDxaq7irvEG4LXApsDWmk0HaCadCnwF+Ki7V9XNFp/pewW4XjNyVz3DbGcXmwu3INaAmX3QzFY49rMm8gfMxYKul2e8rbvOJDPbT5R0gZm9aAO3fgUFX5XfEbdHzOxSM9vfhctLZnaBGFatwbUXmdn7zewwM7tYIfZaxjlVveOZZrahqHjVzI7XvXqHgwXFI2y2kjYHuxEQ6/gkQ8f/Q3r0TuAB4Dll1LbS6NwT2BmYJeM+4HjKGKUPAdcA12rGHQu8Vb9VXNauFOW+l8oObKnSG2uQ575f+fFpwL0iCDg1OGQqKEsdIbXySWC/SJ3UMoDLao8Bi/Qy9wMPyyAasKGM/0wBsq2Y0TTR3r7onsGGrAAuAX4sI3q6KG5QMYGGBpuRN4MXV4K8IJt4CvBSMxCKBMCnOGtOx38YOESJfTLoqEXnD/TiVVHOpdLvjwL/1Quv1XmTpNO308yZ5gxx2eW4LwK+KXo7Vywt3KPHzSaL2FLWM/VENgFR1L+pZKfWyCAXDYCfDZ59TATeBhyoz9lSMVkqxDMhz4byJPf7ZZRXq0BgcnRtr2JeEOW8DPigQNk0Z21TeLaSBsVlYnxLdP4s4ETgqyIGA7KioQKgmXc5Fdhdo3Q3ec9bSGh5W+xDJLpfXEQWj2CLqjXmy0fplyN2II1LLb0t+B5wbuQMxu9fGy4bMJDTY6Sli6eKvz8g9bEi6tsrELbUsZX+/zqdP0UzaaL6ThhkpYUH4kV57TdJNZ0e2YXYprwCHC/jHmyZD0WUnIpqyl6GtOhCQlouT/MqffeinLWnxJ0f07+f0XG3HLnV6j9OurtXAPTpJTfQdxtp9vRJjWwknr+N1MHmGQ5dovevCtx5wGeAz4uFzY3UURj5q0Qy5uveFedjkFfwwzUD4ql4tqZsqyDW5NBVnfFeKVDD76slnIrYxwr93iNjvDuwWQZNJWI+5wHnAF8Cvqzr9ThjepC8+14XphiyuqAijx7nsD3nnJnVcqj6Xfi62sRZarVVM3ITcau5Pl/Ws86LKjuO1fe9RclluGZA7CvM1Cg7JjK8jSibNYhiJgWqzGAXPgz8UrR3EvAD4OTCRv4wq6CBHLZtFZg7BNhJOr2dtlIBuBX6DAxpjbMLU+XEJTlVXiJ2dpScyhkRRR61AAxET6cB28toTpNh3EBspyreXlPUcbnCBM/JQ14m4cfJoSkCeQfR3Q+5JFHShOKWgAdlcKeIGLQc7+9UADwQpYwkTbttM+UcDleiaOoA7KSUYyYEBnQZ8LEoojpmACDDkUraALFHcadDRT1fluoZJx9iumNARCHmUg4QDpGPUPh6h04CoFU7QovC2FKxqfcp9j8pg4JmqaJEEdU5AsQYAzagqBjTJCVC9lC4emupneCZ9suxWwL8WeHuxZodR5CuY3hzRkQ0K+D2KeDiolXRaAEgcaFigH1Jqy724//Tms3ao8DVCk0/RpoaPZd6jiCOA4VZ8JRIQv5sV4c5YoN14FAx7/wBnCzvxPmj4n6PnbtrzGwrXfs4M3smquT2pZOmLF6h6xs6XfjhRbeQsLzQK216y7FXXDWzC3WfTc3s9xkghHstKqIYa7QAUHbLo57MWHVTRPPXutfMdtA9v5cBQsg975MxM9s+OnWjjWDoThb9m+qCYj0FG3WjXmu0UHblFOA7kcEN9ufIHI7cqLYBYeSf7kZe1Ya+VdwCwwP0DFe438IzPFikDeg0FhQcnQ8oO1UpONiWJ8tWUmh7H+oFYNs5mopmy+IiQhOdpIJCSOKNpJUL1WEWvn+G8aQlluNIC7TMxa4SYO+i5NcpAASe3wv8zIWokzZGcNVlqdqJXvbo3BnApaQFwj+XrII92G2sOWJB9Xwe+Aat7bpiTnUkTeI6rcyo8AzvIq1L+o/LP9ypWTBoFdQJAISS8mmkG4JMpHEtTpbODm2J4jZPKmmyOWlyfyfWrfPMw6SCzl8stXi1chcoSTNL+YaEwXjFHcR65g7ghTZjLa9qVc1erg40PnYwsy+4VGilxXu8y8x2c9+vNLPNi1jWNNLCDw+/kZktG6AINqsFkO4ws50zQhdlHbGzNN3Mrm0BhBC+uEXnL3XUePtoidaodMSCKjhccftaDtUTcrbXSD/fR724NskwwkHNlUlLGY9SVDNPbD/YjH1JS13mOXIwpQiHbKQBCAbsiJxx9qC/F5CWE/Y71tKI7dTUp+RCy1fnACHReb3ykG9135eLMoAjST1rGll70XxPocDFXyKtpqi1kaEKIJWAjyvEnJfJHERasU2R4eiRBCDce45AaKZ+Aiv5Nmk1XbnN9GBgTi+RVr8lTQAIz/km0pLEV8YKAEHYO0bqaKDRX9bL/ziH0PJQzEThjhUug9boOWdKFT2v/79UBBCd4AnPasFW3CFDOlgAgjp7hnR1ZaMBEHj+hqRlMmEp7otjBYBNcgoM0gV+Sc7nLuX4PRGLyiPIxIWnV7HumuhRDUArI+jpnP0T8m0sbqRFXa20CdQXZydjYQa0Q1ubvc/OwJmsuzSpCHs1XjN2ceTHrDczYHJOx6cfOB84i8Y7+YbNZ/Ma7j45YH8tmgqOZHu2hb475XTYQprxPM2ErEho8AlmN/Fow73C1gt9cgQLoaKdAMCSFp7z7VIDzXyGxHnI55MuDPEgBBsxlbSoq9FfAwlCfoy0yno56cr/PCqxowEIL/ZQjmcJmarppHWaedbxetZyLvAtB0K41xbUF2E3szt3y2e5E3iVekJ/1AIQXmyRpncpp2o5xwk/jz0IM+FUB0KYIXeRrpzPs83NX0m33bmqhXt3/AwoyaG5m+YbHoW60DnU12715hCEnwkeBPT95cBxDUDokVF/WI7Yr5xRHvVG2P81jiRn/6pmwcckmLwbg3sQvkN9TUIf6T4PWSAEIf9Rquoe0tL38liIBfkXvEEv1kwNBS+4RpowP4t1F2yXdfQ0AeHTpFufhdzBQCCEkMUVYktXFmV8OwWAEGR7Vro1yTG1PYs5T6Nzf+p/XKjSJEwQdro6WSDWHMf3IARPehnpbi4rZK8KXabUSUn5bUh3RimTPynvE+z3AX+QsDaSrm/UwsLvn5Cueu9x+v5YfY/8iNtEFB4pIvyw7hDsrBL0C1pMzA+2dDHc5zL3HCGxf6KZLVEeeZeh2le0U+qCwoifQBoenkXrf6XPrzFu5S92xDPB55Y3pr7nT2VIXryDakODbt2T+sZ37Szaa6fFIASWUx2Ol+6kSGdZDs+J1PO9wzFCwur340grJirkzzuMGQBwkcvLxdfLRdO+HCCcQpp3rrRABsaECsri68eTLqYrM3x/pS/c50LgNOrJf1ufAPAgvI10T9LtHfUcatsQgxAvjx2zKihLCAtI1/JeRH1zvsBKhmpkxrGjIVurMBrWCfviqznAZ0lXu28YedRFj9CQ1BkPfBH4WuFOGKNroXbJATGDtJ70QNKEyqbD8AwXUk9x1tY3ALzKjONFG5NuSTOLdB/QSUMQrzLNhItI9ywtbCaM1s06Ss5xqzGK22gFIEs9DYfHXLjRHwsAjOpW6oqgC0AXgG4bufY/iYOtw5AuCwcAAAAASUVORK5CYII=";

const ITEMS = [
  { label: "Home",       href: "/",            icon: Home },
  { label: "Categories", href: "/categories",  icon: LayoutGrid },
  { label: "Deals",      href: "/deals",       icon: Flame },
  { label: "Search",     href: "/search",      icon: Search },
  { label: "Cart",       href: "/cart",        icon: ShoppingCart },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const cartCount = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-neutral-200"
      style={{ paddingBottom: "env(safe-area-inset-bottom)", boxShadow: "0 -4px 20px rgba(0,0,0,0.12)" }}
    >
      <div className="grid grid-cols-5">
        {ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          const isDeals = label === "Deals";
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center justify-center gap-0.5 py-2"
            >
              <div className="relative">
                {isDeals ? (
                  <div
                    className="flex items-center justify-center w-9 h-9 -mt-4 rounded-full text-white shadow-md"
                    style={{ background: "linear-gradient(135deg, #C72931, #8E1B3A)" }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 20,
                        height: 20,
                        backgroundColor: "currentColor",
                        WebkitMaskImage: `url(${DEALS_MASK})`,
                        maskImage: `url(${DEALS_MASK})`,
                        WebkitMaskRepeat: "no-repeat",
                        maskRepeat: "no-repeat",
                        WebkitMaskPosition: "center",
                        maskPosition: "center",
                        WebkitMaskSize: "contain",
                        maskSize: "contain",
                      }}
                    />
                  </div>
                ) : (
                  <Icon
                    className="w-5 h-5"
                    style={{ color: active ? "#8E1B3A" : "#9ca3af" }}
                  />
                )}
                {label === "Cart" && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-[#C72931] text-white text-[9px] font-bold">
                    {cartCount}
                  </span>
                )}
              </div>
              <span
                className="text-[9.5px] font-semibold"
                style={{ color: active ? "#8E1B3A" : "#9ca3af" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
