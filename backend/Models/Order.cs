using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Order
{
  [Key]
  public required string Id { get; set; }
  public OrderStatus Status { get; set; } = OrderStatus.Pending;
  public ICollection<OrderItem> OrderItems { get; set; } = [];
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum OrderStatus
{
  Pending,
  Completed,
  Canceled,
}