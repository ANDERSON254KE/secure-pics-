'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { validateFile } from '@/lib/utils/file-upload'

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  isUploading?: boolean
  uploadProgress?: number
}

interface FileWithPreview extends File {
  preview: string
  id: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export function FileUpload({ 
  onFilesSelected, 
  maxFiles = 50, 
  isUploading = false,
  uploadProgress = 0 
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: FileWithPreview[] = acceptedFiles.map(file => {
      const validation = validateFile(file)
      return Object.assign(file, {
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9),
        status: validation.isValid ? 'pending' as const : 'error' as const,
        error: validation.error
      })
    })

    setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles))
  }, [maxFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles,
    multiple: true
  })

  const removeFile = (id: string) => {
    setFiles(prev => {
      const updated = prev.filter(file => file.id !== id)
      // Revoke URL to prevent memory leaks
      const fileToRemove = prev.find(file => file.id === id)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return updated
    })
  }

  const uploadFiles = () => {
    const validFiles = files.filter(file => file.status === 'pending')
    if (validFiles.length > 0) {
      onFilesSelected(validFiles)
    }
  }

  const validFilesCount = files.filter(file => file.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium mb-2">
          {isDragActive ? 'Drop files here' : 'Drag & drop images here'}
        </h3>
        <p className="text-muted-foreground mb-4">
          or click to browse files
        </p>
        <p className="text-sm text-muted-foreground">
          Supports JPEG, PNG, WebP • Max 10MB per file • Up to {maxFiles} files
        </p>
      </div>

      {/* File Preview */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">
              Selected Files ({files.length})
            </h4>
            {validFilesCount > 0 && (
              <Button 
                onClick={uploadFiles} 
                disabled={isUploading}
                className="ml-4"
              >
                Upload {validFilesCount} Files
              </Button>
            )}
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading files...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {files.map((file) => (
              <div key={file.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Status Indicator */}
                <div className="absolute top-2 right-2">
                  {file.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                  {file.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>

                {/* Remove Button */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  onClick={() => removeFile(file.id)}
                  disabled={isUploading}
                >
                  <X className="h-3 w-3" />
                </Button>

                {/* File Info */}
                <div className="mt-2 text-xs">
                  <p className="truncate font-medium">{file.name}</p>
                  {file.error ? (
                    <p className="text-destructive">{file.error}</p>
                  ) : (
                    <p className="text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}