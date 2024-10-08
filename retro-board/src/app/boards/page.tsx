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
    <div className="">
      {error && (
        <div className="">
          Aconteceu um erro :( <div className="">{error}</div>
        </div>
      )}
      <label htmlFor="board">Board</label>
      <input
        type="text"
        name="board"
        value={board}
        onChange={(e) => setBoard(e.target.value)}
      />
      <button type="submit" onClick={createBoard}>
        {board ? "Ir para o quadro" : "Criar quadro"}
      </button>
    </div>
  );
}
