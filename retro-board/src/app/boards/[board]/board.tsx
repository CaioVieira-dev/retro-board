"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { MdOutlineDelete } from "react-icons/md";
import { FaArrowLeft, FaPencilAlt, FaRegSave } from "react-icons/fa";

export default function Board({ board }: { board: string }) {
  const [boardFromDb] = api.board.getBoard.useSuspenseQuery({
    boardId: board,
  });
  const [currentUserId] = api.board.myId.useSuspenseQuery();

  return (
    <>
      {boardFromDb &&
        Object.values(boardFromDb).map(({ columns }) =>
          Object.values(columns).map(({ cards, name, id }) => (
            <Column title={name} key={id} columnId={id}>
              <>
                {cards.map(({ content, id, userId }) => (
                  <Card
                    message={content}
                    cardId={id}
                    key={id}
                    createdBy={userId}
                    currentUserId={currentUserId}
                  />
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

function Card({
  message,
  cardId,
  createdBy,
  currentUserId,
}: {
  message: string;
  cardId: string;
  createdBy: string;
  currentUserId: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message);
  const utils = api.useUtils();
  const { mutate: remove } = api.board.removeMessage.useMutation({
    async onSuccess() {
      await utils.invalidate();
    },
  });
  const { mutate: edit } = api.board.editMessage.useMutation({
    async onSuccess() {
      setIsEditing(false);
      await utils.invalidate();
    },
  });

  const canEdit = useMemo(
    () => currentUserId === createdBy,
    [createdBy, currentUserId],
  );

  const removeMessage = useCallback(() => {
    remove({ card: cardId });
  }, [cardId, remove]);
  const editMessage = useCallback(() => {
    edit({ message: editedMessage, messageId: cardId });
  }, [cardId, edit, editedMessage]);

  if (canEdit && isEditing) {
    return (
      <div className="flex items-start justify-between bg-[#AAA3D4] px-4 py-2">
        <Button
          className="bg-[#3018B9] px-3 transition-colors hover:bg-[#180c5f] hover:text-white"
          variant="secondary"
          onClick={() => {
            setIsEditing(false);
            setEditedMessage(message);
          }}
        >
          <FaArrowLeft className="text-white" />
        </Button>
        <textarea
          name="editedMessage"
          id="editedMessage"
          value={editedMessage}
          onChange={(e) => setEditedMessage(e.target.value)}
          className="mx-2 w-full rounded border border-[#3018B9] bg-[#AAA3D4] px-4 py-2 outline-[#3018B9]"
        />
        <Button
          variant="ghost"
          onClick={() => editMessage()}
          className="bg-[#3018B9] hover:bg-[#180c5f]"
        >
          <FaRegSave className="text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between bg-[#AAA3D4] px-4 py-2">
      <span className="py-2">{message}</span>
      <div className="flex">
        {canEdit && (
          <Button
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="bg-transparent px-3 hover:bg-[#180c5f]"
          >
            <FaPencilAlt className="text-white" />
          </Button>
        )}
        <Button
          className="bg-transparent px-3 text-[#AE214E] transition-colors hover:text-white"
          variant="destructive"
          onClick={() => removeMessage()}
        >
          <MdOutlineDelete />
        </Button>
      </div>
    </div>
  );
}
