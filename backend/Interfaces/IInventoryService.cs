using backend.Models;
using backend.ViewModels;

namespace backend.Interfaces;

public interface IInventoryService
{
  Task<IEnumerable<ItemViewModel>> GetItems(string? name);
  Task<Item?> GetItem(string id);
  Task<ItemViewModel> AddItem(AddOrEditItemViewModel item);
  Task<ItemViewModel> UpdateItem(string id, AddOrEditItemViewModel item);
  Task<bool> DeleteItem(string id);
}
