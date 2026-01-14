// Backend/services/websocket.service.js - Add these functions

const io = require('../server').io; // Assuming io is exported from server.js

/**
 * Broadcast rider location to order participants
 */
const broadcastRiderLocation = async (data) => {
  const { riderId, orderId, location, heading, speed, timestamp } = data;

  // Emit to order-specific room
  io.to(`order:${orderId}`).emit('rider:location:update', {
    riderId,
    orderId,
    location,
    heading,
    speed,
    timestamp
  });

  // Also emit to rider's personal room for debugging
  io.to(`rider:${riderId}`).emit('location:confirmed', {
    location,
    timestamp
  });
};

/**
 * Broadcast route update
 */
const broadcastRouteUpdate = async (data) => {
  const { orderId, route, eta } = data;

  io.to(`order:${orderId}`).emit('route:update', {
    route,
    eta,
    timestamp: new Date()
  });
};

/**
 * Notify customer of rider proximity
 */
const notifyRiderProximity = async (orderId, distance) => {
  io.to(`order:${orderId}`).emit('rider:proximity', {
    distance,
    message: distance < 0.5 
      ? 'Rider is arriving soon!' 
      : `Rider is ${distance.toFixed(1)} km away`,
    timestamp: new Date()
  });
};

/**
 * Handle rider connection
 */
const handleRiderConnect = (socket, riderId) => {
  socket.join(`rider:${riderId}`);
  console.log(`Rider ${riderId} connected to location tracking`);

  // Send confirmation
  socket.emit('location:ready', {
    message: 'Location tracking initialized',
    riderId
  });
};

/**
 * Handle customer tracking order
 */
const handleCustomerTrackOrder = (socket, orderId) => {
  socket.join(`order:${orderId}`);
  console.log(`Customer joined order tracking: ${orderId}`);

  // Send confirmation
  socket.emit('tracking:ready', {
    message: 'Order tracking initialized',
    orderId
  });
};

module.exports = {
  broadcastRiderLocation,
  broadcastRouteUpdate,
  notifyRiderProximity,
  handleRiderConnect,
  handleCustomerTrackOrder
};