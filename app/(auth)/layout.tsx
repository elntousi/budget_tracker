import ClientNavbarWrapper from "@/components/ClientNavbarWrapper";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClientNavbarWrapper />
      {children}
    </>
  );
}
