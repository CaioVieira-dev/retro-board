"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { api } from "~/trpc/react";

export default function Page() {
  const router = useRouter();
  const [board, setBoard] = useState("");
  const [error, setError] = useState("");
  const { mutate } = api.board.createBoard.useMutation({
    onSuccess(id) {
      router.push(`/boards/${id}`);
    },
    onError(err) {
      setError(err.message);
    },
  });

  const createBoard = useCallback(() => {
    if (board) {
      return router.push(`/boards/${board}`);
    }

    return mutate();
  }, [board, mutate, router]);

  return (
    <div className="flex w-2/6 min-w-48 flex-col gap-4 self-center rounded bg-[#7139DA] p-4 text-white">
      {error && (
        <div className="">
          Aconteceu um erro :( <div className="">{error}</div>
        </div>
      )}
      <label htmlFor="board">Quadro:</label>
      <input
        type="text"
        name="board"
        value={board}
        onChange={(e) => setBoard(e.target.value)}
        className="rounded bg-[#AAA3D4] px-4 py-2"
      />
      <button type="submit" onClick={createBoard}>
        {board ? "Ir para o quadro" : "Criar quadro"}
      </button>
    </div>
  );
}
