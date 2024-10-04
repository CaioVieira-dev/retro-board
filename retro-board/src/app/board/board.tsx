"use client";

import { useCallback } from "react";
import { api } from "~/trpc/react";

export default function Board() {
  const [board] = api.board.getBoard.useSuspenseQuery();
  console.log(board);

  return (
    <main className="flex min-h-screen items-start justify-center gap-4 bg-gradient-to-b from-[#2e026d] to-[#15162c] px-4 py-12 text-white">
      {board &&
        Object.entries(board).map(([column, messages]) => (
          <Column title={column} key={column}>
            <>
              {messages.map((message, index) => (
                <Card message={message} key={`${message}=${index}`} />
              ))}
            </>
          </Column>
        ))}
    </main>
  );
}

function Column({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const utils = api.useUtils();
  const { mutate } = api.board.addMessage.useMutation({
    async onSuccess() {
      await utils.invalidate();
    },
  });

  const addMessage = useCallback(
    () => mutate({ column: title, message: "teste" }),
    [mutate, title],
  );

  return (
    <div className="flex min-h-full min-w-48 flex-col gap-4 bg-red-900 px-2 py-4">
      <h2 className="border-b-4 border-b-black/40 text-2xl">{title}</h2>
      <button onClick={() => addMessage()}>add message</button>
      {children}
    </div>
  );
}

function Card({ message }: { message: string }) {
  return <div className="">{message}</div>;
}
