import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { Organization } from "@/models/Organization";
import { User } from "@/models/User";
import { createSession } from "@/app/lib/session";

interface GoogleTokenResponse {
  access_token: string;
  error?: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  if (error || !code || !state) {
    return NextResponse.redirect(`${appUrl}/login?error=oauth_cancelled`);
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;
  cookieStore.delete("oauth_state");

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${appUrl}/login?error=oauth_state_mismatch`);
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${appUrl}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  const tokenData: GoogleTokenResponse = await tokenRes.json();
  if (tokenData.error || !tokenData.access_token) {
    return NextResponse.redirect(`${appUrl}/login?error=oauth_token_exchange`);
  }

  // Get user info from Google
  const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userInfoRes.ok) {
    return NextResponse.redirect(`${appUrl}/login?error=oauth_userinfo`);
  }

  const googleUser: GoogleUserInfo = await userInfoRes.json();

  await connectDB();

  // Find existing user by googleId or email
  let user = await User.findOne({ googleId: googleUser.id });

  if (!user) {
    user = await User.findOne({ email: googleUser.email.toLowerCase() });

    if (user) {
      // Link Google account to existing email/password user
      user.googleId = googleUser.id;
      await user.save();
    } else {
      // New user — create org + user
      const org = await Organization.create({
        name: `${googleUser.name}'s Organization`,
      });
      user = await User.create({
        orgId: org._id,
        name: googleUser.name,
        email: googleUser.email.toLowerCase(),
        googleId: googleUser.id,
        role: "owner",
      });
    }
  }

  const org = await Organization.findById(user.orgId);

  await createSession({
    userId: String(user._id),
    orgId: String(user.orgId),
    role: user.role,
    name: user.name,
    orgName: org?.name ?? "My Organization",
  });

  return NextResponse.redirect(`${appUrl}/dashboard`);
}
