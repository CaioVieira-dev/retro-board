import { HydrateClient } from "~/trpc/server";
import Board from "./board";

export default async function Page() {
  return (
    <HydrateClient>
      <Board />;
    </HydrateClient>
  );
}
