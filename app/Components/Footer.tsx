import Image from "next/image";
import Link from "next/link";

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";

function Footer() {
  return (
    <div className="flex w-full lg:px-44 sm:px-20 px-6 items-center flex-col sticky h-auto bg-black mt-6">
      <div className="w-full pt-4 justify-between flex lg:flex-row flex-col items-center">
        {/* <div className="flex lg:flex-row flex-col w-full lg:justify-normal justify-center items-center lg:gap-3 gap-0">
          <Image
            src="/assets/images/logo.webp"
            alt="Pixel Movies"
            className="h-auto w-[180px] object-contain mb-2"
            width={180}
            height={60}
          />
          <span className="title text-white text-lg mb-2 font-bold pointer-events-auto font-sans">
            Pixel Movies
          </span>
        </div> */}
      </div>
      {/* <div className="w-full bg-slate-200 h-[0.5px]"></div> */}
      <span className="text-sm text-center mt-0 text-slate-100 font-thin">
        © 2026 Pixel Movies. All rights reserved.
      </span>
      <span className="text-sm text-center mb-3 text-slate-100 font-thin">
        Game data provided by{" "}
        <Link className="text-blue-400" href={"https://rawg.io/"}>
          RAWG
        </Link>{" "}
        API. Movie data provided by{" "}
        <Link className="text-blue-400" href={"https://www.themoviedb.org/"}>
          TMDB
        </Link>{" "}
        API. This product uses the TMDB API but is not endorsed or certified by
        TMDB.
      </span>
      <nav className="mb-5 flex gap-4 text-sm text-slate-300">
        <Link href="/privacy" className="hover:text-white">
          Privacy Policy
        </Link>
        <span aria-hidden className="text-slate-600">
          ·
        </span>
        <Link href="/terms" className="hover:text-white">
          Terms of Use
        </Link>
        {CONTACT_EMAIL && (
          <>
            <span aria-hidden className="text-slate-600">
              ·
            </span>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white">
              Contact
            </a>
          </>
        )}
      </nav>
    </div>
  );
}

export default Footer;
