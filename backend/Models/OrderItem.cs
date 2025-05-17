using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[PrimaryKey(nameof(OrderId), nameof(ItemId))]
public class OrderItem
{
  public required string OrderId { get; set; }
  public Order? Order { get; set; }

  public required string ItemId { get; set; }
  public Item? Item { get; set; }

  public int Quantity { get; set; }
}
