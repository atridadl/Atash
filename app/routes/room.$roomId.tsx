import { getAuth } from "@clerk/remix/ssr.server";
import { type LoaderFunction, redirect } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import {
  CheckCircleIcon,
  CopyIcon,
  CrownIcon,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  HourglassIcon,
  RefreshCwIcon,
  SaveIcon,
  ShieldIcon,
  StarIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import LoadingIndicator from "~/components/LoadingIndicator";
import { useEventSource } from "remix-utils/sse/react";
import type {
  PresenceItem,
  RoomResponse,
  VoteResponse,
} from "~/services/types.client";
import { isAdmin, jsonToCsv } from "~/services/helpers.client";
import { ClerkLoaded, ClerkLoading, useUser } from "@clerk/remix";
import { db } from "~/services/db.server";
import { rooms } from "~/services/schema.server";
import { eq } from "drizzle-orm";
import ErrorPage from "~/components/ErrorPage";
import { isShit } from "~/services/helpers.server";

// Loader
export const loader: LoaderFunction = async (args) => {
  const { userId, sessionClaims } = await getAuth(args);

  if (!userId) {
    return redirect("/sign-in");
  }

  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, args.params.roomId as string),
  });

  if (!room) {
    throw new Response(
      "Oops! This room does not appear to exist, or may have been deleted!",
      {
        status: 404,
        statusText: "NOT FOUND",
      }
    );
  }

  const email = sessionClaims.email as string;
  const shit = isShit(email);
  if (shit) {
    throw new Response(
      "Gee Willikers! I'm sure I put that room around here somewhere... sorry one moment while I look around... I swear I just had it...",
      {
        status: 418,
        statusText: "I'M A LITTLE TEA POT",
      }
    );
  }

  return {};
};

// Error handler
export function ErrorBoundary() {
  return <ErrorPage />;
}

export default function Room() {
  return (
    <>
      <ClerkLoaded>
        <RoomContent />
      </ClerkLoaded>
      <ClerkLoading>
        <LoadingIndicator />
      </ClerkLoading>
    </>
  );
}

