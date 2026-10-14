import BabyImg from "../Images/Baby.jpg";
import BirthdayImg from "../Images/Birthday.jpg";
import ChristmasImg from "../Images/Christ.jpg";
import DiwaliImg from "../Images/Diya.jpg";
import DinnerImg from "../Images/IMG_1.jpeg";
import EidImg from "../Images/Eid.jpeg";
import EidImg2 from "../Images/Eid.jpeg";
import GiftImg from "../Images/Gift.jpg";
import HousewarmingImg from "../Images/IMG_5.png";
import ImageOne from "../Images/Image1.jpg";
import ImageTwo from "../Images/image2.jpg";
import ImageThree from "../Images/image3.jpg";
import ImageFour from "../Images/image4.jpg";
import ImageFive from "../Images/image5.jpg";
import ImageSix from "../Images/image6.jpg";
import ImgOne from "../Images/IMG_1.jpg";
import ImgTwo from "../Images/IMG_2.jpg";
import ImgThree from "../Images/IMG_3.jpg";
import ImgFour from "../Images/birthday-sculpture.png";
import ImgFive from "../Images/IMG_5.jpg";
import ImgSix from "../Images/IMG_6.jpg";
import PhotoOne from "../Images/Photo1.jpeg";
import PhotoTwo from "../Images/Photo2.jpeg";
import PhotoThree from "../Images/Photo3.jpeg";
import PhotoFour from "../Images/Photo4.jpeg";
import PhotoFive from "../Images/Photo5.jpeg";
import PictureOne from "../Images/Picture1.png";
import PictureTwo from "../Images/Picture2.png";
import PictureThree from "../Images/Picture3.png";
import PictureFour from "../Images/picture4.png";
import PictureFive from "../Images/picture5.png";
import PictureSix from "../Images/picture6.png";
import PictureEight from "../Images/picture8.png";
import Leo1 from "../Images/Leonardo_Phoenix_09_A_highfashion_photograph_featuring_a_beaut_1.jpg";
import Leo2 from "../Images/Leonardo_Phoenix_09_A_stunning_highfashion_photograph_featurin_3.jpg";
import Leo3 from "../Images/Leonardo_Phoenix_09_a_stunningly_lit_highfashion_photograph_of_0.jpg";
import Leo4 from "../Images/Leonardo_Phoenix_09_Capture_exquisite_high_fashion_photography_3.jpg";
import Leo5 from "../Images/Leonardo_Phoenix_09_exquisite_high_fashion_still_life_photogra_1.jpg";
import ChrismasGiftImg from "../Images/crhrishmas-gift.jpg";
import EidDecor2Img from "../Images/eid-decor2.jpg";
import EidGiftsImg from "../Images/eid-gift.jpg";
import EidJwelleryImg from "../Images/eid-jwellery.jpg";
import EidFiguriesImg from "../Images/eid figuries.jpg";

const fallbackImg = "https://images.unsplash.com/photo-1513726214296-1f2e95e452d8?q=80&w=2068&auto=format&fit=crop";

const exactCategoryImages = {
  "diy": PictureFive,
  "paper": PhotoOne,
  "paper craft": PictureEight,
  "origami": PictureSix,
  "creative": ImageSix,
  "paper crafts": PictureEight,
  "valentine gift": GiftImg,
  "house party": HousewarmingImg,
  "dinner dates": DinnerImg,
  "baby shower": BabyImg,
  "baby shower sweaters": BabyImg,
  "anniversaries": GiftImg,
  "anniversary gift": GiftImg,
  "anniversary showpiece": GiftImg,
  "wedding gift": GiftImg,
  "festive gift": DiwaliImg,
  "custom art": ImgOne,
  "diwali lights": DiwaliImg,
  "diwali ethnic decor": DiwaliImg,
  "eid": EidImg,
  "eid special": EidImg2,
  "eid decor": EidImg,
  "eid gift": EidImg,
  "eid gifts": EidImg,
  "eid greeting": EidImg2,
  "eid enamel jewelry": EidJwelleryImg,
  "eid enamel jewellery": EidJwelleryImg,
  "eid lantern wall art": ImageFive,
  "christmas eve": ChristmasImg,
  "birthday personalized gift": BirthdayImg,
  "birthday gift": BirthdayImg,
  "eco-friendly diwali gifts": DiwaliImg,
  "luxury anniversary gift": GiftImg,
  "jewelry": Leo1,
  "jewellery": Leo2,
  "gift": GiftImg,
  "baby": BabyImg,
  "diwali": DiwaliImg,
  "crishmas gift": ChrismasGiftImg,
  "christmas gift": ChrismasGiftImg,
  "winter christmas gift": ChrismasGiftImg,
  "winter chritsmas gift": ChrismasGiftImg,
  "eid decor2": EidDecor2Img,
  "eid gift decor": EidDecor2Img,
  "eid gifts": EidGiftsImg,
  "eid jwellery": EidJwelleryImg,
  "eid figurines": EidFiguriesImg,
  "eid figuries": EidFiguriesImg,
};

