"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-center"
      toastOptions={{
        className:
          "inline-flex items-center justify-center rounded-full bg-popover text-popover-foreground px-4 py-2 text-sm shadow-sm border border-border/60 mx-auto",
        style: { minHeight: "auto", maxWidth: "fit-content", margin: "0 auto" },
        descriptionClassName: "hidden",
        titleClassName: "text-center leading-tight",
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
