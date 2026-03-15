export const readImageAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => {
      const target = event.target;
      if (target && typeof target.result === "string") {
        resolve(target.result);
      } else {
        reject(new Error("Error reading file"));
      }
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};
