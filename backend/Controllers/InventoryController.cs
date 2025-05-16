using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/inventory")]
    public class InventoryController(AppDbContext context) : ControllerBase
    {
        private readonly AppDbContext context = context;

        [HttpGet]
        public async Task<IActionResult> GetItems()
        {
            var items = await context.Inventory.ToListAsync();

            if (items == null || items.Count == 0)
            {
                return NotFound("No items found");
            }

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> AddItem([FromBody] Item item)
        {
            if (item == null)
            {
                return BadRequest("Item cannot be null");
            }

            context.Inventory.Add(item);
            await context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetItems), new { id = item.Id }, item);
        }   
    }
}
