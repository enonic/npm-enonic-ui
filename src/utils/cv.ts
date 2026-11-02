import { type ClassValue, clsx } from 'cn';

type ClassProp =
  | { class: ClassValue; className?: never }
  | { class?: never; className: ClassValue }
  | { class?: never; className?: never };

type StringToBoolean<T> = T extends 'true' | 'false' ? boolean : T;

type CvSchema = Record<string, Record<string, ClassValue>>;

type CvSelection<T extends CvSchema> = {
  [K in keyof T]?: StringToBoolean<keyof T[K]> | null | undefined;
};

type CvMultiSelection<T extends CvSchema> = {
  [K in keyof T]?: StringToBoolean<keyof T[K]> | StringToBoolean<keyof T[K]>[] | undefined;
};

type CvConfig<T> = T extends CvSchema
  ? {
      variants?: T;
      defaultVariants?: CvSelection<T>;
      compoundVariants?: ((CvSelection<T> | CvMultiSelection<T>) & ClassProp)[];
    }
  : never;

type CvCallProps<T> = T extends CvSchema ? CvSelection<T> & ClassProp : ClassProp;

type RuntimeConfig = {
  variants?: CvSchema;
  defaultVariants?: Record<string, unknown>;
  compoundVariants?: ({ class?: ClassValue; className?: ClassValue } & Record<string, unknown>)[];
};

export type CvProps<T> = T extends (props?: infer P) => string ? Omit<NonNullable<P>, 'class' | 'className'> : never;

const toKey = (value: unknown): unknown => (typeof value === 'boolean' ? `${value}` : value === 0 ? '0' : value);

export function cv<T>(base?: ClassValue, config?: CvConfig<T>) {
  const { variants, defaultVariants, compoundVariants } = (config ?? {}) as RuntimeConfig;

  return (props?: CvCallProps<T>): string => {
    const selection = (props ?? {}) as Record<string, unknown>;
    const callClass = selection.class as ClassValue;
    const callClassName = selection.className as ClassValue;

    if (variants == null) return clsx(base, callClass, callClassName);

    const variantClasses = Object.keys(variants).map(name => {
      const value = selection[name];
      if (value === null) return null;
      return variants[name]?.[String(toKey(value) || toKey(defaultVariants?.[name]))];
    });

    const resolved: Record<string, unknown> = { ...defaultVariants };
    for (const [name, value] of Object.entries(selection)) {
      if (value !== undefined) resolved[name] = value;
    }

    const compoundClasses = compoundVariants?.flatMap(({ class: compoundClass, className, ...match }) =>
      Object.entries(match).every(([name, expected]) =>
        Array.isArray(expected) ? expected.includes(resolved[name]) : resolved[name] === expected,
      )
        ? [compoundClass, className]
        : [],
    );

    return clsx(base, variantClasses, compoundClasses, callClass, callClassName);
  };
}
