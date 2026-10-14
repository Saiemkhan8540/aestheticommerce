import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;;

const getCategories = async () => {
  const response = await axios.get(`${BASE_URL}/api/categories`);
  return response.data;
};

const categoryService = {
  getCategories,
};

export default categoryService;