export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number | null;
}

export interface CartItem {
  product: Pick<Product, "id" | "name" | "price">;
  quantity: number;
  totalPrice: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  totalPrice: number;
}

export interface User {
  user_id: number;
  name: string;
  email: string;
}

export interface Order {
  id: number;
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  createdAt: string;
  items: CartItem[];
  totalPrice: number;
}

export interface Category {
  id: number;
  name: string;
  image: string;
  line: string;
}
