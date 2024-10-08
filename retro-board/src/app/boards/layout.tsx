import { HydrateClient } from "~/trpc/server";

export default async function BoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HydrateClient>{children}</HydrateClient>;
}
