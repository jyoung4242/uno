import { Writer as _Writer, Reader as _Reader } from "bin-serde";
import {
  NO_DIFF as _NO_DIFF,
  DeepPartial as _DeepPartial,
  Response as _Response,
  Message as _Message,
  ResponseMessage as _ResponseMessage,
  EventMessage as _EventMessage,
} from "./base";

export enum Color {
  RED,
  BLUE,
  GREEN,
  YELLOW,
}
export type Card = {
  value: number;
  color: Color;
};
export type PlayerState = {
  hand: Card[];
  players: UserId[];
  turn: UserId;
  pile?: Card;
  winner?: UserId;
};
export type UserId = string;
export type IJoinGameRequest = {
};
export type IStartGameRequest = {
};
export type IPlayCardRequest = {
  card: Card;
};
export type IDrawCardRequest = {
};
export type IInitializeRequest = {
};

export const Card = {
  default(): Card {
    return {
      value: 0,
      color: 0,
    };
  },
  encode(obj: Card, writer?: _Writer) {
    const buf = writer ?? new _Writer();
    writeInt(buf, obj.value);
    writeUInt8(buf, obj.color);
    return buf;
  },
  encodeDiff(obj: _DeepPartial<Card>, writer?: _Writer) {
    const buf = writer ?? new _Writer();
    const tracker: boolean[] = [];
    tracker.push(obj.value !== _NO_DIFF);
    tracker.push(obj.color !== _NO_DIFF);
    buf.writeBits(tracker);
    if (obj.value !== _NO_DIFF) {
      writeInt(buf, obj.value);
    }
    if (obj.color !== _NO_DIFF) {
      writeUInt8(buf, obj.color);
    }
    return buf;
  },
  decode(buf: ArrayBufferView | _Reader): Card {
    const sb = ArrayBuffer.isView(buf) ? new _Reader(buf) : buf;
    return {
      value: parseInt(sb),
      color: parseUInt8(sb),
    };
  },
  decodeDiff(buf: ArrayBufferView | _Reader): _DeepPartial<Card> {
    const sb = ArrayBuffer.isView(buf) ? new _Reader(buf) : buf;
    const tracker = sb.readBits(2);
    return {
      value: tracker.shift() ? parseInt(sb) : _NO_DIFF,
      color: tracker.shift() ? parseUInt8(sb) : _NO_DIFF,
    };
  },
};
export const PlayerState = {
  default(): PlayerState {
    return {
      hand: [],
      players: [],
      turn: "",
      pile: undefined,
      winner: undefined,
    };
  },
  encode(obj: PlayerState, writer?: _Writer) {
    const buf = writer ?? new _Writer();
    writeArray(buf, obj.hand, (x) => Card.encode(x, buf));
    writeArray(buf, obj.players, (x) => writeString(buf, x));
    writeString(buf, obj.turn);
    writeOptional(buf, obj.pile, (x) => Card.encode(x, buf));
    writeOptional(buf, obj.winner, (x) => writeString(buf, x));
    return buf;
  },
  encodeDiff(obj: _DeepPartial<PlayerState>, writer?: _Writer) {
    const buf = writer ?? new _Writer();
    const tracker: boolean[] = [];
    tracker.push(obj.hand !== _NO_DIFF);
    tracker.push(obj.players !== _NO_DIFF);
    tracker.push(obj.turn !== _NO_DIFF);
    tracker.push(obj.pile !== _NO_DIFF);
    tracker.push(obj.winner !== _NO_DIFF);
    buf.writeBits(tracker);
    if (obj.hand !== _NO_DIFF) {
      writeArrayDiff(buf, obj.hand, (x) => Card.encodeDiff(x, buf));
    }
    if (obj.players !== _NO_DIFF) {
      writeArrayDiff(buf, obj.players, (x) => writeString(buf, x));
    }
    if (obj.turn !== _NO_DIFF) {
      writeString(buf, obj.turn);
    }
    if (obj.pile !== _NO_DIFF) {
      writeOptional(buf, obj.pile, (x) => Card.encodeDiff(x, buf));
    }
    if (obj.winner !== _NO_DIFF) {
      writeOptional(buf, obj.winner, (x) => writeString(buf, x));
    }
    return buf;
  },
  decode(buf: ArrayBufferView | _Reader): PlayerState {
    const sb = ArrayBuffer.isView(buf) ? new _Reader(buf) : buf;
    return {
      hand: parseArray(sb, () => Card.decode(sb)),
      players: parseArray(sb, () => parseString(sb)),
      turn: parseString(sb),
      pile: parseOptional(sb, () => Card.decode(sb)),
      winner: parseOptional(sb, () => parseString(sb)),
    };
  },
  decodeDiff(buf: ArrayBufferView | _Reader): _DeepPartial<PlayerState> {
    const sb = ArrayBuffer.isView(buf) ? new _Reader(buf) : buf;
    const tracker = sb.readBits(5);
    return {
      hand: tracker.shift() ? parseArrayDiff(sb, () => Card.decodeDiff(sb)) : _NO_DIFF,
      players: tracker.shift() ? parseArrayDiff(sb, () => parseString(sb)) : _NO_DIFF,
      turn: tracker.shift() ? parseString(sb) : _NO_DIFF,
      pile: tracker.shift() ? parseOptional(sb, () => Card.decodeDiff(sb)) : _NO_DIFF,
      winner: tracker.shift() ? parseOptional(sb, () => parseString(sb)) : _NO_DIFF,
    };
  },
};
export const IJoinGameRequest = {
  default(): IJoinGameRequest {
    return {
    };
  },
  encode(obj: IJoinGameRequest, writer?: _Writer) {
    const buf = writer ?? new _Writer();
    return buf;
  },
  decode(buf: ArrayBufferView | _Reader): IJoinGameRequest {
    const sb = ArrayBuffer.isView(buf) ? new _Reader(buf) : buf;
    return {
    };
  },
};
export const IStartGameRequest = {
  default(): IStartGameRequest {
    return {
    };
  },
  encode(obj: IStartGameRequest, writer?: _Writer) {
    const buf = writer ?? new _Writer();
    return buf;
  },
  decode(buf: ArrayBufferView | _Reader): IStartGameRequest {
    const sb = ArrayBuffer.isView(buf) ? new _Reader(buf) : buf;
    return {
    };
  },
};
export const IPlayCardRequest = {
  default(): IPlayCardRequest {
    return {
      card: Card.default(),
    };
  },
  encode(obj: IPlayCardRequest, writer?: _Writer) {
    const buf = writer ?? new _Writer();
    Card.encode(obj.card, buf);
    return buf;
  },
  decode(buf: ArrayBufferView | _Reader): IPlayCardRequest {
    const sb = ArrayBuffer.isView(buf) ? new _Reader(buf) : buf;
    return {
      card: Card.decode(sb),
    };
  },
};
export const IDrawCardRequest = {
  default(): IDrawCardRequest {
    return {
    };
  },
  encode(obj: IDrawCardRequest, writer?: _Writer) {
    const buf = writer ?? new _Writer();
    return buf;
  },
  decode(buf: ArrayBufferView | _Reader): IDrawCardRequest {
    const sb = ArrayBuffer.isView(buf) ? new _Reader(buf) : buf;
    return {
    };
  },
};
export const IInitializeRequest = {
  default(): IInitializeRequest {
    return {};
  },
  encode(x: IInitializeRequest, buf?: _Writer) {
    return buf ?? new _Writer();
  },
  decode(sb: ArrayBufferView | _Reader): IInitializeRequest {
    return {};
  },
};

