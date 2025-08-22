"use client";

import axios, { endpoints } from "@/lib/axios";

// ----------------------------------------------------------------------

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
