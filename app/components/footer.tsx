// components/Footer.tsx
const Footer = () => (
  <footer className="bg-black/90 backdrop-blur-lg border-t border-cyan-400/20">
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
      <p className="text-gray-400">
        © {new Date().getFullYear()} Encoded Tech. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;