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

export type ForgotPasswordParams = {
  email: string;
};

export type VerifyForgotOtpParams = {
  email: string;
  otp: string;
};

export type ResetPasswordParams = {
  resetToken: string;
  newPassword: string;
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
    await signInWithPassword({ email, password });
  } catch (error) {
    console.error("Error during verify otp:", error);
    throw error;
  }
};

/** **************************************
 * Forgot Password
 *************************************** */

export const forgotPassword = async ({
  email,
}: ForgotPasswordParams): Promise<void> => {
  const params = {
    email,
  };

  try {
    await axios.post(endpoints.auth.forgotPassword, params);
  } catch (error) {
    console.error("Error during forgot password:", error);
    throw error;
  }
};

/** **************************************
 * Verify Forgot Otp
 *************************************** */

export const verifyForgotOtp = async ({
  email,
  otp,
}: VerifyForgotOtpParams): Promise<{ resetToken: string }> => {
  const params = {
    email,
    otp,
  };

  try {
    const res = await axios.post(endpoints.auth.verifyForgotOtp, params);

    const { resetToken } = res.data;

    return {
      resetToken,
    };
  } catch (error) {
    console.error("Error during verify forgot otp:", error);
    throw error;
  }
};

/** **************************************
 * ResetPassword
 *************************************** */

export const resetPassword = async ({
  resetToken,
  newPassword,
}: ResetPasswordParams): Promise<void> => {
  const params = {
    resetToken,
    newPassword,
  };

  try {
    await axios.post(endpoints.auth.resetPassword, params);
  } catch (error) {
    console.error("Error during reset password:", error);
    throw error;
  }
};
