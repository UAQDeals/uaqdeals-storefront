import Link from "next/link";

const PHONE = "+971542205775";
const PHONE_WA = "971542205775"; // wa.me wants no + or spaces
const WA_MESSAGE = "Hi UAQ Deals, I have a question.";

export function FloatingContact() {
  return (
    <div className="fixed right-5 z-40 flex flex-col gap-3 bottom-20 md:bottom-5">
      <Link
        href={`https://wa.me/${PHONE_WA}?text=${encodeURIComponent(WA_MESSAGE)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] p-3 text-white shadow-lg transition-transform hover:scale-110"
        style={{ height: 52, width: 52 }}
      >
        <svg viewBox="0 0 32 32" className="h-6 w-6 fill-current">
          <path d="M16 .4C7.4.4.4 7.4.4 16c0 2.8.8 5.5 2.2 7.9L0 32l8.4-2.2c2.3 1.3 4.9 2 7.6 2C24.6 31.8 31.6 24.8 31.6 16.2 31.6 7.6 24.6.6 16 .4zm0 28.5c-2.4 0-4.7-.6-6.7-1.8l-.5-.3-5 1.3 1.3-4.8-.3-.5C3.5 21 2.6 18.5 2.6 16c0-7.4 6-13.4 13.4-13.4S29.4 8.6 29.4 16 23.4 28.9 16 28.9zm7.4-9.9c-.4-.2-2.4-1.2-2.7-1.3-.4-.1-.6-.2-.9.2-.2.4-1 1.3-1.3 1.5-.2.3-.5.3-.9.1-.4-.2-1.6-.6-3.1-1.9-1.2-1-1.9-2.4-2.2-2.7-.2-.4 0-.6.2-.7.2-.2.4-.5.6-.7.2-.2.2-.4.4-.6.1-.3 0-.5 0-.7 0-.2-.9-2.1-1.2-2.9-.3-.7-.6-.7-.9-.7h-.7c-.2 0-.7.1-1 .5-.4.4-1.3 1.3-1.3 3.1 0 1.9 1.4 3.7 1.5 3.9.2.3 2.7 4.2 6.6 5.9.9.4 1.6.6 2.2.8.9.3 1.8.2 2.5.1.8-.1 2.4-1 2.7-1.9.3-.9.3-1.8.2-1.9 0-.2-.3-.3-.7-.5z"/>
        </svg>
      </Link>

      <Link
        href={`tel:${PHONE}`}
        aria-label="Call UAQ Deals"
        className="flex items-center justify-center rounded-full bg-gradient-to-br from-[#8E1B3A] to-[#C72931] p-3 text-white shadow-lg transition-transform hover:scale-110"
        style={{ height: 52, width: 52 }}
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
          <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.27.36-.66.25-1.01C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/>
        </svg>
      </Link>
    </div>
  );
}
