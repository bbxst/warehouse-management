using System;
using backend.Models;

namespace backend.Interfaces;

public interface IInventoryService
{
  Task<IEnumerable<Item>> GetItems(string? name);
  Task<Item?> GetItem(string id);
  Task<string> AddItem(Item item);
  Task<string> UpdateItem(Item item);
  Task<string> DeleteItem(string id);
}
