using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace backend.Models;

[PrimaryKey(nameof(OrderId), nameof(ItemId))]
public class OrderItem
{
    public required string OrderId { get; set; }

    public Order Order { get; set; } = null!;

    public required string ItemId { get; set; }
    public Item Item { get; set; } = null!;

    public decimal Quantity { get; set; }
}
