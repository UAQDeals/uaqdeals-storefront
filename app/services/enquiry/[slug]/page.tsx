import { notFound } from "next/navigation";
import { GovtEnquiryClient } from "./client";

const SLUG_META: Record<string, { title: string; tagline: string }> = {
  typing_center: {
    title: "Typing Center",
    tagline: "Government typing, document processing & PRO services",
  },
  business_setup: {
    title: "Business Setup",
    tagline: "Company formation, licensing & business support",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = SLUG_META[slug];
  return { title: meta ? `${meta.title} Enquiry — UAQ Deals` : "Service Enquiry — UAQ Deals" };
}

export default async function GovtEnquiryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = SLUG_META[slug];
  if (!meta) notFound();

  return <GovtEnquiryClient slug={slug} title={meta.title} tagline={meta.tagline} />;
}
