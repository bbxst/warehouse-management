using backend.Data;
using backend.Interfaces;
using backend.Models;
using backend.ViewModels;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace backend.Services
{
    public class OrderService(AppDbContext context, ILogger<OrderService> logger) : IOrderService
    {
        private readonly AppDbContext context = context;
        private readonly ILogger<OrderService> logger = logger;

        public async Task<IEnumerable<Order>> GetOrders(OrderStatus? status, OrderType? type)
        {
            var query = context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Item)
                .AsQueryable();

            if (status.HasValue)
            {
                query = query.Where(o => o.Status == status.Value);
            }

            if (type.HasValue)
            {
                query = query.Where(o => o.Type == type.Value);
            }

            logger.LogInformation("Fetched orders");
            return await query.OrderBy(order => order.Id).ToListAsync();
        }

        public async Task<Order> GetOrder(string id)
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
            catch (KeyNotFoundException ex)
            {
                logger.LogWarning("{message}", ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error fetching order details.");
                throw new Exception("Failed to retrieve order details.");
            }
        }

        public async Task<Order> AddOrder(AddOrderViewModel order)
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

                foreach (var item in order.OrderItems)
                {
                    var orderItem = new OrderItem
                    {
                        OrderId = orderId,
                        ItemId = item.Id,
                        Quantity = item.Quantity,
                    };

                    await context.OrderItems.AddAsync(orderItem);
                }

                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                logger.LogInformation("Order {OrderId} created successfully.", orderId);
                return newOrder;
            }
            catch (ArgumentException ex)
            {
                await transaction.RollbackAsync();
                logger.LogWarning("An error occurred: {ErrorMessage}", ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                logger.LogError(ex, "Error creating order.");
                throw new Exception("An error occurred while creating the order.");
            }
        }

        public async Task<Order> UpdateMultipleOrderItems(UpdateOrderItemsViewModel updateOrderItems)
        {
            using var transaction = await context.Database.BeginTransactionAsync();

            try
            {
                var exitingOrder = await context.Orders
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Item)
                    .FirstOrDefaultAsync(o => o.Id == updateOrderItems.OrderId);


                if (exitingOrder == null || exitingOrder!.OrderItems.Count == 0)
                {
                    throw new ArgumentException($"No order items found for Order ID {updateOrderItems.OrderId}.");
                }

                if (exitingOrder.Status == OrderStatus.Canceled)
                {
                    throw new ArgumentException($"Order {updateOrderItems.OrderId} has been marked as canceled, please place a new order instead.");
                }

                var existingOrderItems = exitingOrder.OrderItems;

                var itemsToRemove = existingOrderItems
                    .Where(oi => !updateOrderItems.Items.Any(uoi => uoi.Id == oi.ItemId))
                    .ToList();

                foreach (var itemToRemove in itemsToRemove)
                {
                    existingOrderItems.Remove(itemToRemove);
                }

                foreach (var updateOrderItem in updateOrderItems.Items)
                {
                    var existingOrderItem = existingOrderItems.FirstOrDefault(oi => oi.ItemId == updateOrderItem.Id);

                    if (existingOrderItem != null)
                    {
                        existingOrderItem.Quantity = updateOrderItem.Quantity;
                    }
                    else
                    {
                        existingOrderItems.Add(new OrderItem
                        {
                            OrderId = exitingOrder.Id,
                            ItemId = updateOrderItem.Id,
                            Quantity = updateOrderItem.Quantity
                        });
                    }
                }

                exitingOrder.UpdatedAt = DateTime.UtcNow;
                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                logger.LogInformation("Order items updated for Order ID {OrderId}.", updateOrderItems.OrderId);
                logger.LogInformation("[Order Detail] : {OrderDetial}", exitingOrder.ToString());
                return exitingOrder;
            }
            catch (ArgumentException ex)
            {
                await transaction.RollbackAsync();
                logger.LogWarning("An error occurred: {ErrorMessage}", ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                logger.LogError(ex, "Error updating multiple order items.");
                throw new Exception("An error occurred while updating multiple order items.");
            }
        }

        public async Task<Order> UpdateOrder(UpdateOrderStatusViewModel orderStatus)
        {
            using var transaction = await context.Database.BeginTransactionAsync();

            try
            {
                var existingOrder = await context.Orders
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Item)
                    .FirstOrDefaultAsync(o => o.Id == orderStatus.Id);
                    
                if (existingOrder == null || existingOrder.OrderItems.Count == 0)
                {
                    throw new ArgumentException($"Order {orderStatus.Id} not found.");
                }

                foreach (var exitingOrderItem in existingOrder.OrderItems)
                {
                    var exitingItem = exitingOrderItem.Item ?? throw new ArgumentException($"Item with ID {exitingOrderItem.ItemId} not found.");

                    if (existingOrder.Type == OrderType.Incoming)
                    {
                        exitingItem.Quantity += exitingOrderItem.Quantity;
                    }
                    else
                    {
                        if (exitingItem.Quantity < exitingOrderItem.Quantity)
                        {
                            throw new ArgumentException($"Insufficient quantity for item ID {exitingOrderItem.ItemId}. Available: {exitingItem.Quantity}, Requested: {exitingOrderItem.Quantity}");
                        }

                        exitingItem.Quantity -= exitingOrderItem.Quantity;
                    }
                }

                existingOrder.Status = orderStatus.Status;
                existingOrder.UpdatedAt = DateTime.UtcNow;
                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                logger.LogInformation("Update order status for Id: {OrderId} successfully", orderStatus.Id);
                return existingOrder;
            }
            catch (ArgumentException ex)
            {
                await transaction.RollbackAsync();
                logger.LogWarning("An error occurred: {ErrorMessage}", ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                logger.LogError(ex, "Error updating order status.");
                throw new Exception("An error occurred while updating order status.");
            }
        }

        public async Task<Order> DeleteOrder(string id)
        {
            try
            {
                var existingOrder = await context.Orders.FindAsync(id) ??
                    throw new KeyNotFoundException($"Order {id} not found.");

                existingOrder.Status = OrderStatus.Canceled;
                existingOrder.UpdatedAt = DateTime.UtcNow;
                await context.SaveChangesAsync();

                logger.LogInformation("Cancel order Id: {OrderId} successfully", id);
                return existingOrder;
            }
            catch (KeyNotFoundException ex)
            {
                logger.LogWarning("{Message}", ex.Message);
                throw;
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
            return $"ORD{nextId:D5}";
        }
    }
} 
