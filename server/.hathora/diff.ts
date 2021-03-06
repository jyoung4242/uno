import { DeepPartial, NO_DIFF } from "../../api/base";
import * as T from "../../api/types";

function diffCard(obj: T.Card, prevObj: T.Card): DeepPartial<T.Card> | typeof NO_DIFF {
  return diffObj({
    value: diffPrimitive(obj.value, prevObj.value),
    color: diffPrimitive(obj.color, prevObj.color),
  });
}

function diffPlayerState(obj: T.PlayerState, prevObj: T.PlayerState): DeepPartial<T.PlayerState> | typeof NO_DIFF {
  return diffObj({
    hand: diffArray(obj.hand, prevObj.hand, (a, b) => diffCard(a, b)),
    players: diffArray(obj.players, prevObj.players, (a, b) => diffPrimitive(a, b)),
    turn: diffPrimitive(obj.turn, prevObj.turn),
    pile: diffOptional(obj.pile, prevObj.pile, (a, b) => diffCard(a, b)),
    winner: diffOptional(obj.winner, prevObj.winner, (a, b) => diffPrimitive(a, b)),
  });
}

export function computeDiff(state: T.PlayerState, prevState: T.PlayerState): DeepPartial<T.PlayerState> | typeof NO_DIFF {
  try {
    return diffPlayerState(state, prevState);
  } catch (e) {
    console.error("Invalid user state", state);
    throw e;
  }
}

function diffPrimitive<T>(a: T, b: T) {
  return a === b ? NO_DIFF : a;
}

function diffOptional<T>(
  a: T | undefined,
  b: T | undefined,
  innerDiff: (x: T, y: T) => DeepPartial<T> | typeof NO_DIFF
) {
  if (a !== undefined && b !== undefined) {
    return innerDiff(a, b);
  } else if (a !== undefined || b !== undefined) {
    return a;
  }
  return NO_DIFF;
}

function diffArray<T>(a: T[], b: T[], innerDiff: (x: T, y: T) => DeepPartial<T> | typeof NO_DIFF) {
  const arr = a.map((val, i) => (i < b.length ? innerDiff(val, b[i]) : val));
  return a.length === b.length && arr.every((v) => v === NO_DIFF) ? NO_DIFF : arr;
}

function diffObj<T>(obj: T) {
  return Object.values(obj).every((v) => v === NO_DIFF) ? NO_DIFF : obj;
}
