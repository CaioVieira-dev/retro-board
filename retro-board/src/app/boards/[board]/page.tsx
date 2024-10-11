import Board from "./board";

export default async function Page({ params }: { params: { board: string } }) {
  return <Board board={params.board} />;
}
