/**
 * Redimensiona uma imagem escolhida pra no máximo `max` px (mantendo a proporção)
 * e devolve um data URL JPEG leve. Assim o preview/persistência da foto de perfil
 * não estoura o localStorage nem trava com fotos grandes do celular.
 */
export function downscaleImage(file: File, max = 400, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const w = Math.max(1, Math.round(img.width * scale))
      const h = Math.max(1, Math.round(img.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      URL.revokeObjectURL(url)
      if (!ctx) {
        reject(new Error('canvas indisponível'))
        return
      }
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('falha ao carregar a imagem'))
    }
    img.src = url
  })
}
