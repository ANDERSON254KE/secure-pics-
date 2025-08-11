export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760')
  const allowedTypes = (process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(',')

  if (file.size > maxSize) {
    return { isValid: false, error: 'File size too large. Maximum 10MB allowed.' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }
  }

  return { isValid: true }
}

export const generateThumbnail = (file: File, maxWidth = 300, maxHeight = 300): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate thumbnail dimensions
      let { width, height } = img

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height

      // Draw and resize image
      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob((blob) => {
        if (blob) {
          const thumbnailFile = new File([blob], `thumb_${file.name}`, {
            type: file.type,
            lastModified: Date.now()
          })
          resolve(thumbnailFile)
        } else {
          reject(new Error('Failed to generate thumbnail'))
        }
      }, file.type, 0.8)
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}