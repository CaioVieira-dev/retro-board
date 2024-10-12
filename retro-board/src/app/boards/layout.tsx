import { HydrateClient } from "~/trpc/server";
import { Navbar } from "./navbar";
import { getServerAuthSession } from "~/server/auth";

export default async function BoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  return (
    <main className="flex min-h-screen items-start justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <section className="container flex grow flex-col content-center gap-4 px-4 py-12 text-white">
        <HydrateClient>
          <Navbar session={session} />
          {children}
        </HydrateClient>
      </section>
    </main>
  );
}
