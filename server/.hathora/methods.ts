import { Chance } from "chance";
import { Response } from "../../api/base";
import {
  UserId,
  PlayerState as UserState,
  IInitializeRequest,
  IJoinGameRequest,
  IStartGameRequest,
  IPlayCardRequest,
  IDrawCardRequest,
} from "../../api/types";

export interface Context {
  chance: ReturnType<typeof Chance>;
  time: number;
  sendEvent: (event: string, to: UserId) => void;
  broadcastEvent: (event: string) => void;
}

export interface Methods<T> {
  initialize(ctx: Context, request: IInitializeRequest): T;
  joinGame(state: T, userId: UserId, ctx: Context, request: IJoinGameRequest): Response;
  startGame(state: T, userId: UserId, ctx: Context, request: IStartGameRequest): Response;
  playCard(state: T, userId: UserId, ctx: Context, request: IPlayCardRequest): Response;
  drawCard(state: T, userId: UserId, ctx: Context, request: IDrawCardRequest): Response;
  getUserState(state: T, userId: UserId): UserState;
}
