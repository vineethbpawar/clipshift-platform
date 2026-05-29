import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isCreatorPlan, isClientPlan, PlanType } from "@/lib/plans";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const cookie = (await cookieStore).get(name);
            return cookie?.value;
          },
        },
      }
    );
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planType }: { planType: PlanType } = await req.json();

    // 1. Fetch user role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 2. Validate plan matches role
    if (planType !== 'free') {
      if (profile.role === 'creator' && !isCreatorPlan(planType)) {
        return NextResponse.json({ error: "Invalid plan for creator" }, { status: 400 });
      }

      if (profile.role === 'client' && !isClientPlan(planType)) {
        return NextResponse.json({ error: "Invalid plan for client" }, { status: 400 });
      }
    }

    // 3. Update plan
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        plan_type: planType,
        plan_expires_at: planType === 'free' ? null : expiresAt.toISOString(),
        featured_creator: planType === 'creator_pro' || planType === 'creator_premium',
        verified_creator: planType === 'creator_premium'
      })
      .eq('id', session.user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, expiresAt });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
