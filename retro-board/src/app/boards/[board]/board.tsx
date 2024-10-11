"use client";

import { useCallback, useState } from "react";
import { api } from "~/trpc/react";

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
      <button
        onClick={() => addMessage()}
        className="rounded bg-[#3018B9] px-4 py-2"
      >
        Add message
      </button>
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
      <span className="">{message}</span>
      <button className="text-[#AE214E]" onClick={() => removeMessage()}>
        X
      </button>
    </div>
  );
}