const categoryImageRules = [
  { keywords: ["eid"], images: [EidImg, EidImg2] },
  { keywords: ["birthday"], images: [BirthdayImg, GiftImg] },
  { keywords: ["diwali", "diya", "deepavali", "crackers", "festival", "ethnic"], images: [DiwaliImg, HousewarmingImg] },
  { keywords: ["valentine", "anniversary", "anniversaries", "wedding", "luxury", "romantic"], images: [GiftImg] },
  { keywords: ["christmas", "christ"], images: [ChristmasImg, GiftImg] },
  { keywords: ["baby", "newborn", "babies", "kids", "toys"], images: [BabyImg] },
  { keywords: ["house party", "housewarming"], images: [HousewarmingImg, DinnerImg] },
  { keywords: ["dinner", "party", "hosting"], images: [DinnerImg, HousewarmingImg] },
  { keywords: ["origami"], images: [PictureSix, PhotoOne, PictureEight] },
  { keywords: ["paper craft", "paper crafts", "paper"], images: [PictureEight, PictureSix, PhotoOne] },
  { keywords: ["diy", "creative"], images: [PictureFive, ImageSix, PictureEight] },
  { keywords: ["painting", "canvas", "watercolor", "acrylic", "art"], images: [ImgOne, ImageOne, PhotoFour] },
  { keywords: ["drawing", "sketch", "charcoal", "pencil"], images: [ImgTwo, ImageTwo, PictureThree] },
  { keywords: ["calligraphy", "typography", "ink"], images: [ImgThree, ImageFive, PictureFour] },
  { keywords: ["pottery", "ceramic", "clay"], images: [ImgFour, ImageThree, HousewarmingImg] },
  { keywords: ["folk", "madhubani", "warli", "indian"], images: [ImgFive, PictureTwo, PhotoThree] },
  { keywords: ["flower", "ikebana"], images: [PhotoTwo, ImageSix, GiftImg] },
  { keywords: ["resin", "epoxy"], images: [ImageThree, PhotoFive, PictureTwo] },
  { keywords: ["jewelry", "jewellery", "jewelary", "jewel", "necklace", "ring", "bracelet", "bead", "beadwork"], images: [Leo1, Leo2, Leo3, Leo4, Leo5] },
  { keywords: ["embroidery", "sewing", "textile", "knitting", "crochet", "weaving", "quilting"], images: [PictureOne, PhotoFive, PictureFive] },
  { keywords: ["upcycling", "recycling", "eco", "sustainable"], images: [ImageFour, PictureEight, HousewarmingImg] },
  { keywords: ["mosaic", "tiles"], images: [PictureTwo, ImgFive, ImageThree] },
  { keywords: ["print", "linocut"], images: [ImageTwo, ImgTwo, PictureThree] },
  { keywords: ["quilling"], images: [PictureThree, PictureEight, ImageTwo] },
  { keywords: ["card", "cards"], images: [PictureFour, GiftImg, PictureThree] },
  { keywords: ["sand", "mandala"], images: [ImageFive, DiwaliImg, ImgFive] },
  { keywords: ["sculpture", "sculptural", "3d", "showpiece"], images: [ImgSix, ImgFour, HousewarmingImg] },
  { keywords: ["doll"], images: [PhotoFive, BabyImg, PictureOne] },
  { keywords: ["wall", "decor", "macrame", "boho", "home decor"], images: [HousewarmingImg, ImageOne] },
  { keywords: ["collage", "mixed media"], images: [ImageSix, PictureFive] },
  { keywords: ["gift", "gifts", "personalized", "personalised", "present", "presents"], images: [GiftImg, BirthdayImg] },
];

