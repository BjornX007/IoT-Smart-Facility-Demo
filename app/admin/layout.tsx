import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AeroClean AI — Operations Dashboard",
  description: "Airport Facility Intelligence — Admin Control Center",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}