import WebSocket from "isomorphic-ws";
// @ts-ignore
import getRandomValues from "get-random-values";
import axios from "axios";
import jwtDecode from "jwt-decode";
import { Reader, Writer } from "bin-serde";
import { UserData, Response, Method, COORDINATOR_HOST } from "../../api/base";
import {
  decodeStateSnapshot,
  decodeStateUpdate,
  PlayerState as UserState,
  IInitializeRequest,
  IJoinGameRequest,
  IStartGameRequest,
  IPlayCardRequest,
  IDrawCardRequest,
} from "../../api/types";
import { ConnectionFailure, transformCoordinatorFailure } from "./failures";
import { computePatch } from "./patch";

export type StateId = string;
export type UpdateArgs = { stateId: StateId; state: UserState; updatedAt: number; events: string[] };

export class HathoraClient {
  public appId = "4f8a55d436f49a3bbf2f9df47b6455aed1137c7a4a93bbf46ca1baf0ed586618";

  public static getUserFromToken(token: string): UserData {
    return jwtDecode(token);
  }

  public async loginAnonymous(): Promise<string> {
    const res = await axios.post(`https://${COORDINATOR_HOST}/${this.appId}/login/anonymous`);
    return res.data.token;
  }

  public async create(token: string, request: IInitializeRequest): Promise<string> {
    const res = await axios.post(
      `https://${COORDINATOR_HOST}/${this.appId}/create`,
      IInitializeRequest.encode(request).toBuffer(),
      { headers: { Authorization: token, "Content-Type": "application/octet-stream" } }
    );
    return res.data.stateId;
  }

  public connect(
    token: string,
    stateId: StateId,
    onUpdate: (updateArgs: UpdateArgs) => void,
    onConnectionFailure: (failure: ConnectionFailure) => void
  ): HathoraConnection {
    const socket = new WebSocket(`wss://${COORDINATOR_HOST}/${this.appId}`);
    socket.binaryType = "arraybuffer";
    socket.onclose = (e) => onConnectionFailure(transformCoordinatorFailure(e));
    socket.onopen = () =>
      socket.send(
        new Writer()
          .writeUInt8(0)
          .writeString(token)
          .writeUInt64([...stateId].reduce((r, v) => r * 36n + BigInt(parseInt(v, 36)), 0n))
          .toBuffer()
      );
    return new HathoraConnection(stateId, socket, onUpdate);
  }
}

export class HathoraConnection {
  private callbacks: Record<string, (response: Response) => void> = {};
  private state?: UserState = undefined;
  private changedAt = 0;

  public constructor(public stateId: StateId, private socket: WebSocket, onUpdate: (updateArgs: UpdateArgs) => void) {
    socket.onmessage = ({ data }) => {
      const reader = new Reader(new Uint8Array(data as ArrayBuffer));
      const type = reader.readUInt8();
      if (type === 0) {
        this.state = decodeStateSnapshot(reader);
        this.changedAt = 0;
        onUpdate({ stateId, state: JSON.parse(JSON.stringify(this.state)), updatedAt: this.changedAt, events: [] });
      } else if (type === 1) {
        const { stateDiff, changedAtDiff, responses, events } = decodeStateUpdate(reader);
        if (stateDiff !== undefined) {
          this.state = computePatch(this.state!, stateDiff);
        }
        this.changedAt += changedAtDiff;
        onUpdate({
          stateId,
          state: JSON.parse(JSON.stringify(this.state)),
          updatedAt: this.changedAt,
          events: events.map((e) => e.event),
        });
        responses.forEach(({ msgId, response }) => {
          if (msgId in this.callbacks) {
            this.callbacks[msgId](response);
            delete this.callbacks[msgId];
          }
        });
      } else {
        console.error("Unknown message type", type);
      }
    };
  }

  public joinGame(request: IJoinGameRequest): Promise<Response> {
    return this.callMethod(Method.JOIN_GAME, IJoinGameRequest.encode(request).toBuffer());
  }

  public startGame(request: IStartGameRequest): Promise<Response> {
    return this.callMethod(Method.START_GAME, IStartGameRequest.encode(request).toBuffer());
  }

  public playCard(request: IPlayCardRequest): Promise<Response> {
    return this.callMethod(Method.PLAY_CARD, IPlayCardRequest.encode(request).toBuffer());
  }

  public drawCard(request: IDrawCardRequest): Promise<Response> {
    return this.callMethod(Method.DRAW_CARD, IDrawCardRequest.encode(request).toBuffer());
  }

  public disconnect(): void {
    this.socket.onclose = () => {};
    this.socket.close();
  }

  private callMethod(method: Method, request: Uint8Array): Promise<Response> {
    return new Promise((resolve, reject) => {
      if (this.socket.readyState === this.socket.CLOSED) {
        reject("Connection is closed");
      } else if (this.socket.readyState !== this.socket.OPEN) {
        setTimeout(() => this.callMethod(method, request).then(resolve).catch(reject), 0);
      } else {
        const msgId: Uint8Array = getRandomValues(new Uint8Array(4));
        this.socket.send(new Uint8Array([...new Uint8Array([method]), ...msgId, ...request]));
        this.callbacks[new DataView(msgId.buffer).getUint32(0)] = resolve;
      }
    });
  }
}
