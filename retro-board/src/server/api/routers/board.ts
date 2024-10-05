import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const boardSchema = z.map(z.string(), z.array(z.string()));
type boardType = z.infer<typeof boardSchema>;
const board: boardType = new Map([
  ["Dúvidas", []],
  ["Parar", []],
  ["Continuar", []],
]);

export const boardRouter = createTRPCRouter({
  addMessage: publicProcedure
    .input(
      z.object({
        message: z.string(),
        column: z.string(),
      }),
    )
    .mutation(({ input }) => {
      const { column, message } = input;

      if (board.has(column)) {
        const oldMessages = board.get(column);
        board.set(column, [...(oldMessages ?? []), message]);
      }
      return board;
    }),
  removeMessage: publicProcedure
    .input(
      z.object({
        message: z.string(),
        column: z.string(),
      }),
    )
    .mutation(({ input }) => {
      const { column, message } = input;

      if (board.has(column)) {
        const oldMessages = board.get(column) ?? [];
        const newMessages = oldMessages.filter((val) => val !== message);
        board.set(column, newMessages);
      }
      return board;
    }),
  getBoard: publicProcedure.query(() => {
    return Object.fromEntries(board.entries());
  }),
});
