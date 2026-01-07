/**
 * 画像を WebP に変換し、指定された最大サイズにリサイズするユーティリティ
 */
export const optimizeImage = (file, maxDim = 1000, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxDim) {
                        height *= maxDim / width;
                        width = maxDim;
                    }
                } else {
                    if (height > maxDim) {
                        width *= maxDim / height;
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error("Canvas to Blob conversion failed"));
                            return;
                        }
                        const fileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                        const webpFile = new File([blob], fileName, { type: "image/webp" });
                        resolve(webpFile);
                    },
                    "image/webp",
                    quality
                );
            };
            img.onerror = () => reject(new Error("Image load failed"));
        };
        reader.onerror = () => reject(new Error("File read failed"));
    });
};
