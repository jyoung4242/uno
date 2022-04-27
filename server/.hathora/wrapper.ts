import onChange from "on-change";
import { Context } from "./methods";
import { Method } from "../../api/base";
import {
  UserId,
  IInitializeRequest,
  IJoinGameRequest,
  IStartGameRequest,
  IPlayCardRequest,
  IDrawCardRequest,
} from "../../api/types";

let impl = new (await import("../impl")).Impl();
type State = ReturnType<typeof impl.initialize>;

export class ImplWrapper {
  private state: State;
  private _changedAt: number | undefined;
  constructor(ctx: Context, argsBuffer: ArrayBufferView) {
    monkeyPatchSideEffectFunctions(ctx);
    const state = impl.initialize(ctx, IInitializeRequest.decode(argsBuffer));
    restoreSideEffectFunctions();
    this.state = onChange(state, () => (this._changedAt = Date.now()));
  }
  public async getResult(userId: UserId, method: Method, ctx: Context, argsBuffer: ArrayBufferView) {
    await tryReloadImpl();
    monkeyPatchSideEffectFunctions(ctx);
    const res = this._getResult(userId, method, ctx, argsBuffer);
    restoreSideEffectFunctions();
    return res;
  }
  public async getUserState(userId: UserId) {
    await tryReloadImpl();
    return impl.getUserState(onChange.target(this.state), userId);
  }
  public changedAt(): number | undefined {
    const res = this._changedAt;
    this._changedAt = undefined;
    return res;
  }
  private _getResult(userId: UserId, method: Method, ctx: Context, argsBuffer: ArrayBufferView) {
    switch (method) {
      case Method.JOIN_GAME:
        return impl.joinGame(this.state, userId, ctx, IJoinGameRequest.decode(argsBuffer));
      case Method.START_GAME:
        return impl.startGame(this.state, userId, ctx, IStartGameRequest.decode(argsBuffer));
      case Method.PLAY_CARD:
        return impl.playCard(this.state, userId, ctx, IPlayCardRequest.decode(argsBuffer));
      case Method.DRAW_CARD:
        return impl.drawCard(this.state, userId, ctx, IDrawCardRequest.decode(argsBuffer));
    }
  }
}

let prevError = "";
async function tryReloadImpl() {
  try {
    impl = new (await import("../impl")).Impl();
    if (prevError !== "") {
      console.log("Successfully reloaded impl");
      prevError = "";
    }
  } catch (e) {
    const errorString = (e as any).toString();
    if (errorString !== prevError) {
      console.error("Error reloading impl: " + e);
      prevError = errorString;
    }
  }
}

const origMathRandom = Math.random;
const origDateNow = Date.now;

function monkeyPatchSideEffectFunctions(ctx: Context) {
  Math.random = () => (ctx.chance as any).random(); // @types/chance is missing the definition for random
  Date.now = () => ctx.time;
}

function restoreSideEffectFunctions() {
  Math.random = origMathRandom;
  Date.now = origDateNow;
}
