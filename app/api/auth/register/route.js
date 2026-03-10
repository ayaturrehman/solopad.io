import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: { name, email, password: hashed, role: "owner" },
    });

    return NextResponse.json({ id: user.id, email: user.email, name: user.name });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
