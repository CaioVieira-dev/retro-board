"use client";

import Link from "next/link";
import { FaArrowLeft, FaPencilAlt, FaRegCopy, FaRegSave } from "react-icons/fa";

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
import { useParams, usePathname } from "next/navigation";
import clsx from "clsx";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import { type Dispatch, type SetStateAction, useMemo, useState } from "react";

const defaultPathname = "/boards"; //TODO: constante temporaria

export function Navbar({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const { board } = useParams();

  return (
    <Sheet>
      <div
        className={clsx(
          "grid min-w-48 auto-cols-fr grid-cols-3 gap-4 self-center",
          {
            "w-full": pathname !== defaultPathname,
            "w-2/6": pathname === defaultPathname,
          },
        )}
      >
        {board ? (
          <NameAndCopy boardId={board as string} />
        ) : (
          <>
            <div className=""></div>
            <div className=""></div>
          </>
        )}
        <SheetTrigger className="place-self-end">
          <Avatar>
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

function NameAndCopy({ boardId }: { boardId: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [boardQuery] = api.board.getBoard.useSuspenseQuery({ boardId });

  const board = useMemo(() => {
    return Object.values(boardQuery)?.[0];
  }, [boardQuery]);

  console.log("board: ", boardQuery);

  return (
    <>
      <div className="">
        {board?.name && !isEditing ? (
          <>
            <span className="pe-2">{board?.name}</span>
            <Button onClick={() => setIsEditing(true)}>
              <FaPencilAlt />
            </Button>
          </>
        ) : (
          <EditarNomeQuadro boardId={boardId} setIsEditing={setIsEditing} />
        )}
      </div>
      <div className="place-self-center">
        <Button
          onClick={() => navigator?.clipboard?.writeText(window.location.href)}
        >
          <span className="px-2">Compartilhe o quadro</span> <FaRegCopy />
        </Button>
      </div>
    </>
  );
}

function EditarNomeQuadro({
  boardId,
  setIsEditing,
}: {
  boardId: string;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
}) {
  const [name, setName] = useState("");
  const util = api.useUtils();
  const { mutate } = api.board.updateBoardName.useMutation({
    onSuccess: async () => {
      await util.board.invalidate();
    },
  });

  return (
    <div className="flex w-full">
      <Button onClick={() => setIsEditing(false)}>
        <FaArrowLeft />
      </Button>
      <Input
        className="text-white placeholder:text-white/70"
        placeholder="Dê um nome legal para o quadro :)"
        type="text"
        name="name"
        onChange={(e) => setName(e.target.value)}
        value={name}
        required
      />
      <Button
        onClick={async () => {
          if (!name) {
            return;
          }

          mutate({ name, boardId });
          setIsEditing(false);
        }}
      >
        <FaRegSave />
      </Button>
    </div>
  );
}
