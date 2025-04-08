
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, signOut } = useAuth();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false);
    
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }
    
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="bg-white py-3 sticky top-0 z-50 px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold flex items-center">
          <span className="text-black">Pocket</span>
          <span className="text-black ml-1">CV</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="text-gray-600 hover:text-primary transition-colors"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="text-gray-600 hover:text-primary transition-colors"
          >
            FAQ
          </button>
          <LanguageSwitcher />
          
          <Button variant="ghost" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          
          <Button className="bg-pocketcv-orange hover:bg-pocketcv-orange/90 text-white" asChild>
            <Link to="/get-started">Get Your PocketCV Card</Link>
          </Button>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <LanguageSwitcher />
          <button
            className="p-2 rounded-md"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 space-y-3 shadow-lg mt-3 rounded-md">
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="block w-full text-left py-2 text-gray-600 hover:text-primary transition-colors"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="block w-full text-left py-2 text-gray-600 hover:text-primary transition-colors"
          >
            FAQ
          </button>
          <div className="pt-3 border-t space-y-3">
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button className="w-full bg-pocketcv-orange hover:bg-pocketcv-orange/90 text-white" asChild>
              <Link to="/get-started">Get Your PocketCV Card</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
