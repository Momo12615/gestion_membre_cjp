/**
 * Utilitaire de compression et redimensionnement d'image côté client
 * Réduit automatiquement les photos volumineuses (ex: photos de smartphone de 5 à 15 Mo)
 * à une taille adaptée (max 800px) et un poids ultra-léger (~80 à 150 Ko)
 * pour éviter les dépassements de limite HTTP et accélérer les uploads.
 */

export function compressImage(
  file: File,
  maxDimension = 800,
  quality = 0.85
): Promise<{ base64: string; name: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve({ base64: reader.result as string, name: file.name });
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
        resolve({ base64: compressedBase64, name: cleanName });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
