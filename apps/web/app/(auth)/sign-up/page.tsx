import type { Metadata } from "next";

import { CONFIG } from "@/global-config";

import { SignUpView } from "@/auth/view";

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Sign up - ${CONFIG.appName}` };

export default function Page() {
  return <SignUpView />;
}
