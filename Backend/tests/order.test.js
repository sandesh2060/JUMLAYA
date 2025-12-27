const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

describe('Order Lifecycle', () => {
  let token;
  let orderId;

  beforeAll(async () => {
    // login user and get token
  });

  it('Create order', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ paymentMethod: 'cod' });

    expect(res.statusCode).toBe(201);
    orderId = res.body.data._id;
  });

  it('Cancel order', async () => {
    const res = await request(app)
      .patch(`/api/orders/${orderId}/cancel`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.data.orderStatus).toBe('cancelled');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
