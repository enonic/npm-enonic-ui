import type { JSX } from 'react';

export type ButtonProps = {
  label: string;
  onClick?: () => void;
};

export function Button({ label, onClick }: ButtonProps): JSX.Element {
  return (
    <button onClick={onClick} style={{ padding: '0.5em 1em', borderRadius: 4 }}>
      {label}
    </button>
  );
}
