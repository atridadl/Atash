"use client";

import { UserButton, useUser } from "@clerk/remix";
import { Link, useLocation, useNavigate } from "@remix-run/react";

interface NavbarProps {
  title: string;
}

const Navbar = ({ title }: NavbarProps) => {
  const { isSignedIn } = useUser();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const navigationMenu = () => {
    if (pathname !== "/dashboard" && isSignedIn) {
      return (
        <Link className="btn btn-primary btn-outline mx-2" to="/dashboard">
          Dashboard
        </Link>
      );
    } else if (!isSignedIn) {
      return (
        <button
          className="btn btn-primary"
          onClick={() => void navigate("/sign-in")}
        >
          Sign In
        </button>
      );
    }
  };

  return (
    <nav className="navbar bg-base-100 h-12">
      <div className="flex-1">
        <Link
          about="Back to home."
          to="/"
          className="btn btn-ghost normal-case text-xl"
        >
          <img
            className="md:mr-2"
            src="/logo.webp"
            alt="Nav Logo"
            width={32}
            height={32}
          />
          <span className="hidden md:inline-flex">{title}</span>
        </Link>
      </div>

      {navigationMenu()}
      <UserButton afterSignOutUrl="/" userProfileMode="modal" />
    </nav>
  );
};

export default Navbar;
