type Signalish<T> = T | SignalLike<T>;

type SignalLike<T> = {
  value: T;
  peek(): T;
  subscribe(fn: (value: T) => void): () => void;
};

function isSignal(v: unknown): v is SignalLike<unknown> {
  return !!(
    v &&
    typeof v === 'object' &&
    'value' in v &&
    'peek' in v &&
    typeof v.peek === 'function' &&
    'subscribe' in v &&
    typeof v.subscribe === 'function'
  );
}

export function unwrap<T>(v: Signalish<T>): T {
  return isSignal(v) ? v.value : v;
}
