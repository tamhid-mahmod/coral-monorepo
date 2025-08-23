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

import { paths } from "@/routes/paths";
import { useRouter } from "@/routes/hooks";

import { Logo } from "@/components/logo";

import { FormSocials } from "../components/form-socials";
import { useAuthContext } from "../hooks";
import { getErrorMessage } from "../utils";
import { signInWithPassword } from "../context";

// ----------------------------------------------------------------------

export type SignInSchemaType = zod.infer<typeof SignInSchema>;

export const SignInSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: "Email is required!" })
    .email({ message: "Email must be a valid email address!" }),
  password: zod.string().min(1, { message: "Password is required!" }),
  rememberMe: zod.boolean(),
});

// ----------------------------------------------------------------------

export function SignInView() {
  const router = useRouter();

  const { checkUserSession } = useAuthContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues: SignInSchemaType = {
    email: "",
    password: "",
    rememberMe: false,
  };

  const methods = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: SignInSchemaType) => {
    try {
      setErrorMessage(null);
      await signInWithPassword({ email: data.email, password: data.password });
      await checkUserSession?.();

      router.refresh();
    } catch (error) {
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
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

      <div className="flex items-center justify-between">
        <FormField
          control={control}
          name="rememberMe"
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
              <FormLabel className="leading-none text-gray-600">
                Remember me
              </FormLabel>
            </FormItem>
          )}
        />

        <Link
          href={paths.auth.forgotPassword}
          className="text-sm text-blue-600 hover:underline"
        >
          Forgot Password?
        </Link>
      </div>

      <Button className="cursor-pointer w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2Icon className="animate-spin" />}
        Log In
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

          <div className="sm:w-[420px]">
            <h5 className="text-2xl font-semibold tracking-tight mb-2">
              Welcome Back!
            </h5>
            <p className="text-sm text-gray-700 mb-4">
              Login to your account using your preferred social network
              authentication
            </p>

            <FormSocials disabled={isSubmitting} />

            <p className="text-sm text-gray-700 mb-4">
              Or Login with your email address and the password
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

          <div className="mt-auto py-4">
            <p className="text-xs text-gray-500 text-center">
              &copy; {new Date().getFullYear()} All Rights Reserved
            </p>
          </div>
        </div>
        <div className="hidden md:block w-[40%] min-h-screen bg-[url(/assets/images/auth/image-2.jpg)] bg-cover bg-center" />
      </div>
    </div>
  );
}
