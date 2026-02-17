export interface Category {
  _id: string;
  name: string;
  slug?: string;
  image?: string;
}

export interface Brand {
  _id: string;
  name: string;
  logo?: string;
  slug?: string;
}

export interface ProductVariant {
  nicotine: string;
  price: number;
  discountPrice?: number;
  stock: number;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  discountPercent?: number;
  images?: string[];
  puffCount?: number;
  capacity?: string;
  resistance?: string;
  flavours?: string[];
  variants?: ProductVariant[];
  brand?: Brand | string;
  category?: Category | string;
  isHot?: boolean;
  isTopSelling?: boolean;
  isNewArrival?: boolean;
  slug?: string;
  rating?: number;
  averageRating?: number | null;
  reviewCount?: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  puffCount?: number;
  capacity?: string;
  resistance?: string;
  originalPrice?: number;
  selectedFlavour?: string;
  selectedNicotine?: string;
}

export interface Address {
  _id: string;
  phone: string;
  name: string;
  email: string;
  address: string;
  landmark?: string;
  city: string;
  state?: string;
  pincode: string;
  age: number;
}

export interface OrderProduct {
  product: Product;
  quantity: number;
  price: number;
  flavour?: string;
  nicotine?: string;
}

export interface Order {
  _id: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    age: number;
  };
  products: OrderProduct[];
  totalPrice: number;
  paymentMode: 'COD' | 'PREPAID';
  status: string;
  awbNumber?: string;
  createdAt: string;
}
