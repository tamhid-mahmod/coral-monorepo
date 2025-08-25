"use client";

import { z as zod } from "zod";
import { Loader2Icon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";

// ----------------------------------------------------------------------

export type ResetPasswordSchemaType = zod.infer<typeof ResetPasswordSchema>;

export const ResetPasswordSchema = zod
  .object({
    newPassword: zod
      .string()
      .min(1, { message: "Password is required!" })
      .min(6, { message: "Password must be at least 6 characters!" }),
    confirmPassword: zod
      .string()
      .min(1, { message: "Confirm Password is required!" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Confirm password do not match!",
    path: ["confirmPassword"],
  });

// ----------------------------------------------------------------------

type FormResetPasswordProps = {
  onResetPassword: (data: ResetPasswordSchemaType) => void;
};

export function FormResetPassword({ onResetPassword }: FormResetPasswordProps) {
  const defaultValues: ResetPasswordSchemaType = {
    newPassword: "",
    confirmPassword: "",
  };

  const methods = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues,
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  return (
    <Form {...methods}>
      <form onSubmit={handleSubmit(onResetPassword)} className="space-y-5">
        <FormField
          control={control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="cursor-pointer w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          Submit
        </Button>
      </form>
    </Form>
  );
}
