import { Methods, Context } from './.hathora/methods';
import { Response } from '../api/base';
import { Color, Card, PlayerState, UserId, IInitializeRequest, IJoinGameRequest, IStartGameRequest, IPlayCardRequest, IDrawCardRequest } from '../api/types';

type InternalState = PlayerState;

export class Impl implements Methods<InternalState> {
    initialize(ctx: Context, userId: UserId, request: IInitializeRequest): InternalState {
        return {
            hand: [],
            players: [],
            turn: userId,
            pile: undefined,
            winner: undefined,
        };
    }
    joinGame(state: InternalState, userId: UserId, ctx: Context, request: IJoinGameRequest): Response {
        return Response.error('Not implemented');
    }
    startGame(state: InternalState, userId: UserId, ctx: Context, request: IStartGameRequest): Response {
        return Response.error('Not implemented');
    }
    playCard(state: InternalState, userId: UserId, ctx: Context, request: IPlayCardRequest): Response {
        return Response.error('Not implemented');
    }
    drawCard(state: InternalState, userId: UserId, ctx: Context, request: IDrawCardRequest): Response {
        return Response.error('Not implemented');
    }
    getUserState(state: InternalState, userId: UserId): PlayerState {
        return state;
    }
}
