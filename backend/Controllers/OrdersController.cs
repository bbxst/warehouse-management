using backend.Interfaces;
using backend.Models;
using backend.Services;
using backend.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("/api/orders")]
    public class OrdersController(IOrderService orderService) : ControllerBase
    {
        private readonly IOrderService orderService = orderService;

        [HttpGet]
        public async Task<IActionResult> GetOrders([FromQuery] OrderStatus? status, [FromQuery] OrderType? type)
        {
            var result = await orderService.GetOrders(status, type);

            if (result == null)
            {
                return NotFound("No order found.");
            }

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrder(string id)
        {
            try
            {
                var result = await orderService.GetOrder(id);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error fetching order details: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddOrder([FromBody] AddOrderDto order)
        {
            try
            {
                if (order == null)
                {
                    return BadRequest("Item cannot be null");
                }

                var result = await orderService.AddOrder(order);

                if (result == null) return BadRequest("Failed to create order");

                return CreatedAtAction(nameof(GetOrder), new { id = result }, order);
            }
            catch (Exception ex)
            {
                return BadRequest($"Failed to create order: {ex.Message}");
            }
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateOrder(string id, [FromBody] OrderStatus status)
        {
            try
            {
                var orderStatus = new UpdateOrderStatus
                {
                    Id = id,
                    Status = status
                };

                var result = await orderService.UpdateOrder(orderStatus);

                return Ok(result);
            }
            catch(Exception ex)
            {
                return BadRequest($"Failed to update order: {ex.Message}");
            }
        }

        [HttpPut("{id}/items")]
        public async Task<IActionResult> UpdateOrderItem(string id, [FromBody] List<OrderItemUpdateDto> items)
        {
            try
            {
                var updateOrderDto = new UpdateMultipleOrderItemsDto
                {
                    OrderId = id,
                    Items = items
                };

                var result = await orderService.UpdateMultipleOrderItems(updateOrderDto);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Failed to update order items: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(string id)
        {
            try
            {
                var result = await orderService.DeleteOrder(id);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Failed to update order items: {ex.Message}");
            }
        }
    }
}
