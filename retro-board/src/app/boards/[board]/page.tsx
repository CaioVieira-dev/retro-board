import Board from "./board";

export default async function Page({ params }: { params: { board: string } }) {
  return (
    <div className="flex gap-4">
      <Board board={params.board} />
    </div>
  );
}
