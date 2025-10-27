import dynamic from "next/dynamic";

const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false });

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-screen w-full flex-col">
      <Navbar />
      <div className="w-full">{children}</div>
    </div>
  );
}
