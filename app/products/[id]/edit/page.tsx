"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProduct } from "../../../../services/productService";
import api from "../../../../lib/api";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const id = Number(params.id);

        if (!id || id <= 0) {
          setError("Product not found.");
          return;
        }

        const data = await getProduct(id);

        setTitle(data.title || "");
        setPrice(String(data.price ?? ""));
        setCategory(data.category || "");
        setDescription(data.description || "");
        setStock(String(data.stock ?? ""));
      } catch (error) {
        console.error("Load product error:", error);
        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Product title is required.");
      return;
    }

    if (!price || Number(price) <= 0) {
      setError("Price must be greater than 0.");
      return;
    }

    if (!category.trim()) {
      setError("Category is required.");
      return;
    }

    if (!description.trim()) {
      setError("Description is required.");
      return;
    }

    if (stock === "" || Number(stock) < 0) {
      setError("Stock cannot be negative.");
      return;
    }

    try {
      setSaving(true);

      const id = Number(params.id);

      const productData = {
        title: title.trim(),
        price: Number(price),
        category: category.trim(),
        description: description.trim(),
        stock: Number(stock),
      };

      await api.put(`/products/${id}`, productData);

      setSuccess("Product updated successfully.");

      setTimeout(() => {
        router.push("/products");
      }, 1000);
    } catch (error) {
      console.error("Update product error:", error);
      setError("Failed to update product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">
          Loading product...
        </p>
      </main>
    );
  }

  if (error && !title && !category) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-100 p-6">
        <h1 className="text-3xl font-bold text-red-600">
          Product Not Found
        </h1>

        <p className="text-gray-600">
          The product you are trying to edit does not exist.
        </p>

        <button
          onClick={() => router.push("/products")}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Back to Products
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-3xl">

        <button
          type="button"
          onClick={() => router.push("/products")}
          className="mb-6 rounded-lg bg-gray-800 px-5 py-2.5 font-medium text-white hover:bg-gray-900"
        >
          ← Back to Products
        </button>

        <div className="rounded-xl bg-white p-6 shadow-lg md:p-8">

          <h1 className="mb-2 text-3xl font-bold">
            Edit Product
          </h1>

          <p className="mb-6 text-gray-500">
            Update the product information below.
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>
              <label className="mb-2 block font-medium">
                Product Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Enter product title"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Price
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value)
                }
                placeholder="Enter price"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Category
              </label>

              <input
                type="text"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                placeholder="Enter category"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Enter product description"
                rows={5}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Stock
              </label>

              <input
                type="number"
                min="0"
                value={stock}
                onChange={(event) =>
                  setStock(event.target.value)
                }
                placeholder="Enter stock"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Updating..." : "Update Product"}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}