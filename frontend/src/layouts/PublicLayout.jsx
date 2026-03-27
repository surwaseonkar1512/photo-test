import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => (
  <nav className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <Link to="/" className="font-serif text-2xl font-bold tracking-tight">Studio</Link>
      <div className="hidden md:flex gap-6">
        <Link to="/" className="text-sm font-medium hover:text-primary/80 transition-colors">Home</Link>
        <Link to="/about" className="text-sm font-medium hover:text-primary/80 transition-colors">About</Link>
        <Link to="/portfolio" className="text-sm font-medium hover:text-primary/80 transition-colors">Portfolio</Link>
        <Link to="/pricing" className="text-sm font-medium hover:text-primary/80 transition-colors">Pricing</Link>
        <Link to="/contact" className="text-sm font-medium hover:text-primary/80 transition-colors">Contact</Link>
      </div>
      <Link to="/contact" className="hidden md:inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
        Get Started
      </Link>
    </div>
  </nav>
);

const Footer = () => (
  <footer className="border-t bg-muted/50 mt-auto">
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center">
      <p className="text-sm text-muted-foreground">© 2026 Photography Studio. All rights reserved.</p>
      <div className="flex gap-4 mt-4 md:mt-0">
        <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Instagram</Link>
        <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Facebook</Link>
      </div>
    </div>
  </footer>
);

const PublicLayout = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
