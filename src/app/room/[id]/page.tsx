import VoteUI from "@/app/_components/VoteUI";

export const runtime = "edge";
export const preferredRegion = ["pdx1"];
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function Room() {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-2">
      <VoteUI />
    </div>
  );
}
