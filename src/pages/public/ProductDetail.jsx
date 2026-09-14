import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  BatteryCharging,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

import client from "../../api/client";


function getImageUrl(img) {
  if (!img) return null;

  if (/^https?:\/\//i.test(img)) {
    return img;
  }

  const apiBase =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000/api";

  const backendOrigin = apiBase.replace(/\/api\/?$/, "");

  return `${backendOrigin}${img.startsWith("/") ? "" : "/"}${img}`;
}


export default function ProductDetail() {

  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    setLoading(true);

    // FIX: Added "/api" prefix so it correctly reaches the backend router endpoint
    client
      .get(`/api/public-products/${id}/`)
      .then((r) => {
        setProduct(r.data);
      })
      .catch((err) => {
        console.error("Failed to load product:", err);
        setProduct(null);
      })
      .finally(() => {
        setLoading(false);
      });

  }, [id]);


  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-muted">
        Loading…
      </div>
    );
  }


  if (!product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">

        <p className="text-coral mb-4">
          Product not found.
        </p>

        <Link
          to="/products"
          className="text-emerald-dark font-medium"
        >
          Back to Products
        </Link>

      </div>
    );
  }


  const features = Array.isArray(product.features)
    ? product.features
    : String(product.features || "")
        .split("\n")
        .filter(Boolean);


  const specs = product.specifications || {};

  const imageUrl = getImageUrl(product.image);


  // Public detail page ALWAYS uses public_price.
  const publicPrice =
    product.public_price ??
    product.price ??
    0;


  return (

    <div className="max-w-5xl mx-auto px-4 py-12">

      {/* BACK */}
      <Link
        to="/products"
        className="text-sm text-muted flex items-center gap-1.5 mb-6 hover:text-ink"
      >
        <ArrowLeft size={14} />
        Back to Products
      </Link>


      <div className="grid md:grid-cols-2 gap-10">


        {/* PRODUCT IMAGE */}
        <div className="h-80 bg-white rounded-xl2 shadow-card border border-black/[0.04] flex items-center justify-center overflow-hidden">

          {imageUrl ? (

            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover rounded-xl2"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />

          ) : (

            <BatteryCharging
              size={64}
              className="text-emerald/30"
            />

          )}

        </div>


        {/* PRODUCT INFORMATION */}
        <div>

          {/* AVAILABILITY */}
          <span
            className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-3 ${
              product.availability
                ? "bg-emerald/10 text-emerald-dark"
                : "bg-coral/10 text-coral"
            }`}
          >
            {product.availability
              ? "In Stock"
              : "Out of Stock"}
          </span>


          {/* NAME */}
          <h1 className="font-display text-2xl font-semibold text-ink mb-1">
            {product.name}
          </h1>


          {/* MODEL */}
          <p className="text-sm text-muted mb-5">
            {product.model_number || "N/A"}
            {" · "}
            {product.category || "EV"}
          </p>


          {/* PUBLIC PRICE */}
          <div className="mb-6">

            <p className="text-xs text-muted uppercase tracking-wide mb-1">
              Visitor Price
            </p>

            <p className="font-display text-3xl font-semibold text-emerald-dark">
              ₹
              {Number(publicPrice).toLocaleString("en-IN")}
            </p>

          </div>


          {/* DESCRIPTION */}
          <p className="text-sm text-muted leading-relaxed mb-6">
            {product.description || "No description available."}
          </p>


          {/* FEATURES */}
          {features.length > 0 && (

            <div className="mb-6">

              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                Features
              </p>

              <ul className="space-y-2">

                {features.map((feature, index) => (

                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-ink"
                  >

                    <CheckCircle2
                      size={15}
                      className="text-emerald mt-0.5 shrink-0"
                    />

                    {feature}

                  </li>

                ))}

              </ul>

            </div>

          )}


          {/* SPECIFICATIONS */}
          {Object.keys(specs).length > 0 && (

            <div>

              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                Specifications
              </p>

              <div className="bg-white rounded-lg border border-black/[0.06] divide-y divide-black/[0.05]">

                {Object.entries(specs).map(([key, value]) => (

                  <div
                    key={key}
                    className="flex justify-between px-4 py-2.5 text-sm"
                  >

                    <span className="text-muted">
                      {key}
                    </span>

                    <span className="text-ink font-medium">
                      {String(value)}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          )}


          {/* CTA */}
          <Link
            to="/vendor/register"
            className="inline-block mt-7 bg-ink text-volt font-medium px-5 py-2.5 rounded-lg"
          >
            Register as a Vendor to Order
          </Link>

        </div>

      </div>

    </div>
  );
}