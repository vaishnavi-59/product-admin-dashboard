"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getProducts,
  searchProducts,
  getCategories,
  getProductsByCategory,
  deleteProduct,
} from "../../services/productService";
import { useAuth } from "../../context/AuthContext";

interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  thumbnail: string;
}

interface ProductResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, logout } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [error, setError] = useState("");

  const [total, setTotal] = useState(0);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const searchRequestId = useRef(0);

  const urlPage = Number(searchParams.get("page")) || 1;
  const urlLimit = Number(searchParams.get("limit")) || 10;

  const page =
    urlPage > 0 && Number.isFinite(urlPage) ? urlPage : 1;

  const pageSize = [10, 20, 50].includes(urlLimit)
    ? urlLimit
    : 10;

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sortBy = searchParams.get("sortBy") || "";
  const order = searchParams.get("order") || "";

  const [searchInput, setSearchInput] = useState(search);

  const totalPages = Math.ceil(total / pageSize);

  const updateUrl = (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    sortBy?: string;
    order?: string;
  }) => {
    const query = new URLSearchParams(searchParams.toString());

    if (params.page !== undefined) {
      query.set("page", String(params.page));
    }

    if (params.limit !== undefined) {
      query.set("limit", String(params.limit));
    }

    if (params.search !== undefined) {
      if (params.search.trim()) {
        query.set("search", params.search.trim());
      } else {
        query.delete("search");
      }
    }

    if (params.category !== undefined) {
      if (params.category) {
        query.set("category", params.category);
      } else {
        query.delete("category");
      }
    }

    if (params.sortBy !== undefined) {
      if (params.sortBy) {
        query.set("sortBy", params.sortBy);
      } else {
        query.delete("sortBy");
      }
    }

    if (params.order !== undefined) {
      if (params.order) {
        query.set("order", params.order);
      } else {
        query.delete("order");
      }
    }

    router.push(`/products?${query.toString()}`);
  };

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const loadCategories = async () => {
      try {
        setCategoryLoading(true);

        const data = await getCategories();

        const categoryNames = data.map((item: any) =>
          typeof item === "string" ? item : item.slug
        );

        setCategories(categoryNames);
      } catch (error) {
        console.error("Category error:", error);
      } finally {
        setCategoryLoading(false);
      }
    };

    loadCategories();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const requestId = ++searchRequestId.current;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const skip = (page - 1) * pageSize;

        let data: ProductResponse;

        if (search.trim()) {
          data = await searchProducts(
            search.trim(),
            pageSize,
            skip
          );
        } else if (category) {
          data = await getProductsByCategory(
            category,
            pageSize,
            skip,
            sortBy || undefined,
            order || undefined
          );
        } else {
          data = await getProducts(
            pageSize,
            skip,
            sortBy || undefined,
            order || undefined
          );
        }

        if (requestId !== searchRequestId.current) {
          return;
        }

        setProducts(data.products);
        setTotal(data.total);
      } catch (error) {
        if (requestId !== searchRequestId.current) {
          return;
        }

        console.error("Product error:", error);
        setError("Failed to load products.");
      } finally {
        if (requestId === searchRequestId.current) {
          setLoading(false);
        }
      }
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [
    isAuthenticated,
    router,
    page,
    pageSize,
    search,
    category,
    sortBy,
    order,
  ]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      updateUrl({
        page: totalPages,
      });
    }
  }, [page, totalPages]);

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    setSearchInput(value);

    updateUrl({
      search: value,
      page: 1,
      category: "",
    });
  };

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;

    updateUrl({
      category: value,
      page: 1,
      search: "",
    });
  };

  const handleSortChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;

    if (!value) {
      updateUrl({
        sortBy: "",
        order: "",
        page: 1,
      });

      return;
    }

    const [newSortBy, newOrder] = value.split("-");

    updateUrl({
      sortBy: newSortBy,
      order: newOrder,
      page: 1,
    });
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    updateUrl({
      limit: Number(event.target.value),
      page: 1,
    });
  };

  const handleDelete = async (product: Product) => {
    if (deletingId !== null) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(product.id);
      setError("");

      await deleteProduct(product.id);

      setProducts((currentProducts) =>
        currentProducts.filter(
          (item) => item.id !== product.id
        )
      );

      setTotal((currentTotal) =>
        Math.max(currentTotal - 1, 0)
      );
    } catch (error) {
      console.error("Delete error:", error);
      setError("Failed to delete product. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleRetry = () => {
    router.refresh();
  };

  const startItem =
    total === 0 ? 0 : (page - 1) * pageSize + 1;

  const endItem = Math.min(page * pageSize, total);

  const currentSort =
    sortBy && order ? `${sortBy}-${order}` : "";

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Product Admin Dashboard
            </h1>

            <p className="mt-1 text-gray-500">
              Manage your products
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/products/add")}
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
            >
              + Add Product
            </button>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          <div className="grid gap-4 md:grid-cols-3">

            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <select
              value={search ? "" : category}
              onChange={handleCategoryChange}
              disabled={!!search || categoryLoading}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value="">
                {categoryLoading
                  ? "Loading categories..."
                  : "All Categories"}
              </option>

              {!search &&
                categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
            </select>

            <select
              value={currentSort}
              onChange={handleSortChange}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3"
            >
              <option value="">Sort By</option>

              <option value="price-asc">
                Price: Low to High
              </option>

              <option value="price-desc">
                Price: High to Low
              </option>

              <option value="rating-desc">
                Rating: High to Low
              </option>

              <option value="rating-asc">
                Rating: Low to High
              </option>

              <option value="title-asc">
                Title: A to Z
              </option>

              <option value="title-desc">
                Title: Z to A
              </option>
            </select>
          </div>

          {search && (
            <p className="mt-3 text-sm text-gray-500">
              Category filtering is disabled while searching because
              DummyJSON does not support combining search and category
              filtering.
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
            <p>{error}</p>

            <button
              onClick={handleRetry}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {loading && (
          <div className="rounded-lg bg-white p-10 text-center shadow">
            <p className="text-gray-500">
              Loading products...
            </p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="rounded-lg bg-white p-10 text-center shadow">
            <p className="text-gray-500">
              No products found.
            </p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-lg bg-white shadow md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Image
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Title
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Category
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Price
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Rating
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Stock
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              router.push(
                                `/products/${product.id}`
                              )
                            }
                            className="text-left font-medium text-blue-600 hover:underline"
                          >
                            {product.title}
                          </button>
                        </td>

                        <td className="px-6 py-4 capitalize text-gray-600">
                          {product.category}
                        </td>

                        <td className="px-6 py-4">
                          ${product.price}
                        </td>

                        <td className="px-6 py-4">
                          ⭐ {product.rating}
                        </td>

                        <td className="px-6 py-4">
                          {product.stock}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex gap-2">

                            <button
                              onClick={() =>
                                router.push(
                                  `/products/${product.id}/edit`
                                )
                              }
                              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(product)
                              }
                              disabled={
                                deletingId === product.id
                              }
                              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId === product.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-4 md:hidden">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-lg bg-white p-4 shadow"
                >
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="mb-4 h-48 w-full rounded-lg object-cover"
                  />

                  <button
                    onClick={() =>
                      router.push(
                        `/products/${product.id}`
                      )
                    }
                    className="text-left font-semibold text-blue-600 hover:underline"
                  >
                    {product.title}
                  </button>

                  <p className="mt-1 capitalize text-sm text-gray-500">
                    {product.category}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <p>
                      <span className="font-medium">
                        Price:
                      </span>{" "}
                      ${product.price}
                    </p>

                    <p>
                      <span className="font-medium">
                        Rating:
                      </span>{" "}
                      ⭐ {product.rating}
                    </p>

                    <p>
                      <span className="font-medium">
                        Stock:
                      </span>{" "}
                      {product.stock}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      router.push(
                        `/products/${product.id}/edit`
                      )
                    }
                    className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
                  >
                    Edit Product
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(product)
                    }
                    disabled={
                      deletingId === product.id
                    }
                    className="mt-2 w-full rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === product.id
                      ? "Deleting..."
                      : "Delete Product"}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg bg-white p-5 shadow">
              <div className="flex flex-col gap-4">

                <p className="text-center text-sm text-gray-600 md:text-left">
                  Showing{" "}
                  <span className="font-semibold">
                    {startItem}
                  </span>{" "}
                  –{" "}
                  <span className="font-semibold">
                    {endItem}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold">
                    {total}
                  </span>
                </p>

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                  <div className="flex items-center justify-center gap-2 md:justify-start">
                    <label
                      htmlFor="pageSize"
                      className="text-sm text-gray-600"
                    >
                      Page size:
                    </label>

                    <select
                      id="pageSize"
                      value={pageSize}
                      onChange={handlePageSizeChange}
                      className="rounded-lg border border-gray-300 px-3 py-2"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2">

                    <button
                      onClick={() =>
                        updateUrl({
                          page: page - 1,
                        })
                      }
                      disabled={page <= 1}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>

                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1
                    ).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() =>
                          updateUrl({
                            page: pageNumber,
                          })
                        }
                        className={`rounded-lg px-3 py-2 text-sm ${
                          page === pageNumber
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}

                    <button
                      onClick={() =>
                        updateUrl({
                          page: page + 1,
                        })
                      }
                      disabled={
                        page >= totalPages ||
                        totalPages === 0
                      }
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>

                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
          <p className="text-gray-500">
            Loading products...
          </p>
        </main>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}