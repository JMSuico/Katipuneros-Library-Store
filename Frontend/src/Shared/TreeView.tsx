// [Layer: Shared]
// TreeView.tsx -- Hierarchical tree explorer presentation primitive.
// DO NOT put business logic or API calls here.
import { FC, useState } from 'react';

export interface TreeNode {
  id: string;
  label: string;
  icon?: string;
  children?: TreeNode[];
}

interface TreeViewProps {
  nodes: TreeNode[];
  onSelectNode?: (node: TreeNode) => void;
}

const TreeItem: FC<{ node: TreeNode; onSelectNode?: (node: TreeNode) => void }> = ({
  node,
  onSelectNode,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col">
      <div
        className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-surface-container cursor-pointer select-none text-text-primary text-small"
        onClick={() => {
          if (hasChildren) setIsOpen(!isOpen);
          onSelectNode?.(node);
        }}
      >
        {hasChildren ? (
          <span className="material-symbols-outlined text-base text-text-secondary">
            {isOpen ? 'expand_more' : 'chevron_right'}
          </span>
        ) : (
          <span className="w-4" />
        )}
        <span className="material-symbols-outlined text-base text-primary">
          {node.icon || (hasChildren ? 'folder' : 'description')}
        </span>
        <span>{node.label}</span>
      </div>
      {hasChildren && isOpen && (
        <div className="pl-5 border-l border-outline-variant/30 flex flex-col gap-1 ml-3 mt-1">
          {node.children!.map((child) => (
            <TreeItem key={child.id} node={child} onSelectNode={onSelectNode} />
          ))}
        </div>
      )}
    </div>
  );
};

export const TreeView: FC<TreeViewProps> = ({ nodes, onSelectNode }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {nodes.map((node) => (
        <TreeItem key={node.id} node={node} onSelectNode={onSelectNode} />
      ))}
    </div>
  );
};
