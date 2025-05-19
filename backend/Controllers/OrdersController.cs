using backend.Models;
using backend.Interfaces;
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

            var orders = result.Select(o => new OrderViewModel
            {
                Id = o.Id,
                Type = o.Type,
                Status = o.Status,
                Total = o.OrderItems.Sum(oi => oi.Quantity * oi.Item.Price),
                ItemCount = o.OrderItems.Count,
                CreatedAt = o.CreatedAt,
                UpdatedAt = o.UpdatedAt
            });

            if (orders == null)
            {
                return NotFound("No order found");
            }

            return Ok(orders);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrder(string id)
        {
            try
            {
                var result = await orderService.GetOrder(id);

                var order = OrderDetailViewModel.MapToOrderDetail(result);

                if (order == null)
                {
                    return NotFound("Order not found");
                }

                return Ok(order);
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
        public async Task<IActionResult> AddOrder([FromBody] AddOrderViewModel addOrder)
        {
            try
            {
                if (addOrder == null)
                {
                    return BadRequest("Item cannot be null");
                }

                var result = await orderService.AddOrder(addOrder);

                var order = OrderViewModel.MapToOrderWithNoItem(result);

                return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
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
                var orderStatus = new UpdateOrderStatusViewModel
                {
                    Id = id,
                    Status = status
                };

                var result = await orderService.UpdateOrder(orderStatus);

                var order = OrderViewModel.MapToOrderWithNoItem(result);

                return Ok(result);
            }
            catch(Exception ex)
            {
                return BadRequest($"Failed to update order: {ex.Message}");
            }
        }

        [HttpPut("{id}/items")]
        public async Task<IActionResult> UpdateOrderItem(string id, [FromBody] List<OrderItemViewModel> items)
        {
            try
            {
                var updateOrderDto = new UpdateOrderItemsViewModel
                {
                    OrderId = id,
                    Items = items
                };

                var result = await orderService.UpdateMultipleOrderItems(updateOrderDto);

                var order = OrderViewModel.MapToOrderWithNoItem(result);

                return Ok(order);
            }
            catch (ArgumentException ex)
            {
                return BadRequest($"{ex.Message}");
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

                var order = OrderViewModel.MapToOrderWithNoItem(result);

                return Ok(order);
            }
            catch (Exception ex)
            {
                return BadRequest($"Failed to update order items: {ex.Message}");
            }
        }
    }
}
