const products = [
  {
    id: 1,
    title: "Print Biasa",
    image: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
    category: "print",
    formComponent: "PrintBiasaForm"
  },
  {
    id: 2,
    title: "Buku",
    image: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
    category: "print",
    formComponent: "BukuForm"
  },
  {
    id: 3,
    title: "Undangan",
    image: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
    category: "print",
    formComponent: "UndanganForm"
  },
  {
    id: 4,
    title: "Sticker",
    image: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
    category: "print",
    formComponent: "StickerForm"
  },
  {
    id: 5,
    title: "Spanduk/Baliho",
    image: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
    category: "outdoor",
    formComponent: "SpandukBalihoForm"
  },
  {
    id: 6,
    title: "Roll Banner",
    image: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
    category: "outdoor",
    formComponent: "RollBannerForm"
  },
  {
    id: 7,
    title: "X-Banner",
    image: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
    category: "outdoor",
    formComponent: "XBannerForm"
  },
  {
    id: 8,
    title: "Neon Box",
    image: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
    category: "outdoor",
    formComponent: "NeonBoxForm"
  },
  {
    id: 9,
    title: "Krans Bunga",
    image: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
    category: "outdoor",
    formComponent: "KransBungaForm"
  },
  {
    id: 10,
    title: "Batu Nisan",
    image: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
    category: "outdoor",
    formComponent: "BatuNisanForm"
  },
  {
    id: 11,
    title: "Stempel",
    image: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
    category: "others",
    formComponent: "StempelForm"
  },
  {
    id: 12,
    title: "Sablon Gelas",
    image: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
    category: "others",
    formComponent: "SablonGelasForm"
  },
  {
    id: 13,
    title: "Sablon Piring",
    image: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
    category: "others",
    formComponent: "SablonPiringForm"
  },
  {
    id: 14,
    title: "Sablon Baju",
    image: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
    category: "others",
    formComponent: "SablonBajuForm"
  }
];

// Helper functions
const getProductById = (id) => {
  return products.find(product => product.id === id);
};

const getProductsByCategory = (category) => {
  return products.filter(product => product.category === category);
};

const isValidProductId = (id) => {
  return products.some(product => product.id === id);
};

module.exports = {
  products,
  getProductById,
  getProductsByCategory,
  isValidProductId
};
