import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[\s&]+/g, "-");
}

/**
 * @returns {Promise<Array<{ name: string, subcategories: Array<{ name: string, keywords?: string[] }> }>>}
 */
export async function fetchCategories() {
  const { data } = await axios.get(`${API_URL}/api/categories`);
  return Array.isArray(data) ? data : [];
}

/**
 * @returns {Promise<string[]>}
 */
export async function fetchTrendingTags() {
  const { data } = await axios.get(`${API_URL}/products/navigation/trending-tags`, {
    params: { limit: 5 },
  });
  const tags = data?.tags;
  return Array.isArray(tags) ? tags : [];
}

/**
 * @returns {Promise<Array<Object>>}
 */
export async function fetchTopSellers() {
  try {
    const { data } = await axios.get(`${API_URL}/products/shops`);
    return Array.isArray(data) ? data.slice(0, 3) : [];
  } catch (error) {
    console.error("Failed to fetch top sellers", error);
    return [];
  }
}

export function buildProductColumn(category) {
  const links = [];
  const subs = category.subcategories || [];
  for (const sub of subs) {
    links.push({
      label: sub.name,
      to: `/${slugify(category.name)}/${slugify(sub.name)}`,
    });
    for (const kw of sub.keywords || []) {
      const k = String(kw).trim();
      if (!k) continue;
      links.push({
        label: k,
        to: `/products?tag=${encodeURIComponent(k)}`,
      });
    }
  }
  return {
    heading: category.name,
    headingTo: `/${slugify(category.name)}`,
    links,
  };
}

export function buildBlogColumn(category) {
  const links = [];
  const subs = category.subcategories || [];
  for (const sub of subs) {
    links.push({
      label: sub.name,
      to: `/blog?tag=${encodeURIComponent(slugify(sub.name))}`,
    });
    for (const kw of sub.keywords || []) {
      const k = String(kw).trim();
      if (!k) continue;
      links.push({
        label: k,
        to: `/blog?tag=${encodeURIComponent(slugify(k))}`,
      });
    }
  }
  const categoryTag = slugify(category.name);

  return {
    heading: category.name,
    headingTo: `/blog?tag=${encodeURIComponent(categoryTag)}`,
    links,
  };
}
