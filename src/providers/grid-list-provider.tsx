import { createContext, type ReactElement, type ReactNode, useContext } from 'react';

import type { ActiveCell } from '@/hooks/use-grid-navigation';

export type GridListContextValue = {
  baseId: string;
  /**
   * Currently active cell (undefined when no cell is active).
   */
  activeCell?: ActiveCell;
  /**
   * Set active cell.
   */
  setActiveCell: (cell?: ActiveCell) => void;
  /**
   * Whether the entire grid is disabled
   */
  disabled: boolean;
  /**
   * Register a row with the grid
   */
  registerRow: (id: string, disabled?: boolean, element?: HTMLElement | null) => void;
  /**
   * Unregister a row from the grid
   */
  unregisterRow: (id: string) => void;
  /**
   * Get all registered row IDs in DOM order
   */
  getRows: () => string[];
  /**
   * Check if a row is disabled
   */
  isRowDisabled: (id: string) => boolean;
  /**
   * Get the number of cells in a row
   */
  getCellCount: (rowId: string) => number;
  /**
   * Check if a cell is disabled
   */
  isCellDisabled: (rowId: string, colIndex: number) => boolean;
  /**
   * Check if a cell is interactive (participates in keyboard navigation)
   */
  isCellInteractive: (rowId: string, colIndex: number) => boolean;
  /**
   * Keyboard event handler for navigation
   */
  handleKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  /**
   * Register a cell with a row
   */
  registerCell: (
    rowId: string,
    colIndex: number,
    disabled?: boolean,
    interactive?: boolean,
    element?: HTMLElement | null,
  ) => void;
  /**
   * Unregister a cell from a row
   */
  unregisterCell: (rowId: string, colIndex: number) => void;
};

const GridListContext = createContext<GridListContextValue | undefined>(undefined);

export type GridListProviderProps = {
  value: GridListContextValue;
  children?: ReactNode;
};

export const GridListProvider = ({ value, children }: GridListProviderProps): ReactElement => {
  return <GridListContext.Provider value={value}>{children}</GridListContext.Provider>;
};

GridListProvider.displayName = 'GridListProvider';

export const useGridList = (): GridListContextValue => {
  const ctx = useContext(GridListContext);

  if (!ctx) {
    throw new Error('useGridList must be used within a GridList');
  }

  return ctx;
};

export type GridListRowContextValue = {
  rowId: string;
  disabled: boolean;
  /**
   * Get the next available cell index for auto-indexing
   */
  getNextCellIndex: () => number;
};

const GridListRowContext = createContext<GridListRowContextValue | undefined>(undefined);

export type GridListRowProviderProps = {
  value: GridListRowContextValue;
  children?: ReactNode;
};

export const GridListRowProvider = ({ value, children }: GridListRowProviderProps): ReactElement => {
  return <GridListRowContext.Provider value={value}>{children}</GridListRowContext.Provider>;
};

GridListRowProvider.displayName = 'GridListRowProvider';

export const useGridListRow = (): GridListRowContextValue => {
  const ctx = useContext(GridListRowContext);

  if (!ctx) {
    throw new Error('useGridListRow must be used within a GridList.Row');
  }

  return ctx;
};
