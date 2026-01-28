import {
  type ComponentPropsWithoutRef,
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useActiveItemFocus } from '@/hooks/use-active-item-focus';
import { useControlledState } from '@/hooks/use-controlled-state';
import { type ActiveCell, useGridNavigation } from '@/hooks/use-grid-navigation';
import {
  type GridListContextValue,
  GridListProvider,
  GridListRowProvider,
  useGridList,
  useGridListRow,
} from '@/providers/grid-list-provider';
import { usePrefixedId } from '@/providers/id-provider';
import { cn, useComposedRefs } from '@/utils';

type RowMetadata = {
  disabled: boolean;
  element: HTMLElement | null;
};

type CellMetadata = {
  disabled: boolean;
  interactive: boolean;
  element: HTMLElement | null;
};

export type GridListProps = {
  baseId?: string;
  /**
   * Controlled active cell (use `undefined` for no active cell, omit for uncontrolled)
   */
  activeCell?: ActiveCell;
  /**
   * Default active cell (uncontrolled mode)
   */
  defaultActiveCell?: ActiveCell;
  /**
   * Callback when active cell changes
   */
  onActiveCellChange?: (cell: ActiveCell | undefined) => void;
  /**
   * Whether the entire grid is disabled
   */
  disabled?: boolean;
  /**
   * Whether to loop navigation at boundaries
   * @default false
   */
  loop?: boolean;
  /**
   * Accessible label for the grid
   */
  label?: string;
  /**
   * ID of element that labels this grid (alternative to label)
   */
  labelledBy?: string;
  /**
   * ID of element that describes this grid (for additional context)
   */
  describedBy?: string;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'role'>;

const GridListRoot = forwardRef<HTMLDivElement, GridListProps>(
  (
    {
      baseId,
      activeCell: controlledActiveCell,
      defaultActiveCell,
      onActiveCellChange,
      disabled = false,
      loop = false,
      label,
      labelledBy,
      describedBy,
      className,
      children,
      ...props
    },
    ref,
  ): ReactElement => {
    const innerRef = useRef<HTMLDivElement>(null);
    const prefixedId = usePrefixedId();
    const gridBaseId = baseId ?? prefixedId;

    const [activeCell, setActiveCellInternal] = useControlledState(
      controlledActiveCell,
      defaultActiveCell,
      onActiveCellChange,
    );

    const setActiveCell = useCallback(
      (cell: ActiveCell | undefined) => {
        setActiveCellInternal(cell);
      },
      [setActiveCellInternal],
    );

    // Row registry
    const rowsRef = useRef<Map<string, RowMetadata>>(new Map());

    // Cell registry - keyed by `${rowId}:${colIndex}`
    const cellsRef = useRef<Map<string, CellMetadata>>(new Map());

    const registerRow = useCallback((id: string, rowDisabled = false, element: HTMLElement | null = null): void => {
      rowsRef.current.set(id, { disabled: rowDisabled, element });
    }, []);

    const unregisterRow = useCallback((id: string): void => {
      rowsRef.current.delete(id);
      // Clean up cells for this row
      for (const key of cellsRef.current.keys()) {
        if (key.startsWith(`${id}:`)) {
          cellsRef.current.delete(key);
        }
      }
    }, []);

    const getRows = useCallback((): string[] => {
      const entries = Array.from(rowsRef.current.entries());

      // Build element map for sorting
      const elementMap = new Map<string, Element | null>();
      for (const [id, meta] of entries) {
        if (meta.element) {
          elementMap.set(id, meta.element);
        } else {
          const element = document.getElementById(`${gridBaseId}-row-${id}`);
          elementMap.set(id, element);
        }
      }

      // Sort by DOM position
      return entries
        .map(([id]) => id)
        .sort((a, b) => {
          const elementA = elementMap.get(a);
          const elementB = elementMap.get(b);

          if (!elementA || !elementB) return 0;

          const position = elementA.compareDocumentPosition(elementB);

          if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
          if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;

          return 0;
        });
    }, [gridBaseId]);

    const isRowDisabled = useCallback((id: string): boolean => {
      return rowsRef.current.get(id)?.disabled ?? false;
    }, []);

    const registerCell = useCallback(
      (
        rowId: string,
        colIndex: number,
        cellDisabled = false,
        interactive = true,
        element: HTMLElement | null = null,
      ): void => {
        cellsRef.current.set(`${rowId}:${colIndex}`, { disabled: cellDisabled, interactive, element });
      },
      [],
    );

    const unregisterCell = useCallback((rowId: string, colIndex: number): void => {
      cellsRef.current.delete(`${rowId}:${colIndex}`);
    }, []);

    const getCellCount = useCallback((rowId: string): number => {
      let count = 0;
      for (const key of cellsRef.current.keys()) {
        if (key.startsWith(`${rowId}:`)) {
          count++;
        }
      }
      return count;
    }, []);

    const isCellDisabled = useCallback(
      (rowId: string, colIndex: number): boolean => {
        // If row is disabled, all cells are disabled
        if (isRowDisabled(rowId)) return true;
        return cellsRef.current.get(`${rowId}:${colIndex}`)?.disabled ?? false;
      },
      [isRowDisabled],
    );

    const isCellInteractive = useCallback((rowId: string, colIndex: number): boolean => {
      return cellsRef.current.get(`${rowId}:${colIndex}`)?.interactive ?? true;
    }, []);

    // Activation handler - clicks the first interactive element in the cell
    const handleActivate = useCallback(
      (rowId: string, colIndex: number): void => {
        const cell = document.getElementById(`${gridBaseId}-cell-${rowId}-${colIndex}`);
        if (!cell) return;

        const focusable = cell.querySelector<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );

        if (focusable) {
          focusable.click();
        }
      },
      [gridBaseId],
    );

    const { handleKeyDown } = useGridNavigation({
      getRows,
      getCellCount,
      isRowDisabled,
      isCellDisabled,
      isCellInteractive,
      activeCell,
      setActiveCell,
      loop,
      onActivate: handleActivate,
    });

    const contextValue = useMemo<GridListContextValue>(
      () => ({
        baseId: gridBaseId,
        activeCell,
        setActiveCell,
        disabled,
        registerRow,
        unregisterRow,
        getRows,
        isRowDisabled,
        getCellCount,
        isCellDisabled,
        isCellInteractive,
        handleKeyDown,
        registerCell,
        unregisterCell,
      }),
      [
        gridBaseId,
        activeCell,
        setActiveCell,
        disabled,
        registerRow,
        unregisterRow,
        getRows,
        isRowDisabled,
        getCellCount,
        isCellDisabled,
        isCellInteractive,
        handleKeyDown,
        registerCell,
        unregisterCell,
      ],
    );

    return (
      <GridListProvider value={contextValue}>
        {/* Grid uses roving tabindex pattern - cells provide focusability, not container */}
        {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus */}
        <div
          ref={useComposedRefs(ref, innerRef)}
          id={`${gridBaseId}-grid`}
          className={cn(
            'flex flex-col outline-none',
            'outline-none focus-within:ring-2 focus-within:ring-ring/10 focus-within:ring-inset',
            disabled && 'pointer-events-none select-none opacity-30',
            className,
          )}
          role='grid'
          aria-label={label}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          aria-disabled={disabled || undefined}
          onKeyDown={handleKeyDown}
          {...props}
        >
          {children}
        </div>
      </GridListProvider>
    );
  },
);
GridListRoot.displayName = 'GridList';

