"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { EventTypes } from "@/utils/types";

import { useParams } from "next/navigation";
import {
  IoCheckmarkCircleOutline,
  IoCopyOutline,
  IoDownloadOutline,
  IoEyeOffOutline,
  IoEyeOutline,
  IoHourglassOutline,
  IoReloadOutline,
  IoSaveOutline,
} from "react-icons/io5";
import { GiStarFormation } from "react-icons/gi";
import { configureAbly, useChannel, usePresence } from "@ably-labs/react-hooks";
import { FaShieldAlt } from "react-icons/fa";
import { RiVipCrownFill } from "react-icons/ri";
import { env } from "@/env.mjs";
import { isAdmin, isVIP, jsonToCsv } from "@/utils/helpers";
import type { PresenceItem } from "@/utils/types";
import LoadingIndicator from "@/app/_components/LoadingIndicator";
import { useUser } from "@clerk/nextjs";
import { getRoom, setRoom } from "@/server/actions/room";
import { getVotes, setVote } from "@/server/actions/vote";
import NoRoomUI from "./NoRoomUI";

const VoteUI = () => {
  const params = useParams();
  const roomId = params?.id as string;
  const { user } = useUser();

  const [topicNameText, setTopicNameText] = useState<string>("");
  const [roomScale, setRoomScale] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const [roomFromDb, setRoomFromDb] = useState<
    | {
        id: string;
        created_at: Date | null;
        userId: string;
        orgId: string | null;
        roomName: string | null;
        topicName: string | null;
        visible: boolean;
        scale: string | null;
        logs: {
          id: string;
          created_at: Date | null;
          userId: string;
          roomId: string;
          roomName: string | null;
          topicName: string | null;
          scale: string | null;
          votes: unknown;
        }[];
      }
    | undefined
    | null
  >();

  const [votesFromDb, setVotesFromDb] = useState<
    | {
        id: string;
        created_at: Date | null;
        userId: string;
        roomId: string;
        value: string;
      }[]
    | undefined
    | null
  >(undefined);

  const getRoomHandler = async () => {
    const dbRoom = await getRoom(roomId);
    setRoomFromDb(dbRoom);
  };

  const getVotesHandler = async () => {
    const dbVotes = await getVotes(roomId);
    setVotesFromDb(dbVotes);
  };

  configureAbly({
    key: env.NEXT_PUBLIC_ABLY_PUBLIC_KEY,
    clientId: user ? user.id : "unknown",
    recover: (_, cb) => {
      cb(true);
    },
  });

  const [channel] = useChannel(
    {
      channelName: `${env.NEXT_PUBLIC_APP_ENV}-${roomId}`,
    },
    ({ name }) => {
      if (name === EventTypes.ROOM_UPDATE) {
        void getVotesHandler();
        void getRoomHandler();
      } else if (name === EventTypes.VOTE_UPDATE) {
        void getVotesHandler();
      }
    }
  );

  const [presenceData] = usePresence<PresenceItem>(
    `${env.NEXT_PUBLIC_APP_ENV}-${roomId}`,
    {
      name: (user?.fullName ?? user?.username) || "",
      image: user?.imageUrl || "",
      client_id: user?.id || "unknown",
      isAdmin: isAdmin(user?.publicMetadata),
      isVIP: isVIP(user?.publicMetadata),
    }
  );

  // Subscribe on mount and unsubscribe on unmount
  useEffect(() => {
    window.addEventListener("beforeunload", () => channel.presence.leave());
    return () => {
      window.removeEventListener("beforeunload", () =>
        channel.presence.leave()
      );
      channel.presence.leave();
    };
  }, [channel.presence, roomId]);

  // Init Topic name
  useEffect(() => {
    if (roomFromDb) {
      setTopicNameText(roomFromDb.topicName || "");
      setRoomScale(roomFromDb.scale || "ERROR");
    } else {
      void getRoomHandler();
      void getVotesHandler();
    }
  }, [roomFromDb, roomId, user]);

  // Helper functions
  const getVoteForCurrentUser = () => {
    if (roomFromDb) {
      return (
        votesFromDb && votesFromDb.find((vote) => vote.userId === user?.id)
      );
    } else {
      return null;
    }
  };

  const setVoteHandler = async (value: string) => {
    if (roomFromDb) {
      await setVote(value, roomFromDb.id);
    }
  };

  const setRoomHandler = async (
    visible: boolean,
    reset = false,
    log = false
  ) => {
    if (roomFromDb) {
      await setRoom(
        topicNameText,
        visible,
        roomScale,
        roomFromDb.id,
        reset,
        log
      );
    }
  };

  const downloadLogs = () => {
    if (roomFromDb && votesFromDb) {
      const jsonObject = roomFromDb?.logs
        .map((item) => {
          return {
            id: item.id,
            created_at: item.created_at,
            userId: item.userId,
            roomId: item.roomId,
            roomName: item.roomName,
            topicName: item.topicName,
            scale: item.scale,
            votes: item.votes,
          };
        })
        .concat({
          id: "LATEST",
          created_at: new Date(),
          userId: roomFromDb.userId,
          roomId: roomFromDb.id,
          roomName: roomFromDb.roomName,
          topicName: topicNameText,
          scale: roomScale,
          votes: votesFromDb.map((vote) => {
            return {
              value: vote.value,
            };
          }),
        });

      jsonToCsv(jsonObject, `sp_${roomId}.csv`);
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
    votes: typeof votesFromDb,
    presenceItem: PresenceItem
  ) => {
    const matchedVote = votes?.find(
      (vote) => vote.userId === presenceItem.client_id
    );

    if (visible) {
      if (!!matchedVote) {
        return <div>{matchedVote.value}</div>;
      } else {
        return <IoHourglassOutline className="text-xl mx-auto text-error" />;
      }
    } else if (!!matchedVote) {
      return (
        <IoCheckmarkCircleOutline className="text-xl mx-auto text-success" />
      );
    } else {
      return (
        <IoHourglassOutline className="text-xl animate-spin mx-auto text-warning" />
      );
    }
  };

  // Room is loading
  if (roomFromDb === undefined) {
    return <LoadingIndicator />;
    // Room has been loaded
  } else if (roomFromDb) {
    return (
      <span className="text-center">
        <div className="text-2xl">{roomFromDb.roomName}</div>
        <div className="flex flex-row flex-wrap text-center justify-center items-center gap-1 text-md mx-auto">
          <div>ID:</div>
          <div>{roomFromDb.id}</div>

          <button>
            {copied ? (
              <IoCheckmarkCircleOutline className="mx-1 text-success animate-bounce" />
            ) : (
              <IoCopyOutline
                className="mx-1 hover:text-primary"
                onClick={copyRoomURLHandler}
              ></IoCopyOutline>
            )}
          </button>
        </div>

        {roomFromDb && (
          <div className="card card-compact bg-base-100 shadow-xl mx-auto m-4">
            <div className="card-body">
              <h2 className="card-title mx-auto">
                Topic: {roomFromDb.topicName}
              </h2>

              <ul className="p-0 mx-auto flex flex-row flex-wrap justify-center items-center text-ceter gap-4">
                {presenceData &&
                  presenceData
                    .filter(
                      (value, index, self) =>
                        index ===
                        self.findIndex(
                          (presenceItem) =>
                            presenceItem.clientId === value.clientId
                        )
                    )
                    .map((presenceItem) => {
                      return (
                        <li
                          key={presenceItem.clientId}
                          className="flex flex-row items-center justify-center gap-2"
                        >
                          <div className="w-10 rounded-full avatar mx-auto">
                            <Image
                              src={presenceItem.data.image}
                              alt={`${presenceItem.data.name}'s Profile Picture`}
                              height={32}
                              width={32}
                            />
                          </div>

                          <p className="flex flex-row flex-wrap text-center justify-center items-center gap-1 text-md mx-auto">
                            {presenceItem.data.name}{" "}
                            {presenceItem.data.isAdmin && (
                              <span
                                className="tooltip tooltip-primary"
                                data-tip="Admin"
                              >
                                <FaShieldAlt className="inline-block text-primary" />
                              </span>
                            )}{" "}
                            {presenceItem.data.isVIP && (
                              <span
                                className="tooltip tooltip-secondary"
                                data-tip="VIP"
                              >
                                <GiStarFormation className="inline-block text-secondary" />
                              </span>
                            )}{" "}
                            {presenceItem.clientId === roomFromDb.userId && (
                              <span
                                className="tooltip tooltip-warning"
                                data-tip="Room Owner"
                              >
                                <RiVipCrownFill className="inline-block text-yellow-500" />
                              </span>
                            )}
                            {" : "}
                          </p>

                          {roomFromDb &&
                            votesFromDb &&
                            voteString(
                              roomFromDb.visible,
                              votesFromDb,
                              presenceItem.data
                            )}
                        </li>
                      );
                    })}
              </ul>

              <div className="join md:btn-group-horizontal mx-auto">
                {roomFromDb.scale?.split(",").map((scaleItem, index) => {
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

        {!!roomFromDb &&
          (roomFromDb.userId === user?.id || isAdmin(user?.publicMetadata)) && (
            <>
              <div className="card card-compact bg-base-100 shadow-xl mx-auto m-4">
                <div className="card-body flex flex-col flex-wrap">
                  <h2 className="card-title mx-auto">Room Settings</h2>

                  <label className="label mx-auto">
                    {"Vote Scale (Comma Separated):"}{" "}
                  </label>

                  <input
                    type="text"
                    placeholder="Scale (Comma Separated)"
                    className="input input-bordered m-auto"
                    value={roomScale}
                    onChange={(event) => {
                      setRoomScale(event.target.value);
                    }}
                  />

                  <label className="label mx-auto">{"Topic Name:"} </label>

                  <input
                    type="text"
                    placeholder="Topic Name"
                    className="input input-bordered m-auto"
                    value={topicNameText}
                    onChange={(event) => {
                      setTopicNameText(event.target.value);
                    }}
                  />

                  <div className="flex flex-row flex-wrap text-center items-center justify-center gap-2">
                    <div>
                      <button
                        onClick={() =>
                          void setRoomHandler(!roomFromDb.visible, false)
                        }
                        className="btn btn-primary inline-flex"
                      >
                        {roomFromDb.visible ? (
                          <>
                            <IoEyeOffOutline className="text-xl mr-1" />
                            Hide
                          </>
                        ) : (
                          <>
                            <IoEyeOutline className="text-xl mr-1" />
                            Show
                          </>
                        )}
                      </button>
                    </div>

                    <div>
                      <button
                        onClick={() =>
                          void setRoomHandler(
                            false,
                            true,
                            roomFromDb.topicName === topicNameText ||
                              votesFromDb?.length === 0
                              ? false
                              : true
                          )
                        }
                        className="btn btn-primary inline-flex"
                        disabled={
                          [...new Set(roomScale.split(","))].filter(
                            (item) => item !== ""
                          ).length <= 1
                        }
                      >
                        {roomFromDb.topicName === topicNameText ||
                        votesFromDb?.length === 0 ? (
                          <>
                            <IoReloadOutline className="text-xl mr-1" /> Reset
                          </>
                        ) : (
                          <>
                            <IoSaveOutline className="text-xl mr-1" /> Save
                          </>
                        )}
                      </button>
                    </div>

                    {votesFromDb &&
                      (roomFromDb.logs.length > 0 ||
                        votesFromDb.length > 0) && (
                        <div>
                          <button
                            onClick={() => downloadLogs()}
                            className="btn btn-primary inline-flex hover:animate-pulse"
                          >
                            <>
                              <IoDownloadOutline className="text-xl" />
                            </>
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </>
          )}
      </span>
    );
    // Room does not exist
  } else {
    return <NoRoomUI />;
  }
};

export default VoteUI;
