import { useNavigate } from "react-router-dom";
import { ProductCreator } from "@/features/products";

export function ProductCreatePage() {
  const navigate = useNavigate();

  return (
    <ProductCreator
      onBack={() => navigate("/products")}
      // replace: "back" from the new product must not return to an empty create form
      onCreated={(id) => navigate(`/products/${id}`, { replace: true })}
    />
  );
}
