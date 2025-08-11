export interface WatermarkOptions {
  text: string
  position: 'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  opacity: number
  fontSize: number
  color: string
}

export const addWatermark = (
  imageUrl: string,
  options: WatermarkOptions
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      // Draw the original image
      ctx?.drawImage(img, 0, 0)

      if (ctx) {
        // Set watermark properties
        ctx.globalAlpha = options.opacity
        ctx.fillStyle = options.color
        ctx.font = `${options.fontSize}px Arial`
        ctx.textAlign = 'center'

        // Calculate position
        let x = canvas.width / 2
        let y = canvas.height / 2

        switch (options.position) {
          case 'top-left':
            x = options.fontSize
            y = options.fontSize * 1.5
            ctx.textAlign = 'left'
            break
          case 'top-right':
            x = canvas.width - options.fontSize
            y = options.fontSize * 1.5
            ctx.textAlign = 'right'
            break
          case 'bottom-left':
            x = options.fontSize
            y = canvas.height - options.fontSize
            ctx.textAlign = 'left'
            break
          case 'bottom-right':
            x = canvas.width - options.fontSize
            y = canvas.height - options.fontSize
            ctx.textAlign = 'right'
            break
          default:
            // center position
            break
        }

        // Draw the watermark text
        ctx.fillText(options.text, x, y)

        // Convert canvas to data URL
        resolve(canvas.toDataURL('image/jpeg', 0.9))
      } else {
        reject(new Error('Could not get canvas context'))
      }
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.crossOrigin = 'anonymous'
    img.src = imageUrl
  })
}