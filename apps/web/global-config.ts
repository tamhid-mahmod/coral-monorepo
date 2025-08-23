import { paths } from "./routes/paths";

// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  serverUrl: string;
  assetsDir: string;
  sessionSecretKey: string;
  auth: {
    redirectPath: string;
  };
};

// ----------------------------------------------------------------------

export const CONFIG: ConfigValue = {
  appName: "Coral",
  serverUrl: process.env.NEXT_PUBLIC_SERVER_URL ?? "",
  assetsDir: process.env.NEXT_PUBLIC_ASSETS_DIR ?? "",
  sessionSecretKey: process.env.SESSION_SECRET_KEY ?? "",
  // Auth
  auth: {
    redirectPath: paths.dashboard.root,
  },
};
