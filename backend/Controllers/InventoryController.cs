using backend.Models;
using backend.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/inventory")]
    public class InventoryController(IInventoryService inventoryService) : ControllerBase
    {
        private readonly IInventoryService inventoryService = inventoryService;

        [HttpGet]
        public async Task<IActionResult> GetItems([FromQuery] string? name)
        {
            var items = await inventoryService.GetItems(name);

            if (items == null || !items.Any())
            {
                return NotFound("No items found");
            }

            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetItem(string id)
        {
            var item = await inventoryService.GetItem(id);

            if (item == null)
            {
                return NotFound($"Item with Id {id} not found");
            }

            return Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> AddItem([FromBody] Item item)
        {
            if (item == null)
            {
                return BadRequest("Item cannot be null");
            }

            var createdItem = await inventoryService.AddItem(item);

            return CreatedAtAction(nameof(GetItem), new { id = item.Id }, item);
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateItem(string id, [FromBody] Item item)
        {
            if (item == null || id != item.Id)
            {
                return BadRequest("Item cannot be null and Id must match");
            }

            var updatedItem = await inventoryService.UpdateItem(item);

            if (updatedItem == null)
            {
                return NotFound($"Item with Id {id} not found");
            }

            return Ok(updatedItem);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem(string id)
        {
            var deleted = await inventoryService.DeleteItem(id);

            if (deleted == null)
            {
                return NotFound($"Item with Id {id} not found");
            }

            return Ok(deleted);
        }
    }
}
