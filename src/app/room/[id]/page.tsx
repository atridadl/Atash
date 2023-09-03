import { currentUser } from "@clerk/nextjs";
import Loading from "@/app/_components/Loading";
import VoteUI from "@/app/_components/VoteUI";

export const runtime = "edge";
export const preferredRegion = ["pdx1"];

export default async function Room() {
  const user = await currentUser();

  const shapedUser = {
    id: user?.id,
    firstName: user?.firstName,
    lastName: user?.lastName,
    imageUrl: user?.imageUrl,
    publicMetadata: user?.publicMetadata,
  };

  return (
    <div className="flex flex-col items-center justify-center text-center gap-2">
      {user ? <VoteUI user={shapedUser} /> : <Loading />}
    </div>
  );
}
