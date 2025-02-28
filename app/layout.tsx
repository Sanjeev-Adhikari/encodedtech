import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Encoded Tech - Innovative IT Solutions",
  description: "Encoded Tech - Leading the way in innovative technology solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
