// [Layer: Shared]
// DragDropFileUpload.tsx -- Reusable drag and drop file upload zone.
// DO NOT put business logic or API calls here.
import { FC, useState, DragEvent, ChangeEvent } from 'react';

interface DragDropFileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
}

export const DragDropFileUpload: FC<DragDropFileUploadProps> = ({
  onFileSelect,
  accept = 'image/*',
  label = 'Drag and drop file here, or click to browse',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
        isDragOver
          ? 'border-primary bg-primary/5'
          : 'border-outline-variant hover:border-primary/60 bg-surface-container-low'
      }`}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        id="drag-drop-input"
      />
      <label htmlFor="drag-drop-input" className="cursor-pointer flex flex-col items-center gap-2">
        <span className="material-symbols-outlined text-3xl text-primary">cloud_upload</span>
        <span className="font-body-medium text-body-medium text-text-primary font-medium">{label}</span>
        <span className="font-caption text-caption text-text-secondary">Supported files: {accept}</span>
      </label>
    </div>
  );
};
