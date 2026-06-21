import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Ensure a profile row exists for this user (FK target for orders, etc.)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
        const fullName =
          (meta.full_name as string | undefined) ||
          (meta.name as string | undefined) ||
          null;
        const avatar = (meta.avatar_url as string | undefined) ?? null;

        // Idempotent: only writes id/email/name/avatar; never touches phone_number
        await supabase.from("profiles").upsert(
          {
            id: user.id,
            email: user.email ?? null,
            full_name: fullName,
            avatar_url: avatar,
            auth_method: "google",
          },
          { onConflict: "id" }
        );
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
