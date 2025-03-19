import type { Metadata } from "next";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
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
      <body style={{ 
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      margin: 0,
      padding: 0,
      overflow: "hidden"
    }}>
        
        {children}
        <Footer />
      </body>
    </html>
  );
}
