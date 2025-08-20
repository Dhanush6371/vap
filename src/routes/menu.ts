import { Router } from "express";


const router = Router();

// Google Sheets API config
const API_KEY = "AIzaSyA6SFA1LGwRimgKm88YUVNOj2uSzX2d5JI";
const SPREADSHEET_ID = "1IHe2YxfnBFK8iv3EaYcfH9xI9VW8GLJZi8q8x2XxeOg";
const RANGE = "Sheet1!A2:H";

function convertDriveUrlToThumbnail(url: string): string {
  if (!url) return "";
  const driveFileId = url.match(/[-\w]{25,}/);
  return driveFileId ? `https://drive.google.com/thumbnail?id=${driveFileId[0]}` : url;
}

interface SheetsResponse {
  values?: string[][];
}

router.get("/", async (_req, res) => {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Error fetching data: ${response.statusText}`
      });
    }

    const data = (await response.json()) as SheetsResponse;

    if (!data.values || !Array.isArray(data.values)) {
      return res.status(404).json({ error: "No data found in spreadsheet" });
    }

    const menuItems = data.values.map((row: string[]) => {
      let price = 0;
      const priceString = row[3] || row[4] || "0";

      try {
        const cleanedPrice = priceString.toString().replace(/[^0-9.]/g, "");
        price = parseFloat(cleanedPrice);
        if (isNaN(price)) price = parseFloat(priceString.replace(",", ".")) || 0;
      } catch {
        price = 0;
      }

      return {
        id: parseInt(row[0]) || Date.now(),
        category: row[1]?.trim() || "Uncategorized",
        name: row[2]?.trim() || "Unnamed Item",
        price,
        image: convertDriveUrlToThumbnail(row[5] || ""),
        desc: row[6]?.trim() || "",
        combinations: row[7]
          ? row[7].split(",").map((c) => c.trim()).filter(Boolean)
          : [],
      };
    });

    res.json(menuItems);
  } catch (error) {
    console.error("Error fetching spreadsheet data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
