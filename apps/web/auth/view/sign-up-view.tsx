"use client";

import Link from "next/link";
import { z as zod } from "zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";

import { useBoolean } from "@/hooks/use-boolean";

import { paths } from "@/routes/paths";
import { useRouter } from "@/routes/hooks";

import { Logo } from "@/components/logo";

import { FormSocials } from "../components/form-socials";
import { getErrorMessage } from "../utils";
import { signUp, verifyAccount } from "../context";
import {
  VerifyAccount,
  VerifyAccountSchemaType,
} from "../components/verify-account";

// ----------------------------------------------------------------------

export type SignUpSchemaType = zod.infer<typeof SignUpSchema>;

export const SignUpSchema = zod.object({
  name: zod.string().min(1, { message: "Name is required!" }),
  email: zod
    .string()
    .min(1, { message: "Email is required!" })
    .email({ message: "Email must be a valid email address!" }),
  password: zod
    .string()
    .min(1, { message: "Password is required!" })
    .min(6, { message: "Password must be at least 6 characters!" }),
  iAgree: zod.boolean().refine((val) => val === true, {
    message: "You have to accept our rules!",
  }),
});

// ----------------------------------------------------------------------

export function SignUpView() {
  const router = useRouter();

  const showOtp = useBoolean();
  const canResend = useBoolean();
  const isResendLoading = useBoolean();

  const [timer, setTimer] = useState(60);
  const [user, setUser] = useState<SignUpSchemaType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues: SignUpSchemaType = {
    name: "",
    email: "",
    password: "",
    iAgree: false,
  };

  const methods = useForm<SignUpSchemaType>({
    resolver: zodResolver(SignUpSchema),
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

  const onSubmit = async (data: SignUpSchemaType) => {
    try {
      setErrorMessage(null);
      await signUp(data);

      setUser(data);
      showOtp.onTrue();
      canResend.onFalse();
      setTimer(60);
      startResendTimer();
    } catch (error) {
      console.error(error);
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
    }
  };

  const onVerifyAccount = async (data: VerifyAccountSchemaType) => {
    if (!user) return;

    try {
      setErrorMessage(null);
      await verifyAccount({ ...user, ...data });

      setUser(null);
      router.push(paths.auth.signIn);
    } catch (error) {
      console.error(error);
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
    }
  };

  const resendOtp = async () => {
    if (!user) return;

    try {
      isResendLoading.onTrue();
      await onSubmit(user);
    } finally {
      isResendLoading.onFalse();
    }
  };

  const renderForm = () => (
    <>
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input type="text" placeholder="John Doe" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="johndoe@example.com"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input type="password" placeholder="******" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="iAgree"
        render={({ field }) => (
          <FormItem
            className="flex items-center space-x-2"
            suppressHydrationWarning
          >
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="leading-none">
              Accept{" "}
              <Link href="#" className="text-blue-600 hover:underline">
                terms and conditions
              </Link>
            </FormLabel>
          </FormItem>
        )}
      />

      <Button className="cursor-pointer w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2Icon className="animate-spin" />}
        Sign up
      </Button>

      <p className="text-sm text-gray-700">
        Already have an account?{" "}
        <Link
          href={paths.auth.signIn}
          className="text-blue-600 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </>
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

          {!showOtp.value ? (
            <div className="sm:w-[420px]">
              <h5 className="text-2xl font-semibold tracking-tight mb-2">
                Create Free Account Now!
              </h5>
              <p className="text-sm text-gray-700 mb-4">
                Do not want another password to remember? No problem! Sign Up
                using one of your favourite social networks
              </p>

              <FormSocials disabled={isSubmitting} />

              <p className="text-sm text-gray-700 mb-4">
                Or Fill in your email address and get your free account in less
                than 60 seconds
              </p>

              {!!errorMessage && (
                <Alert variant="destructive" className="border-red-600 mb-4">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <Form {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {renderForm()}
                </form>
              </Form>
            </div>
          ) : (
            <VerifyAccount
              onSubmit={onVerifyAccount}
              timer={timer}
              canResend={canResend.value}
              resendOtp={resendOtp}
              resendDisabled={isResendLoading.value}
              errorMessage={errorMessage}
            />
          )}

          <div className="mt-auto py-4">
            <p className="text-xs text-gray-500 text-center">
              &copy; {new Date().getFullYear()} All Rights Reserved
            </p>
          </div>
        </div>
        <div className="hidden md:block w-[40%] min-h-screen bg-[url(/assets/images/auth/image-1.jpg)] bg-cover bg-center" />
      </div>
    </div>
  );
}
