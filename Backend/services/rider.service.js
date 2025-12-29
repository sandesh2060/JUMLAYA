const Rider = require('../models/rider.model');
const Order = require('../models/order.model');

class RiderService {
  // Get rider by user ID
  async getRiderByUserId(userId) {
    return await Rider.findOne({ user: userId })
      .populate('user', 'name email phone avatar')
      .populate('currentOrders');
  }

  // Get rider by rider code
  async getRiderByCode(riderCode) {
    return await Rider.findOne({ riderCode })
      .populate('user', 'name email phone avatar');
  }

  // Get available riders near location
  async getAvailableRidersNearLocation(longitude, latitude, maxDistance = 5000) {
    return await Rider.find({
      status: 'active',
      'verification.isVerified': true,
      isSuspended: false,
      isDeleted: false,
      'currentLocation.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance // meters
        }
      }
    })
      .populate('user', 'name phone avatar')
      .limit(10);
  }

  // Find best rider for order
  async findBestRiderForOrder(orderLocation, orderValue) {
    const riders = await this.getAvailableRidersNearLocation(
      orderLocation.longitude,
      orderLocation.latitude,
      10000 // 10km radius
    );

    // Filter riders who can accept more orders
    const eligibleRiders = riders.filter(rider => 
      rider.currentOrders.length < rider.maxActiveOrders
    );

    if (eligibleRiders.length === 0) {
      return null;
    }

    // Sort by rating and distance
    eligibleRiders.sort((a, b) => {
      const ratingDiff = b.rating.average - a.rating.average;
      if (Math.abs(ratingDiff) > 0.5) {
        return ratingDiff;
      }
      // If ratings are close, prefer rider with fewer active orders
      return a.currentOrders.length - b.currentOrders.length;
    });

    return eligibleRiders[0];
  }

  // Update rider location
  async updateRiderLocation(riderId, latitude, longitude, address) {
    const rider = await Rider.findById(riderId);
    if (!rider) {
      throw new Error('Rider not found');
    }

    return await rider.updateLocation(latitude, longitude);
  }

  // Update rider status
  async updateRiderStatus(riderId, status) {
    const rider = await Rider.findById(riderId);
    if (!rider) {
      throw new Error('Rider not found');
    }

    return await rider.updateStatus(status);
  }

  // Get rider statistics
  async getRiderStatistics(riderId) {
    const rider = await Rider.findById(riderId);
    if (!rider) {
      throw new Error('Rider not found');
    }

    const orders = await Order.find({
      rider: riderId,
      status: 'delivered'
    }).select('totalAmount deliveredAt createdAt');

    const totalOrders = orders.length;
    const totalEarnings = orders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0);

    // Calculate average delivery time
    const deliveryTimes = orders
      .filter(o => o.deliveredAt && o.createdAt)
      .map(o => (o.deliveredAt - o.createdAt) / (1000 * 60)); // minutes

    const avgDeliveryTime = deliveryTimes.length > 0
      ? deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length
      : 0;

    return {
      totalOrders,
      totalEarnings,
      averageDeliveryTime: Math.round(avgDeliveryTime),
      rating: rider.rating,
      completionRate: rider.stats.acceptanceRate,
      currentOrders: rider.currentOrders.length
    };
  }

  // Get rider earnings
  async getRiderEarnings(riderId, period = 'all') {
    const rider = await Rider.findById(riderId);
    if (!rider) {
      throw new Error('Rider not found');
    }

    let earnings = {
      total: rider.earnings.total,
      pending: rider.earnings.pending,
      paid: rider.earnings.paid
    };

    if (period === 'today') {
      earnings.amount = rider.stats.todayEarnings;
    } else if (period === 'week') {
      earnings.amount = rider.stats.weeklyEarnings;
    } else if (period === 'month') {
      earnings.amount = rider.stats.monthlyEarnings;
    }

    return earnings;
  }

  // Assign order to rider
  async assignOrderToRider(riderId, orderId) {
    const rider = await Rider.findById(riderId);
    if (!rider) {
      throw new Error('Rider not found');
    }

    if (!rider.canAcceptOrders) {
      throw new Error('Rider cannot accept orders at this time');
    }

    return await rider.acceptOrder(orderId);
  }

  // Complete delivery
  async completeDelivery(riderId, orderId, earnings) {
    const rider = await Rider.findById(riderId);
    if (!rider) {
      throw new Error('Rider not found');
    }

    await rider.completeOrder(orderId);
    if (earnings) {
      await rider.addEarnings(earnings, orderId, 'delivery');
    }

    return rider;
  }

  // Get rider active orders
  async getRiderActiveOrders(riderId) {
    return await Order.find({
      rider: riderId,
      status: { $in: ['confirmed', 'preparing', 'ready', 'picked_up', 'out_for_delivery'] }
    })
      .populate('user', 'name phone')
      .populate('deliveryAddress')
      .sort({ createdAt: -1 });
  }

  // Get rider order history
  async getRiderOrderHistory(riderId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const orders = await Order.find({
      rider: riderId,
      status: { $in: ['delivered', 'cancelled'] }
    })
      .populate('user', 'name phone')
      .populate('deliveryAddress')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({
      rider: riderId,
      status: { $in: ['delivered', 'cancelled'] }
    });

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = new RiderService();