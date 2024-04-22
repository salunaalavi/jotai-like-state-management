import { useSyncExternalStore } from "react";

export function atom<Store>(initialValue: Store): {
  get: () => Store;
  set: (value: Partial<Store> | ((val: Store) => Partial<Store>)) => void;
  subscribe: (callback: () => void) => () => void;
} {
  let value =
    typeof initialValue === "function" ? initialValue() : initialValue;
  const subscribers = new Set();
  const previousValues = new Map();

  function get() {
    return value;
  }

  function notifySubscribers() {
    subscribers.forEach((callback: any) => {
      const previousValue = previousValues.get(callback) ?? value;
      callback(value, previousValue);
    });
  }

  function computeValue(newValue: Partial<Store>) {
    const oldValue = value;
    value = newValue;
    notifySubscribers();
  }

  computeValue(value);

  return {
    get,
    set: (newValue) => {
      const newValueResolved = typeof newValue === "function" ? newValue(value) : newValue;
      const oldSubscribers = new Set(subscribers); // Create a copy of subscribers before updating=
      computeValue(newValueResolved);
      oldSubscribers.forEach((callback) => {
        if (!subscribers.has(callback)) {
          // Remove previous value for unsubscribed callback
          previousValues.delete(callback);
        }
      });
    },
    subscribe: (callback) => {
      subscribers.add(callback);
      previousValues.set(callback, value); // Set initial previous value for the new subscriber
      return () => {
        subscribers.delete(callback);
        previousValues.delete(callback); // Remove previous value for the unsubscribed callback
      };
    },
  };
}

type UseAtom<T> = typeof atom<T>;
type SelectorType<T> = (store: T) => Partial<UseAtom<T>>;

export function useAtom<Atom>(atom: ReturnType<UseAtom<Atom>>, selector: SelectorType<Atom>): [Partial<Atom[keyof Partial<Atom>]>, typeof atom.set]
export function useAtom<Atom>(atom: ReturnType<UseAtom<Atom>>, selector?: SelectorType<Atom>): [Partial<Atom>, typeof atom.set]
export function useAtom<Atom>(atom: ReturnType<UseAtom<Atom>>, selector?: SelectorType<Atom>): [unknown, typeof atom.set] {
  if (selector) {
    return [
      useSyncExternalStore(
        atom.subscribe,
        () => selector(atom.get()),
        () => atom.get,
      ),
      atom.set
    ];
  }

  return [
    useSyncExternalStore(
      atom.subscribe,
      atom.get,
      atom.get,
    ),
    atom.set
  ];
}

export function useAtomValue<Atom>(atom: ReturnType<UseAtom<Atom>>) {
  return useSyncExternalStore(atom.subscribe, atom.get);
}

export default atom;
