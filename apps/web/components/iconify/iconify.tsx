"use client";

import type { IconProps } from "@iconify/react";
import { useId } from "react";
import { Icon } from "@iconify/react";

import { cn } from "@workspace/ui/lib/utils";

import { allIconNames, registerIcons } from "./register-icons";
import type { IconifyName } from "./register-icons";

// ----------------------------------------------------------------------

export type IconifyProps = Omit<IconProps, "icon"> & {
  icon: IconifyName;
  className?: string;
  width?: number | string;
  height?: number | string;
};

export function Iconify({
  className,
  icon,
  width = 20,
  height,
  ...other
}: IconifyProps) {
  const id = useId();

  if (!allIconNames.includes(icon)) {
    console.warn(
      [
        `Icon "${icon}" is currently loaded online, which may cause flickering effects.`,
        `To ensure a smoother experience, please register your icon collection for offline use.`,
        `More information is available at: https://docs.minimals.cc/icons/`,
      ].join("\n")
    );
  }

  registerIcons();

  return (
    <Icon
      ssr
      id={id}
      icon={icon}
      className={cn(
        "inline-flex flex-shrink-0", // Tailwind classes
        className
      )}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height:
          typeof height === "number"
            ? `${height}px`
            : (height ?? (typeof width === "number" ? `${width}px` : width)),
      }}
      {...other}
    />
  );
}
