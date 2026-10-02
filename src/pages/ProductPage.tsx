import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ProductEditor } from "@/features/products";

export function ProductPage() {
  const navigate = useNavigate();
  const id = Number(useParams().id);

  if (!Number.isInteger(id) || id <= 0) return <Navigate to="/products" replace />;

  return <ProductEditor productId={id} onBack={() => navigate("/products")} />;
}
