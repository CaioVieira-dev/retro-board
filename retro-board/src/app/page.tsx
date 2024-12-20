import Link from "next/link";

import { getServerAuthSession } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await getServerAuthSession();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <div className="flex flex-col items-center gap-2">
            <div className="grid grid-cols-1 gap-4 text-center">
              <p className="text-center text-2xl text-white">
                {session && <span>Logged in as {session.user?.name}</span>}
              </p>
              <Link
                href="/boards"
                className="rounded-full bg-white/10 py-3 font-semibold no-underline transition hover:bg-white/20"
              >
                Quadros
              </Link>
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="rounded-full bg-white/10 py-3 font-semibold no-underline transition hover:bg-white/20"
              >
                {session ? "Sair" : "Entrar"}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
