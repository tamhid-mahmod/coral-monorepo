"use server";

import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

import { CONFIG } from "@/global-config";

import { SESSION_STORAGE_KEY } from "./constant";

// ----------------------------------------------------------------------

export type Session = {
  user: {
    id: string;
    name: string;
    // role: Role;
  };
  accessToken: string;
  refreshToken: string;
};

// ----------------------------------------------------------------------

const encodedKey = new TextEncoder().encode(CONFIG.sessionSecretKey);

export async function setSession(payload: Session) {
  try {
    const expiredAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7d

    const session = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(encodedKey);

    (await cookies()).set(SESSION_STORAGE_KEY, session, {
      httpOnly: true,
      secure: true,
      expires: expiredAt,
      sameSite: "lax",
      path: "/",
    });
  } catch (error) {
    console.error("Error during set session:", error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export async function getSession() {
  const cookie = (await cookies()).get("session")?.value;

  if (!cookie) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(cookie, encodedKey, {
      algorithms: ["HS256"],
    });

    return payload as Session;
  } catch (error) {
    console.log("Falied to verify the session", error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export async function removeSession() {
  (await cookies()).delete("session");
}

// ----------------------------------------------------------------------

export async function updateSession({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken: string;
}) {
  const cookie = (await cookies()).get("session")?.value;

  if (!cookie) {
    return null;
  }

  const { payload } = await jwtVerify<Session>(cookie, encodedKey);

  if (!payload) {
    throw new Error("Session not found");
  }

  const newPayload: Session = {
    user: {
      ...payload.user,
    },
    accessToken,
    refreshToken,
  };

  await setSession(newPayload);
}
