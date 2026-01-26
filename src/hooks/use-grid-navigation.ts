import { useCallback, useRef } from 'react';

export type ActiveCell = { row: string; col: number };

export type GridNavigationConfig = {
  /**
   * Get all row IDs in order
   */
  getRows: () => string[];

  /**
   * Get the number of cells in a row
   */
  getCellCount: (rowId: string) => number;

  /**
   * Check if a row is disabled
   */
  isRowDisabled: (rowId: string) => boolean;

  /**
   * Check if a cell is disabled
   */
  isCellDisabled: (rowId: string, colIndex: number) => boolean;

  /**
   * Check if a cell is interactive (participates in keyboard navigation).
   * Non-interactive cells are skipped during navigation.
   * @default () => true
   */
  isCellInteractive?: (rowId: string, colIndex: number) => boolean;

  /**
   * Currently active cell (undefined when no cell is active)
   */
  activeCell: ActiveCell | undefined;

  /**
   * Set the active cell
   */
  setActiveCell: (cell: ActiveCell | undefined) => void;

  /**
   * Whether to loop navigation (wrap around at start/end)
   * @default false
   */
  loop?: boolean;

  /**
   * Called when user requests activation (Enter/Space)
   * Receives the row ID and column index
   */
  onActivate?: (rowId: string, colIndex: number) => void;

  /**
   * Called when user presses Escape
   */
  onEscape?: () => void;
};

export type UseGridNavigationReturn = {
  /**
   * Move active cell by delta rows (1 for next, -1 for previous)
   */
  moveRow: (delta: number) => void;

  /**
   * Move active cell by delta columns (1 for next, -1 for previous)
   */
  moveCol: (delta: number) => void;

  /**
   * Keyboard event handler to attach to the container
   */
  handleKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
};

/**
 * Hook for 2D keyboard navigation within a grid-like list structure.
 * Handles arrow keys for bidirectional navigation, Home/End, Enter/Space, and Escape.
 *
 * Supports:
 * - ArrowUp/ArrowDown navigate between rows
 * - ArrowLeft/ArrowRight navigate between cells within a row
 * - Home/End navigate to first/last cell in current row
 * - Ctrl+Home/Ctrl+End navigate to first/last cell in grid
 * - Loop navigation (optional)
 * - Disabled row/cell skipping
 * - Enter/Space for activation
 * - Escape key handling
 * - Column position memory when navigating rows
 *
 * @param config - Configuration object
 * @returns Object with navigation methods
 *
 * @example
 * ```tsx
 * function MyGrid() {
 *   const [activeCell, setActiveCell] = useState<ActiveCell>();
 *
 *   const { handleKeyDown } = useGridNavigation({
 *     getRows: () => ['row1', 'row2', 'row3'],
 *     getCellCount: () => 3,
 *     isRowDisabled: () => false,
 *     isCellDisabled: () => false,
 *     activeCell,
 *     setActiveCell,
 *     onActivate: (rowId, colIndex) => console.log('Activated:', rowId, colIndex),
 *   });
 *
 *   return <div role="grid" onKeyDown={handleKeyDown}>...</div>;
 * }
 * ```
 */
const defaultIsCellInteractive = (): boolean => true;