const fallbackPool = [
  ImageOne,
  ImageTwo,
  ImageThree,
  ImageFour,
  ImageFive,
  ImageSix,
  PhotoOne,
  PhotoTwo,
  PhotoThree,
  PhotoFour,
  PhotoFive,
  PictureOne,
  PictureTwo,
  PictureThree,
  PictureFour,
  PictureFive,
  PictureSix,
  PictureEight,
];

function normalizeTag(tag) {
  return String(tag || "").trim().toLowerCase();
}

function hashText(text) {
  return String(text || "").split("").reduce((total, char, index) => {
    return total + char.charCodeAt(0) * (index + 11);
  }, 0);
}

function getCategoryCandidates(tag) {
  const normalizedTag = normalizeTag(tag);
  const semanticCandidates = [];
  const matchedExactImage = exactCategoryImages[normalizedTag];

  if (matchedExactImage) semanticCandidates.push(matchedExactImage);

  categoryImageRules.forEach((rule) => {
    const hasKeyword = rule.keywords.some((keyword) => normalizedTag.includes(keyword));
    if (hasKeyword) {
      semanticCandidates.push(...rule.images);
    }
  });

  return [...new Set(semanticCandidates)];
}

export function getCategoryBannerImage(tag, index = 0, usedImages = new Set()) {
  const semanticCandidates = getCategoryCandidates(tag);
  
  // Prefer any semantic candidate over a fallback, even if it's already used
  if (semanticCandidates.length > 0) {
    // Try to find an unused semantic candidate first
    const unusedSemantic = semanticCandidates.find((img) => !usedImages.has(img));
    if (unusedSemantic) {
      return unusedSemantic;
    }
    // If all semantic candidates are used, just return the first one (reusing it) 
    // to maintain semantic relevance instead of showing a random image.
    return semanticCandidates[0];
  }

  // If no semantic match, fallback to random but consistent image
  const fallbackStartIndex = (hashText(normalizeTag(tag)) + index * 7) % fallbackPool.length;
  const fallbackCandidates = [];
  fallbackPool.forEach((_, offset) => {
    fallbackCandidates.push(fallbackPool[(fallbackStartIndex + offset) % fallbackPool.length]);
  });

  const availableFallback = fallbackCandidates.find((img) => !usedImages.has(img));
  return availableFallback || fallbackCandidates[0] || fallbackImg;
}

export function getCategoryBannerImages(items = []) {
  const usedImages = new Set();

  return items.map((item, index) => {
    const image = getCategoryBannerImage(item?.tag || item, index, usedImages);
    usedImages.add(image);
    return image;
  });
}

export function getHeroBannerImages(products = []) {
  const productImages = products
    .filter((product) => product.images && product.images.length > 0)
    .map((product) => product.images[0]);

  const fallbackHeroImages = [ImageOne, PhotoOne, PictureOne, ImageTwo, ImageFive, PhotoFour];
  const heroImages = [...productImages, ...fallbackHeroImages];
  const usedImages = new Set();
  const uniqueImages = heroImages.filter((image) => {
    if (usedImages.has(image)) return false;
    usedImages.add(image);
    return true;
  });

  while (uniqueImages.length < 6) {
    uniqueImages.push(fallbackHeroImages[uniqueImages.length % fallbackHeroImages.length]);
  }

  return {
    large: uniqueImages.slice(0, 3),
    small: uniqueImages.slice(3, 6),
  };
}

export function getSellerBannerImage(storeName, index = 0) {
  const key = `${storeName || "seller"}-${index}`;
  return fallbackPool[hashText(key) % fallbackPool.length] || fallbackImg;
}
