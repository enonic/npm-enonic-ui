import { TreeList, type TreeNode } from '@/components';
import { useTreeList } from '@/providers/tree-list-provider';
import { type ReactElement, type ReactNode } from 'react';
import { Virtuoso } from 'react-virtuoso';

const LOADING_SUFFIX = '__loading__';

export type TreeListContentProps<T extends TreeNode> = {
  itemToRow: (item: T) => ReactNode;
};

export const TreeListExtContent = <T extends TreeNode>({ itemToRow }: TreeListContentProps<T>): ReactElement => {
  const { items } = useTreeList<T>();

  return (
    <Virtuoso
      data={items}
      increaseViewportBy={200}
      itemContent={(_index, item: T) => {
        if (isLoadingPlaceholder(item)) {
          return <TreeList.LoadingRow item={item} />;
        }

        return <>{itemToRow(item)}</>;
      }}
    />
  );
};

function isLoadingPlaceholder(node: TreeNode): boolean {
  return node.id.endsWith(LOADING_SUFFIX);
}
