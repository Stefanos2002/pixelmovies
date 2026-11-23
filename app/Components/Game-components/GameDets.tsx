import React from "react";
import Link from "next/link";
import AddToList from "./AddToList";
import Screenshots from "./Screenshots";
import { getServerSession } from "next-auth";
import { findUserByEmail } from "@/app/User Collection/connection";
import { authOptions } from "@/authDbConnection/authOptions";
import { getGameBySlug } from "@/app/Game Collection/functions";
import { BsController } from "react-icons/bs";
import Image from "next/image";

const cleanDescription = (text: string): string =>
  text
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/[⌀-➿⬀-⯿\uD800-\uDFFF]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const GameDets = async ({ params }: { params: any }) => {
  const game = await getGameBySlug(params.name);
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email; // You get this from session

  let dbUser;
  if (userEmail) {
    // Fetch the full user details from MongoDB
    dbUser = await findUserByEmail(userEmail);
  }
  return (
    <div className="flex w-full flex-col">
      <div className="flex pt-20 items-stretch max-[923px]:flex-col h-full gap-5 sm:px-6 px-4">
        <div className="flex w-[50vw] max-[923px]:w-full h-full flex-col relative">
          <div className="relative w-full aspect-[16/9]">
            <Image
              src={game.background_image}
              alt={game.name}
              className="object-cover rounded-t-lg"
              fill
              sizes="(max-width: 923px) 100vw, 50vw"
            />
          </div>
          <div className="relative flex flex-col -top-10">
            <div className="fade-bottom"></div>
            <div className="flex flex-col gap-2 text-base sm:text-lg px-4 py-6 text-center font-inter text-white bg-black rounded-b-xl h-full">
              <div className="flex flex-row gap-4 items-stretch justify-between">
                <span className="text-base sm:text-lg font-bold">Name:</span>
                <span className="flex gap-1 text-end text-white text-base sm:text-lg">
                  {game.name}
                </span>
              </div>
              <div className="flex flex-row gap-4 items-center justify-between">
                <span className="text-base sm:text-lg font-bold">Rating:</span>
                {game.rating > 0 ? (
                  <span
                    className="flex gap-2 items-center text-base sm:text-lg font-semibold"
                    style={{
                      color:
                        Math.round(game.rating * 20) >= 80
                          ? "#4ade80"
                          : Math.round(game.rating * 20) >= 50
                            ? "#c084fc"
                            : "#f87171",
                    }}
                  >
                    <BsController style={{ fontSize: "22px" }} />
                    {Math.round(game.rating * 20)}/100
                  </span>
                ) : (
                  <span>---</span>
                )}
              </div>
              <div className="flex flex-row gap-4 items-stretch justify-between">
                <span className="text-base sm:text-lg font-bold">
                  Release date:{" "}
                </span>
                {game.released ? (
                  <span className="flex gap-1 text-end text-white text-base sm:text-lg">
                    {game.released}
                  </span>
                ) : (
                  <span>TBA</span>
                )}
              </div>
              <div className="flex flex-row gap-4 items-stretch justify-between">
                <span className="text-base sm:text-lg font-bold">Genres:</span>
                <span className="text-end text-base sm:text-lg">
                  {game.genres && game.genres.length > 0 ? (
                    game.genres.map(
                      (genre: { name: string }, index: number) => (
                        <span key={index}>
                          {index > 0 && ","}{" "}
                          {/* Add slash if not the first platform */}
                          {genre.name}
                        </span>
                      ),
                    )
                  ) : (
                    <span>---</span>
                  )}
                </span>
              </div>
              <div className="flex flex-row gap-4 items-stretch justify-between">
                <span className="text-base sm:text-lg font-bold">
                  Platforms:
                </span>
                <span className="text-end text-base sm:text-lg">
                  {game.platforms && game.platforms.length > 0 ? (
                    game.platforms.map(
                      (
                        platform: { platform: { name: string } },
                        index: number,
                      ) => (
                        <span key={index}>
                          {index > 0 && ","}{" "}
                          {/* Add slash if not the first platform */}
                          {platform.platform.name}
                        </span>
                      ),
                    )
                  ) : (
                    <span>---</span>
                  )}
                </span>
              </div>
              <div className="flex flex-row gap-4 items-stretch justify-between">
                <span className="text-base sm:text-lg font-bold">
                  Playtime:
                </span>
                {game.playtime && game.playtime > 0 ? (
                  <span className="text-base sm:text-lg">
                    about {game.playtime}h
                  </span>
                ) : (
                  <span>---</span>
                )}
              </div>
              {dbUser ? (
                <>
                  <div className="mt-4 gap-4 flex sm:flex-row sm:text-lg text-md flex-col w-full justify-between items-center">
                    <Link
                      href={`/games/${game.slug}/review`}
                      className="bg-neutral-600 hover:bg-neutral-800 py-1 px-4 rounded-xl transition-all duration-200 hover:scale-105"
                    >
                      Add a review
                    </Link>
                    <AddToList gameName={game.slug} />
                  </div>
                </>
              ) : (
                <div className="mt-4 flex w-full justify-center items-center">
                  <span className="bg-neutral-600 text-lg py-2 px-6 rounded-xl">
                    Sign in to review or save to Library
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {game.description_raw ? (
          // Outer box takes its height from the left panel (row stretch) on desktop,
          // and a fixed height on mobile; the absolute inner box never adds height.
          <div className="relative mb-10 w-[50vw] max-[923px]:w-full max-[923px]:h-[28rem] min-h-[20rem]">
            <div className="absolute inset-0 flex flex-col gap-3 border shadow-xl shadow-gray-600 bg-neutral-900 p-6 max-sm:p-4 rounded-2xl">
              <h2 className="shrink-0 text-white text-xl font-semibold border-b border-neutral-700 pb-2 tracking-wide">
                About
              </h2>
              <div className="flex-1 min-h-0 overflow-y-auto pr-3 space-y-4 text-neutral-300 text-[15px] sm:text-base leading-7 break-words [scrollbar-width:thin] [scrollbar-color:#525252_transparent]">
                {cleanDescription(game.description_raw)
                  .split(/\n+/)
                  .map((p) => p.trim())
                  .filter(Boolean)
                  .map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <span>No Description Yet For This Game</span>
        )}
      </div>
      <Screenshots params={params} />
    </div>
  );
};

export default GameDets;
