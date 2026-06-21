import { getTranslations } from "next-intl/server";
import { CartView } from "@/components/cart-view";

export async function generateMetadata() {
  const t = await getTranslations("cartPage");
  return { title: t("title") };
}

export default function CartPage() {
  return <CartView />;
}
