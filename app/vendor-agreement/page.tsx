import type { Metadata } from 'next';
import VendorAgreementForm from './VendorAgreementForm';
import './vendor-agreement.css';

export const metadata: Metadata = {
  title: 'Vendor Agreement Generator — UAQ Deals',
  robots: { index: false, follow: false },
};

export default function VendorAgreementPage() {
  return <VendorAgreementForm />;
}
