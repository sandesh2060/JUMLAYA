const { Server } = require('socket.io');

let io;
const userSockets = new Map(); // userId -> socketId mapping

// Initialize WebSocket server
const initializeWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // User authentication
    socket.on('authenticate', (userId) => {
      if (userId) {
        userSockets.set(userId.toString(), socket.id);
        socket.userId = userId;
        socket.join(`user:${userId}`);
        console.log(`User ${userId} authenticated with socket ${socket.id}`);
        
        // Send confirmation
        socket.emit('authenticated', { userId, socketId: socket.id });
      }
    });

    // Rider authentication and location updates
    socket.on('rider:authenticate', (riderId) => {
      if (riderId) {
        socket.riderId = riderId;
        socket.join(`rider:${riderId}`);
        userSockets.set(riderId.toString(), socket.id);
        console.log(`Rider ${riderId} authenticated`);
      }
    });

    // Rider location update
    socket.on('rider:location', async (data) => {
      if (socket.riderId) {
        try {
          const Rider = require('../models/rider.model');
          const rider = await Rider.findOne({ user: socket.riderId });
          
          if (rider) {
            await rider.updateLocation(data.latitude, data.longitude);
            
            // Broadcast location to relevant users
            if (rider.currentOrders && rider.currentOrders.length > 0) {
              const Order = require('../models/order.model');
              
              for (const orderId of rider.currentOrders) {
                const order = await Order.findById(orderId);
                if (order) {
                  io.to(`user:${order.user}`).emit('rider:location:update', {
                    riderId: socket.riderId,
                    location: {
                      latitude: data.latitude,
                      longitude: data.longitude,
                      address: data.address
                    },
                    orderId: order._id
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error('Error updating rider location:', error);
        }
      }
    });

    // Admin joins admin room
    socket.on('admin:authenticate', (adminId) => {
      if (adminId) {
        socket.adminId = adminId;
        socket.join('admin');
        userSockets.set(adminId.toString(), socket.id);
        console.log(`Admin ${adminId} authenticated`);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Remove from user sockets map
      if (socket.userId) {
        userSockets.delete(socket.userId.toString());
      }
      if (socket.riderId) {
        userSockets.delete(socket.riderId.toString());
      }
      if (socket.adminId) {
        userSockets.delete(socket.adminId.toString());
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};

// Emit notification to specific user
const emitToUser = async (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
    console.log(`Emitted ${event} to user ${userId}`);
  }
};

// Emit notification to specific rider
const emitToRider = async (riderId, event, data) => {
  if (io) {
    io.to(`rider:${riderId}`).emit(event, data);
    console.log(`Emitted ${event} to rider ${riderId}`);
  }
};

// Emit notification to all admins
const emitToAdmins = async (event, data) => {
  if (io) {
    io.to('admin').emit(event, data);
    console.log(`Emitted ${event} to all admins`);
  }
};

// Emit order status update
const emitOrderUpdate = async (orderId, userId, status, data) => {
  if (io) {
    io.to(`user:${userId}`).emit('order:status:update', {
      orderId,
      status,
      ...data
    });
  }
};

// Emit delivery status to user
const emitDeliveryUpdate = async (orderId, userId, riderLocation) => {
  if (io) {
    io.to(`user:${userId}`).emit('delivery:location:update', {
      orderId,
      riderLocation
    });
  }
};

// Check if user is online
const isUserOnline = (userId) => {
  return userSockets.has(userId.toString());
};

// Get connected users count
const getConnectedUsersCount = () => {
  return userSockets.size;
};

// Broadcast to all connected clients
const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
    console.log(`Broadcasted ${event} to all clients`);
  }
};

module.exports = {
  initializeWebSocket,
  emitToUser,
  emitToRider,
  emitToAdmins,
  emitOrderUpdate,
  emitDeliveryUpdate,
  isUserOnline,
  getConnectedUsersCount,
  broadcast
};