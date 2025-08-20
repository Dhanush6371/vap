// Mock menu data for console usage
const mockMenuData = [
  {
    id: 1,
    category: "Main Course",
    name: "Grilled Chicken",
    price: 15.99,
    image: "https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=400",
    desc: "Delicious grilled chicken with herbs and spices",
    combinations: ["Rice", "Vegetables"]
  },
  {
    id: 2,
    category: "Appetizer",
    name: "Caesar Salad",
    price: 8.99,
    image: "https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=400",
    desc: "Fresh caesar salad with crispy croutons",
    combinations: ["Bread", "Dressing"]
  },
  {
    id: 3,
    category: "Main Course",
    name: "Beef Burger",
    price: 12.99,
    image: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400",
    desc: "Juicy beef burger with fresh vegetables",
    combinations: ["Fries", "Pickles"]
  },
  {
    id: 4,
    category: "Dessert",
    name: "Chocolate Cake",
    price: 6.99,
    image: "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400",
    desc: "Rich chocolate cake with cream frosting",
    combinations: ["Ice Cream", "Berries"]
  },
  {
    id: 5,
    category: "Beverage",
    name: "Fresh Orange Juice",
    price: 4.99,
    image: "https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400",
    desc: "Freshly squeezed orange juice",
    combinations: ["Ice", "Mint"]
  }
];

export async function loadMenuData() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("Menu data loaded:", mockMenuData);
    return mockMenuData;
  } catch (error) {
    console.error("Error loading menu data:", error);
    return mockMenuData; // Return mock data even if there's an error
  }
}