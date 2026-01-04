const products = [
  {
    name: "Hộp giấy nắp gài Kraft",
    slug: "hop-giay-nap-gai-kraft",
    category: "Hộp giấy",
    images: [
      {
        url: "https://inhuongphat.com/wp-content/uploads/2023/08/in-hop-giay-kraft-1.jpg",
        public_id: "sample_id_1",
        isThumbnail: true
      }
    ],
    material: "Giấy Kraft Nhật 280gsm",
    description: "<p>Hộp giấy Kraft phong cách vintage, thân thiện môi trường. Thích hợp đựng quần áo, mỹ phẩm handmade.</p>",
    priceTable: [
      { minQuantity: 100, price: 5000 },
      { minQuantity: 500, price: 4500 },
      { minQuantity: 1000, price: 3800 }
    ],
    isFeatured: true,
  },
  {
    name: "Túi giấy Shop Thời Trang",
    slug: "tui-giay-shop-thoi-trang",
    category: "Túi giấy",
    images: [
      {
        url: "https://inhuongphat.com/wp-content/uploads/2023/08/in-tui-giay-shop.jpg",
        public_id: "sample_id_2",
        isThumbnail: true
      }
    ],
    material: "Giấy Ivory 250gsm, cán màng mờ",
    description: "<p>Túi giấy sang trọng cho shop thời trang, dây dù chắc chắn, chịu lực tốt.</p>",
    priceTable: [
      { minQuantity: 500, price: 6000 },
      { minQuantity: 1000, price: 5500 }
    ],
    isFeatured: true,
  },
  {
    name: "Tem nhãn Decal trong",
    slug: "tem-nhan-decal-trong",
    category: "Tem nhãn",
    images: [
      {
        url: "https://inhuongphat.com/wp-content/uploads/2023/08/in-tem-decal.jpg",
        public_id: "sample_id_3",
        isThumbnail: true
      }
    ],
    material: "Decal nhựa trong",
    description: "<p>Tem dán ly trà sữa, chai lọ mỹ phẩm. Chống nước tuyệt đối.</p>",
    priceTable: [
      { minQuantity: 1000, price: 500 },
      { minQuantity: 5000, price: 300 }
    ],
    isFeatured: false,
  }
];

module.exports = products;