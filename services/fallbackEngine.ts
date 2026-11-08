import { prisma } from '@/lib/prisma';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RequestedItem {
  medicineId: string;
  quantity: number;
  medicineName?: string;
}

export interface FallbackPharmacyResult {
  pharmacyId: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  lat: number;
  lng: number;
  distanceKm: number;
  etaMinutes: number;
  stockMatchRatio: number;
  allInStock: boolean;
  score: number;
  availableItems: {
    medicineId: string;
    medicineName: string;
    availableQty: number;
    requestedQty: number;
    inStock: boolean;
    price: number;
  }[];
}

/**
 * Calculates great-circle distance between two coordinates in kilometers using the Haversine formula.
 */
export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Calculates estimated delivery time (store prep time + transit time at average urban speed).
 */
export function calculateEtaMinutes(distanceKm: number, prepTimeMinutes: number = 15, avgSpeedKmh: number = 18): number {
  const transitMinutes = (distanceKm / avgSpeedKmh) * 60;
  return Math.round(prepTimeMinutes + transitMinutes);
}

/**
 * Ranks pharmacy candidates using a 4-factor weighted score:
 * - Stock Match: 40% (must have unexpired requested stock)
 * - Distance: 30% (closer is higher score)
 * - ETA: 15% (faster delivery is higher score)
 * - Rating: 15% (customer rating out of 5)
 */
export function calculatePharmacyScore({
  stockMatchRatio,
  distanceKm,
  maxRadiusKm,
  etaMinutes,
  rating,
}: {
  stockMatchRatio: number; // 0 to 1
  distanceKm: number;
  maxRadiusKm: number;
  etaMinutes: number;
  rating: number; // 0 to 5
}): number {
  const distanceScore = Math.max(0, 1 - distanceKm / maxRadiusKm);
  // Cap ETA score between 0 and 1, assuming 60 mins max realistic delivery
  const etaScore = Math.max(0, 1 - etaMinutes / 60);
  const ratingScore = Math.min(1, Math.max(0, rating / 5.0));

  const weighted =
    stockMatchRatio * 0.4 +
    distanceScore * 0.3 +
    etaScore * 0.15 +
    ratingScore * 0.15;

  return Math.round(weighted * 100) / 100;
}

/**
 * Checks if an active order is delayed past its promised delivery window.
 * Default threshold is 10 minutes past promised ETA.
 */
export function isOrderDelayed(
  order: {
    status: string;
    promisedEta: Date;
    deliveredAt?: Date | null;
  },
  delayThresholdMinutes: number = 10,
  currentTime: Date = new Date()
): boolean {
  // If already delivered or cancelled, it's not currently delayed
  if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
    return false;
  }

  const promisedTimeMs = new Date(order.promisedEta).getTime();
  const thresholdMs = delayThresholdMinutes * 60 * 1000;
  const cutoffTimeMs = promisedTimeMs + thresholdMs;

  return currentTime.getTime() > cutoffTimeMs;
}

/**
 * Queries all approved & open pharmacies within the search radius,
 * checks their valid (non-expired) inventory for requested items,
 * and returns ranked alternatives with live distance and ETA.
 */
export async function findFallbackPharmacies({
  customerLat,
  customerLng,
  items,
  excludePharmacyId,
  maxRadiusKm = 5.0,
  maxResults = 5,
}: {
  customerLat: number;
  customerLng: number;
  items: RequestedItem[];
  excludePharmacyId?: string;
  maxRadiusKm?: number;
  maxResults?: number;
}): Promise<FallbackPharmacyResult[]> {
  const now = new Date();

  // Fetch candidate pharmacies
  const pharmacies = await prisma.pharmacy.findMany({
    where: {
      isApproved: true,
      isOpen: true,
      ...(excludePharmacyId ? { id: { not: excludePharmacyId } } : {}),
    },
    include: {
      batches: {
        where: {
          isFlaggedExpired: false,
          expiryDate: { gt: now },
          quantity: { gt: 0 },
        },
        include: {
          medicine: true,
        },
      },
    },
  });

  const results: FallbackPharmacyResult[] = [];

  for (const pharmacy of pharmacies) {
    const distanceKm = haversineDistanceKm(
      customerLat,
      customerLng,
      pharmacy.lat,
      pharmacy.lng
    );

    if (distanceKm > maxRadiusKm) {
      continue;
    }

    const etaMinutes = calculateEtaMinutes(distanceKm, pharmacy.prepTimeMinutes);

    // Evaluate stock for requested items
    let matchedItemCount = 0;
    const availableItems = items.map((req) => {
      // Sum all unexpired batch quantities for this medicine at this pharmacy
      const matchingBatches = pharmacy.batches.filter((b) => b.medicineId === req.medicineId);
      const totalAvailable = matchingBatches.reduce((sum, b) => sum + b.quantity, 0);
      const inStock = totalAvailable >= req.quantity;
      if (inStock) matchedItemCount++;

      const medicineName = req.medicineName || matchingBatches[0]?.medicine.name || 'Medicine';
      const salePrice = matchingBatches[0]?.salePrice || 0;

      return {
        medicineId: req.medicineId,
        medicineName,
        availableQty: totalAvailable,
        requestedQty: req.quantity,
        inStock,
        price: salePrice,
      };
    });

    const stockMatchRatio = items.length > 0 ? matchedItemCount / items.length : 1;
    const allInStock = matchedItemCount === items.length;

    // Filter out pharmacies with 0 matches unless all stores have 0
    if (stockMatchRatio === 0 && items.length > 0) {
      continue;
    }

    const score = calculatePharmacyScore({
      stockMatchRatio,
      distanceKm,
      maxRadiusKm,
      etaMinutes,
      rating: pharmacy.rating,
    });

    results.push({
      pharmacyId: pharmacy.id,
      name: pharmacy.name,
      address: pharmacy.address,
      phone: pharmacy.phone,
      rating: pharmacy.rating,
      lat: pharmacy.lat,
      lng: pharmacy.lng,
      distanceKm,
      etaMinutes,
      stockMatchRatio,
      allInStock,
      score,
      availableItems,
    });
  }

  // Sort descending by calculated score
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, maxResults);
}

