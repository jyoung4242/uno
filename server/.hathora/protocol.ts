import net from "net";
import { Reader, Writer } from "bin-serde";
import { COORDINATOR_HOST } from "../../api/base";

const NEW_STATE = 0;
const SUBSCRIBE_USER = 1;
const UNSUBSCRIBE_USER = 2;
const HANDLE_UPDATE = 3;

const STATE_UPDATE = 0;
const STATE_NOT_FOUND = 1;

type StateId = bigint;
type UserId = string;

function readData(socket: net.Socket, onData: (data: Buffer) => void) {
  let buf = Buffer.alloc(0);
  socket.on("data", (data) => {
    buf = Buffer.concat([buf, data]);
    while (buf.length >= 4) {
      const bufLen = buf.readUInt32BE();
      if (buf.length < 4 + bufLen) {
        return;
      }
      onData(buf.slice(4, 4 + bufLen));
      buf = buf.slice(4 + bufLen);
    }
  });
}

export function register(store: Store): Promise<CoordinatorClient> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.setKeepAlive(true, 10000);
    socket.connect(7147, COORDINATOR_HOST);
    socket.on("connect", () => {
      socket.write(
        JSON.stringify({
          appSecret: "43bfc37e-1303-481d-ad2c-ad82669cc926",
          authInfo: {
            anonymous: { separator: "-" },
          },
        })
      );
      console.log("Connected to coordinator at " + COORDINATOR_HOST);
      resolve(new CoordinatorClient(socket));
    });
    socket.on("error", (err) => {
      console.error("Coordinator connection error", err);
      reject(err.message);
    });
    socket.on("close", () => {
      console.error("Coordinator connection closed, retrying...");
      setTimeout(() => socket.connect(7147, COORDINATOR_HOST), 1000 + Math.random() * 1000);
    });
    readData(socket, (data) => {
      const reader = new Reader(data);
      const type = reader.readUInt8();
      if (type === NEW_STATE) {
        store.newState(reader.readUInt64(), reader.readString(), reader.readBuffer(reader.remaining()));
      } else if (type === SUBSCRIBE_USER) {
        store.subscribeUser(reader.readUInt64(), reader.readString());
      } else if (type === UNSUBSCRIBE_USER) {
        store.unsubscribeUser(reader.readUInt64(), reader.readString());
      } else if (type === HANDLE_UPDATE) {
        store.handleUpdate(reader.readUInt64(), reader.readString(), reader.readBuffer(reader.remaining()));
      } else {
        throw new Error("Unknown type: " + type);
      }
    });
  });
}

interface Store {
  newState(stateId: StateId, userId: UserId, data: ArrayBufferView): void;
  subscribeUser(stateId: StateId, userId: UserId): void;
  unsubscribeUser(stateId: StateId, userId: UserId): void;
  handleUpdate(stateId: StateId, userId: UserId, data: ArrayBufferView): void;
}

class CoordinatorClient {
  constructor(private socket: net.Socket) {}

  public stateUpdate(stateId: StateId, userId: UserId, data: Buffer) {
    const userIdBuf = new Writer().writeString(userId).toBuffer();
    this.socket.write(
      new Writer()
        .writeUInt32(9 + userIdBuf.length + data.length)
        .writeUInt8(STATE_UPDATE)
        .writeUInt64(stateId)
        .writeBuffer(userIdBuf)
        .writeBuffer(data)
        .toBuffer()
    );
  }

  public stateNotFound(stateId: StateId, userId: UserId) {
    const userIdBuf = new Writer().writeString(userId).toBuffer();
    this.socket.write(
      new Writer()
        .writeUInt32(9 + userIdBuf.length)
        .writeUInt8(STATE_NOT_FOUND)
        .writeUInt64(stateId)
        .writeBuffer(userIdBuf)
        .toBuffer()
    );
  }
}
