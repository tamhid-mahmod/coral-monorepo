"use client";

import axios, { endpoints } from "@/lib/axios";

import { setSession } from "./session";

// ----------------------------------------------------------------------

export type SignInParams = {
  email: string;
  password: string;
};

export type SignUpParams = {
  email: string;
  password: string;
  name: string;
};

export type VerifyAccountParams = SignUpParams & {
  otp: string;
};

// ----------------------------------------------------------------------

/** **************************************
 * Sign in
 *************************************** */

export const signInWithPassword = async ({
  email,
  password,
}: SignInParams): Promise<void> => {
  try {
    const params = { email, password };

    const res = await axios.post(endpoints.auth.signIn, params);

    const { accessToken, refreshToken, id, name } = res.data;

    if (!accessToken) {
      throw new Error("Access token not found in response");
    }

    if (!refreshToken) {
      throw new Error("Refresh token not found in response");
    }

    await setSession({
      user: {
        id,
        name,
      },
      accessToken,
      refreshToken,
    });
    // setSession(accessToken);
  } catch (error) {
    console.error("Error during sign in:", error);
    throw error;
  }
};

/** **************************************
 * Sign up
 *************************************** */

export const signUp = async ({
  email,
  password,
  name,
}: SignUpParams): Promise<void> => {
  const params = {
    email,
    password,
    name,
  };

  try {
    await axios.post(endpoints.auth.signUp, params);
  } catch (error) {
    console.error("Error during sign up:", error);
    throw error;
  }
};

/** **************************************
 * Verify OTP
 *************************************** */

export const verifyAccount = async ({
  email,
  password,
  name,
  otp,
}: VerifyAccountParams): Promise<void> => {
  const params = {
    email,
    password,
    name,
    otp,
  };

  try {
    await axios.post(endpoints.auth.verifyAccount, params);
  } catch (error) {
    console.error("Error during verify otp:", error);
    throw error;
  }
};
