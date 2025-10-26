import { ReactNode } from "react";

export default function VendorRegisterLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
