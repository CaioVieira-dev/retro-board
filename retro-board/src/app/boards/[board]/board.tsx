"use client";

import { useCallback, useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { MdOutlineDelete } from "react-icons/md";

export default function Board({ board }: { board: string }) {
  const [boardFromDb] = api.board.getBoard.useSuspenseQuery({
    boardId: board,
  });

  return (
    <>
      {boardFromDb &&
        Object.values(boardFromDb).map(({ columns }) =>
          Object.values(columns).map(({ cards, name, id }) => (
            <Column title={name} key={id} columnId={id}>
              <>
                {cards.map(({ content, id }) => (
                  <Card message={content} cardId={id} key={id} />
                ))}
              </>
            </Column>
          )),
        )}
    </>
  );
}

function Column({
  title,
  children,
  columnId,
}: {
  title: string;
  columnId: string;
  children: React.ReactNode;
}) {
  const [message, setMessage] = useState("");
  const utils = api.useUtils();
  const { mutate } = api.board.addMessage.useMutation({
    async onSuccess() {
      await utils.invalidate();
    },
  });

  const addMessage = useCallback(() => {
    mutate({ column: columnId, message });
    setMessage("");
  }, [columnId, message, mutate]);

  return (
    <div className="flex w-2/6 min-w-48 flex-col gap-4 rounded bg-[#7139DA] px-2 py-4">
      <h2 className="border-b-4 border-b-black/40 text-2xl">{title}</h2>
      <textarea
        name="message"
        id="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="rounded bg-[#AAA3D4] px-4 py-2"
      />
      <Button
        onClick={() => addMessage()}
        className="rounded bg-[#3018B9] px-4 py-2 hover:bg-[#180c5f]"
        variant="default"
      >
        Add message
      </Button>
      {children}
    </div>
  );
}

function Card({ message, cardId }: { message: string; cardId: string }) {
  const utils = api.useUtils();
  const { mutate } = api.board.removeMessage.useMutation({
    async onSuccess() {
      await utils.invalidate();
    },
  });

  const removeMessage = useCallback(() => {
    mutate({ card: cardId });
  }, [cardId, mutate]);

  return (
    <div className="flex items-start justify-between bg-[#AAA3D4] px-4 py-2">
      <span className="py-2">{message}</span>
      <Button
        className="bg-transparent text-[#AE214E] transition-colors hover:text-white"
        variant="destructive"
        onClick={() => removeMessage()}
      >
        <MdOutlineDelete />
      </Button>
    </div>
  );
}
