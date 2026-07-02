'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Upload, Trash2, X, Loader2, ImageIcon } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Profile } from '@/lib/types';

interface UploadPortraitDialogProps {
  profile: Profile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadPortraitDialog({ profile, open, onOpenChange }: UploadPortraitDialogProps) {
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === 'admin';
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const reset = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
    setDragActive(false);
  }, []);

  const handleFile = useCallback((file: File) => {
    const allowed = ['image/webp', 'image/png', 'image/jpeg'];
    if (!allowed.includes(file.type)) {
      toast.error('Format tidak didukung', { description: 'Gunakan WebP, PNG, atau JPEG' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File terlalu besar', { description: 'Maksimal 5MB' });
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragActive(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res = await fetch(`/api/profiles/${profile.id}/portrait`, { method: 'POST', body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? 'Upload gagal');
      }
      toast.success('Portrait berhasil diupload');
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      onOpenChange(false);
      reset();
    } catch (err) {
      toast.error('Upload gagal', { description: err instanceof Error ? err.message : undefined });
    } finally {
      setUploading(false);
    }
  }, [selectedFile, profile.id, queryClient, onOpenChange, reset]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/profiles/${profile.id}/portrait`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus portrait');
      toast.success('Portrait dihapus');
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      onOpenChange(false);
      reset();
    } catch (err) {
      toast.error('Gagal menghapus', { description: err instanceof Error ? err.message : undefined });
    } finally {
      setDeleting(false);
    }
  }, [profile.id, queryClient, onOpenChange, reset]);

  if (!isAdmin) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">UPLOAD KARAKTER PORTRAIT</DialogTitle>
          <DialogDescription className="font-data-mono text-xs">
            {profile.full_name} — {profile.codename ?? 'OPERATOR'}
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg aspect-[2/3] flex items-center justify-center cursor-pointer transition-colors',
            dragActive ? 'border-primary bg-primary/5' : 'border-on-surface-muted/30 hover:border-on-surface-muted/50',
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/webp,image/png,image/jpeg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />

          {preview ? (
            <Image src={preview} alt="Preview" fill className="object-contain p-2" />
          ) : profile.portrait_url ? (
            <Image src={profile.portrait_url} alt="Current" fill className="object-contain p-2" />
          ) : (
            <div className="text-center space-y-2">
              <ImageIcon className="w-12 h-12 mx-auto text-on-surface-muted" />
              <p className="text-sm text-on-surface-muted">Klik atau seret gambar ke sini</p>
            </div>
          )}
        </div>

        <p className="font-data-mono text-[10px] text-on-surface-muted text-center">
          Format: WebP, PNG, JPEG | Max: 5MB | Recommended: 1024×1536
        </p>

        <DialogFooter className="gap-2">
          {profile.portrait_url && (
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              HAPUS PORTRAIT
            </Button>
          )}
          <Button size="sm" onClick={handleUpload} disabled={!selectedFile || uploading}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            UPLOAD
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
