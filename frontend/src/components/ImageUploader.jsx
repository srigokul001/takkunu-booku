import React, { useRef, useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  X,
  Trash2,
  Star,
  Check,
  AlertCircle,
  FileImage
} from 'lucide-react';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ImageUploader = ({
  label = 'Photos',
  subLabel = 'Upload high-resolution property and amenity photos',
  existingImages = [],
  onExistingImagesChange,
  pendingFiles = [],
  onPendingFilesChange,
  isUploading = false,
  error = '',
  setError,
}) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Validate single file
  const validateFile = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const isExtValid = ALLOWED_EXTS.includes(ext);
    const isMimeValid = ALLOWED_TYPES.includes(file.type);

    if (!isExtValid && !isMimeValid) {
      return 'Image must be JPG, PNG, JPEG or WEBP and below 5 MB.';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'Image must be JPG, PNG, JPEG or WEBP and below 5 MB.';
    }

    return null;
  };

  // Handle incoming files
  const processFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;

    if (setError) setError('');
    const newPending = [...pendingFiles];
    let validationError = null;

    Array.from(fileList).forEach((file) => {
      const err = validateFile(file);
      if (err) {
        validationError = err;
        return;
      }

      // Check if file already added
      const exists = newPending.some(
        (p) => p.file.name === file.name && p.file.size === file.size
      );
      if (!exists) {
        newPending.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          preview: URL.createObjectURL(file),
          isCover: false,
        });
      }
    });

    if (validationError && setError) {
      setError(validationError);
    }

    // If no existing images and no current cover in pending, set the first pending as cover
    const hasExistingCover = existingImages.some((img) => img.isCover);
    const hasPendingCover = newPending.some((p) => p.isCover);
    if (!hasExistingCover && !hasPendingCover && newPending.length > 0) {
      newPending[0].isCover = true;
    }

    onPendingFilesChange(newPending);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Remove pending file before upload
  const removePendingFile = (id) => {
    const fileToRemove = pendingFiles.find((p) => p.id === id);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    const updated = pendingFiles.filter((p) => p.id !== id);
    // If we removed the cover, reassign cover
    if (fileToRemove?.isCover) {
      if (existingImages.length > 0) {
        const updatedExisting = existingImages.map((img, idx) => ({
          ...img,
          isCover: idx === 0,
        }));
        onExistingImagesChange(updatedExisting);
      } else if (updated.length > 0) {
        updated[0].isCover = true;
      }
    }
    onPendingFilesChange(updated);
  };

  // Remove existing saved image
  const removeExistingImage = (indexToRemove) => {
    const wasCover = existingImages[indexToRemove]?.isCover;
    const updated = existingImages.filter((_, idx) => idx !== indexToRemove);

    if (wasCover) {
      if (updated.length > 0) {
        updated[0].isCover = true;
      } else if (pendingFiles.length > 0) {
        const updatedPending = pendingFiles.map((p, idx) => ({
          ...p,
          isCover: idx === 0,
        }));
        onPendingFilesChange(updatedPending);
      }
    }

    onExistingImagesChange(updated);
  };

  // Set existing image as cover
  const setExistingAsCover = (index) => {
    const updatedExisting = existingImages.map((img, idx) => ({
      ...img,
      isCover: idx === index,
    }));
    const updatedPending = pendingFiles.map((p) => ({
      ...p,
      isCover: false,
    }));
    onExistingImagesChange(updatedExisting);
    onPendingFilesChange(updatedPending);
  };

  // Set pending image as cover
  const setPendingAsCover = (id) => {
    const updatedExisting = existingImages.map((img) => ({
      ...img,
      isCover: false,
    }));
    const updatedPending = pendingFiles.map((p) => ({
      ...p,
      isCover: p.id === id,
    }));
    onExistingImagesChange(updatedExisting);
    onPendingFilesChange(updatedPending);
  };

  const totalCount = existingImages.length + pendingFiles.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
            {label} *
          </label>
          <p className="text-[11px] text-slate-400 mt-0.5">{subLabel}</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
          {totalCount} {totalCount === 1 ? 'photo' : 'photos'}
        </span>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-teal-600 bg-teal-50/70 scale-[0.99]'
            : 'border-slate-300 hover:border-teal-500 hover:bg-slate-50/80 bg-slate-50/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            processFiles(e.target.files);
            e.target.value = '';
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-100/70 text-teal-700 flex items-center justify-center shadow-inner">
            <Upload className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              Drag & Drop your photos here, or{' '}
              <span className="text-teal-600 underline font-extrabold hover:text-teal-700">
                Choose Files
              </span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports multiple files: JPG, JPEG, PNG, WEBP (Max 5 MB each)
            </p>
          </div>
        </div>
      </div>

      {/* Existing Photos Section (For Edit Mode) */}
      {existingImages.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Existing Saved Photos ({existingImages.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Click ⭐ to set as cover photo
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {existingImages.map((img, idx) => (
              <div
                key={img.publicId || idx}
                className={`relative group rounded-2xl overflow-hidden border transition shadow-sm aspect-video sm:aspect-square bg-slate-100 ${
                  img.isCover
                    ? 'border-teal-600 ring-2 ring-teal-500/40'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <img
                  src={img.url}
                  alt={`Saved photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80';
                  }}
                />

                {/* Cover Badge */}
                {img.isCover && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-teal-600 text-white font-bold text-[10px] shadow flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-white" />
                    <span>Cover Photo</span>
                  </span>
                )}

                {/* Action Overlay */}
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  {!img.isCover && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExistingAsCover(idx);
                      }}
                      className="p-1.5 rounded-xl bg-white text-teal-700 hover:bg-teal-50 shadow text-[10px] font-bold flex items-center space-x-1 transition"
                      title="Set as Cover Photo"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>Set Cover</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeExistingImage(idx);
                    }}
                    className="p-1.5 rounded-xl bg-white text-rose-600 hover:bg-rose-50 shadow transition"
                    title="Delete Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Photos to Upload (Preview Section) */}
      {pendingFiles.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Selected New Photos Ready to Save ({pendingFiles.length})
            </span>
            <button
              type="button"
              onClick={() => onPendingFilesChange([])}
              className="text-[11px] text-rose-600 hover:underline font-semibold"
            >
              Clear All New
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {pendingFiles.map((item) => (
              <div
                key={item.id}
                className={`relative group rounded-2xl overflow-hidden border transition shadow-sm aspect-video sm:aspect-square bg-slate-100 ${
                  item.isCover
                    ? 'border-teal-600 ring-2 ring-teal-500/40'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <img
                  src={item.preview}
                  alt={item.file.name}
                  className="w-full h-full object-cover"
                />

                {/* File size & name footer */}
                <div className="absolute bottom-0 inset-x-0 bg-slate-900/70 backdrop-blur-sm p-1 text-[10px] text-white truncate px-2">
                  <p className="truncate font-medium">{item.file.name}</p>
                  <p className="text-[9px] text-slate-300">
                    {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>

                {/* Cover badge */}
                {item.isCover && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-teal-600 text-white font-bold text-[10px] shadow flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-white" />
                    <span>Cover Photo</span>
                  </span>
                )}

                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  {!item.isCover && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingAsCover(item.id);
                      }}
                      className="p-1 rounded-lg bg-white/90 text-amber-600 hover:bg-white shadow text-[10px] transition"
                      title="Set as Cover"
                    >
                      <Star className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePendingFile(item.id);
                    }}
                    className="p-1 rounded-lg bg-white/90 text-rose-600 hover:bg-white shadow transition"
                    title="Remove File"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploading indicator */}
      {isUploading && (
        <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center space-x-2 animate-pulse">
          <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span>Uploading photos to cloud storage... Please wait</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
