import { prisma } from '@repo/db';
import { sendPushNotification } from './firebase.service';
import { isWithinRadius } from './location.service';

const BROADCAST_RADIUS_KM = 10;

/**
 * Broadcast order notification to all on-duty delivery partners within radius
 * @param orderId - The order ID to broadcast
 * @param restaurantLat - Restaurant latitude
 * @param restaurantLng - Restaurant longitude
 * @returns Number of partners notified
 */
export async function broadcastOrderToNearbyPartners(
  orderId: string,
  restaurantLat: number,
  restaurantLng: number
): Promise<number> {
  try {
    console.log(`📢 [Broadcast] Broadcasting order ${orderId} to nearby delivery partners...`);
    console.log(`📍 [Broadcast] Restaurant location: (${restaurantLat}, ${restaurantLng})`);

    // Fetch the order details for notification content
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        orderNumber: true,
        total: true,
      },
    });

    if (!order) {
      console.error(`❌ [Broadcast] Order ${orderId} not found`);
      return 0;
    }

    // Query all on-duty, approved delivery partners with FCM tokens and locations
    const partners = await prisma.deliveryPersonnel.findMany({
      where: {
        isOnDuty: true,
        onboardingStatus: 'APPROVED',
        fcmToken: { not: null },
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        name: true,
        fcmToken: true,
        latitude: true,
        longitude: true,
      },
    });

    console.log(`👥 [Broadcast] Found ${partners.length} on-duty partners with FCM tokens`);

    if (partners.length === 0) {
      console.log('⚠️ [Broadcast] No eligible partners found');
      return 0;
    }

    // Filter partners within radius
    const nearbyPartners = partners.filter((partner) => {
      // Skip if location is invalid (0, 0)
      if (!partner.latitude || !partner.longitude ||
          (partner.latitude === 0 && partner.longitude === 0)) {
        return false;
      }

      return isWithinRadius(
        restaurantLat,
        restaurantLng,
        partner.latitude,
        partner.longitude,
        BROADCAST_RADIUS_KM
      );
    });

    console.log(`📍 [Broadcast] ${nearbyPartners.length} partners within ${BROADCAST_RADIUS_KM}km radius`);

    if (nearbyPartners.length === 0) {
      console.log('⚠️ [Broadcast] No partners within delivery radius');
      return 0;
    }

    // Send notifications to each partner
    let successCount = 0;
    const broadcastRecords: Array<{ orderId: string; personnelId: string }> = [];

    for (const partner of nearbyPartners) {
      try {
        console.log(`📱 [Broadcast] Sending to ${partner.name || 'Partner'} (${partner.id})`);

        const result = await sendPushNotification(
          partner.fcmToken!,
          'New Order Available!',
          `Order #${order.orderNumber} is ready for pickup nearby - ₹${order.total.toFixed(2)}`,
          {
            orderId: orderId,
            orderNumber: order.orderNumber,
            type: 'order_available',
          }
        );

        if (result.success) {
          // Track broadcast record only for successful notifications
          broadcastRecords.push({
            orderId: orderId,
            personnelId: partner.id,
          });

          successCount++;
          console.log(`✅ [Broadcast] Notification sent to ${partner.name || 'Partner'}`);
        } else if (result.shouldInvalidateToken) {
          // Clear invalid FCM token from database
          console.warn(`⚠️ [Broadcast] Invalid token for ${partner.name || 'Partner'}. Clearing...`);
          await prisma.deliveryPersonnel.update({
            where: { id: partner.id },
            data: { fcmToken: null },
          });
          console.log(`✅ [Broadcast] Invalid token cleared for ${partner.id}`);
        } else {
          console.warn(`⚠️ [Broadcast] Failed to send notification to ${partner.name || 'Partner'}`);
        }
      } catch (error) {
        // Log error but continue with other partners
        console.error(`❌ [Broadcast] Unexpected error sending to ${partner.id}:`, error);
      }
    }

    // Create OrderBroadcast records in batch
    if (broadcastRecords.length > 0) {
      await prisma.orderBroadcast.createMany({
        data: broadcastRecords,
      });
      console.log(`📝 [Broadcast] Created ${broadcastRecords.length} broadcast records`);
    }

    console.log(`✅ [Broadcast] Successfully notified ${successCount}/${nearbyPartners.length} partners`);
    return successCount;
  } catch (error) {
    console.error('❌ [Broadcast] Error broadcasting order:', error);
    throw error;
  }
}
