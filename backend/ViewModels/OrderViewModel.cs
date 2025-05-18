using backend.Models;

namespace backend.ViewModels
{
    public class OrderDetail
    {
        public required string Id { get; set; }
        public OrderType Type { get; set; }
        public OrderStatus Status { get; set; }
        public decimal Total { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public required List<OrderItemDetail> Items { get; set; }
    }

    public class OrderItemDetail
    {
        public required string Id { get; set; }
        public required string Name { get; set; }
        public decimal Price { get; set; }
        public decimal Quantity { get; set; }
    }

    public class AddOrderDto
    {
        public required OrderType Type { get; set; }
        public required List<OrderItemDto> Items { get; set; }
    }

    public class OrderItemDto
    {
        public required string Id { get; set; } 
        public decimal Quantity { get; set; }
    }

    public class UpdateOrderStatus
    {
        public required string Id { get; set; }
        public OrderStatus Status { get; set; }
    }

    public class UpdateMultipleOrderItemsDto
    {
        public required string OrderId { get; set; }
        public required List<OrderItemUpdateDto> Items { get; set; }
    }

    public class OrderItemUpdateDto
    {
        public required string OldItemId { get; set; }
        public required string NewItemId { get; set; }
        public decimal Quantity { get; set; }
    }
}
