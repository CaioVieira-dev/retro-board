"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { MdOutlineDelete } from "react-icons/md";
import { FaArrowLeft, FaPencilAlt, FaRegSave } from "react-icons/fa";
import { Input } from "~/components/ui/input";

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
  const [editedTitle, setEditedTitle] = useState(title);
  const [isEditing, setIsEditing] = useState(false);
  const utils = api.useUtils();
  const { mutate: createMessage } = api.board.addMessage.useMutation({
    async onSuccess() {
      await utils.invalidate();
    },
  });
  const { mutate: editColumnTitle } = api.board.editColumnTitle.useMutation({
    async onSuccess() {
      setIsEditing(false);
      await utils.invalidate();
    },
  });

  const addMessage = useCallback(() => {
    createMessage({ column: columnId, message });
    setMessage("");
  }, [columnId, message, createMessage]);
  const editTitle = useCallback(() => {
    editColumnTitle({ columnId, title: editedTitle });
  }, [columnId, editColumnTitle, editedTitle]);

  return (
    <div className="flex w-2/6 min-w-48 flex-col gap-4 rounded bg-[#7139DA] px-2 py-4">
      <div className="flex items-center justify-between border-b-4 border-b-black/40 pb-2">
        {isEditing ? (
          <>
            <Button
              className="bg-[#3018B9] px-3 transition-colors hover:bg-[#180c5f] hover:text-white"
              variant="secondary"
              onClick={() => {
                setIsEditing(false);
                setEditedTitle(title);
              }}
            >
              <FaArrowLeft className="text-white" />
            </Button>
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="mx-2 w-full"
            />
            <Button
              variant="ghost"
              onClick={() => editTitle()}
              className="bg-[#3018B9] px-3 hover:bg-[#180c5f]"
              size="icon"
            >
              <FaRegSave className="text-white" />
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-2xl">{title}</h2>
            <Button
              variant="ghost"
              className="bg-[#3018B9] px-3 hover:bg-[#180c5f]"
              size="icon"
              onClick={() => setIsEditing(true)}
            >
              <FaPencilAlt className="text-white" />
            </Button>
          </>
        )}
      </div>
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
      <div className="flex flex-col gap-4 bg-[#AAA3D4] px-2 py-2">
        <div className="flex justify-between">
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
          <Button
            variant="ghost"
            onClick={() => editMessage()}
            className="bg-[#3018B9] px-3 hover:bg-[#180c5f]"
            size="icon"
          >
            <FaRegSave className="text-white" />
          </Button>
        </div>
        <textarea
          name="editedMessage"
          id="editedMessage"
          value={editedMessage}
          onChange={(e) => setEditedMessage(e.target.value)}
          className="w-full rounded border border-[#3018B9] bg-[#AAA3D4] px-4 py-2 outline-[#3018B9]"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#AAA3D4] px-2 py-2">
      <div className="flex justify-between">
        {canEdit && (
          <Button
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="bg-transparent hover:bg-[#180c5f]"
            size="icon"
          >
            <FaPencilAlt className="text-white" />
          </Button>
        )}
        <Button
          className="bg-transparent text-[#AE214E] transition-colors hover:text-white"
          variant="destructive"
          onClick={() => removeMessage()}
          size="icon"
        >
          <MdOutlineDelete />
        </Button>
      </div>
      <span className="px-2 py-2">{message}</span>
    </div>
  );
}
