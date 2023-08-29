"use client";

import { UserButton, useUser, OrganizationSwitcher } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { env } from "~/env.mjs";

interface NavbarProps {
  title: string;
}

export const dynamic = "force-dynamic";

const Navbar = ({ title }: NavbarProps) => {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const navigationMenu = () => {
    if (pathname !== "/dashboard" && isSignedIn) {
      return (
        <Link className="btn btn-secondary btn-outline mx-2" href="/dashboard">
          Dashboard
        </Link>
      );
    } else if (!isSignedIn) {
      return (
        <button
          className="btn btn-secondary"
          onClick={() => void router.push("/sign-in")}
        >
          Sign In
        </button>
      );
    } else {
      return (
        <OrganizationSwitcher
          createOrganizationMode="modal"
          afterCreateOrganizationUrl="/dashboard"
          afterLeaveOrganizationUrl="/dashboard"
          afterSwitchOrganizationUrl="/dashboard"
          appearance={{
            elements: {
              organizationSwitcherTrigger: "text-white",
              organizationSwitcherTriggerIcon: "text-white",
              organizationSwitcherPopoverRootBox: "text-black",
            },
          }}
        />
      );
    }
  };

  return (
    <nav className="navbar bg-base-100 h-12">
      <div className="flex-1">
        <Link
          about="Back to home."
          href="/"
          className="btn btn-ghost normal-case text-xl"
        >
          <Image
            className="md:mr-2"
            src="/logo.webp"
            alt="Nav Logo"
            width={32}
            height={32}
            priority
          />
          <span className="hidden md:inline-flex">
            {title}
            {env.NEXT_PUBLIC_APP_ENV === "development" && " >> Staging"}
          </span>
        </Link>
      </div>

      {!isLoaded ? (
        <div className="flex items-center justify-center">
          <span className="loading loading-dots loading-lg"></span>
        </div>
      ) : (
        navigationMenu()
      )}
      <UserButton afterSignOutUrl="/" userProfileMode="modal" />
    </nav>
  );
};

export default Navbar;
