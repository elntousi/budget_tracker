import React from "react";
import ClientNavbarWrapper from "@/components/ClientNavbarWrapper";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-screen w-full flex-col">
      <ClientNavbarWrapper />
      <div className="w-full">{children}</div>
    </div>
  );
}