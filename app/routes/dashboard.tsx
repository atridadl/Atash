import { getAuth } from "@clerk/remix/ssr.server";
import { type LoaderFunction, redirect } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { LogInIcon, ShieldIcon, StarIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import LoadingIndicator from "~/components/LoadingIndicator";
import { useEventSource } from "remix-utils/sse/react";
import { ClerkLoaded, ClerkLoading, useUser } from "@clerk/remix";
import { isAdmin, isVIP } from "~/services/helpers.client";

export const loader: LoaderFunction = async (args) => {
  const { userId } = await getAuth(args);

  if (!userId) {
    return redirect("/sign-in");
  }

  if (userId) return {};
};

type RoomsResponse =
  | {
      id: string;
      createdAt: Date;
      roomName: string;
    }[]
  | {
      roomName: string | null;
      id: string;
      created_at: Date | null;
      userId: string;
      storyName: string | null;
      visible: boolean;
      scale: string;
    }[]
  | null
  | undefined;

export default function Dashboard() {
  return (
    <>
      <ClerkLoaded>
        <DashboardContent />
      </ClerkLoaded>
      <ClerkLoading>
        <LoadingIndicator />
      </ClerkLoading>
    </>
  );
}

function DashboardContent() {
  const { user, isLoaded } = useUser();
  let roomsFromDb = useEventSource("/api/room/get/all", { event: user?.id });

  let roomsFromDbParsed = JSON.parse(roomsFromDb!) as RoomsResponse;

  const [roomName, setRoomName] = useState<string>("");

  const createRoomHandler = async () => {
    await fetch("/api/room/create", {
      cache: "no-cache",
      method: "POST",
      body: JSON.stringify({ name: roomName }),
    });

    setRoomName("");
    (document.querySelector("#roomNameInput") as HTMLInputElement).value = "";
    (document.querySelector("#new-room-modal") as HTMLInputElement).checked =
      false;
  };

  const deleteRoomHandler = async (roomId: string) => {
    await fetch(`/api/room/delete/${roomId}`, {
      cache: "no-cache",
      method: "DELETE",
    });
  };

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
                onClick={() => void createRoomHandler()}
              >
                Submit
              </label>
            )}
          </div>
        </div>
      </div>

      <h1 className="flex flex-row flex-wrap text-center justify-center items-center gap-1 text-4xl font-bold">
        Hi, {user?.firstName ?? user?.username}!{" "}
        {isAdmin(user?.publicMetadata) && (
          <ShieldIcon className="inline-block text-primary" />
        )}
        {isVIP(user?.publicMetadata) && (
          <StarIcon className="inline-block text-secondary" />
        )}
      </h1>

      {roomsFromDbParsed && roomsFromDbParsed.length > 0 && (
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
              {roomsFromDbParsed?.map((room) => {
                return (
                  <tr key={room.id} className="hover border-white">
                    <td className="break-all max-w-[200px] md:max-w-[400px]">
                      {room.roomName}
                    </td>
                    <td>
                      <Link
                        className="m-2 no-underline"
                        to={`/room/${room.id}`}
                      >
                        <LogInIcon className="text-xl inline-block hover:text-primary" />
                      </Link>

                      <button
                        className="m-2"
                        onClick={() => void deleteRoomHandler(room.id)}
                      >
                        <TrashIcon className="text-xl inline-block hover:text-error" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <label htmlFor="new-room-modal" className="btn btn-primary">
        New Room
      </label>

      {(!roomsFromDbParsed || !isLoaded) && <LoadingIndicator />}
    </div>
  );
}
