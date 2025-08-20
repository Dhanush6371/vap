export async function loadMenuData() {
  try {
    const res = await fetch("/api/menu");
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Error loading menu data:", error);
    return [];
  }
} 