"use client";

import Link from "next/link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { type Session } from "next-auth";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const defaultPathname = "/boards"; //TODO: constante temporaria

export function Navbar({ session }: { session: Session | null }) {
  const pathname = usePathname();
  console.log("pathname: ", pathname);

  return (
    <Sheet>
      <div
        className={clsx("flex min-w-48 flex-col items-end self-center", {
          "w-full": pathname !== defaultPathname,
          "w-2/6": pathname === defaultPathname,
        })}
      >
        <SheetTrigger>
          <Avatar className="">
            <AvatarImage src={session?.user?.image ?? ""} />
            <AvatarFallback>
              {session?.user?.name?.substring?.(0, 2).toUpperCase() ?? "SN"}
            </AvatarFallback>
          </Avatar>
        </SheetTrigger>
      </div>

      <SheetContent className="border-l-0 bg-[#7139DA] text-white">
        <SheetHeader>
          <SheetTitle className="text-white">
            Logado como {session?.user?.name ?? "SN"}
          </SheetTitle>
        </SheetHeader>

        <SheetFooter className="pt-8">
          <SheetClose asChild>
            <Link
              href={session ? "/api/auth/signout" : "/api/auth/signin"}
              className="w-full rounded bg-white/10 px-10 py-3 text-center font-semibold no-underline transition hover:bg-white/20"
            >
              {session ? "Sign out" : "Sign in"}
            </Link>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
