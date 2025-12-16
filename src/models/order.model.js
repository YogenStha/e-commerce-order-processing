const { v4: uuidv4 } = require('uuid');

class Order {
  constructor(data) {
    this.orderId = data.orderId || uuidv4();
    this.customerName = data.customerName;
    this.items = data.items;
    this.totalAmount = data.totalAmount || this.calculateTotal(data.items);
    this.status = data.status || 'pending';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.processedAt = data.processedAt || null;
  }

  calculateTotal(items) {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  validate() {
    const errors = [];

    if (!this.customerName || typeof this.customerName !== 'string') {
      errors.push('Customer name is required');
    }

    if (!this.items || !Array.isArray(this.items) || this.items.length === 0) {
      errors.push('Items array is required and must not be empty');
    }

    if (this.items) {
      this.items.forEach((item, index) => {
        if (!item.price || typeof item.price !== 'number' || item.price <= 0) {
          errors.push(`Item at index ${index} has invalid price`);
        }
        if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
          errors.push(`Item at index ${index} has invalid quantity`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toJSON() {
    return {
      orderId: this.orderId,
      customerName: this.customerName,
      items: this.items,
      totalAmount: this.totalAmount,
      status: this.status,
      createdAt: this.createdAt,
      processedAt: this.processedAt
    };
  }
}

module.exports = Order;

