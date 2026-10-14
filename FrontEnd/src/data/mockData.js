// URLs from the given Pexels links
const imageUrls = [
  "https://i.ibb.co/SDnWK685/Flux-Dev-A-beautifully-arranged-Quilling-Art-Starter-Kit-surro-3.jpg",
  "https://images.pexels.com/photos/1099816/pexels-photo-1099816.jpeg",
  "https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg",
  "https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg",
  "https://images.pexels.com/photos/1129413/pexels-photo-1129413.jpeg",
  "https://images.pexels.com/photos/2249959/pexels-photo-2249959.jpeg",
];

// Additional image URLs for variety
const additionalImageUrls = [
  "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
  "https://images.pexels.com/photos/1852382/pexels-photo-1852382.jpeg",
  "https://images.pexels.com/photos/2811087/pexels-photo-2811087.jpeg",
  "https://images.pexels.com/photos/6634686/pexels-photo-6634686.jpeg",
  "https://images.pexels.com/photos/7667668/pexels-photo-7667668.jpeg",
];

// Product descriptions
const productDescriptions = [
  "Create beautiful designs with this comprehensive DIY kit. Perfect for beginners and experienced crafters alike.",
  "Premium craft set with vibrant colors, brushes, and all necessary tools. Ideal for beginners and professionals.",
  "Complete starter kit with essential tools, materials, and instructional guide. Create beautiful pieces with ease.",
  "Professional kit with high-quality materials and detailed instructions. Perfect way to start your crafting journey.",
  "Advanced set with premium tools and materials. Perfect for creating stunning artistic pieces.",
];

// Helper function to generate a random product
const generateRandomProduct = (id, categoryIndex) => {
  const categories = [
    "Visual Arts",
    "Paper Crafts",
    "Traditional & Cultural Crafts",
    "Sculptural & 3D Crafts",
    "Textile Arts",
    "Decorative Arts & Mixed Media",
  ];
  const subcategories = [
    [
      "Drawing Supplies",
      "Painting",
      "Printmaking",
      "Illustration",
      "Calligraphy & Typography",
    ],
    ["Origami", "Scrapbooking", "Quilling", "Card Making", "Paper Mâché"],
    [
      "Indian Folk Arts",
      "Sand Art",
      "Pottery & Clay",
      "Indigenous Beadwork",
      "Ikebana",
    ],
    [
      "Clay Modelling",
      "Sculpture",
      "Papier-Mâché Sculptures",
      "Resin Art",
      "Doll Making",
    ],
    ["Sewing", "Embroidery", "Quilting", "Knitting & Crocheting", "Weaving"],
    ["Upcycling Art", "Collage", "Wall Décor", "Mosaics", "Enamelling"],
  ];

  const category = categories[categoryIndex % categories.length];
  const subcategory =
    subcategories[categoryIndex % subcategories.length][
      Math.floor(Math.random() * 5)
    ];

  const price = Math.floor(Math.random() * 1700) + 300;
  const discountPercent = Math.floor(Math.random() * 31);
  const hasDiscount = Math.random() > 0.3;
  const originalPrice = hasDiscount
    ? Math.floor(price * (100 / (100 - discountPercent)))
    : null;
  const rating = (Math.random() * 2 + 3).toFixed(1);

  const allTags = [
    "diy",
    "craft",
    "handmade",
    "creative",
    "art",
    "hobby",
    "decor",
    "gift",
    "unique",
    "artistic",
    "home",
    "colorful",
  ];
  const numTags = Math.floor(Math.random() * 4) + 2;
  const tags = [];

  while (tags.length < numTags) {
    const tagIndex = Math.floor(Math.random() * allTags.length);
    const tag = allTags[tagIndex];
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  }

  tags.push(category.toLowerCase(), subcategory.toLowerCase());

  const images = [...imageUrls, ...additionalImageUrls.slice(0, 3)];

  const craftTypes = [
    "DIY Kit",
    "Craft Set",
    "Handcrafted Set",
    "Premium Kit",
    "Starter Kit",
    "Advanced Set",
    "Artisan Collection",
  ];
  const craftName = `${subcategory} ${
    craftTypes[Math.floor(Math.random() * craftTypes.length)]
  }`;

  return {
    // id,
    // name: craftName,
    // description: productDescriptions[Math.floor(Math.random() * productDescriptions.length)],
    // price,
    // originalPrice: hasDiscount ? originalPrice : null,
    // discountPercentage: hasDiscount ? discountPercent : null,
    // images,
    // category,
    // subcategory,
    // rating: parseFloat(rating),
    // inStock: Math.random() > 0.2,
    // tags
  };
};

