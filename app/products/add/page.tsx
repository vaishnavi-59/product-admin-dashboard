"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";

export default function AddProductPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

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

    if (!stock || Number(stock) < 0) {
      setError("Stock cannot be negative.");
      return;
    }

    if (loading) {
      return;
    }

    try {
      setLoading(true);

      await api.post("/products/add", {
        title: title.trim(),
        price: Number(price),
        category: category.trim(),
        description: description.trim(),
        stock: Number(stock),
      });

      setSuccess("Product added successfully.");

      setTitle("");
      setPrice("");
      setCategory("");
      setDescription("");
      setStock("");
    } catch (error) {
      console.error("Add product error:", error);
      setError("Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-3xl">

        <button
          onClick={() => router.push("/products")}
          className="mb-6 rounded-lg bg-gray-800 px-5 py-2.5 font-medium text-white hover:bg-gray-900"
        >
          ← Back to Products
        </button>

        <div className="rounded-xl bg-white p-6 shadow-lg md:p-8">

          <h1 className="mb-2 text-3xl font-bold">
            Add Product
          </h1>

          <p className="mb-6 text-gray-500">
            Add a new product to the dashboard.
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Title */}

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

            {/* Price */}

            <div>
              <label className="mb-2 block font-medium">
                Price
              </label>

              <input
                type="number"
                min="0"
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value)
                }
                placeholder="Enter price"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Category */}

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

            {/* Description */}

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

            {/* Stock */}

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
                placeholder="Enter stock quantity"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Error */}

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Success */}

            {success && (
              <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
                {success}
              </div>
            )}

            {/* Save */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Product"}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}