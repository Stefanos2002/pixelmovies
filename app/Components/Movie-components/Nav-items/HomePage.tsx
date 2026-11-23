import Link from "next/link";
import Image from "next/image";
import siteLogo from "@/public/assets/images/logo.webp";

const HomePage = () => {
  return (
    <div className="not-search">
      <Link
        className="flex flex-row items-center h-20 gap-2 not-search logo-container"
        href={"/"}
      >
        <Image
          src={siteLogo}
          alt="Pixel Movies"
          width={170}
          height={57}
          className="pointer-events-auto h-auto w-[130px] sm:w-[170px] object-contain"
        />
      </Link>
    </div>
  );
};

export default HomePage;
