
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
  return <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? "py-2 bg-white/80 backdrop-blur-lg shadow-sm" : "py-4 bg-transparent"}`}>
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <Link to="/" className="flex flex-col items-start" onClick={closeMenu}>
          <span className="font-museomoderno tracking-tight pocketcv-gradient-text drop-shadow-[0_0_0.3rem_rgba(140,82,255,0.3)] font-medium text-2xl">PocketCV</span>
          <span className="text-xs text-muted-foreground font-medium tracking-wide">
            instant networking
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex gap-6">
            {navigationLinks.map(link => <Link key={link.name} to={link.path} className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.path || location.hash === link.path ? "text-primary" : "text-muted-foreground"}`}>
                {link.name}
              </Link>)}
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            {isAuthenticated ? <Button variant="default" size="sm" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button> : <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button variant="default" size="sm" asChild>
                  <Link to="/get-started">Get Started</Link>
                </Button>
              </>}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <LanguageSwitcher />
          <Button variant="ghost" size="icon" aria-label="Toggle Menu" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMenuOpen && <div className="fixed inset-0 top-16 z-50 bg-background/95 backdrop-blur-sm animate-fadeIn md:hidden">
          <div className="container h-full flex flex-col gap-8 pt-16 pb-24">
            <div className="flex flex-col gap-4">
              {navigationLinks.map(link => <Link key={link.name} to={link.path} className="text-lg font-medium px-4 py-3 transition-colors hover:bg-secondary rounded-md" onClick={closeMenu}>
                  {link.name}
                </Link>)}
            </div>
            <div className="mt-auto space-y-4">
              {isAuthenticated ? <Button className="w-full" asChild>
                  <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
                </Button> : <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/login" onClick={closeMenu}>Log in</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link to="/get-started" onClick={closeMenu}>Get Started</Link>
                  </Button>
                </>}
            </div>
          </div>
        </div>}
    </nav>;
};
export default Navbar;
