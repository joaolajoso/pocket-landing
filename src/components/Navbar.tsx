import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isAuthenticated = false; // This will be replaced with actual auth state

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const navigationLinks = isAuthenticated ? [{
    name: "Dashboard",
    path: "/dashboard"
  }, {
    name: "Preview",
    path: "/preview"
  }] : [
  // Removed the Features link
  {
    name: "How It Works",
    path: "/#how-it-works"
  }, {
    name: "FAQ",
    path: "/#faq"
  }];

  // Handle smooth scrolling for hash links when on the home page
  const handleNavClick = (path: string, e: React.MouseEvent) => {
    closeMenu();

    // Check if it's a hash link and we're already on the home page
    if (path.startsWith('/#') && location.pathname === '/') {
      e.preventDefault();
      const targetId = path.replace('/#', '');
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    }
  };
  return;
};
export default Navbar;