using System;
using backend.Models;

namespace backend.Interfaces;

public interface IInventoryService
{
  Task<IEnumerable<Item>> GetItems();
  Task<Item?> GetItem(string id);
  Task<Item> AddItem(Item item);
  Task<Item?> UpdateItem(Item item);
  Task<bool> DeleteItem(string id);
}
