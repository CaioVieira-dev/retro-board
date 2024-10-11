import { TRPCError } from "@trpc/server";
import { eq, type InferSelectModel } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { boards, boardColumns, cards } from "~/server/db/schema";

const DEFAULT_BOARD_COLUMN_NAMES = ["Dúvidas", "Parar", "Continuar"];

export const boardRouter = createTRPCRouter({
  addMessage: publicProcedure
    .input(
      z.object({
        message: z.string(),
        column: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { column, message } = input;

      if (!column) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Provide a column next time",
          // optional: pass the original error to retain stack trace
          // cause: theError,
        });
      }

      await ctx.db.insert(cards).values({
        boardColumnId: column,
        content: message,
      });
    }),

  removeMessage: publicProcedure
    .input(
      z.object({
        card: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { card } = input;

      if (!card) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Provide a card next time",
          // optional: pass the original error to retain stack trace
          // cause: theError,
        });
      }

      await ctx.db.delete(cards).where(eq(cards.id, card));
    }),

  getBoard: publicProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { boardId } = input;
      const rows = await ctx.db
        .select()
        .from(boards)
        .where(eq(boards.id, boardId))
        .leftJoin(boardColumns, eq(boards.id, boardColumns.boardId))
        .leftJoin(cards, eq(boardColumns.id, cards.boardColumnId));

      type cardsType = InferSelectModel<typeof cards>;
      type boardColumnsTypes = InferSelectModel<typeof boardColumns>;
      type boardsType = InferSelectModel<typeof boards>;
      type resultType = Record<
        string,
        boardsType & {
          columns: Record<string, boardColumnsTypes & { cards: cardsType[] }>;
        }
      >;
      const result: resultType = {};

      for (const { board_columns, boards, cards } of rows) {
        if (boards?.id && !result?.[boards?.id]) {
          result[boards.id] = {
            ...boards,
            columns: {},
          };
        }

        const board = result[boards.id];

        if (
          board &&
          board_columns?.id &&
          !board?.columns?.[board_columns?.id]
        ) {
          board.columns[board_columns?.id] = {
            ...board_columns,
            cards: [],
          };
        }

        const column = board?.columns?.[board_columns?.id ?? ""];

        if (column?.cards && cards) {
          column.cards.push(cards);
        }
      }

      return result;
    }),

  createBoard: protectedProcedure.mutation(async ({ ctx }) => {
    const [board] = await ctx.db
      .insert(boards)
      .values({})
      .returning({ id: boards.id });

    if (!board) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "An unexpected error occurred, while creating the board please try again later.",
        // optional: pass the original error to retain stack trace
        // cause: theError,
      });
    }

    await ctx.db.insert(boardColumns).values(
      DEFAULT_BOARD_COLUMN_NAMES.map((colName) => ({
        boardId: board.id,
        name: colName,
      })),
    );

    return board.id;
  }),
});
