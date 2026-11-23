"use client";
import React, { useEffect, useRef, useState } from "react";
import { FaXbox, FaPlaystation } from "react-icons/fa";
import { BsNintendoSwitch } from "react-icons/bs";
import { SiEpicgames } from "react-icons/si";
import { AiOutlineSearch, AiOutlineClose } from "react-icons/ai";
import Link from "next/link";
import Logout from "../Logout";
import { useSession } from "next-auth/react";
import defaultAvatar from "@/public/assets/images/default_avatar.jpg";
import siteLogo from "@/public/assets/images/logo.webp";
import dynamic from "next/dynamic";
import Image from "next/image";

const SearchBar = dynamic(() => import("./SearchBar"), {
  loading: () => (
    <div className="h-10 w-full max-w-xl rounded-lg bg-white/5 animate-pulse" />
  ),
});
import { TbMenuDeep, TbLayoutGrid, TbArrowLeft } from "react-icons/tb";
import { usePathname, useRouter } from "next/navigation";

const logos = [
  { component: <FaXbox />, key: 3, slug: "xbox" },
  { component: <FaPlaystation />, key: 2, slug: "playstation" },
  { component: <BsNintendoSwitch />, key: 7, slug: "nintendo" },
  { component: <SiEpicgames />, key: 1, slug: "pc" },
];

