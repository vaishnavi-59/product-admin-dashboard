import api from "../lib/api";

export const getProducts = async (
  limit: number,
  skip: number,
  sortBy?: string,
  order?: string
) => {
  const response = await api.get("/products", {
    params: {
      limit,
      skip,
      ...(sortBy && { sortBy }),
      ...(order && { order }),
    },
  });

  return response.data;
};

export const searchProducts = async (
  query: string,
  limit: number,
  skip: number
) => {
  const response = await api.get("/products/search", {
    params: {
      q: query,
      limit,
      skip,
    },
  });

  return response.data;
};

export const getProduct = async (id: number) => {
  const response = await api.get(`/products/${id}`);

  return response.data;
};

export const getCategories = async () => {
  const response = await api.get("/products/categories");

  return response.data;
};

export const getProductsByCategory = async (
  category: string,
  limit: number,
  skip: number,
  sortBy?: string,
  order?: string
) => {
  const response = await api.get(
    `/products/category/${encodeURIComponent(category)}`,
    {
      params: {
        limit,
        skip,
        ...(sortBy && { sortBy }),
        ...(order && { order }),
      },
    }
  );

  return response.data;
};

export const deleteProduct = async (id: number) => {
  const response = await api.delete(`/products/${id}`);

  return response.data;
};