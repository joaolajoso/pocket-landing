
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, signOut } = useAuth();

  // Close menu when navigating to a new page
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Features", path: "/#features" },
    { name: "Example", path: "/example" },
    { name: "Pricing", path: "/#pricing" },
    { name: "FAQ", path: "/#faq" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white border-b py-3 sticky top-0 z-50 px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          <span className="text-gradient">Pocket</span>
          <span>CV</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-gray-700 hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              <Button variant="outline" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button onClick={signOut}>Logout</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/login?signup=true">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md"
          onClick={toggleMenu}
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

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 space-y-3 shadow-lg mt-3 rounded-md">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="block py-2 text-gray-700 hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t space-y-3">
            {isAuthenticated ? (
              <>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button onClick={signOut} className="w-full">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link to="/login?signup=true">Sign up</Link>
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
