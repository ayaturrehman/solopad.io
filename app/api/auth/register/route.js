import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { isValidPlan } from "@/lib/plans";
import { validatePassword } from "@/lib/passwordValidation";

export async function POST(req) {
  try {
    const { name, email, password, plan } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const selectedPlan = isValidPlan(plan) ? plan : "starter";

    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { name, email, password: hashed, role: "owner", plan: selectedPlan },
      });

      const business = await tx.business.create({
        data: { name: `${name}'s Business`, ownerId: newUser.id, plan: selectedPlan },
      });

      // Auto-create subscription with 30-day free trial (no Stripe yet — that happens at checkout)
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 30);
      await tx.subscription.create({
        data: {
          businessId: business.id,
          stripeCustomerId: `pending_${business.id}`, // placeholder until Stripe checkout
          plan: selectedPlan,
          status: "trialing",
          trialEnd,
          currentPeriodStart: new Date(),
          currentPeriodEnd: trialEnd,
        },
      });

      // Auto-create owner TeamMember so owner appears in team list with permissions
      await tx.teamMember.create({
        data: {
          userId: newUser.id,
          businessId: business.id,
          name,
          email,
          role: "owner",
          permissions: "",
          status: "active",
        },
      });

      return tx.user.update({
        where: { id: newUser.id },
        data: { businessId: business.id },
      });
    });

    return NextResponse.json({ id: user.id, email: user.email, name: user.name });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