export function useGridNavigation(config: GridNavigationConfig): UseGridNavigationReturn {
  const {
    getRows,
    getCellCount,
    isRowDisabled,
    isCellDisabled,
    isCellInteractive = defaultIsCellInteractive,
    activeCell,
    setActiveCell,
    loop = false,
    onActivate,
    onEscape,
  } = config;

  // Remember preferred column when navigating vertically
  const preferredColRef = useRef(0);

  const findNextEnabledRow = useCallback(
    (startIndex: number, delta: number, rows: string[]): number | null => {
      let index = startIndex;
      let attempts = 0;
      const maxAttempts = rows.length;

      while (attempts < maxAttempts) {
        if (loop) {
          if (index < 0) {
            index = rows.length - 1;
          } else if (index >= rows.length) {
            index = 0;
          }
        } else {
          if (index < 0 || index >= rows.length) {
            return null;
          }
        }

        const rowId = rows[index];
        if (rowId && !isRowDisabled(rowId)) {
          return index;
        }

        index += delta;
        attempts++;
      }

      return null;
    },
    [loop, isRowDisabled],
  );

  const findNextEnabledCell = useCallback(
    (rowId: string, startCol: number, delta: number, cellCount: number): number | null => {
      let col = startCol;
      let attempts = 0;

      while (attempts < cellCount) {
        if (loop) {
          if (col < 0) {
            col = cellCount - 1;
          } else if (col >= cellCount) {
            col = 0;
          }
        } else {
          if (col < 0 || col >= cellCount) {
            return null;
          }
        }

        // Skip disabled and non-interactive cells
        if (!isCellDisabled(rowId, col) && isCellInteractive(rowId, col)) {
          return col;
        }

        col += delta;
        attempts++;
      }

      return null;
    },
    [loop, isCellDisabled, isCellInteractive],
  );

  const moveRow = useCallback(
    (delta: number): void => {
      const rows = getRows();
      if (!rows.length) return;

      const currentRowIndex = activeCell ? rows.indexOf(activeCell.row) : -1;
      let newRowIndex: number;

      if (currentRowIndex === -1) {
        // No active cell, start from first or last depending on direction
        newRowIndex = delta > 0 ? 0 : rows.length - 1;
      } else {
        newRowIndex = currentRowIndex + delta;
      }

      const enabledRowIndex = findNextEnabledRow(newRowIndex, delta, rows);
      if (enabledRowIndex === null) return;

      const newRowId = rows[enabledRowIndex];
      if (!newRowId) return;

      const cellCount = getCellCount(newRowId);
      // Use preferred column, but clamp to available cells
      const targetCol = Math.min(preferredColRef.current, cellCount - 1);
      // Find nearest enabled cell
      const enabledCol = findNextEnabledCell(newRowId, targetCol, 1, cellCount);

      if (enabledCol !== null) {
        setActiveCell({ row: newRowId, col: enabledCol });
      }
    },
    [getRows, activeCell, getCellCount, findNextEnabledRow, findNextEnabledCell, setActiveCell],
  );

  const moveCol = useCallback(
    (delta: number): void => {
      if (!activeCell) {
        // No active cell, try to activate first cell of first row
        const rows = getRows();
        if (!rows.length) return;

        const firstRowIndex = findNextEnabledRow(0, 1, rows);
        if (firstRowIndex === null) return;

        const firstRowId = rows[firstRowIndex];
        if (!firstRowId) return;

        const cellCount = getCellCount(firstRowId);
        const firstCol = findNextEnabledCell(firstRowId, 0, 1, cellCount);
        if (firstCol !== null) {
          preferredColRef.current = firstCol;
          setActiveCell({ row: firstRowId, col: firstCol });
        }
        return;
      }

      const cellCount = getCellCount(activeCell.row);
      const newCol = activeCell.col + delta;
      const enabledCol = findNextEnabledCell(activeCell.row, newCol, delta, cellCount);

      if (enabledCol !== null) {
        preferredColRef.current = enabledCol;
        setActiveCell({ row: activeCell.row, col: enabledCol });
      }
    },
    [activeCell, getRows, getCellCount, findNextEnabledRow, findNextEnabledCell, setActiveCell],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>): void => {
      const rows = getRows();
      if (!rows.length) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          moveRow(1);
          break;

        case 'ArrowUp':
          e.preventDefault();
          moveRow(-1);
          break;

        case 'ArrowRight':
          e.preventDefault();
          moveCol(1);
          break;

        case 'ArrowLeft':
          e.preventDefault();
          moveCol(-1);
          break;

        case 'Home':
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) {
            // Ctrl+Home: Go to first cell of first row
            const firstRowIndex = findNextEnabledRow(0, 1, rows);
            if (firstRowIndex !== null) {
              const firstRowId = rows[firstRowIndex];
              if (firstRowId) {
                const cellCount = getCellCount(firstRowId);
                const firstCol = findNextEnabledCell(firstRowId, 0, 1, cellCount);
                if (firstCol !== null) {
                  preferredColRef.current = firstCol;
                  setActiveCell({ row: firstRowId, col: firstCol });
                }
              }
            }
          } else if (activeCell) {
            // Home: Go to first cell in current row
            const cellCount = getCellCount(activeCell.row);
            const firstCol = findNextEnabledCell(activeCell.row, 0, 1, cellCount);
            if (firstCol !== null) {
              preferredColRef.current = firstCol;
              setActiveCell({ row: activeCell.row, col: firstCol });
            }
          }
          break;

        case 'End':
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) {
            // Ctrl+End: Go to last cell of last row
            const lastRowIndex = findNextEnabledRow(rows.length - 1, -1, rows);
            if (lastRowIndex !== null) {
              const lastRowId = rows[lastRowIndex];
              if (lastRowId) {
                const cellCount = getCellCount(lastRowId);
                const lastCol = findNextEnabledCell(lastRowId, cellCount - 1, -1, cellCount);
                if (lastCol !== null) {
                  preferredColRef.current = lastCol;
                  setActiveCell({ row: lastRowId, col: lastCol });
                }
              }
            }
          } else if (activeCell) {
            // End: Go to last cell in current row
            const cellCount = getCellCount(activeCell.row);
            const lastCol = findNextEnabledCell(activeCell.row, cellCount - 1, -1, cellCount);
            if (lastCol !== null) {
              preferredColRef.current = lastCol;
              setActiveCell({ row: activeCell.row, col: lastCol });
            }
          }
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          if (activeCell && !isRowDisabled(activeCell.row) && !isCellDisabled(activeCell.row, activeCell.col)) {
            onActivate?.(activeCell.row, activeCell.col);
          }
          break;

        case 'Escape':
          e.preventDefault();
          onEscape?.();
          break;
      }
    },
    [
      getRows,
      activeCell,
      moveRow,
      moveCol,
      getCellCount,
      findNextEnabledRow,
      findNextEnabledCell,
      setActiveCell,
      isRowDisabled,
      isCellDisabled,
      onActivate,
      onEscape,
    ],
  );

  return {
    moveRow,
    moveCol,
    handleKeyDown,
  };
}
