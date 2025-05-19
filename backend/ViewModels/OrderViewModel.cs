using backend.Models;

namespace backend.ViewModels
{
    public class OrderViewModel
    {
        public required string Id { get; set; }
        public OrderType Type { get; set; }
        public OrderStatus Status { get; set; }
        public decimal ItemCount { get; set; }
        public decimal Total { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public static OrderViewModel MapToOrder(Order order)
        {
            return order == null || order.OrderItems == null || order.OrderItems.Count == 0
                ? throw new ArgumentNullException(nameof(order))
                : new OrderViewModel
                {
                    Id = order.Id,
                    Type = order.Type,
                    Status = order.Status,
                    ItemCount = order.OrderItems.Count,
                    Total = order.OrderItems.Sum(item => item.Item.Price * item.Quantity),
                    CreatedAt = order.CreatedAt,
                    UpdatedAt = order.UpdatedAt,
                };
        }

        public static OrderViewModel MapToOrderWithNoItem(Order order)
        {
            return order == null
                ? throw new ArgumentNullException(nameof(order))
                : new OrderViewModel
                {
                    Id = order.Id,
                    Type = order.Type,
                    Status = order.Status,
                    CreatedAt = order.CreatedAt,
                    UpdatedAt = order.UpdatedAt,
                };
        }
    }

    public class OrderDetailViewModel
    {
        public required string Id { get; set; }
        public OrderType Type { get; set; }
        public OrderStatus Status { get; set; }
        public decimal Total { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public required List<OrderItemDetailViewModel> Items { get; set; }

        public static OrderDetailViewModel MapToOrderDetail(Order order)
        {
            return order == null || order.OrderItems == null || order.OrderItems.Count == 0
                ? throw new ArgumentNullException(nameof(order))
                : new OrderDetailViewModel
            {
                Id = order.Id,
                Type = order.Type,
                Status = order.Status,
                Total = order.OrderItems.Sum(item => item.Item.Price * item.Quantity),
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                Items = [.. order.OrderItems
                    .Select(item => new OrderItemDetailViewModel
                    {
                        Id = item.ItemId,
                        Name = item.Item.Name,
                        Quantity = item.Quantity,
                        Price = item.Item.Price
                    })]
                };
        }
    }

    public class OrderItemViewModel
    {
        public required string Id { get; set; } 
        public decimal Quantity { get; set; }
    }

    public class OrderItemDetailViewModel
    {
        public required string Id { get; set; }
        public required string Name { get; set; }
        public decimal Price { get; set; }
        public decimal Quantity { get; set; }
    }

    public class AddOrderViewModel
    {
        public required OrderType Type { get; set; }
        public required List<OrderItemViewModel> OrderItems { get; set; }
    }

    public class UpdateOrderStatusViewModel
    {
        public required string Id { get; set; }
        public OrderStatus Status { get; set; }
    }

    public class UpdateOrderItemsViewModel
    {
        public required string OrderId { get; set; }
        public required List<OrderItemViewModel> Items { get; set; }
    }
}
