"use client";

import Link from "next/link";
import { FaArrowLeft, FaPencilAlt, FaRegCopy, FaRegSave } from "react-icons/fa";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
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
        <SheetDescription className="flex flex-col gap-4 pt-4 text-white">
          <MyBoards />
        </SheetDescription>

        <SheetFooter className="pt-8">
          <SheetClose asChild>
            <Link
              href={session ? "/api/auth/signout" : "/api/auth/signin"}
              className="bg-btnPrimary hover:bg-btnPrimaryHover w-full rounded px-10 py-3 text-center font-semibold no-underline transition"
            >
              {session ? "Sign out" : "Sign in"}
            </Link>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function MyBoards() {
  const [allMyBoards] = api.board.getAllMyBoards.useSuspenseQuery();

  return (
    <>
      {allMyBoards.map(({ id, name }, index) => (
        <SheetClose asChild key={id}>
          <Link
            href={`/boards/${id}`}
            className="bg-btnPrimary hover:bg-btnPrimaryHover w-full rounded px-10 py-3 text-center font-semibold no-underline transition"
          >
            {name ? name : `Quadro sem nome ${index + 1}`}
          </Link>
        </SheetClose>
      ))}
    </>
  );
}

function NameAndCopy({ boardId }: { boardId: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [boardQuery] = api.board.getBoard.useSuspenseQuery({ boardId });

  const board = useMemo(() => {
    return Object.values(boardQuery)?.[0];
  }, [boardQuery]);

  return (
    <>
      <div className="">
        {board?.name && !isEditing ? (
          <>
            <span className="pe-2">{board?.name}</span>
            <Button onClick={() => setIsEditing(true)} size="icon">
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
      <Button onClick={() => setIsEditing(false)} size="icon">
        <FaArrowLeft />
      </Button>
      <Input
        className="mx-2 text-white placeholder:text-white/70"
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
        size="icon"
      >
        <FaRegSave />
      </Button>
    </div>
  );
}
