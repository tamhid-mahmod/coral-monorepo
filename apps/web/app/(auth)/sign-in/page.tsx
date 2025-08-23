import type { Metadata } from "next";

import { CONFIG } from "@/global-config";

import { SignInView } from "@/auth/view";

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Sign in - ${CONFIG.appName}` };

export default function Page() {
  return <SignInView />;
}
