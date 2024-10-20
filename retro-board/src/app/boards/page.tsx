"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { MdOutlineDelete } from "react-icons/md";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";

export default function Page() {
  const router = useRouter();
  const [boardName, setBoardName] = useState("");
  const [boardColumn, setBoardColumn] = useState("");
  const [boardColumns, setBoardColumns] = useState<string[]>([]);
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
    return mutate({ columns: boardColumns, name: boardName });
  }, [boardColumns, boardName, mutate]);

  const addColumn = useCallback(() => {
    if (boardColumn) {
      setBoardColumns((prev) => [...prev, boardColumn]);
      setBoardColumn("");
    }
  }, [boardColumn]);

  return (
    <div className="flex w-2/6 min-w-48 flex-col gap-4 self-center rounded bg-[#7139DA] p-4 text-white">
      {error && (
        <div className="">
          Aconteceu um erro :( <div className="">{error}</div>
        </div>
      )}
      <div className="flex flex-col gap-4">
        <div className="">
          <label htmlFor="boardName">Nome do quadro</label>
          <Input
            name="boardName"
            id="boardName"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
          />
        </div>
        <div className="">
          <label htmlFor="boardColumn">Colunas</label>
          <div className="flex">
            <Input
              name="boardColumn"
              value={boardColumn}
              onChange={(e) => setBoardColumn(e.target.value)}
            />
            <Button onClick={() => addColumn()}>
              <FaPlus />
            </Button>
          </div>
        </div>
        <div className="">
          <ul className="flex flex-col gap-2">
            {boardColumns.map((column, index) => (
              <li
                className="flex items-center justify-between gap-2 rounded border px-4 py-2"
                key={`${column}-${index}`}
              >
                {column}
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() =>
                    setBoardColumns((prev) =>
                      prev.filter((_, i) => i !== index),
                    )
                  }
                >
                  <MdOutlineDelete />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Button onClick={() => createBoard()}>Criar quadro</Button>
    </div>
  );
}
