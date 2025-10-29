"use client";

import dynamic from "next/dynamic";

const Navbar = dynamic(() => import("@/components/Navbar"), {
  ssr: false,
  loading: () => <div className="h-12 bg-muted animate-pulse" />,
});

export default function ClientNavbarWrapper() {
  return <Navbar />;
}
