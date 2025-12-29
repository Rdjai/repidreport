import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";

const navItems = [
  {
    name: "Home",
    path: "/",
  },
  {
    name: "Submit Report",
    path: "/submit-report",
  },
  {
    name: "Track Report",
    path: "/track-report",
  },
  {
    name: "Nearby Support",
    path: "/near-by-support",
  },
  {
    name: "How it works",
    path: "/how-it-works",
  },
  {
    name: "Voice",
    path: "/feed",
  },
  {
    name: "Volunteer",
    path: "/volunteer/login",
  },

];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  // Load admin from localStorage on component mount
  useEffect(() => {
    const savedAdmin = localStorage.getItem("adminUser");
    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin));
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // logout
  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    setAdmin(null);
    navigate("/admin/login");
  };

  const isDashboard = window.location.pathname === "/admin/dashboard";
  const isHomePage = window.location.pathname === "/";

  if (admin) {
    return (
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
          ? "bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-lg"
          : "bg-white/95 backdrop-blur-sm border-b border-transparent shadow-sm"
          }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="flex justify-center items-center text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors duration-200"
              >
                <img src="./icon.png" alt="repid report" height={50} width={50} />
                <span className="text-red-500 ">Report</span>
              </Link>
            </div>
            {/* left section  */}
            {admin ? (
              <div className="flex items-center gap-3">
                {isDashboard ? null : (
                  <Button
                    variant="outline"
                    className="border border-gray-300 hover:bg-gray-100"
                  >
                    <Link to="/admin/dashboard">
                      <span className="flex justify-center items-center gap-2">
                        Dashboard
                      </span>
                    </Link>
                  </Button>
                )}
                {isHomePage ? null : (
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="border border-gray-300 hover:bg-gray-100"
                  >
                    <LogOut />
                  </Button>
                )}
              </div>
            ) : (
              "please log in"
            )}
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-lg"
        : "bg-white/95 backdrop-blur-sm border-b border-transparent shadow-sm"
        }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className=" flex justify-center items-center text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors duration-200"
            >
              <img src="./icon.png" alt="" height={50} width={50} /><span className="text-red-500 ">Report</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-gray-700 hover:text-red-500 font-medium transition-colors duration-200 relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all duration-200 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-red-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500 transition-colors duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Mobile menu button */}
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen
            ? "max-h-64 opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
            }`}
        >
          <div
            className={`px-2 pt-2 pb-3 space-y-1 border-t transition-all duration-300 ${isScrolled
              ? "bg-white/80 backdrop-blur-md border-gray-200/50"
              : "bg-white border-gray-200"
              }`}
          >
            {!admin &&
              navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-gray-700 hover:text-red-500 hover:bg-gray-50 font-medium rounded-md transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
