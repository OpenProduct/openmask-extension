import { beginCell, Cell } from "ton";
import { Dictionary, Slice } from "ton-core";
import { sha256_sync } from "ton-crypto";

const ONCHAIN_CONTENT_PREFIX = 0x00;
const SNAKE_PREFIX = 0x00;
const CELL_MAX_SIZE_BYTES = Math.floor((1023 - 8) / 8);

function bufferToChunks(buff: Buffer, chunkSize: number) {
  let chunks: Buffer[] = [];
  while (buff.byteLength > 0) {
    chunks.push(buff.slice(0, chunkSize));
    buff = buff.slice(chunkSize);
  }
  return chunks;
}

export function makeSnakeCell(data: Buffer) {
  let chunks = bufferToChunks(data, CELL_MAX_SIZE_BYTES);
  const b = chunks.reduceRight((curCell, chunk, index) => {
    if (index === 0) {
      curCell.storeInt(SNAKE_PREFIX, 8);
    }
    curCell.storeBuffer(chunk);
    if (index > 0) {
      const cell = curCell.endCell();
      return beginCell().storeRef(cell);
    } else {
      return curCell;
    }
  }, beginCell());
  return b.endCell();
}

export function readOffChainMetadata(sl: Slice) {
  if (sl.remainingBits < 8) {
    return null;
  }
  let result = sl.loadBuffer(sl.remainingBits / 8);
  while (sl.remainingRefs) {
    const next = sl.loadRef().beginParse();
    result = Buffer.concat([result, next.loadBuffer(next.remainingBits / 8)]);
    sl = next;
  }

  return result;
}
export function readSnakeCell(cell: Cell): Buffer | null {
  let sl = cell.beginParse();
  if (sl.remainingBits < 8 || sl.loadUint(8) !== SNAKE_PREFIX) {
    return null;
  }
  return readOffChainMetadata(sl);
}

const toKey = (key: string) => {
  return BigInt(`0x${sha256_sync(key).toString("hex")}`);
};

export function readOnchainMetadata<T>(cell: Cell, keys: string[]) {
  const slice = cell.beginParse();
  const prefix = slice.loadUint(8);
  if (prefix !== ONCHAIN_CONTENT_PREFIX) {
    throw new Error("Unknown content");
  }

  const dict = Dictionary.load(
    Dictionary.Keys.BigUint(256),
    Dictionary.Values.Cell(),
    slice
  );

  return keys.reduce((acc, key) => {
    const value = dict.get(toKey(key));
    if (value) {
      const data = readSnakeCell(value);
      if (data) {
        acc[key] = data.toString("utf8");
      }
    }
    return acc;
  }, {} as Record<string, string>) as any as T;
}

export function buildOnchainMetadata(data: {
  name: string;
  description?: string;
  image: string;
  symbol?: string;
  decimals?: string;
}): Cell {
  let dict = Dictionary.empty(
    Dictionary.Keys.BigUint(256),
    Dictionary.Values.Cell()
  );
  Object.entries(data).forEach(([key, value]) => {
    dict.set(toKey(key), makeSnakeCell(Buffer.from(value, "utf8")));
  });

  return beginCell()
    .storeInt(ONCHAIN_CONTENT_PREFIX, 8)
    .storeDict(dict)
    .endCell();
}
