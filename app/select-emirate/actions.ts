"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function selectEmirate(name: string) {
  const c = await cookies();
  c.set("emirate", name, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
  // Bust the cached RSC for every route under the root layout so the new
  // emirate shows immediately (no hard refresh needed).
  revalidatePath("/", "layout");
  redirect("/");
}
