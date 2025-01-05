// Fungsi untuk membersihkan console.log di production
export const cleanupConsole = () => {
  if (import.meta.env.PROD) {
    console.log = () => {};
    console.info = () => {};
    console.debug = () => {};
    // Biarkan console.error dan console.warn untuk debugging production
  }
};

// Fungsi untuk membersihkan localStorage yang tidak digunakan
export const cleanupStorage = () => {
  if (import.meta.env.PROD) {
    // Hapus item cache yang sudah expired
    const CACHE_KEYS = ['hydroponics_charts'];
    CACHE_KEYS.forEach(key => {
      const cached = localStorage.getItem(key);
      if (cached) {
        const { timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > 5 * 60 * 1000) { // 5 menit
          localStorage.removeItem(key);
        }
      }
    });
  }
}; 