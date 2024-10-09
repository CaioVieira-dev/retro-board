import { HydrateClient } from "~/trpc/server";

export default async function BoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-start justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <section className="container flex items-start justify-center gap-4 px-4 py-12 text-white">
        <HydrateClient>{children}</HydrateClient>
      </section>
    </main>
  );
}
