"use client";

import { z as zod } from "zod";
import { Loader2Icon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@workspace/ui/components/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp";

// ----------------------------------------------------------------------

export type VerifyOtpSchemaType = zod.infer<typeof VerifyOtpSchema>;

export const VerifyOtpSchema = zod.object({
  otp: zod
    .string()
    .regex(/^\d{6}$/, { message: "OTP must be a 6-digit number!" }),
});

// ----------------------------------------------------------------------

type FormVerifyOtpProps = {
  disabled?: boolean;
  onSubmit: (data: VerifyOtpSchemaType) => void;
};

export function FormVerifyOtp({ disabled, onSubmit }: FormVerifyOtpProps) {
  const defaultValues: VerifyOtpSchemaType = {
    otp: "",
  };

  const methods = useForm<VerifyOtpSchemaType>({
    resolver: zodResolver(VerifyOtpSchema),
    defaultValues,
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  return (
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
        disabled={isSubmitting || disabled}
      >
        {isSubmitting && <Loader2Icon className="animate-spin" />}
        Submit
      </Button>
    </form>
  );
}
