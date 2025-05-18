using backend.Models;

namespace backend.ViewModels
{
    public class ItemViewModel
    {
        public required string Id { get; set; }
        public required string Name { get; set; }
        public decimal Price { get; set; }
        public decimal Quantity { get; set; }
        public decimal Total { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public static ItemViewModel FromEntity(Item item)
        {
            return new ItemViewModel
            {
                Id = item.Id,
                Name = item.Name,
                Price = item.Price,
                Quantity = item.Quantity,
                Total = item.Price * item.Quantity,
                CreatedAt = item.CreatedAt,
                UpdatedAt = item.UpdatedAt
            };
        }
    }

    public class AddOrEditItemViewModel
    {
        public required string Name { get; set; }
        public decimal Price { get; set; }
    }
}
