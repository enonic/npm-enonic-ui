import {
  createContext,
  type Dispatch,
  type ReactElement,
  type ReactNode,
  type SetStateAction,
  useContext,
} from 'react';

export type DialogContextValue = {
  open: boolean;
  setOpen: (next: boolean) => void;
  titleId: string | undefined;
  descriptionId: string | undefined;
  setTitleId: Dispatch<SetStateAction<string | undefined>>;
  setDescriptionId: Dispatch<SetStateAction<string | undefined>>;
  isUsingStepper?: boolean;
};

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

export type DialogProviderProps = {
  value: DialogContextValue;
  children?: ReactNode;
};

export const DialogProvider = ({ value, children }: DialogProviderProps): ReactElement => {
  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
};

DialogProvider.displayName = 'DialogProvider';

export const useDialog = (): DialogContextValue => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
