"use client";
import Link from "next/link";

const Navbar = () => {
  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Services", href: "#services" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav style={{
      position: "absolute",
      top: 0,
      width: "100%",
      padding: "1.5rem",
      zIndex: 2,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "transparent"
    }}>
      {/* Logo */}
      <Link href="/" style={{
        fontSize: "1.5rem",
        fontWeight: "bold",
        color: "white",
        textDecoration: "none",
        textShadow: "0 0 10px rgba(0, 255, 255, 0.5)",
        flex: 1
      }}>
        YourLogo
      </Link>

      {/* Navigation Links */}
      <div style={{
        display: "flex",
        gap: "2rem",
        flex: 1,
        justifyContent: "center"
      }}>
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "1.1rem",
              fontWeight: 500,
              transition: "all 0.3s ease",
              textShadow: "0 0 10px rgba(0, 255, 255, 0.5)",
            }}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Join Now Button */}
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
        <Link
          href="#join"
          style={{
            color: "white",
            textDecoration: "none",
            fontSize: "1.1rem",
            fontWeight: 500,
            padding: "0.5rem 1.5rem",
            borderRadius: "0.5rem",
            background: "rgba(0, 255, 255, 0.1)",
            border: "1px solid rgba(0, 255, 255, 0.3)",
            transition: "all 0.3s ease",
            textShadow: "0 0 10px rgba(0, 255, 255, 0.5)",
          }}
        >
          Join Now
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;