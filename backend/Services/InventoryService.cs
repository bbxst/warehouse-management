using backend.Data;
using backend.Models;
using backend.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class InventoryService(AppDbContext context, ILogger<InventoryService> logger) : IInventoryService
{
    private readonly AppDbContext context = context;
    private readonly ILogger<InventoryService> logger = logger;

    public async Task<IEnumerable<Item>> GetItems(string? name = null)
    {
        var query = context.Inventory.AsQueryable();

        if (!string.IsNullOrEmpty(name))
        {
            query = query.Where(item => item.Name.ToLower().Contains(name.ToLower()));
        }

        logger.LogInformation("Fetched items.");
        return await query.ToListAsync();
    }

    public async Task<Item?> GetItem(string id)
    {
        logger.LogInformation("Fetched item.");
        return await context.Inventory.FindAsync(id);
    }

    public async Task<string> AddItem(Item item)
    {
        try
        {
            var itemId = await GenerateItemIdAsync();
            item.Id = itemId;
            context.Inventory.Add(item);
            await context.SaveChangesAsync();
            
            logger.LogInformation("Added item: {ItemId}",itemId);
            return "Added Item.";
        }
        catch (Exception ex)
        {
            logger.LogError("Failed to add item: {Message}", ex.Message);
            return "Failed to add item.";
        }

    }

    public async Task<string> UpdateItem(Item item)
    {
        try
        {
            var existingItem = await context.Inventory.FindAsync(item.Id);

            if (existingItem == null)
            {
                var message = $"Update failed: Item with ID {item.Id} not found.";
                logger.LogWarning(message);
                return message;
            }

            context.Entry(existingItem).CurrentValues.SetValues(item);
            var result = await context.SaveChangesAsync();

            if (result > 0)
            {
                var message = $"Successfully updated item with ID {item.Id}.";
                logger.LogInformation(message);
                return message;
            }

            var noChangeMessage = $"Update operation did not affect any rows for item ID {item.Id}.";
            logger.LogWarning(noChangeMessage);
            return noChangeMessage;
        }
        catch (Exception ex)
        {
            var errorMessage = $"Error updating item with ID {item.Id}: {ex.Message}";
            logger.LogError(ex, errorMessage);
            return errorMessage;
        }
    }

    public async Task<string> DeleteItem(string id)
    {
        try
        {
            var existingItem = await context.Inventory.FindAsync(id);

            if (existingItem == null)
            {
                var message = $"Delete failed: Item with ID {id} not found.";
                logger.LogWarning(message);
                return message;
            }

            context.Inventory.Remove(existingItem);
            await context.SaveChangesAsync();

            var successMessage = $"Successfully deleted item with ID {id}.";
            logger.LogInformation(successMessage);
            return successMessage;
        }
        catch (Exception ex)
        {
            var errorMessage = $"Error deleting item with ID {id}: {ex.Message}";
            logger.LogError(ex, errorMessage);
            return errorMessage;
        }
    }

    private async Task<string> GenerateItemIdAsync()
    {
        var lastOrder = await context.Inventory.OrderByDescending(o => o.Id).FirstOrDefaultAsync();
        int nextId = lastOrder != null ? int.Parse(lastOrder.Id.Substring(4)) + 1 : 1;
        return $"INV-{nextId:D5}";  // Example: ORD-00001
    }
}
