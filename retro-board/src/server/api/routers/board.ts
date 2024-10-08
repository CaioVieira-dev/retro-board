import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { boards, boardColumns, cards } from "~/server/db/schema";

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

  getLatestBoardFromDb: publicProcedure.query(async ({ ctx }) => {
    const board = await ctx.db.query.boards.findFirst({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });

    return board ?? null;
  }),

  createBoard: protectedProcedure.mutation(async ({ ctx }) => {
    const [resultado] = await ctx.db
      .insert(boards)
      .values({})
      .returning({ id: boards.id });

    if (!resultado) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "An unexpected error occurred, while creating the board please try again later.",
        // optional: pass the original error to retain stack trace
        // cause: theError,
      });
    }

    return resultado.id;
  }),
});
