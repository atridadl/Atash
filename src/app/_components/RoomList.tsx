"use client";

import Link from "next/link";
import { configureAbly, useChannel } from "@ably-labs/react-hooks";
import { useEffect, useState } from "react";
import { IoEnterOutline, IoTrashBinOutline } from "react-icons/io5";
import { env } from "~/env.mjs";
import { useUser, useOrganization } from "@clerk/nextjs";
import { trpc } from "../_trpc/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const RoomList = () => {
  const { isSignedIn, user } = useUser();
  const { organization } = useOrganization();

  configureAbly({
    key: env.NEXT_PUBLIC_ABLY_PUBLIC_KEY,
    clientId: user?.id,
    recover: (_, cb) => {
      cb(true);
    },
  });

  useChannel(
    `${env.NEXT_PUBLIC_APP_ENV}-${organization ? organization.id : user?.id}`,
    () => void refetchRoomsFromDb()
  );

  const [roomName, setRoomName] = useState<string>("");

  const { data: roomsFromDb, refetch: refetchRoomsFromDb } =
    trpc.room.getAll.useQuery(undefined, {
      enabled: isSignedIn,
    });

  const createRoom = trpc.room.create.useMutation({});

  const createRoomHandler = () => {
    createRoom.mutate({ name: roomName });
    setRoomName("");
    (document.querySelector("#roomNameInput") as HTMLInputElement).value = "";
    (document.querySelector("#new-room-modal") as HTMLInputElement).checked =
      false;
  };

  const deleteRoom = trpc.room.delete.useMutation({});

  const deleteRoomHandler = (roomId: string) => {
    if (isSignedIn) {
      deleteRoom.mutate({ id: roomId });
    }
  };

  useEffect(() => {
    void refetchRoomsFromDb();
  }, [organization]);

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      {/* Modal for Adding Rooms */}
      <input type="checkbox" id="new-room-modal" className="modal-toggle" />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box flex-col flex text-center justify-center items-center">
          <label
            htmlFor="new-room-modal"
            className="btn btn-sm btn-circle absolute right-2 top-2"
          >
            ✕
          </label>

          <h3 className="font-bold text-lg">Create a new room!</h3>

          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text">Room Name</span>
            </label>
            <input
              id="roomNameInput"
              type="text"
              placeholder="Type here"
              className="input input-bordered w-full max-w-xs"
              onChange={(event) => {
                setRoomName(event.target.value);
              }}
            />
          </div>

          <div className="modal-action">
            {roomName.length > 0 && (
              <label
                htmlFor="new-room-modal"
                className="btn btn-primary"
                onClick={() => createRoomHandler()}
              >
                Submit
              </label>
            )}
          </div>
        </div>
      </div>

      {roomsFromDb && roomsFromDb.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table text-center">
            {/* head */}
            <thead>
              <tr className="border-white">
                <th>Room Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="">
              {roomsFromDb?.map((room) => {
                return (
                  <tr key={room.id} className="hover border-white">
                    <td className="break-all max-w-[200px] md:max-w-[400px]">
                      {room.roomName}
                    </td>
                    <td>
                      <Link
                        className="m-2 no-underline"
                        href={`/room/${room.id}`}
                      >
                        <IoEnterOutline className="text-xl inline-block hover:text-secondary" />
                      </Link>

                      <button
                        className="m-2"
                        onClick={() => deleteRoomHandler(room.id)}
                      >
                        <IoTrashBinOutline className="text-xl inline-block hover:text-error" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <label htmlFor="new-room-modal" className="btn btn-secondary">
        New Room
      </label>

      {roomsFromDb === undefined && (
        <div className="flex items-center justify-center">
          <span className="loading loading-dots loading-lg"></span>
        </div>
      )}
    </div>
  );
};

export default RoomList;
