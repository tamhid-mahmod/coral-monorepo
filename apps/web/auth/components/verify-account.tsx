"use client";

import { z as zod } from "zod";
import { Loader2Icon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Form } from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp";

// ----------------------------------------------------------------------

export type VerifyAccountSchemaType = zod.infer<typeof VerifyAccountSchema>;

export const VerifyAccountSchema = zod.object({
  otp: zod
    .string()
    .regex(/^\d{6}$/, { message: "OTP must be a 6-digit number!" }),
});

// ----------------------------------------------------------------------

type Props = {
  resendOtp: () => void;
  canResend: boolean;
  timer: number;
  resendDisabled?: boolean;
  errorMessage?: string | null;
  onSubmit: (data: VerifyAccountSchemaType) => void;
};

export function VerifyAccount({
  onSubmit,
  resendOtp,
  canResend,
  timer,
  resendDisabled,
  errorMessage = null,
}: Props) {
  const defaultValues: VerifyAccountSchemaType = {
    otp: "",
  };

  const methods = useForm<VerifyAccountSchemaType>({
    resolver: zodResolver(VerifyAccountSchema),
    defaultValues,
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  return (
    <div className="w-full sm:w-[420px]">
      <h5 className="text-2xl font-semibold tracking-tight mb-2">
        OTP verification
      </h5>
      <p className="text-sm text-gray-700 mb-4">
        We’ve sent a six-digit verification code to your email. Please enter the
        code to verify your account.
      </p>

      {!!errorMessage && (
        <Alert variant="destructive" className="border-red-600 mb-4">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex flex-col items-center">
          <Controller
            control={control}
            name="otp"
            render={({ field }) => (
              <InputOTP
                maxLength={6}
                value={field.value}
                onChange={field.onChange}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            )}
          />

          {errors.otp && (
            <p className="text-sm text-red-500 mt-2">{errors.otp.message}</p>
          )}
        </div>

        <Button
          className="w-full cursor-pointer"
          disabled={resendDisabled || isSubmitting}
        >
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          Submit
        </Button>
      </form>

      <div className="flex flex-col items-center">
        {canResend ? (
          <Button
            type="button"
            variant="ghost"
            className="cursor-pointer mt-5"
            onClick={resendOtp}
            disabled={resendDisabled || isSubmitting}
          >
            Resend OTP
          </Button>
        ) : (
          <p className="text-center text-sm mt-5">Resend OTP in {timer}s</p>
        )}
      </div>
    </div>
  );
}
