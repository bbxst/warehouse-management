using backend.Data;
using backend.Interfaces;
using backend.Models;
using backend.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class OrderService(AppDbContext context, ILogger<OrderService> logger) : IOrderService
    {
        private readonly AppDbContext context = context;
        private readonly ILogger<OrderService> logger = logger;

        public async Task<IEnumerable<Order>> GetOrders(OrderStatus? status, OrderType? type)
        {
            var query = context.Orders.AsQueryable();

            if (status.HasValue)
            {
                query = query.Where(o => o.Status == status.Value);
            }

            if (type.HasValue)
            {
                query = query.Where(o => o.Type == type.Value);
            }

            logger.LogInformation("Fetched orders");
            return await query.ToListAsync();
        }

        public async Task<Order?> GetOrder(string id)
        {
            try
            {
                var order = await context.Orders
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Item)
                    .FirstOrDefaultAsync(o => o.Id == id) ??
                    throw new KeyNotFoundException($"Order with ID {id} not found.");

                logger.LogInformation("Fetched details for order {OrderId}", order.Id);
                return order;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error fetching order details.");
                throw new Exception("Failed to retrieve order details.");
            }
        }

        public async Task<string?> AddOrder(AddOrderDto order)
        {
            using var transaction = await context.Database.BeginTransactionAsync();

            var orderId = await GenerateOrderIdAsync();

            try
            {
                if (await context.Orders.AnyAsync(o => o.Id == orderId))
                {
                    throw new ArgumentException($"Order with ID {orderId} already exists.");
                }

                var newOrder = new Order
                {
                    Id = orderId,
                    Type = order.Type
                };

                await context.Orders.AddAsync(newOrder);
                await context.SaveChangesAsync();

                foreach (var item in order.Items)
                {
                    var inventoryItem = await context.Inventory.FirstOrDefaultAsync(i => i.Id == item.Id) ?? 
                        throw new ArgumentException($"Item with ID {item.Id} not found.");

                    if (order.Type == OrderType.Outgoing)
                    {
                        if (inventoryItem.Quantity < item.Quantity)
                        {
                            throw new ArgumentException($"Insufficient quantity for item ID {item.Id}. Available: {inventoryItem.Quantity}, Requested: {item.Quantity}");
                        }

                        inventoryItem.Quantity -= item.Quantity;
                    } 
                    else
                    {
                        inventoryItem.Quantity += item.Quantity;
                    }

                    var orderItem = new OrderItem
                    {
                        OrderId = orderId,
                        ItemId = item.Id,
                        Quantity = item.Quantity,
                    };

                    await context.OrderItems.AddAsync(orderItem);
                    context.Inventory.Update(inventoryItem);
                }

                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                logger.LogInformation("Order {OrderId} created successfully.", orderId);
                return orderId;
            }
            catch (ArgumentException ex)
            {
                await transaction.RollbackAsync();
                logger.LogWarning("An error occurred: {ErrorMessage}", ex.Message);
                return null;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                logger.LogError(ex, "Error creating order.");
                throw new Exception("An error occurred while creating the order.");
            }
        }

        public async Task<string> UpdateMultipleOrderItems(UpdateMultipleOrderItemsDto updateDto)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var orderItems = await context.OrderItems
                    .Where(oi => oi.OrderId == updateDto.OrderId)
                    .ToListAsync();

                if (orderItems.Count == 0)
                {
                    throw new ArgumentException($"No order items found for Order ID {updateDto.OrderId}.");
                }

                foreach (var itemDto in updateDto.Items)
                {
                    var existingItem = orderItems
                        .FirstOrDefault(oi => oi.ItemId == itemDto.OldItemId) ?? 
                        throw new ArgumentException($"Order item with Item ID {itemDto.OldItemId} not found.");
                    var newItem = await context.Inventory.FindAsync(itemDto.NewItemId) ?? 
                        throw new ArgumentException($"Item with ID {itemDto.NewItemId} not found.");
                    existingItem.ItemId = itemDto.NewItemId;
                    existingItem.Quantity = itemDto.Quantity;

                    context.OrderItems.Update(existingItem);
                }

                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                logger.LogInformation("Order items updated for Order ID {OrderId}.", updateDto.OrderId);
                return "Order items updated successfully.";
            }
            catch (ArgumentException ex)
            {
                await transaction.RollbackAsync();
                logger.LogWarning("An error occurred: {ErrorMessage}", ex.Message);
                return $"Update failed: {ex.Message}";
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                logger.LogError(ex, "Error updating multiple order items.");
                throw new Exception("An error occurred while updating multiple order items.");
            }
        }
        public async Task<string> UpdateOrder(UpdateOrderStatus orderStatus)
        {
            try
            {
                var existingOrder = await context.Orders.FindAsync(orderStatus.Id) ??
                    throw new ArgumentException($"Order {orderStatus.Id} not found.");

                existingOrder.Status = orderStatus.Status;
                await context.SaveChangesAsync();

                logger.LogInformation("Update order status for Id: {OrderId} successfully", orderStatus.Id);
                return "Update order status successfully";
            }
            catch (ArgumentException ex)
            {
                logger.LogWarning("An error occurred: {ErrorMessage}", ex.Message);
                return $"Update failed: {ex.Message}";
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error updating order status.");
                throw new Exception("An error occurred while updating order status.");
            }
        }

        public async Task<string> DeleteOrder(string id)
        {
            try
            {
                var existingOrder = await context.Orders.FindAsync(id) ??
                    throw new ArgumentException($"Order {id} not found.");

                existingOrder.Status = OrderStatus.Canceled;
                await context.SaveChangesAsync();

                logger.LogInformation("Cancel order Id: {OrderId} successfully", id);
                return "Cancel order successfully";
            }
            catch (ArgumentException ex)
            {
                logger.LogWarning("An error occurred: {ErrorMessage}", ex.Message);
                return $"Cancel failed: {ex.Message}";
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error cancel order.");
                throw new Exception("An error occurred while cancel order.");
            }
        }

        private async Task<string> GenerateOrderIdAsync()
        {
            var lastOrder = await context.Orders.OrderByDescending(o => o.Id).FirstOrDefaultAsync();
            int nextId = lastOrder != null ? int.Parse(lastOrder.Id[4..]) + 1 : 1;
            return $"ORD-{nextId:D5}";
        }
    }
} 
