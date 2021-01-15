import * as msgpack from "@msgpack/msgpack";
import pako from "pako";

export interface Message {
  sequenceId: number;
  payload: unknown;
}

function isMessage(v: unknown): v is Message {
  const msg = v as Message;

  if (typeof msg !== "object") {
    return false;
  }

  if (!("payload" in msg)) {
    return false;
  }

  if (typeof msg.sequenceId !== "number") {
    return false;
  }

  return true;
}

function bufferToHex(buffer: Uint8Array): string {
  return [...buffer].map(x => x.toString(16).padStart(2, "0")).join("");
}

function hexToBuffer(str: string): Uint8Array {
  const splited = str.match(/.{2}/g);
  if (splited === null) {
    throw "not hex string!";
  }
  return new Uint8Array(splited.map(x => parseInt(x, 16)));
}

// 戻り値は [iv, encrypted]
async function encrypt(
  content: Uint8Array,
  rawKey: Uint8Array
): Promise<[Uint8Array, Uint8Array]> {
  const iv = new Uint8Array(16);
  window.crypto.getRandomValues(iv);

  const key = await window.crypto.subtle.importKey(
    "raw",
    rawKey,
    "AES-CBC",
    false,
    ["encrypt"]
  );

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv
    },
    key,
    content
  );

  return [iv, new Uint8Array(encrypted)];
}

async function decrypt(
  encrypted: Uint8Array,
  rawKey: Uint8Array,
  iv: Uint8Array
): Promise<Uint8Array> {
  const key = await window.crypto.subtle.importKey(
    "raw",
    rawKey,
    "AES-CBC",
    false,
    ["decrypt"]
  );

  const content = await window.crypto.subtle.decrypt(
    {
      name: "AES-CBC",
      iv
    },
    key,
    encrypted
  );

  return new Uint8Array(content);
}

interface RequestQueueItem {
  payload: unknown;
  finishHandler: (resPayload: unknown, err: Error | undefined) => void;
}

export class Api {
  private readonly _key: Uint8Array;
  private _sequenceId = 1;
  private _requestQueue: RequestQueueItem[] = [];
  private _isRunning = false;

  constructor(
    private readonly _server: string,
    private readonly _accessToken: string,
    accessTokenSecret: string
  ) {
    this._key = hexToBuffer(accessTokenSecret);
  }

  request(payload: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this._requestQueue.push({
        payload,
        finishHandler: (res, err) => {
          if (err !== undefined) {
            reject(err);
            return;
          }
          resolve(res);
        }
      });
      this._runQueue();
    });
  }

  private _runQueue(): void {
    if (this._isRunning) {
      return;
    }

    const item = this._requestQueue.shift();
    if (item === undefined) {
      return;
    }

    this._isRunning = true;
    void (async () => {
      try {
        const res = await this._sendRequest(item.payload);
        item.finishHandler(res, undefined);
      } catch (e) {
        item.finishHandler(undefined, e);
      } finally {
        this._isRunning = false;
        this._runQueue();
      }
    })();
  }

  private _sendRequest(payload: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      void (async () => {
        try {
          const reqMessage: Message = {
            sequenceId: this._sequenceId,
            payload
          };
          const content = pako.deflateRaw(msgpack.encode(reqMessage));
          const [iv, encrypted] = await encrypt(content, this._key);

          const res = await fetch(this._server, {
            method: "POST",
            cache: "no-cache",
            mode: "cors",
            headers: {
              "Content-Type": "application/msgpack",
              "X-Access-Token": this._accessToken,
              "X-IV": bufferToHex(iv)
            },
            credentials: "omit",
            referrerPolicy: "no-referrer",
            body: encrypted
          });

          if (res.status !== 200) {
            reject("なんかダメだったっぽい");
            return;
          }

          const resIvString = res.headers.get("X-IV");
          if (resIvString === null) {
            reject("レスポンスがおかしい");
            return;
          }
          const resIv = hexToBuffer(resIvString);
          const resEncrypted = new Uint8Array(await res.arrayBuffer());
          const resContent = await decrypt(resEncrypted, this._key, resIv);

          const resMessage = msgpack.decode(pako.inflateRaw(resContent));
          if (!isMessage(resMessage)) {
            reject("なりすまし?");
            return;
          }

          if (resMessage.sequenceId <= this._sequenceId) {
            reject("なりすまし?");
            return;
          }
          this._sequenceId = resMessage.sequenceId + 1;

          console.log(resMessage);
          resolve(resMessage.payload);
        } catch (e) {
          reject(e);
        }
      })();
    });
  }
}
