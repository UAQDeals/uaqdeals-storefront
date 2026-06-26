"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function selectEmirate(name: string) {
  const c = await cookies();
  c.set("emirate", name, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
  redirect("/");
}
