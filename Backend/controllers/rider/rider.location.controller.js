// Backend/controllers/rider/rider.location.controller.js

const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const Rider = require('../../models/rider.model');
const Order = require('../../models/order.model');
const { broadcastRiderLocation } = require('../../services/websocket.service');
const { calculateDistance, getOptimalRoute } = require('../../utils/geolocationService');

/**
 * Update rider's current location
 */
exports.updateLocation = catchAsync(async (req, res, next) => {
  const { latitude, longitude, heading, speed } = req.body;
  const riderId = req.user._id;

  // Validate coordinates
  if (!latitude || !longitude) {
    return next(new AppError('Latitude and longitude are required', 400));
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return next(new AppError('Invalid coordinates', 400));
  }

  // Update rider location
  const rider = await Rider.findByIdAndUpdate(
    riderId,
    {
      currentLocation: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      lastLocationUpdate: new Date(),
      heading: heading || 0,
      speed: speed || 0,
      isOnline: true
    },
    { new: true, runValidators: true }
  );

  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  // Get active delivery
  const activeOrder = await Order.findOne({
    rider: riderId,
    status: { $in: ['picked_up', 'out_for_delivery'] }
  });

  // Broadcast location to relevant parties
  if (activeOrder) {
    await broadcastRiderLocation({
      riderId: riderId.toString(),
      orderId: activeOrder._id.toString(),
      location: { latitude, longitude },
      heading,
      speed,
      timestamp: new Date()
    });

    // Calculate ETA if order exists
    const destination = activeOrder.deliveryAddress.location;
    if (destination) {
      const distance = calculateDistance(
        latitude,
        longitude,
        destination.coordinates[1],
        destination.coordinates[0]
      );

      // Update order with ETA (assuming average speed of 30 km/h in city)
      const avgSpeed = speed > 0 ? speed : 30;
      const eta = Math.ceil((distance / avgSpeed) * 60); // minutes

      await Order.findByIdAndUpdate(activeOrder._id, {
        estimatedDeliveryTime: new Date(Date.now() + eta * 60000),
        'tracking.lastUpdate': new Date(),
        'tracking.currentDistance': distance
      });
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      location: {
        latitude,
        longitude,
        heading,
        speed
      },
      timestamp: rider.lastLocationUpdate
    }
  });
});

/**
 * Get optimal route to delivery address
 */
exports.getRoute = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const riderId = req.user._id;

  // Get order details
  const order = await Order.findById(orderId).populate('rider');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.rider._id.toString() !== riderId.toString()) {
    return next(new AppError('Unauthorized to access this order', 403));
  }

  // Get rider's current location
  const rider = await Rider.findById(riderId);
  
  if (!rider.currentLocation) {
    return next(new AppError('Rider location not available', 400));
  }

  const origin = {
    lat: rider.currentLocation.coordinates[1],
    lng: rider.currentLocation.coordinates[0]
  };

  // Determine destination based on order status
  let destination;
  if (order.status === 'confirmed' || order.status === 'preparing') {
    // Route to restaurant/pickup location
    destination = {
      lat: order.restaurant?.location?.coordinates[1] || order.pickupLocation?.coordinates[1],
      lng: order.restaurant?.location?.coordinates[0] || order.pickupLocation?.coordinates[0]
    };
  } else {
    // Route to delivery address
    destination = {
      lat: order.deliveryAddress.location.coordinates[1],
      lng: order.deliveryAddress.location.coordinates[0]
    };
  }

  // Get optimal route from routing service
  const route = await getOptimalRoute(origin, destination);

  if (!route) {
    return next(new AppError('Unable to calculate route', 500));
  }

  res.status(200).json({
    status: 'success',
    data: {
      route,
      origin,
      destination,
      distance: route.distance,
      duration: route.duration,
      steps: route.steps
    }
  });
});

/**
 * Get rider's location history for an order
 */
exports.getLocationHistory = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  
  const order = await Order.findById(orderId)
    .populate({
      path: 'rider',
      select: 'name phone currentLocation locationHistory'
    });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Check authorization (rider, customer, or admin)
  const userId = req.user._id.toString();
  const isAuthorized = 
    order.rider?._id.toString() === userId ||
    order.user?.toString() === userId ||
    req.user.role === 'admin';

  if (!isAuthorized) {
    return next(new AppError('Unauthorized to access this data', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      currentLocation: order.rider?.currentLocation,
      locationHistory: order.rider?.locationHistory || [],
      lastUpdate: order.rider?.lastLocationUpdate
    }
  });
});

/**
 * Mark arrival at pickup/delivery location
 */
exports.markArrival = catchAsync(async (req, res, next) => {
  const { orderId, locationType } = req.body; // locationType: 'pickup' or 'delivery'
  const riderId = req.user._id;

  const order = await Order.findById(orderId);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.rider.toString() !== riderId.toString()) {
    return next(new AppError('Unauthorized', 403));
  }

  const rider = await Rider.findById(riderId);
  const riderLocation = {
    lat: rider.currentLocation.coordinates[1],
    lng: rider.currentLocation.coordinates[0]
  };

  // Determine target location
  let targetLocation;
  if (locationType === 'pickup') {
    targetLocation = {
      lat: order.restaurant?.location?.coordinates[1],
      lng: order.restaurant?.location?.coordinates[0]
    };
  } else {
    targetLocation = {
      lat: order.deliveryAddress.location.coordinates[1],
      lng: order.deliveryAddress.location.coordinates[0]
    };
  }

  // Verify rider is within acceptable range (100 meters)
  const distance = calculateDistance(
    riderLocation.lat,
    riderLocation.lng,
    targetLocation.lat,
    targetLocation.lng
  );

  if (distance > 0.1) { // 100 meters
    return next(new AppError('You must be at the location to mark arrival', 400));
  }

  // Update order tracking
  const updateData = {
    [`tracking.${locationType}ArrivalTime`]: new Date(),
    [`tracking.${locationType}Location`]: rider.currentLocation
  };

  await Order.findByIdAndUpdate(orderId, updateData);

  res.status(200).json({
    status: 'success',
    message: `Arrival at ${locationType} location confirmed`,
    data: {
      arrivedAt: new Date(),
      distance
    }
  });
});

/**
 * Toggle rider online/offline status
 */
exports.toggleOnlineStatus = catchAsync(async (req, res, next) => {
  const riderId = req.user._id;
  const { isOnline } = req.body;

  const rider = await Rider.findByIdAndUpdate(
    riderId,
    { 
      isOnline,
      lastStatusChange: new Date()
    },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      isOnline: rider.isOnline,
      lastStatusChange: rider.lastStatusChange
    }
  });
});

/**
 * Get nearby riders for admin/dispatch
 */
exports.getNearbyRiders = catchAsync(async (req, res, next) => {
  const { latitude, longitude, radius = 5 } = req.query; // radius in km

  if (!latitude || !longitude) {
    return next(new AppError('Location coordinates required', 400));
  }

  const riders = await Rider.find({
    isOnline: true,
    isApproved: true,
    currentLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        $maxDistance: radius * 1000 // Convert km to meters
      }
    }
  }).select('name phone currentLocation lastLocationUpdate vehicleType');

  res.status(200).json({
    status: 'success',
    results: riders.length,
    data: { riders }
  });
});