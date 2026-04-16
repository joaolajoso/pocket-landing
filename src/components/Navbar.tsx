
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, signOut } = useAuth();
  const { language } = useLanguage();
  const domain = "pocketcv.pt"; // Using the custom domain

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false);
    
    if (location.pathname !== '/') {
      window.location.href = `https://${domain}/#${sectionId}`;
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
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/e2dc45fe-1094-4092-bd2c-a5d283e4d0f8.png" 
            alt="PocketCV Logo" 
            className="h-10"
            width="184"
            height="40"
            loading="eager"
            decoding="async"
          />
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link 
            to="/forbusinesses"
            className="text-gray-600 hover:text-primary transition-colors"
          >
            {isPortuguese(language) ? 'Para Empresas' : 'For Business'}
          </Link>
          <Link 
            to="/pricing"
            className="text-gray-600 hover:text-primary transition-colors"
          >
            {isPortuguese(language) ? 'Preços' : 'Pricing'}
          </Link>
          <Link 
            to="/blog"
            className="text-gray-600 hover:text-primary transition-colors"
          >
            Blog
          </Link>
          <Link 
            to="/shop"
            className="text-gray-600 hover:text-primary transition-colors"
          >
            {isPortuguese(language) ? 'Loja NFC' : 'NFC Shop'}
          </Link>
          <Link 
            to="/about"
            className="text-gray-600 hover:text-primary transition-colors"
          >
            {isPortuguese(language) ? 'Sobre Nós' : 'About Us'}
          </Link>
          <button
            onClick={() => scrollToSection('faq')}
            className="text-gray-600 hover:text-primary transition-colors"
          >
            FAQ
          </button>
          <LanguageSwitcher />
          
          {isAuthenticated ? (
            <>
              <Button variant="ghost" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button 
                variant="outline" 
                onClick={signOut}
              >
                {isPortuguese(language) ? 'Sair' : 'Log out'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">{isPortuguese(language) ? 'Entrar' : 'Log in'}</Link>
              </Button>
              
              <Button className="bg-pocketcv-purple hover:bg-pocketcv-purple/90 text-white" asChild>
                <Link to="/login?signup=true">
                  {isPortuguese(language) ? 'Começar Agora' : 'Get Started'}
                </Link>
              </Button>
            </>
          )}
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
          <Link
            to="/forbusinesses"
            className="block w-full text-left py-2 text-gray-600 hover:text-primary transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            {isPortuguese(language) ? 'Para Empresas' : 'For Business'}
          </Link>
          <Link
            to="/pricing"
            className="block w-full text-left py-2 text-gray-600 hover:text-primary transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            {isPortuguese(language) ? 'Preços' : 'Pricing'}
          </Link>
          <Link
            to="/blog"
            className="block w-full text-left py-2 text-gray-600 hover:text-primary transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Blog
          </Link>
          <Link
            to="/shop"
            className="block w-full text-left py-2 text-gray-600 hover:text-primary transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            {isPortuguese(language) ? 'Loja NFC' : 'NFC Shop'}
          </Link>
          <Link
            to="/about"
            className="block w-full text-left py-2 text-gray-600 hover:text-primary transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            {isPortuguese(language) ? 'Sobre Nós' : 'About Us'}
          </Link>
          <button
            onClick={() => scrollToSection('faq')}
            className="block w-full text-left py-2 text-gray-600 hover:text-primary transition-colors"
          >
            FAQ
          </button>
          <div className="pt-3 border-t space-y-3">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={signOut}
                >
                  {isPortuguese(language) ? 'Sair' : 'Log out'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/login">{isPortuguese(language) ? 'Entrar' : 'Log in'}</Link>
                </Button>
                <Button className="w-full bg-pocketcv-purple hover:bg-pocketcv-purple/90 text-white" asChild>
                  <Link to="/login?signup=true">
                    {isPortuguese(language) ? 'Começar Agora' : 'Get Started'}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
