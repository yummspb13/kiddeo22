import { ReactNode } from "react";
import { Unbounded } from "next/font/google";

const unbounded = Unbounded({
  subsets: ["cyrillic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-unbounded",
});

export default function VendorRegisterLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 ${unbounded.variable} font-unbounded`}>
      {children}
    </div>
  );
}