using backend.Data;
using backend.Models;
using backend.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class InventoryService(AppDbContext context) : IInventoryService
{
    private readonly AppDbContext context = context;

  public async Task<IEnumerable<Item>> GetItems()
  {
    return await context.Inventory.ToListAsync();
  }
  public async Task<Item?> GetItem(string id)
  {
    return await context.Inventory.FindAsync(id);
  }
  public async Task<Item> AddItem(Item item)
  {
    context.Inventory.Add(item);
    await context.SaveChangesAsync();
    return item;
  }
  public async Task<Item?> UpdateItem(Item item)
  {
    var existingItem = await context.Inventory.FindAsync(item.Id);

    if (existingItem == null)
    {
      return null;
    }
    
    context.Entry(existingItem).CurrentValues.SetValues(item);
    await context.SaveChangesAsync();
    return existingItem;
  }
  public async Task<bool> DeleteItem(string id)
  {
    var existingItem = await context.Inventory.FindAsync(id);

    if (existingItem == null)
    {
      return false;
    }

    context.Inventory.Remove(existingItem);
    await context.SaveChangesAsync();
    return true;
  }
}
