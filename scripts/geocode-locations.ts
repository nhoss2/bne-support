import { parseServicesCSV } from "../src/lib/parse-csv";
import { batchGeocodeServices } from "../src/lib/geocode";
import { loadEnv } from "vite";
import fs from "fs/promises";
import path from "path";
import Papa from "papaparse";
import type { RawServiceData } from "../src/lib/parse-csv";

async function main() {
  try {
    const env = loadEnv("", process.cwd(), "VITE_");
    process.env.VITE_GOOGLE_MAPS_API_KEY = env.VITE_GOOGLE_MAPS_API_KEY;

    if (!env.VITE_GOOGLE_MAPS_API_KEY) {
      throw new Error("Missing VITE_GOOGLE_MAPS_API_KEY environment variable");
    }

    const csvPath = path.join(process.cwd(), "services.csv");

    try {
      await fs.access(csvPath);
    } catch {
      throw new Error(`CSV file not found at: ${csvPath}`);
    }

    console.log("Reading CSV file...");
    const csvContent = await fs.readFile(csvPath, "utf-8");
    const services = parseServicesCSV(csvContent);

    console.log(`Geocoding ${services.length} services...\n`);

    const servicesWithCoordinates = await batchGeocodeServices(
      services,
      env.VITE_GOOGLE_MAPS_API_KEY
    );

    // Update CSV with new coordinates
    const originalCsv = Papa.parse<RawServiceData>(csvContent, {
      header: true,
    });

    const updatedRows = originalCsv.data.map((row, index) => ({
      ...row,
      latitude: servicesWithCoordinates[index].location.coordinates?.lat ?? "",
      longitude: servicesWithCoordinates[index].location.coordinates?.lng ?? "",
    }));

    const outputPath = csvPath.replace(".csv", "_with_coordinates.csv");
    await fs.writeFile(outputPath, Papa.unparse(updatedRows));

    console.log(`\nResults saved to: ${outputPath}`);
  } catch (error) {
    console.error("\nError:", error.message);
    process.exit(1);
  }
}

main();