// Generate 30 products
// export const products = Array.from({ length: 30 }, (_, index) =>
//   generateRandomProduct((index + 1).toString(), index % 6)
// );

// Original categories (unchanged from input)
export const categories = [
  {
    id: 1,
    name: "Visual Arts",
    subcategories: [
      {
        id: "1-1",
        name: "Drawing Supplies",
        items: [
          { id: "1-1-1", name: "Pencil Sets" },
          { id: "1-1-2", name: "Charcoal Pencils" },
          { id: "1-1-3", name: "Pen & Ink" },
        ],
      },
      {
        id: "1-2",
        name: "Painting",
        items: [
          { id: "1-2-1", name: "Watercolor Paints & Sets" },
          { id: "1-2-2", name: "Acrylic Paints & Sets" },
          { id: "1-2-3", name: "Oil Paints & Sets" },
        ],
      },
      {
        id: "1-3",
        name: "Printmaking",
        items: [
          { id: "1-3-1", name: "Linocut Tools & Materials" },
          { id: "1-3-2", name: "Etching Supplies" },
          { id: "1-3-3", name: "Screen Printing Kits & Materials" },
        ],
      },
      {
        id: "1-4",
        name: "Illustration",
        items: [
          { id: "1-4-1", name: "Digital Illustration Tools" },
          { id: "1-4-2", name: "Traditional Illustration Supplies" },
        ],
      },
      {
        id: "1-5",
        name: "Calligraphy & Typography",
        items: [
          { id: "1-5-1", name: "Calligraphy Pens & Ink" },
          { id: "1-5-2", name: "Typography Tools & Guides" },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Paper Crafts",
    subcategories: [
      {
        id: "2-1",
        name: "Origami",
        items: [
          { id: "2-1-1", name: "Origami Paper Sets" },
          { id: "2-1-2", name: "Instructional Books & Kits" },
        ],
      },
      {
        id: "2-2",
        name: "Scrapbooking",
        items: [
          { id: "2-2-1", name: "Scrapbook Paper & Albums" },
          { id: "2-2-2", name: "Stickers & Embellishments" },
          { id: "2-2-3", name: "Scrapbooking Tools" },
        ],
      },
      {
        id: "2-3",
        name: "Quilling",
        items: [
          { id: "2-3-1", name: "Quilling Paper & Kits" },
          { id: "2-3-2", name: "Quilling Tools & Accessories" },
        ],
      },
      {
        id: "2-4",
        name: "Card Making",
        items: [
          { id: "2-4-1", name: "Cardstock & Blank Cards" },
          { id: "2-4-2", name: "Stamps & Ink Pads" },
          { id: "2-4-3", name: "Embossing & Die Cutting Tools" },
        ],
      },
      {
        id: "2-5",
        name: "Paper Mâché",
        items: [
          { id: "2-5-1", name: "Paper Mâché Kits" },
          { id: "2-5-2", name: "Molds & Sculpting Tools" },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "Traditional & Cultural Crafts",
    subcategories: [
      {
        id: "3-1",
        name: "Indian Folk Arts",
        items: [
          { id: "3-1-1", name: "Madhubani Art Supplies" },
          { id: "3-1-2", name: "Warli Art Supplies" },
          { id: "3-1-3", name: "Traditional Folk Art Kits" },
        ],
      },
      {
        id: "3-2",
        name: "Sand Art",
        items: [
          { id: "3-2-1", name: "Tibetan Mandala Sand Art Kits" },
          { id: "3-2-2", name: "Bottle Sand Art Supplies" },
        ],
      },
      {
        id: "3-3",
        name: "Pottery & Clay",
        items: [
          { id: "3-3-1", name: "Pottery Wheels" },
          { id: "3-3-2", name: "Hand-Building Clay Kits" },
          { id: "3-3-3", name: "Pottery Tools & Accessories" },
        ],
      },
      {
        id: "3-4",
        name: "Indigenous Beadwork",
        items: [
          { id: "3-4-1", name: "Beading Kits & Tools" },
          { id: "3-4-2", name: "Indigenous Beadwork Supplies" },
        ],
      },
      {
        id: "3-5",
        name: "Ikebana",
        items: [
          { id: "3-5-1", name: "Ikebana Vases" },
          { id: "3-5-2", name: "Floral Design Tools" },
          { id: "3-5-3", name: "Ikebana Kits & Supplies" },
        ],
      },
    ],
  },
  {
    id: "4",
    name: "Sculptural & 3D Crafts",
    subcategories: [
      {
        id: "4-1",
        name: "Clay Modelling",
        items: [
          { id: "4-1-1", name: "Polymer Clay Sets" },
          { id: "4-1-2", name: "Air-Dry Clay Kits" },
          { id: "4-1-3", name: "Pottery & Ceramics Tools" },
        ],
      },
      {
        id: "4-2",
        name: "Sculpture",
        items: [
          { id: "4-2-1", name: "Sculpture Materials" },
          { id: "4-2-2", name: "Carving & Sculpting Tools" },
        ],
      },
      {
        id: "4-3",
        name: "Papier-Mâché Sculptures",
        items: [
          { id: "4-3-1", name: "Papier-Mâché Kits" },
          { id: "4-3-2", name: "Sculpting Molds & Forms" },
        ],
      },
      {
        id: "4-4",
        name: "Resin Art",
        items: [
          { id: "4-4-1", name: "Resin Kits & Pigments" },
          { id: "4-4-2", name: "Molds & Tools for Resin Art" },
        ],
      },
      {
        id: "4-5",
        name: "Doll Making",
        items: [
          { id: "4-5-1", name: "Doll Making Kits" },
          { id: "4-5-2", name: "Doll Parts & Accessories" },
        ],
      },
    ],
  },
  {
    id: "5",
    name: "Textile Arts",
    subcategories: [
      {
        id: "5-1",
        name: "Sewing",
        items: [
          { id: "5-1-1", name: "Sewing Machines" },
          { id: "5-1-2", name: "Fabrics & Textiles" },
          { id: "5-1-3", name: "Sewing Notions & Accessories" },
        ],
      },
      {
        id: "5-2",
        name: "Embroidery",
        items: [
          { id: "5-2-1", name: "Embroidery Kits & Threads" },
          { id: "5-2-2", name: "Embroidery Hoops & Tools" },
        ],
      },
      {
        id: "5-3",
        name: "Quilting",
        items: [
          { id: "5-3-1", name: "Quilting Fabric & Patterns" },
          { id: "5-3-2", name: "Quilting Tools & Rulers" },
        ],
      },
      {
        id: "5-4",
        name: "Knitting & Crocheting",
        items: [
          { id: "5-4-1", name: "Yarn & Thread" },
          { id: "5-4-2", name: "Knitting Needles & Crochet Hooks" },
          { id: "5-4-3", name: "Patterns & Guides" },
        ],
      },
      {
        id: "5-5",
        name: "Weaving",
        items: [
          { id: "5-5-1", name: "Weaving Looms & Frames" },
          { id: "5-5-2", name: "Yarn & Thread for Weaving" },
          { id: "5-5-3", name: "Weaving Tools & Accessories" },
        ],
      },
    ],
  },
  {
    id: "6",
    name: "Decorative Arts & Mixed Media",
    subcategories: [
      {
        id: "6-1",
        name: "Upcycling Art & Recycling Art",
        items: [
          { id: "6-1-1", name: "Upcycling Materials" },
          { id: "6-1-2", name: "DIY Upcycling Kits" },
        ],
      },
      {
        id: "6-2",
        name: "Collage",
        items: [
          { id: "6-2-1", name: "Collage Paper & Materials" },
          { id: "6-2-2", name: "Collage Tools & Adhesives" },
        ],
      },
      {
        id: "6-3",
        name: "Wall Décor",
        items: [
          { id: "6-3-1", name: "Wall Art Prints" },
          { id: "6-3-2", name: "Home Décor Stencils & Stamps" },
          { id: "6-3-3", name: "Wall Decals & Stickers" },
        ],
      },
      {
        id: "6-4",
        name: "Mosaics",
        items: [
          { id: "6-4-1", name: "Mosaic Tiles & Supplies" },
          { id: "6-4-2", name: "Mosaic Grout & Adhesives" },
        ],
      },
      {
        id: "6-5",
        name: "Enamelling",
        items: [
          { id: "6-5-1", name: "Enamel Paints & Powders" },
          { id: "6-5-2", name: "Enamelling Tools & Kilns" },
        ],
      },
    ],
  },
];

// Product categories and subcategories

export const products = [
  {
    id: 1,
    name: "Quilling Art Starter Kit",
    description:
      "Complete beginner's kit with papers, tools, and guidebook for quilling art",
    price: 899,
    originalPrice: 1299,
    discountPercentage: 30,
    images: [
      "https://i.ibb.co/m5ysTf92/Flux-Dev-A-beautifully-arranged-and-colorful-premium-scrapbook-3.jpg",
      "https://images.pexels.com/photos/1099816/pexels-photo-1099816.jpeg",
      "https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg",
      "https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg",

      ,
    ],
    category: "Paper Crafts",
    subcategory: "Quilling",
    rating: 4.5,
    inStock: true,
    tags: ["paper craft", "beginner friendly", "art kit", "quilling"],
  },
  {
    id: 2,
    name: "Professional Watercolor Set",
    description: "24 premium watercolor pans with natural hair brushes",
    price: 1399,
    originalPrice: 1599,
    discountPercentage: null,
    images: [
      "https://images.pexels.com/photos/2249959/pexels-photo-2249959.jpeg",
      "https://i.ibb.co/SDnWK685/Flux-Dev-A-beautifully-arranged-Quilling-Art-Starter-Kit-surro-3.jpg",
      "https://ideogram.ai/assets/image/lossless/response/yfpuyrrSSKy8CSSlqV2jOQ",
      "https://ideogram.ai/assets/image/lossless/response/BQ35Bo92S9mT_cKv3YPCdQ",
    ],
    category: "Visual Arts",
    subcategory: "Painting",
    rating: 4.8,
    inStock: true,
    tags: ["painting", "watercolor", "artist grade"],
  },
  {
    id: 3,
    name: "Origami Paper Collection",
    description: "200 sheets of traditional Japanese origami papers",
    price: 599,
    originalPrice: 799,
    discountPercentage: 25,
    images: [
      "https://ideogram.ai/assets/image/lossless/response/yfpuyrrSSKy8CSSlqV2jOQ",
      "https://ideogram.ai/assets/image/lossless/response/G1K-idlSSCSgBTCzVwjfIw",
      "https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg",
      "https://i.ibb.co/VYt0Pysz/Flux-Dev-A-beautifully-arranged-Quilling-Art-Starter-Kit-laid-1.jpg",
    ],
    category: "Paper Crafts",
    subcategory: "Origami",
    rating: 4.3,
    inStock: true,
    tags: ["origami", "paper", "craft"],
  },
  {
    id: 4,
    name: "Oil Painting Starter Kit",
    description: "Complete set with canvases, oils, and brushes for beginners",
    price: 787,
    originalPrice: 1049,
    discountPercentage: 24,
    images: [
      "https://ideogram.ai/assets/image/lossless/response/BQ35Bo92S9mT_cKv3YPCdQ","https://cdn.leonardo.ai/users/1d4822bc-4f00-4b69-a656-b9d83079b145/generations/3ac96f3f-daaf-4f29-96d9-b78c3272f39b/segments/2:4:1/ Flux_Dev_A_beautifully_lit_vibrant_and_artistic_product_image__1.jpg",
      imageUrls[1],
      imageUrls[2],
    ],
    category: "Visual Arts",
    subcategory: "Painting",
    rating: 4.6,
    inStock: false,
    tags: ["painting", "oil", "starter kit"],
  },
  {
    id: 5,
    name: "Calligraphy Master Set",
    description:
      "Professional calligraphy set with ink, nibs, and practice sheets",
    price: 499,
    originalPrice: 799,
    discountPercentage: null,
    images: [
      "https://ideogram.ai/assets/image/lossless/response/6i3obRvqTjSXKzpJBmYGWw",
      "https://images.pexels.com/photos/1129413/pexels-photo-1129413.jpeg",
      imageUrls[3],
      imageUrls[4],
      "https://cdn.leonardo.ai/users/1d4822bc-4f00-4b69-a656-b9d83079b145/generations/3ac96f3f-daaf-4f29-96d9-b78c3272f39b/segments/2:4:1/ Flux_Dev_A_beautifully_lit_vibrant_and_artistic_product_image__1.jpg",
    ],
    category: "Visual Arts",
    subcategory: "Calligraphy & Typography",
    rating: 4.7,
    inStock: true,
    tags: ["calligraphy", "writing", "stationery"],
  },
  {
    id: 6,
    name: "Calligraphy Master Set",
    description:
      "Professional calligraphy set with ink, nibs, and practice sheets",
    price: 499,
    originalPrice: 799,
    discountPercentage: null,
    images: [imageUrls[3], imageUrls[4]],
    category: "Visual Arts",
    subcategory: "Calligraphy & Typography",
    rating: 4.7,
    inStock: true,
    tags: ["calligraphy", "writing", "stationery"],
  },
  {
    id: 7,
    name: "Origami Starter Kit",
    description:
      "Create beautiful designs with this comprehensive DIY kit. Perfect for beginners and experienced crafters alike.",
    price: 899,
    originalPrice: 1299,
    discountPercentage: 30,
    images: [
      "https://i.ibb.co/SDnWK685/Flux-Dev-A-beautifully-arranged-Quilling-Art-Starter-Kit-surro-3.jpg",
      "https://images.pexels.com/photos/1099816/pexels-photo-1099816.jpeg",
    ],
    category: "Paper Crafts",
    subcategory: "Origami",
    rating: 4.5,
    inStock: true,
    tags: ["diy", "paper", "origami", "creative", "craft", "paper crafts"],
  },
  {
    id: 8,
    name: "Embroidery Premium Kit",
    description:
      "Premium craft set with vibrant colors, brushes, and all necessary tools. Ideal for beginners and professionals.",
    price: 1399,
    originalPrice: 1599,
    discountPercentage: null,
    images: [imageUrls[2], imageUrls[3]],
    category: "Visual Arts",
    subcategory: "Painting",
    rating: 4.8,
    inStock: true,
    tags: ["painting", "watercolor", "artist grade"],
  },
  {
    id: 9,
    name: "Clay Modelling Artisan Collection",
    description:
      "Complete starter kit with essential tools, materials, and instructional guide. Create beautiful pieces with ease.",
    price: 999,
    originalPrice: null,
    discountPercentage: null,
    images: [
      "https://ideogram.ai/assets/image/lossless/response/nbnUTo2RQgO7Gh4Q3ELQJw",

      "https://images.pexels.com/photos/1129413/pexels-photo-1129413.jpeg",
      "https://images.pexels.com/photos/2249959/pexels-photo-2249959.jpeg",
    ],
    category: "Sculptural & 3D Crafts",
    subcategory: "Clay Modelling",
    rating: 4.3,
    inStock: true,
    tags: [
      "clay",
      "sculpture",
      "handmade",
      "diy",
      "3d",
      "sculptural & 3d crafts",
    ],
  },
  {
    id: 10,
    name: "Wall Décor Mixed Media Kit",
    description:
      "Professional kit with high-quality materials and detailed instructions. Perfect way to start your crafting journey.",
    price: 1499,
    originalPrice: 1899,
    discountPercentage: 21,
    images: [
      "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
      "https://images.pexels.com/photos/1852382/pexels-photo-1852382.jpeg",
    ],
    category: "Decorative Arts & Mixed Media",
    subcategory: "Wall Décor",
    rating: 4.7,
    inStock: false,
    tags: [
      "wall",
      "decor",
      "mixed media",
      "creative",
      "home",
      "decorative arts & mixed media",
    ],
  },
  {
    id: 11,
    name: "Calligraphy & Typography DIY Kit",
    description:
      "Advanced set with premium tools and materials. Perfect for creating stunning artistic pieces.",
    price: 899,
    originalPrice: 1199,

    images: [
      "https://i.ibb.co/m5ysTf92/Flux-Dev-A-beautifully-arranged-and-colorful-premium-scrapbook-3.jpg",
      "https://images.pexels.com/photos/1129413/pexels-photo-1129413.jpeg",
      "https://images.pexels.com/photos/2811087/pexels-photo-2811087.jpeg",
      "https://images.pexels.com/photos/6634686/pexels-photo-6634686.jpeg",
    ],
    category: "Visual Arts",
    subcategory: "Calligraphy & Typography",
    rating: 4.4,
    inStock: true,
    tags: ["calligraphy", "typography", "art", "pen", "ink", "visual arts"],
  },
  {
    id: 12,
    name: "Indian Folk Arts Premium Kit",
    description:
      "Professional kit with high-quality materials and detailed instructions. Perfect way to start your crafting journey.",
    price: 1299,
    originalPrice: 1699,
    discountPercentage: 24,
    images: [
      "https://ideogram.ai/assets/image/lossless/response/6i3obRvqTjSXKzpJBmYGWw",
      "https://images.pexels.com/photos/7667668/pexels-photo-7667668.jpeg",
    ],
    category: "Traditional & Cultural Crafts",
    subcategory: "Indian Folk Arts",
    rating: 4.5,
    inStock: false,
    tags: [
      "folk art",
      "indian",
      "traditional",
      "culture",
      "handcrafted",
      "traditional & cultural crafts",
    ],
  },
  {
    id: 13,
    name: "Quilling Art Starter Kit",
    description:
      "Complete beginner's kit with papers, tools, and guidebook for quilling art",
    price: 899,
    originalPrice: 1299,
    discountPercentage: 30,
    images: [imageUrls[0], imageUrls[1]],
    category: "Paper Crafts",
    subcategory: "Quilling",
    rating: 4.5,
    inStock: true,
    tags: ["paper craft", "beginner friendly", "art kit", "quilling"],
  },
  {
    id: 14,
    name: "Professional Watercolor Set",
    description: "24 premium watercolor pans with natural hair brushes",
    price: 1399,
    originalPrice: 1599,
    discountPercentage: null,
    images: [
      "https://images.pexels.com/photos/1129413/pexels-photo-1129413.jpeg",
      imageUrls[2],
      imageUrls[3],
    ],
    category: "Visual Arts",
    subcategory: "Painting",
    rating: 4.8,
    inStock: true,
    tags: ["painting", "watercolor", "artist grade"],
  },
  {
    id: 15,
    name: "Origami Paper Collection",
    description: "200 sheets of traditional Japanese origami papers",
    price: 599,
    originalPrice: 799,
    discountPercentage: 25,
    images: [imageUrls[4], imageUrls[5]],
    category: "Paper Crafts",
    subcategory: "Origami",
    rating: 4.3,
    inStock: true,
    tags: ["origami", "paper", "craft"],
  },
  {
    id: 16,
    name: "Oil Painting Starter Kit",
    description: "Complete set with canvases, oils, and brushes for beginners",
    price: 787,
    originalPrice: 1049,
    discountPercentage: 24,
    images: [imageUrls[1], imageUrls[2]],
    category: "Visual Arts",
    subcategory: "Painting",
    rating: 4.6,
    inStock: false,
    tags: ["painting", "oil", "starter kit"],
  },
  {
    id: 17,
    name: "Calligraphy Master Set",
    description:
      "Professional calligraphy set with ink, nibs, and practice sheets",
    price: 499,
    originalPrice: 799,
    discountPercentage: null,
    images: [imageUrls[3], imageUrls[4]],
    category: "Visual Arts",
    subcategory: "Calligraphy & Typography",
    rating: 4.7,
    inStock: true,
    tags: ["calligraphy", "writing", "stationery"],
  },
  {
    id: 18,
    name: "Calligraphy Master Set",
    description:
      "Professional calligraphy set with ink, nibs, and practice sheets",
    price: 499,
    originalPrice: 799,
    discountPercentage: null,
    images: [imageUrls[3], imageUrls[4]],
    category: "Visual Arts",
    subcategory: "Calligraphy & Typography",
    rating: 4.7,
    inStock: true,
    tags: ["calligraphy", "writing", "stationery"],
  },

  

  // ... Continue this pattern for remaining 25 products
];

// Sorting options
export const sortOptions = [
  { label: "Default", value: "default", direction: "asc" },
  { label: "Alphabetical (A-Z)", value: "name", direction: "asc" },
  { label: "Price (Low to High)", value: "price", direction: "asc" },
  { label: "Price (High to Low)", value: "price", direction: "desc" },
  { label: "Newest", value: "id", direction: "desc" },
  { label: "Discount", value: "discountPercentage", direction: "desc" },
  { label: "Rating", value: "rating", direction: "desc" },
];