export type GridListRowProps = {
  /**
   * Unique identifier for this row
   */
  id: string;
  /**
   * Whether this row is disabled
   */
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'id' | 'role'>;

const GridListRow = forwardRef<HTMLDivElement, GridListRowProps>(
  ({ id, disabled = false, className, children, ...props }, ref): ReactElement => {
    const rowRef = useRef<HTMLDivElement>(null);
    const { baseId, disabled: gridDisabled, registerRow, unregisterRow, activeCell } = useGridList();

    const isDisabled = disabled || gridDisabled;
    const isRowActive = activeCell?.row === id;

    // Cell index counter for auto-indexing
    const cellIndexRef = useRef(0);

    // Reset cell index on each render (before children render)
    cellIndexRef.current = 0;

    const getNextCellIndex = useCallback((): number => {
      return cellIndexRef.current++;
    }, []);

    useEffect(() => {
      registerRow(id, isDisabled, rowRef.current);
      return () => unregisterRow(id);
    }, [id, isDisabled, registerRow, unregisterRow]);

    const rowContextValue = useMemo(
      () => ({
        rowId: id,
        disabled: isDisabled,
        getNextCellIndex,
      }),
      [id, isDisabled, getNextCellIndex],
    );

    return (
      <GridListRowProvider value={rowContextValue}>
        <div
          ref={useComposedRefs(ref, rowRef)}
          id={`${baseId}-row-${id}`}
          className={cn('flex items-center', disabled && !gridDisabled && 'pointer-events-none opacity-30', className)}
          role='row'
          aria-disabled={isDisabled || undefined}
          data-active={isRowActive || undefined}
          {...props}
        >
          {children}
        </div>
      </GridListRowProvider>
    );
  },
);
GridListRow.displayName = 'GridListRow';

export type GridListCellProps = {
  /**
   * Whether this cell is disabled
   */
  disabled?: boolean;
  /**
   * Whether this cell participates in keyboard navigation.
   * Set to false for cells with static content (labels, badges).
   * @default true
   */
  interactive?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'role'>;

const GridListCell = forwardRef<HTMLDivElement, GridListCellProps>(
  ({ disabled = false, interactive = true, className, children, ...props }, ref): ReactElement => {
    const cellRef = useRef<HTMLDivElement>(null);
    const { rowId, disabled: rowDisabled, getNextCellIndex } = useGridListRow();
    const {
      baseId,
      activeCell,
      setActiveCell,
      getRows,
      getCellCount,
      isCellDisabled,
      isCellInteractive,
      registerCell,
      unregisterCell,
    } = useGridList();

    // Auto-assign column index
    const colIndexRef = useRef<number>(-1);
    if (colIndexRef.current === -1) {
      colIndexRef.current = getNextCellIndex();
    }
    const colIndex = colIndexRef.current;

    const isDisabled = disabled || rowDisabled;
    const isActive = activeCell != null && activeCell.row === rowId && activeCell.col === colIndex;

    useEffect(() => {
      registerCell(rowId, colIndex, isDisabled, interactive, cellRef.current);
      return () => unregisterCell(rowId, colIndex);
    }, [rowId, colIndex, isDisabled, interactive, registerCell, unregisterCell]);

    // Determine if this cell should be the tab entry point (roving tabindex)
    const shouldBeFocusable = useMemo(() => {
      // Active cell is always focusable
      if (isActive) return true;

      // Non-interactive or disabled cells are never the entry point
      if (!interactive || isDisabled) return false;

      // If there's an active cell, only it should be focusable
      if (activeCell != null) return false;

      // No active cell - first interactive non-disabled cell is focusable
      const rows = getRows();
      for (const currentRowId of rows) {
        const cellCount = getCellCount(currentRowId);
        for (let col = 0; col < cellCount; col++) {
          if (!isCellDisabled(currentRowId, col) && isCellInteractive(currentRowId, col)) {
            // This is the first focusable cell - check if it's us
            return currentRowId === rowId && col === colIndex;
          }
        }
      }

      // Fallback: No cells registered yet (initial render before effects run).
      // This cell is focusable if interactive and not disabled (already checked above).
      return true;
    }, [
      isActive,
      activeCell,
      interactive,
      isDisabled,
      getRows,
      getCellCount,
      isCellDisabled,
      isCellInteractive,
      rowId,
      colIndex,
    ]);

    // Set activeCell when this cell receives focus
    const handleFocus = useCallback(() => {
      if (!isDisabled && interactive) {
        setActiveCell({ row: rowId, col: colIndex });
      }
    }, [isDisabled, interactive, setActiveCell, rowId, colIndex]);

    // Auto-focus active cell during keyboard navigation
    useActiveItemFocus({
      ref: cellRef,
      isActive,
      disabled: isDisabled,
      checkFocusWithin: {
        enabled: true,
        containerRole: 'grid',
      },
    });

    return (
      <div
        ref={useComposedRefs(ref, cellRef)}
        id={`${baseId}-cell-${rowId}-${colIndex}`}
        className={cn(
          'flex items-center',
          'rounded-sm outline-none transition-highlight',
          'focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-3 focus-visible:ring-offset-ring-offset',
          disabled && !rowDisabled && 'pointer-events-none opacity-30',
          className,
        )}
        role='gridcell'
        tabIndex={shouldBeFocusable ? 0 : -1}
        aria-disabled={isDisabled || undefined}
        data-active={isActive || undefined}
        onFocus={handleFocus}
        {...props}
      >
        {children}
      </div>
    );
  },
);
GridListCell.displayName = 'GridListCell';

export type GridListActionProps = {
  /**
   * The interactive element to render.
   * Will have tabIndex={-1} applied to remove it from the tab order.
   */
  children: ReactElement;
};

/**
 * Wrapper for interactive elements inside cells.
 * Sets tabIndex={-1} on the child to prevent Tab capturing within the grid.
 */
const GridListAction = ({ children }: GridListActionProps): ReactElement => {
  if (!isValidElement(children)) {
    return children;
  }
  return cloneElement(children, { tabIndex: -1 });
};
GridListAction.displayName = 'GridListAction';

export const GridList = Object.assign(GridListRoot, {
  Root: GridListRoot,
  Row: GridListRow,
  Cell: GridListCell,
  Action: GridListAction,
});
