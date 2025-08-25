import type { Metadata } from "next";

import { CONFIG } from "@/global-config";

import { ForgotPasswordView } from "@/auth/view";

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `Forgot password - ${CONFIG.appName}`,
};

export default function Page() {
  return <ForgotPasswordView />;
}