function RoomContent() {
  const { user } = useUser();
  const params = useParams();
  const roomId = params.roomId;

  let roomFromDb = useEventSource(`/api/room/get/${roomId}`, {
    event: `room-${params.roomId}`,
  });

  let votesFromDb = useEventSource(`/api/votes/get/${roomId}`, {
    event: `votes-${params.roomId}`,
  });

  let presenceData = useEventSource(`/api/room/presence/get/${roomId}`, {
    event: `${user?.id}-${params.roomId}`,
  });

  let roomFromDbParsed = (roomFromDb ? JSON.parse(roomFromDb!) : undefined) as
    | RoomResponse
    | null
    | undefined;

  let votesFromDbParsed = JSON.parse(votesFromDb!) as VoteResponse | undefined;
  let presenceDateParsed = JSON.parse(presenceData!) as
    | PresenceItem[]
    | undefined;

  const [storyNameText, setStoryNameText] = useState<string>("");
  const [roomScale, setRoomScale] = useState<string>("");

  const [copied, setCopied] = useState<boolean>(false);

  // Handlers
  // =================================
  async function setVoteHandler(value: string) {
    if (roomFromDb) {
      await fetch(`/api/vote/set/${roomId}`, {
        cache: "no-cache",
        method: "PUT",
        body: JSON.stringify({
          value,
        }),
      });
    }
  }

  async function setRoomHandler(data: {
    visible: boolean;
    reset: boolean | undefined;
    log: boolean | undefined;
  }) {
    if (roomFromDb) {
      await fetch(`/api/room/set/${roomId}`, {
        cache: "no-cache",
        method: "PUT",
        body: JSON.stringify({
          name: storyNameText,
          visible: data.visible,
          scale: roomScale,
          reset: data.reset ? data.reset : false,
          log: data.log ? data.log : false,
        }),
      });
    }
  }

  // Helpers
  // =================================
  const getVoteForCurrentUser = () => {
    if (roomFromDb) {
      return (
        votesFromDbParsed &&
        votesFromDbParsed.find((vote) => vote.userId === user?.id)
      );
    } else {
      return null;
    }
  };

  const downloadLogs = () => {
    if (roomFromDbParsed && votesFromDbParsed) {
      const jsonObject = roomFromDbParsed?.logs
        .map((item) => {
          return {
            id: item.id,
            created_at: item.created_at,
            userId: item.userId,
            roomId: item.roomId,
            roomName: item.roomName,
            storyName: item.storyName,
            scale: item.scale,
            votes: item.votes,
          };
        })
        .concat({
          id: "LATEST",
          created_at: new Date(),
          userId: roomFromDbParsed.userId,
          roomId: roomFromDbParsed.id,
          roomName: roomFromDbParsed.roomName,
          storyName: storyNameText,
          scale: roomScale,
          votes: votesFromDbParsed?.map((vote) => {
            return {
              value: vote.value,
            };
          }),
        });

      jsonToCsv(jsonObject!, `sp_${roomId}.csv`);
    }
  };

  const copyRoomURLHandler = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        console.log(`Copied Room Link to Clipboard!`);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch(() => {
        console.log(`Error Copying Room Link to Clipboard!`);
      });
  };

  const voteString = (
    visible: boolean,
    votes: typeof votesFromDbParsed,
    presenceItem: PresenceItem
  ) => {
    const matchedVote = votes?.find(
      (vote) => vote.userId === presenceItem.userId
    );

    if (visible) {
      if (matchedVote) {
        return <div>{matchedVote.value}</div>;
      } else {
        return <HourglassIcon className="text-xl text-error" />;
      }
    } else if (matchedVote) {
      return <CheckCircleIcon className="text-xl text-success" />;
    } else {
      return <HourglassIcon className="text-xl animate-spin text-warning" />;
    }
  };

  // Hooks
  // =================================
  useEffect(() => {
    if (roomFromDb) {
      setStoryNameText(roomFromDbParsed?.storyName || "");
      setRoomScale(roomFromDbParsed?.scale || "ERROR");
    }
  }, [roomFromDb]);

  // UI
  // =================================
  // Room is loading
  if (!roomFromDbParsed) {
    return <LoadingIndicator />;
    // Room has been loaded
  } else {
    return (
      <div className="flex flex-col gap-4 text-center justify-center items-center">
        <div className="text-2xl">{roomFromDbParsed?.roomName}</div>
        <div className="flex flex-row flex-wrap text-center justify-center items-center gap-1 text-md">
          <div>ID:</div>
          <div>{roomFromDbParsed?.id}</div>

          <button>
            {copied ? (
              <CheckCircleIcon className="mx-1 text-success animate-bounce" />
            ) : (
              <CopyIcon
                className="mx-1 hover:text-primary"
                onClick={copyRoomURLHandler}
              />
            )}
          </button>
        </div>

        {roomFromDb && (
          <div className="card card-compact bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mx-auto">
                Story: {roomFromDbParsed?.storyName}
              </h2>

              <ul className="p-0 flex flex-row flex-wrap justify-center items-center text-ceter gap-4">
                {presenceData &&
                  presenceDateParsed
                    ?.filter(
                      (value, index, self) =>
                        index ===
                        self.findIndex(
                          (presenceItem) => presenceItem.userId === value.userId
                        )
                    )
                    .map((presenceItem) => {
                      return (
                        <li
                          key={presenceItem.userId}
                          className="flex flex-row items-center justify-center gap-2"
                        >
                          <div className="w-10 rounded-full avatar">
                            <img
                              src={presenceItem.userImageUrl}
                              alt={`${presenceItem.userFullName}'s Profile`}
                              height={32}
                              width={32}
                            />
                          </div>

                          <p className="flex flex-row flex-wrap text-center justify-center items-center gap-1 text-md">
                            {presenceItem.userFullName}{" "}
                            {presenceItem.isAdmin && (
                              <span
                                className="tooltip tooltip-primary"
                                data-tip="Admin"
                              >
                                <ShieldIcon className="inline-block text-primary" />
                              </span>
                            )}{" "}
                            {presenceItem.isVIP && (
                              <span
                                className="tooltip tooltip-secondary"
                                data-tip="VIP"
                              >
                                <StarIcon className="inline-block text-secondary" />
                              </span>
                            )}{" "}
                            {presenceItem.userId ===
                              roomFromDbParsed?.userId && (
                              <span
                                className="tooltip tooltip-warning"
                                data-tip="Room Owner"
                              >
                                <CrownIcon className="inline-block text-warning" />
                              </span>
                            )}
                            {" : "}
                          </p>

                          {roomFromDb &&
                            votesFromDb &&
                            voteString(
                              roomFromDbParsed?.visible || false,
                              votesFromDbParsed,
                              presenceItem
                            )}
                        </li>
                      );
                    })}
              </ul>

              <div className="join md:btn-group-horizontal mx-auto">
                {roomFromDbParsed?.scale?.split(",").map((scaleItem, index) => {
                  return (
                    <button
                      key={index}
                      className={`join-item ${
                        getVoteForCurrentUser()?.value === scaleItem
                          ? "btn btn-active btn-primary"
                          : "btn"
                      }`}
                      onClick={() => void setVoteHandler(scaleItem)}
                    >
                      {scaleItem}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!!roomFromDbParsed &&
          (roomFromDbParsed.userId === user?.id ||
            isAdmin(user?.publicMetadata)) && (
            <>
              <div className="card card-compact bg-base-100 shadow-xl">
                <div className="card-body flex flex-col flex-wrap">
                  <h2 className="card-title">Room Settings</h2>

                  <label className="label">
                    {"Vote Scale (Comma Separated):"}{" "}
                  </label>

                  <input
                    type="text"
                    placeholder="Scale (Comma Separated)"
                    className="input input-bordered"
                    value={roomScale}
                    onChange={(event) => {
                      setRoomScale(event.target.value);
                    }}
                  />

                  <label className="label">{"Story Name:"} </label>

                  <input
                    type="text"
                    placeholder="Story Name"
                    className="input input-bordered"
                    value={storyNameText}
                    onChange={(event) => {
                      setStoryNameText(event.target.value);
                    }}
                  />

                  <div className="flex flex-row flex-wrap text-center items-center justify-center gap-2">
                    <div>
                      <button
                        onClick={() =>
                          void setRoomHandler({
                            visible: !roomFromDbParsed?.visible,
                            reset: false,
                            log: false,
                          })
                        }
                        className="btn btn-primary inline-flex"
                      >
                        {roomFromDbParsed.visible ? (
                          <>
                            <EyeOffIcon className="text-xl mr-1" />
                            Hide
                          </>
                        ) : (
                          <>
                            <EyeIcon className="text-xl mr-1" />
                            Show
                          </>
                        )}
                      </button>
                    </div>

                    <div>
                      <button
                        onClick={() =>
                          void setRoomHandler({
                            visible: false,
                            reset: true,
                            log:
                              roomFromDbParsed?.storyName === storyNameText ||
                              votesFromDb?.length === 0
                                ? false
                                : true,
                          })
                        }
                        className="btn btn-primary inline-flex"
                        disabled={
                          [...new Set(roomScale.split(","))].filter(
                            (item) => item !== ""
                          ).length <= 1
                        }
                      >
                        {roomFromDbParsed?.storyName === storyNameText ||
                        votesFromDb?.length === 0 ? (
                          <>
                            <RefreshCwIcon className="text-xl mr-1" /> Reset
                          </>
                        ) : (
                          <>
                            <SaveIcon className="text-xl mr-1" /> Save
                          </>
                        )}
                      </button>
                    </div>

                    {votesFromDb &&
                      (roomFromDbParsed?.logs.length > 0 ||
                        votesFromDb.length > 0) && (
                        <div>
                          <button
                            onClick={() => downloadLogs()}
                            className="btn btn-primary inline-flex hover:animate-pulse"
                          >
                            <>
                              <DownloadIcon className="text-xl" />
                            </>
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </>
          )}
      </div>
    );
  }
}
