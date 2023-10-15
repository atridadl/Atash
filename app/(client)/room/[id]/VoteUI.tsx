"use client";

import { EventTypes } from "@/_utils/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import LoadingIndicator from "@/_components/LoadingIndicator";
import type { PresenceItem, RoomResponse, VoteResponse } from "@/_utils/types";
import { useUser } from "@clerk/nextjs";
import { useChannel, usePresence } from "ably/react";
import { isAdmin, isVIP, jsonToCsv } from "app/_utils/helpers";
import { env } from "env.mjs";
import { useParams } from "next/navigation";
import { FaShieldAlt } from "react-icons/fa";
import { GiStarFormation } from "react-icons/gi";
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
import { RiVipCrownFill } from "react-icons/ri";
import NoRoomUI from "./NoRoomUI";

const VoteUI = () => {
  // State
  // =================================
  const params = useParams();
  const roomId = params?.id as string;
  const { user } = useUser();
  const [topicNameText, setTopicNameText] = useState<string>("");
  const [roomScale, setRoomScale] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const {
    data: roomFromDb,
    isLoading: roomFromDbLoading,
  } = useQuery({
    queryKey: ["room"],
    queryFn: getRoomHandler,
    retry: false,
  });

  const { data: votesFromDb } = useQuery({
    queryKey: ["votes"],
    queryFn: getVotesHandler,
  });

  const { mutate: setVote } = useMutation({
    mutationFn: setVoteHandler,
    // When mutate is called:
    onMutate: async (newVote) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["votes"] });

      // Snapshot the previous value
      const previousVotes = queryClient.getQueryData(["votes"]);

      // Optimistically update to the new value
      queryClient.setQueryData<VoteResponse>(["votes"], (old) =>
        old?.map((vote) => {
          if (vote.userId === user?.id) {
            return {
              ...vote,
              value: newVote,
            };
          } else {
            return vote;
          }
        })
      );

      // Return a context object with the snapshotted value
      return { previousVotes };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, newVote, context) => {
      queryClient.setQueryData(["votes"], context?.previousVotes);
    },
    // Always refetch after error or success:
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["votes"] });
    },
  });

  const { mutate: setRoom } = useMutation({
    mutationFn: setRoomHandler,
    // When mutate is called:
    onMutate: async (data: {
      visible: boolean;
      reset: boolean;
      log: boolean;
    }) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["room"] });

      // Snapshot the previous value
      const previousRoom = queryClient.getQueryData(["room"]);

      // Optimistically update to the new value
      queryClient.setQueryData<RoomResponse>(["room"], (old) => {
        return old?.created_at || old?.orgId || old?.id || old?.userId
          ? {
              roomName: old?.roomName,
              created_at: old?.created_at,
              orgId: old?.orgId,
              id: old?.id,
              userId: old?.userId,
              logs: old?.logs,
              topicName: topicNameText,
              visible: data.visible,
              scale: roomScale,
              reset: data.reset,
              log: data.log,
            }
          : old;
      });

      // Return a context object with the snapshotted value
      return { previousRoom };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["room"], context?.previousRoom);
    },
    // Always refetch after error or success:
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["room"] });
    },
  });

  // Handlers
  // =================================
  async function getRoomHandler() {
    const response = await fetch(`/api/internal/room/${roomId}`, {
      cache: "no-cache",
      method: "GET",
    });

    return (await response.json()) as RoomResponse;
  }

  async function getVotesHandler() {
    const dbVotesResponse = await fetch(`/api/internal/room/${roomId}/votes`, {
      cache: "no-cache",
      method: "GET",
    });
    const dbVotes = (await dbVotesResponse.json()) as VoteResponse;
    return dbVotes;
  }

  async function setVoteHandler(value: string) {
    if (roomFromDb) {
      await fetch(`/api/internal/room/${roomId}/vote`, {
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
      await fetch(`/api/internal/room/${roomId}`, {
        cache: "no-cache",
        method: "PUT",
        body: JSON.stringify({
          name: topicNameText,
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
        votesFromDb && votesFromDb.find((vote) => vote.userId === user?.id)
      );
    } else {
      return null;
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
        return <IoHourglassOutline className="text-xl text-error" />;
      }
    } else if (!!matchedVote) {
      return <IoCheckmarkCircleOutline className="text-xl text-success" />;
    } else {
      return (
        <IoHourglassOutline className="text-xl animate-spin text-warning" />
      );
    }
  };

  // Hooks
  // =================================
  useChannel(
    {
      channelName: `${env.NEXT_PUBLIC_APP_ENV}-${roomId}`,
    },
    ({ name }: { name: string }) => {
      if (name === EventTypes.ROOM_UPDATE) {
        void queryClient.invalidateQueries({ queryKey: ["votes"] });
        void queryClient.invalidateQueries({ queryKey: ["room"] });
      } else if (name === EventTypes.VOTE_UPDATE) {
        void queryClient.invalidateQueries({ queryKey: ["votes"] });
      }
    }
  );

  const { presenceData } = usePresence<PresenceItem>(
    `${env.NEXT_PUBLIC_APP_ENV}-${roomId}`,
    {
      name: (user?.fullName ?? user?.username) || "",
      image: user?.imageUrl || "",
      client_id: user?.id || "unknown",
      isAdmin: isAdmin(user?.publicMetadata),
      isVIP: isVIP(user?.publicMetadata),
    }
  );

  useEffect(() => {
    if (roomFromDb) {
      setTopicNameText(roomFromDb.topicName || "");
      setRoomScale(roomFromDb.scale || "ERROR");
    } else {
      void getRoomHandler();
      void getVotesHandler();
    }
  }, [roomFromDb, roomId, user]);

  // UI
  // =================================
  // Room is loading
  if (roomFromDbLoading) {
    return <LoadingIndicator />;
    // Room has been loaded
  } else {
    return roomFromDb ? (
      <div className="flex flex-col gap-4 text-center justify-center items-center">
        <div className="text-2xl">{roomFromDb.roomName}</div>
        <div className="flex flex-row flex-wrap text-center justify-center items-center gap-1 text-md">
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
          <div className="card card-compact bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mx-auto">
                Topic: {roomFromDb.topicName}
              </h2>

              <ul className="p-0 flex flex-row flex-wrap justify-center items-center text-ceter gap-4">
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
                          <div className="w-10 rounded-full avatar">
                            <Image
                              src={presenceItem.data.image}
                              alt={`${presenceItem.data.name}'s Profile Picture`}
                              height={32}
                              width={32}
                            />
                          </div>

                          <p className="flex flex-row flex-wrap text-center justify-center items-center gap-1 text-md">
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
                      onClick={() => void setVote(scaleItem)}
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

                  <label className="label">{"Topic Name:"} </label>

                  <input
                    type="text"
                    placeholder="Topic Name"
                    className="input input-bordered"
                    value={topicNameText}
                    onChange={(event) => {
                      setTopicNameText(event.target.value);
                    }}
                  />

                  <div className="flex flex-row flex-wrap text-center items-center justify-center gap-2">
                    <div>
                      <button
                        onClick={() =>
                          void setRoom({
                            visible: !roomFromDb.visible,
                            reset: false,
                            log: false,
                          })
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
                          void setRoom({
                            visible: false,
                            reset: true,
                            log:
                              roomFromDb.topicName === topicNameText ||
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
      </div>
    ) : (
      <NoRoomUI />
    );
  }
};

export default VoteUI;