export function encodeStateSnapshot(x: PlayerState) {
  const buf = new _Writer();
  buf.writeUInt8(0);
  try {
    PlayerState.encode(x, buf);
  } catch (e) {
    console.error("Invalid user state", x);
    throw e;
  }
  return buf.toBuffer();
}
export function encodeStateUpdate(
  x: _DeepPartial<PlayerState> | undefined,
  changedAtDiff: number,
  messages: _Message[]
) {
  const buf = new _Writer();
  buf.writeUInt8(1);
  buf.writeUVarint(changedAtDiff);
  const responses = messages.flatMap((msg) => (msg.type === "response" ? msg : []));
  buf.writeUVarint(responses.length);
  responses.forEach(({ msgId, response }) => {
    buf.writeUInt32(Number(msgId));
    writeOptional(buf, response.type === "error" ? response.error : undefined, (x) => writeString(buf, x));
  });
  const events = messages.flatMap((msg) => (msg.type === "event" ? msg : []));
  buf.writeUVarint(events.length);
  events.forEach(({ event }) => buf.writeString(event));
  if (x !== undefined) {
    PlayerState.encodeDiff(x, buf);
  }
  return buf.toBuffer();
}
export function decodeStateUpdate(buf: ArrayBufferView | _Reader): {
  stateDiff?: _DeepPartial<PlayerState>;
  changedAtDiff: number;
  responses: _ResponseMessage[];
  events: _EventMessage[];
} {
  const sb = ArrayBuffer.isView(buf) ? new _Reader(buf) : buf;
  const changedAtDiff = sb.readUVarint();
  const responses = [...Array(sb.readUVarint())].map(() => {
    const msgId = sb.readUInt32();
    const maybeError = parseOptional(sb, () => parseString(sb));
    return _Message.response(msgId, maybeError === undefined ? _Response.ok() : _Response.error(maybeError));
  });
  const events = [...Array(sb.readUVarint())].map(() => _Message.event(sb.readString()));
  const stateDiff = sb.remaining() ? PlayerState.decodeDiff(sb) : undefined;
  return { stateDiff, changedAtDiff, responses, events };
}
export function decodeStateSnapshot(buf: ArrayBufferView | _Reader) {
  const sb = ArrayBuffer.isView(buf) ? new _Reader(buf) : buf;
  return PlayerState.decode(sb);
}

