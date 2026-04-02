import { useRef } from 'react';

interface IconUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (name: string, dataUrl: string) => void;
}

export const IconUploadModal = ({ open, onClose, onUpload }: IconUploadModalProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[28px] border border-brass/25 bg-midnight/96 p-6 shadow-panel">
        <h3 className="font-display text-lg uppercase tracking-[0.22em] text-parchment">Upload Icon</h3>
        <p className="mt-2 text-sm text-frost/65">Upload a logo or custom icon. It will be stored locally with the rest of the scenario library.</p>
        <input ref={inputRef} accept="image/*" className="mt-4 block w-full text-sm text-frost/80" type="file" />
        <div className="mt-5 flex justify-end gap-3">
          <button className="command-pill" onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className="command-pill command-pill-primary"
            onClick={() => {
              const file = inputRef.current?.files?.[0];
              if (!file) {
                return;
              }
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === 'string') {
                  onUpload(file.name, reader.result);
                  onClose();
                }
              };
              reader.readAsDataURL(file);
            }}
            type="button"
          >
            Save icon
          </button>
        </div>
      </div>
    </div>
  );
};
