import { Copy, Group, Trash2, UnfoldHorizontal, UnfoldVertical } from 'lucide-react';

interface SelectionOverlayProps {
  selectedCount: number;
  onAlign: (axis: 'x' | 'y') => void;
  onDuplicate: () => void;
  onGroup: () => void;
  onDelete: () => void;
}

export const SelectionOverlay = ({ selectedCount, onAlign, onDuplicate, onGroup, onDelete }: SelectionOverlayProps) => {
  if (selectedCount < 2) {
    return null;
  }

  return (
    <div className="absolute left-1/2 top-5 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-brass/30 bg-obsidian/92 px-3 py-2 shadow-panel backdrop-blur-md">
      <span className="text-[10px] uppercase tracking-[0.24em] text-frost/70">{selectedCount} selected</span>
      <button className="command-pill" onClick={() => onAlign('x')} type="button">
        <UnfoldHorizontal size={14} />
        Align X
      </button>
      <button className="command-pill" onClick={() => onAlign('y')} type="button">
        <UnfoldVertical size={14} />
        Align Y
      </button>
      <button className="command-pill" onClick={onGroup} type="button">
        <Group size={14} />
        Group
      </button>
      <button className="command-pill" onClick={onDuplicate} type="button">
        <Copy size={14} />
        Duplicate
      </button>
      <button className="command-pill command-pill-danger" onClick={onDelete} type="button">
        <Trash2 size={14} />
        Delete
      </button>
    </div>
  );
};
