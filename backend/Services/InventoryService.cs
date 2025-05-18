using backend.Data;
using backend.Models;
using backend.Interfaces;
using backend.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class InventoryService(AppDbContext context, ILogger<InventoryService> logger) : IInventoryService
{
    private readonly AppDbContext context = context;
    private readonly ILogger<InventoryService> logger = logger;

    public async Task<IEnumerable<ItemViewModel>> GetItems(string? name = null)
    {
        var query = context.Inventory.AsQueryable();

        if (!string.IsNullOrEmpty(name))
        {
            query = query.Where(item => item.Name.ToLower().Contains(name.ToLower()));
        }

        var items = await query
            .Select(item => new ItemViewModel
            {
                Id = item.Id,
                Name = item.Name,
                Price = item.Price,
                Quantity = item.Quantity,
                Total = item.Quantity * item.Price,
                CreatedAt = item.CreatedAt,
                UpdatedAt = item.UpdatedAt,
            })
            .OrderBy(item => item.Id)
            .ToListAsync();

        return items;
    }

    public async Task<Item?> GetItem(string id)
    {
        return await context.Inventory.FindAsync(id);
    }

    public async Task<ItemViewModel> AddItem(AddOrEditItemViewModel item)
    {
        try
        {
            var itemId = await GenerateItemIdAsync();
            var newItem = new Item
            {
                Id = itemId,
                Name = item.Name,
                Price = item.Price
            };

            context.Inventory.Add(newItem);
            var completed = await context.SaveChangesAsync() > 0;

            if (!completed)
            {
                logger.LogError("Can not update database");
                throw new DbUpdateException("Can not update database");
            }

            logger.LogInformation("Added item: {ItemId}", itemId);
            return ItemViewModel.FromEntity(newItem);
        }
        catch (Exception ex)
        {
            logger.LogError("Failed to add item: {Message}", ex.Message);
            throw new Exception($"Failed to add item: {ex.Message}");
        }
    }

    public async Task<ItemViewModel> UpdateItem(string id, AddOrEditItemViewModel item)
    {
        try
        {
            var existingItem = await context.Inventory.FindAsync(id);

            if (existingItem == null)
            {
                logger.LogWarning("Update failed: Item with ID {Id} not found.", id);
                throw new KeyNotFoundException($"Update failed: Item with ID {id} not found.");
            }

            existingItem.Name = item.Name;
            existingItem.Price = item.Price;
            existingItem.UpdatedAt = DateTime.UtcNow;
            var complete = await context.SaveChangesAsync() > 0;

            if (complete)
            {
                var updatedItem = ItemViewModel.FromEntity(existingItem);
                logger.LogInformation("Successfully updated item with ID {Id}.", id);
                return updatedItem;
            }

            logger.LogError("Can not update database");
            throw new DbUpdateException("Can not update database");
        }
        catch (Exception ex)
        {
            logger.LogError("Failed to update item: {Message}", ex.Message);
            throw new Exception($"Failed to update item: {ex.Message}");
        }
    }

    public async Task<bool> DeleteItem(string id)
    {
        try
        {
            var existingItem = await context.Inventory.FindAsync(id);

            if (existingItem == null)
            {
                logger.LogWarning("Delete failed: Item with ID {id} not found.", id);
                throw new KeyNotFoundException($"Delete failed: Item with ID {id} not found.");
            }

            context.Inventory.Remove(existingItem);
            var completed = await context.SaveChangesAsync() > 0;

            if (completed)
            {
                logger.LogInformation("Successfully deleted item with ID {id}.", id);
                return true;
            }

            logger.LogError("Can not update database");
            throw new DbUpdateException("Can not update database");
        }
        catch (Exception ex)
        {
            logger.LogError("Failed to delete item: {Message}", ex.Message);
            throw new Exception($"Failed to delete item: {ex.Message}");
        }
    }

    private async Task<string> GenerateItemIdAsync()
    {
        var lastOrder = await context.Inventory.OrderByDescending(o => o.Id).FirstOrDefaultAsync();
        int nextId = lastOrder != null ? int.Parse(lastOrder.Id.Substring(4)) + 1 : 1;
        return $"INV-{nextId:D5}";  // Example: ORD-00001
    }
}
