// components/Navigation.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Navigation = () => {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'services', 'solutions', 'contact'];
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && element.offsetTop <= scrollPosition && 
            element.offsetTop + element.offsetHeight > scrollPosition) {
          setActiveSection(section);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-1/2 right-6 -translate-y-1/2 z-50">
      <div className="flex flex-col gap-4">
        {['home', 'services', 'solutions', 'contact'].map((section) => (
          <motion.a
            key={section}
            href={`#${section}`}
            className={`w-3 h-3 rounded-full border ${
              activeSection === section 
                ? 'bg-cyan-400 border-cyan-400 scale-150' 
                : 'bg-transparent border-gray-400'
            } transition-all`}
            whileHover={{ scale: 1.5 }}
          />
        ))}
      </div>
    </nav>
  );
};

export default Navigation;