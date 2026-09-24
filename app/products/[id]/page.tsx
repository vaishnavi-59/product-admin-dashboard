"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProduct } from "../../../services/productService";

interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
}

interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  images: string[];
  thumbnail: string;
  reviews: Review[];
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const id = Number(params.id);

        if (!id || id <= 0) {
          setError("Product not found");
          return;
        }

        const data = await getProduct(id);

        setProduct(data);
      } catch (error) {
        console.error("Product details error:", error);
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">
          Loading product...
        </p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-100 p-6">
        <h1 className="text-3xl font-bold text-red-600">
          Product Not Found
        </h1>

        <p className="text-gray-600">
          The product you are looking for does not exist.
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
      <div className="mx-auto max-w-6xl">

        <div className="mb-6 flex flex-wrap gap-3">

          <button
            onClick={() => router.push("/products")}
            className="rounded-lg bg-gray-800 px-5 py-2.5 font-medium text-white hover:bg-gray-900"
          >
            ← Back to Products
          </button>

          <button
            onClick={() =>
              router.push(`/products/${product.id}/edit`)
            }
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            Edit Product
          </button>

        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg md:p-8">

          <div className="grid gap-8 md:grid-cols-2">

            {/* Product Image */}
            <div>
              <img
                src={
                  product.images?.[0] ||
                  product.thumbnail
                }
                alt={product.title}
                className="h-96 w-full rounded-xl bg-gray-50 object-contain p-6"
              />
            </div>

            {/* Product Information */}
            <div>

              <h1 className="mb-4 text-3xl font-bold text-gray-900">
                {product.title}
              </h1>

              <div className="mb-5">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium capitalize text-blue-700">
                  {product.category}
                </span>
              </div>

              <p className="mb-6 leading-7 text-gray-600">
                {product.description}
              </p>

              <div className="mb-4 text-3xl font-bold text-green-600">
                ${product.price}
              </div>

              <div className="mb-4 rounded-lg bg-yellow-50 p-4">
                <span className="font-semibold">
                  Rating:
                </span>{" "}
                ⭐ {product.rating}
              </div>

              <div
                className={`rounded-lg p-4 ${
                  product.stock > 0
                    ? "bg-green-50"
                    : "bg-red-50"
                }`}
              >
                <span className="font-semibold">
                  Stock:
                </span>{" "}
                {product.stock > 0
                  ? `${product.stock} units available`
                  : "Out of stock"}
              </div>

            </div>
          </div>

          {/* Reviews */}
          <div className="mt-10 border-t pt-8">

            <h2 className="mb-5 text-2xl font-bold">
              Reviews
            </h2>

            {product.reviews &&
            product.reviews.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">

                {product.reviews.map(
                  (review, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-gray-200 p-5"
                    >

                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">

                        <p className="font-semibold text-gray-900">
                          {review.reviewerName}
                        </p>

                        <p className="rounded-lg bg-yellow-50 px-2 py-1 text-sm text-yellow-700">
                          ⭐ {review.rating}
                        </p>

                      </div>

                      <p className="text-gray-600">
                        {review.comment}
                      </p>

                      <p className="mt-3 text-xs text-gray-400">
                        {new Date(
                          review.date
                        ).toLocaleDateString()}
                      </p>

                    </div>
                  )
                )}

              </div>
            ) : (
              <p className="text-gray-500">
                No reviews available.
              </p>
            )}

          </div>

        </div>
      </div>
    </main>
  );
}