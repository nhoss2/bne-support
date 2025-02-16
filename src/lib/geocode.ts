import type { EventData } from "@/types";

interface GeocodeResult {
  lat: number;
  lng: number;
}

export async function geocodeAddress(
  address: string,
  apiKey: string
): Promise<GeocodeResult | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address + ", Brisbane, QLD, Australia"
      )}&key=${apiKey}`
    );

    const data = await response.json();

    if (data.status === "OVER_QUERY_LIMIT") {
      throw new Error("Rate limit exceeded - please try again later");
    }

    if (data.status !== "OK") {
      console.warn(`Geocoding failed for "${address}": ${data.status}`);
      return null;
    }

    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng };
  } catch (error) {
    console.error(`Geocoding error for "${address}":`, error);
    throw error;
  }
}

export async function batchGeocodeServices(
  services: EventData[],
  apiKey: string
): Promise<EventData[]> {
  const updatedServices = [];
  const failedAddresses = [];

  for (const service of services) {
    const fullAddress = `${service.location.address}, ${service.location.suburb}`;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const coordinates = await geocodeAddress(fullAddress, apiKey);

      updatedServices.push({
        ...service,
        location: {
          ...service.location,
          coordinates: coordinates || undefined,
        },
      });

      console.log(`✓ Geocoded: ${fullAddress}`, coordinates || "(no result)");
    } catch (error) {
      console.error(`✗ Failed to geocode: ${fullAddress}`);
      failedAddresses.push(fullAddress);
      updatedServices.push(service);

      if (error instanceof Error && error.message?.includes("rate limit")) {
        console.log("Rate limit hit - pausing for 2 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  // Report results
  console.log("\nGeocoding Summary:");
  console.log(`Total addresses: ${services.length}`);
  console.log(
    `Successfully geocoded: ${services.length - failedAddresses.length}`
  );
  console.log(`Failed addresses: ${failedAddresses.length}`);

  if (failedAddresses.length > 0) {
    console.log("\nFailed addresses:");
    failedAddresses.forEach((addr) => console.log(`- ${addr}`));
  }

  return updatedServices;
}
