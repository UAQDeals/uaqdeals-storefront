// Single source of truth: vendor-type slugs that have a dedicated /services/ page.
// Any slug here should route to /services/... NOT /categories/...
export const DEDICATED: Record<string, string> = {
  hotel_booking:        "/services/hotel-booking",
  flight_booking:       "/services/flight-booking",
  explore_uaq:          "/services/explore-uaq",
  zoo_events:           "/services/zoo-events",
  job_portal:           "/services/job-portal",
  mobile_repair:        "/services/mobile-repair",
  web_dev_design:       "/services/tech-services",
  mobile_app_dev:       "/services/tech-services",
  ecommerce_dev:        "/services/tech-services",
  ecommerce_management: "/services/tech-services",
  accounting_software:  "/services/tech-services",
  custom_software:      "/services/tech-services",
  seo_content:          "/services/tech-services",
  social_media_mgmt:    "/services/tech-services",
};

export function dedicatedFor(slug: string): string | null {
  return DEDICATED[slug] ?? null;
}
