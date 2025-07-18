using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Item
{
    [Key]
    public required string Id { get; set; }
    [Required]
    public required string Name { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = [];
    public decimal Quantity { get; set; }
    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0.")]
    public decimal Price { get; set; }
    public ItemStatus Status { get; set; } = ItemStatus.Incoming;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum ItemStatus
{
    Deleted,
    Active,
    Arrived,
    Incoming,
}
