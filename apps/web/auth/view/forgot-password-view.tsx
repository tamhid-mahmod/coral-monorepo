"use client";

import Link from "next/link";
import { z as zod } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";

import { useBoolean } from "@/hooks";

import { paths } from "@/routes/paths";
import { useRouter } from "@/routes/hooks";

import { Logo } from "@/components/logo";

import { FormHead } from "../components/form-head";
import { FormResendCode } from "../components/form-resend-code";
import { getErrorMessage } from "../utils";
import {
  FormVerifyOtp,
  type VerifyOtpSchemaType,
} from "../components/form-verify-otp";
import { forgotPassword, resetPassword, verifyForgotOtp } from "../context";
import {
  FormResetPassword,
  type ResetPasswordSchemaType,
} from "../components/form-reset-password";

// ----------------------------------------------------------------------

export type ForgotPasswordSchemaType = zod.infer<typeof ForgotPasswordSchema>;

export const ForgotPasswordSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: "Email is required!" })
    .email({ message: "Email must be a valid email address!" }),
});

// ----------------------------------------------------------------------

export function ForgotPasswordView() {
  const router = useRouter();

  const canResend = useBoolean();
  const isResendLoading = useBoolean();

  const [timer, setTimer] = useState(60);
  const [step, setStep] = useState<"request" | "otp" | "reset">("request");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues: ForgotPasswordSchemaType = {
    email: "",
  };

  const methods = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues,
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          canResend.onTrue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onSubmit = async (data: ForgotPasswordSchemaType) => {
    try {
      setErrorMessage(null);
      await forgotPassword({ email: data.email });

      setUserEmail(data.email);
      setStep("otp");
      canResend.onFalse();
      setTimer(60);
      startResendTimer();
    } catch (error) {
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
    }
  };

  const onVerifyOtp = async (data: VerifyOtpSchemaType) => {
    if (!userEmail) return;

    try {
      setErrorMessage(null);
      const { resetToken: responseResetToken } = await verifyForgotOtp({
        email: userEmail,
        ...data,
      });

      setResetToken(responseResetToken);
      setStep("reset");
    } catch (error) {
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
    }
  };

  const onResetPassword = async (data: ResetPasswordSchemaType) => {
    if (!resetToken) return;

    try {
      setErrorMessage("");
      await resetPassword({ resetToken, newPassword: data.newPassword });

      setResetToken(null);
      setStep("request");
      toast.success("Password reset successfully.");
      router.push(paths.auth.signIn);
    } catch (error) {
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
    }
  };

  const resendOtp = async () => {
    if (!userEmail) return;

    try {
      isResendLoading.onTrue();
      await onSubmit({ email: userEmail });

      toast.success("We’ve resent the OTP to your email.");
    } catch (error) {
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
    } finally {
      isResendLoading.onFalse();
    }
  };

  const renderForm = () => (
    <>
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button className="cursor-pointer w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2Icon className="animate-spin" />}
        Reset Password
      </Button>

      <p className="text-sm text-gray-700">
        Don’t have an account?{" "}
        <Link
          href={paths.auth.signUp}
          className="text-blue-600 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </>
  );

  const renderErrorMessage = !!errorMessage && (
    <Alert variant="destructive" className="border-red-600 mb-4">
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  );

  return (
    <div className="w-full min-h-svh">
      <div className="flex flex-row">
        <div className="w-full md:w-[60%] px-4 md:px-0 min-h-screen flex flex-col sm:items-center">
          <div className="py-4 sm:w-[420px] mb-auto">
            <div className="flex items-center gap-2">
              <Logo />
              <h4 className="text-3xl font-semibold tracking-tight">Coral</h4>
            </div>
          </div>

          <div className="w-full sm:w-[420px]">
            {step === "request" && (
              <>
                <FormHead
                  title="Recover Your Password"
                  description="Enter your email address and we will send you reset instructions for your account"
                />

                {renderErrorMessage}

                <Form {...methods}>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {renderForm()}
                  </form>
                </Form>
              </>
            )}

            {step === "otp" && (
              <>
                <FormHead
                  title="OTP verification"
                  description="We’ve sent a six-digit verification code to your email. Please enter the code to verify."
                />

                {renderErrorMessage}

                <FormVerifyOtp
                  onSubmit={onVerifyOtp}
                  disabled={isResendLoading.value}
                />

                <FormResendCode
                  timer={timer}
                  canResend={canResend.value}
                  onResendCode={resendOtp}
                  disabled={isResendLoading.value}
                />
              </>
            )}

            {step === "reset" && (
              <>
                <FormHead
                  title="Reset Password"
                  description="Enter a new password to complete the reset process."
                />

                {renderErrorMessage}

                <FormResetPassword onResetPassword={onResetPassword} />
              </>
            )}
          </div>

          <div className="mt-auto py-4">
            <p className="text-xs text-gray-500 text-center">
              &copy; {new Date().getFullYear()} All Rights Reserved
            </p>
          </div>
        </div>
        <div className="hidden md:block w-[40%] min-h-screen bg-[url(/assets/images/auth/image-3.jpg)] bg-cover bg-center" />
      </div>
    </div>
  );
}
