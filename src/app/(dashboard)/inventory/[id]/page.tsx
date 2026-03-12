import { inventoryApi } from "@/services/api/inventory/inventory.api";

export default async function InventoryDetail({ params }: any) {

  const item = await inventoryApi.getById(params.id);

  return (
    <div>

      <h1>{item.productName}</h1>

      <p>SKU: {item.sku}</p>
      <p>Category: {item.category}</p>
      <p>Quantity: {item.quantity}</p>
      <p>Location: {item.location}</p>
      <p>Price: ${item.unitPrice}</p>

    </div>
  );
}