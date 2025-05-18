using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace backend.Models;

[PrimaryKey(nameof(OrderId), nameof(ItemId))]
public class OrderItem
{
    public required string OrderId { get; set; }
    [JsonIgnore]
    public Order? Order { get; set; }

    public required string ItemId { get; set; }
    public Item? Item { get; set; }

    public decimal Quantity { get; set; }
}
