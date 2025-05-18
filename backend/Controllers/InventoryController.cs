using backend.Models;
using backend.Interfaces;
using Microsoft.AspNetCore.Mvc;
using backend.ViewModels;
using Microsoft.EntityFrameworkCore;

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
        public async Task<IActionResult> AddItem([FromBody] AddOrEditItemViewModel item)
        {
            try
            {
                if (item == null)
                {
                    return BadRequest("Item cannot be null");
                }

                var createdItemId = await inventoryService.AddItem(item);

                return CreatedAtAction(nameof(GetItem), new { id = createdItemId }, item);
            }
            catch (DbUpdateException ex)
            {
                return Problem(ex.Message);
            }
            catch (Exception ex)
            {
                return Problem(ex.Message);
            }
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateItem(string id, [FromBody] AddOrEditItemViewModel item)
        {
            try
            {
                if (item == null)
                {
                    return BadRequest("Item cannot be null.");
                }

                var updatedItem = await inventoryService.UpdateItem(id, item);

                return Ok(updatedItem);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (DbUpdateException ex)
            {
                return Problem(ex.Message);
            }
            catch (Exception ex)
            {
                return Problem(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem(string id)
        {
            try
            {
                var deleted = await inventoryService.DeleteItem(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (DbUpdateException ex)
            {
                return Problem(ex.Message);
            }
            catch (Exception ex)
            {
                return Problem(ex.Message);
            }
        }
    }
}