function writeUInt8(buf: _Writer, x: number) {
  buf.writeUInt8(x);
}
function writeBoolean(buf: _Writer, x: boolean) {
  buf.writeUInt8(x ? 1 : 0);
}
function writeInt(buf: _Writer, x: number) {
  buf.writeVarint(x);
}
function writeFloat(buf: _Writer, x: number) {
  buf.writeFloat(x);
}
function writeString(buf: _Writer, x: string) {
  buf.writeString(x);
}
function writeOptional<T>(buf: _Writer, x: T | undefined, innerWrite: (x: T) => void) {
  writeBoolean(buf, x !== undefined);
  if (x !== undefined) {
    innerWrite(x);
  }
}
function writeArray<T>(buf: _Writer, x: T[], innerWrite: (x: T) => void) {
  buf.writeUVarint(x.length);
  for (const val of x) {
    innerWrite(val);
  }
}
function writeArrayDiff<T>(buf: _Writer, x: (T | typeof _NO_DIFF)[], innerWrite: (x: T) => void) {
  buf.writeUVarint(x.length);
  const tracker: boolean[] = [];
  x.forEach((val) => {
    tracker.push(val !== _NO_DIFF);
  });
  buf.writeBits(tracker);
  x.forEach((val) => {
    if (val !== _NO_DIFF) {
      innerWrite(val);
    }
  });
}

function parseUInt8(buf: _Reader): number {
  return buf.readUInt8();
}
function parseBoolean(buf: _Reader): boolean {
  return buf.readUInt8() > 0;
}
function parseInt(buf: _Reader): number {
  return buf.readVarint();
}
function parseFloat(buf: _Reader): number {
  return buf.readFloat();
}
function parseString(buf: _Reader): string {
  return buf.readString();
}
function parseOptional<T>(buf: _Reader, innerParse: (buf: _Reader) => T): T | undefined {
  return parseBoolean(buf) ? innerParse(buf) : undefined;
}
function parseArray<T>(buf: _Reader, innerParse: () => T): T[] {
  const len = buf.readUVarint();
  const arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(innerParse());
  }
  return arr;
}
function parseArrayDiff<T>(buf: _Reader, innerParse: () => T): (T | typeof _NO_DIFF)[] {
  const len = buf.readUVarint();
  const tracker = buf.readBits(len);
  const arr = [];
  for (let i = 0; i < len; i++) {
    if (tracker.shift()) {
      arr.push(innerParse());
    } else {
      arr.push(_NO_DIFF);
    }
  }
  return arr;
}
