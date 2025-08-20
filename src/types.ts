export interface CartItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  tableNum: string;
  dishes: CartItem[];
  total: string;
  orderTime: string;
  feedback?: string;
  status: 'completed' | 'preparing' | 'delivered';
}