const NavBar = () => {
  const [user, setUser] = useState<any>(null);
  const [showmenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close each dropdown independently when clicking outside of it.
    // (Previously both refs had to exist, so logged-out users could never
    // close the burger menu by clicking away.)
    const mouseHandler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setShowMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", mouseHandler);
    return () => document.removeEventListener("mousedown", mouseHandler);
  }, []);

  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (!session?.user?.email) return;
      try {
        const response = await fetch(
          `/api/getUserDetails/${session.user.email}`,
        );
        if (!response.ok) return;
        const data = await response.json();
        if (data?._id) setUser(data);
      } catch (error) {
        console.error("Failed to fetch profile details:", error);
      }
    };
    fetchProfileDetails();
  }, [session?.user?.email]);

  const toggleMenu = () => setShowMenu((p) => !p);
  const closeDropdown = () => setShowMenu(false);
  const toggleProfile = () => setShowProfile((p) => !p);
  const closeProfile = () => setShowProfile(false);

  // Show a back button on game detail pages (/games/[name], /games/[name]/review)
  const segments = pathname?.split("/").filter(Boolean) ?? [];
  const showBack =
    segments[0] === "games" && segments.length >= 2 && segments[1] !== "page";

  const goBack = () => {
    // Fall back to the games list if the user landed here directly
    if (window.history.length > 1) router.back();
    else router.push("/games/page/1");
  };

  return (
    <nav className="w-full flex justify-between items-center sticky top-0 bg-black h-20 z-20">
      {/* Left: logo + avatar */}
      <div className="pl-2 flex items-center h-full gap-1 sm:gap-2 shrink-0 pointer-events-none">
        {showBack && (
          <button
            onClick={goBack}
            aria-label="Go back"
            title="Go back"
            className="pointer-events-auto text-white text-2xl sm:text-3xl p-1.5 rounded-full hover:bg-neutral-800 transition-all duration-200"
          >
            <TbArrowLeft />
          </button>
        )}
        <Link
          href="/"
          className="pointer-events-auto flex items-center justify-center"
        >
          <Image
            src={siteLogo}
            alt="site_logo"
            width={200}
            height={50}
            className="object-contain mt-2 max-[400px]:w-[150px] h-auto w-[200px]"
          />
        </Link>
      </div>

      {/* Center: search bar — hidden below md (768px) */}
      <div className="hidden min-[930px]:flex flex-1 justify-center px-4">
        <SearchBar />
      </div>

      {/* Right: search icon (mobile only), register, hamburger */}
      <div className="flex items-center gap-1 pr-2 shrink-0" ref={menuRef}>
        <button
          className="min-[930px]:hidden text-white text-2xl p-2 rounded-full hover:bg-neutral-800 transition-all duration-200"
          onClick={() => setShowSearch(true)}
          aria-label="Open search"
        >
          <AiOutlineSearch />
        </button>

        {!session ? (
          <Link href="/authentication/signup">
            <button className="text-neutral-900 tracking-tight border bg-neutral-200 sm:text-lg text-sm transition delay-50 p-2 rounded-2xl hover:scale-105">
              Register
            </button>
          </Link>
        ) : (
          <div
            className="relative pointer-events-none z-10 text-white max-[900px]:hidden"
            ref={profileRef}
          >
            <div
              className="pointer-events-auto flex flex-row items-center gap-1 cursor-pointer hover:brightness-75"
              onClick={toggleProfile}
            >
              <Image
                src={user?.profilePicture || defaultAvatar.src}
                alt="image"
                width={45}
                height={50}
                priority
                className="rounded-full object-cover"
              />
            </div>
            <div
              className={`pointer-events-auto absolute flex flex-col overflow-hidden -left-6 top-14 w-24 bg-white rounded-md shadow-lg transition-all duration-200 ${
                showProfile ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
              style={{ transitionProperty: "max-height, opacity" }}
              onClick={closeProfile}
            >
              <ul className="py-2 divide-y text-black">
                <Link href="/account/info">
                  <li className="px-4 py-3 hover:bg-gray-100 cursor-pointer">
                    Profile
                  </li>
                </Link>
                <li className="px-3 text-md py-4 hover:bg-gray-100 cursor-pointer">
                  <Logout />
                </li>
              </ul>
            </div>
          </div>
        )}

        <button
          className="text-white rounded-full hover:bg-neutral-800 transition-all duration-200 text-4xl p-1.5"
          onClick={toggleMenu}
          aria-label="Open menu"
        >
          <TbMenuDeep strokeWidth={1} />
        </button>

        <ul
          style={{ transitionProperty: "max-height, opacity" }}
          className={`${
            showmenu ? "max-h-[30rem] opacity-100" : "max-h-0 opacity-0"
          } bg-black w-28 py-3 absolute z-30 right-0 top-16 transition-all duration-300 ease-in-out overflow-hidden rounded-b-lg gap-5 flex items-center justify-center flex-col`}
        >
          {logos.map((logo) => (
            <Link
              key={logo.key}
              aria-label={logo.slug}
              title={logo.slug}
              href={`/games/page/1?console=${logo.slug}`}
            >
              <div
                className="text-stone-200 sm:text-3xl text-2xl transition delay-50 p-2 rounded-full hover:scale-110"
                onClick={closeDropdown}
              >
                {logo.component}
              </div>
            </Link>
          ))}
          {session && (
            <div className="min-[900px]:hidden flex flex-col items-center gap-5">
              <Link href="/account/info">
                <div
                  className="pointer-events-auto flex flex-row items-center gap-1 cursor-pointer hover:brightness-75"
                  onClick={toggleProfile}
                >
                  <Image
                    src={user?.profilePicture || defaultAvatar.src}
                    alt="image"
                    width={45}
                    height={50}
                    priority
                    className="rounded-full object-cover"
                  />
                </div>
              </Link>
            </div>
          )}
          <Link
            href="/games/page/1"
            aria-label="All games"
            title="All games"
            onClick={closeDropdown}
            className="text-stone-200 sm:text-3xl text-2xl transition delay-50 p-2 rounded-full hover:scale-110"
          >
            <TbLayoutGrid />
          </Link>
        </ul>
      </div>

      {/* Mobile search overlay */}
      {showSearch && (
        <div className="md:hidden absolute inset-0 bg-black flex items-center gap-2 px-3 z-30">
          <SearchBar className="w-full" />
          <button
            className="text-white text-2xl p-2 shrink-0 rounded-full hover:bg-neutral-800 transition-all duration-200"
            onClick={() => setShowSearch(false)}
            aria-label="Close search"
          >
            <AiOutlineClose />
          </button>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
