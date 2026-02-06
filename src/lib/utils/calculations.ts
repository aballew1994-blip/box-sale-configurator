/**
 * Margin-based pricing calculations for the Box Sale Configurator.
 *
 * Pricing model:
 *   productPrice = unitCost / (1 - targetMargin)
 *   extCost      = unitCost × quantity
 *   totalPrice   = productPrice × quantity
 *   actualMargin = (productPrice - unitCost) / productPrice
 *   shippingFee  = totalExtCost × 0.05 (default)
 *   subtotal     = totalPrice + shippingFee
 */

/** Round to 2 decimal places (currency) */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Round to 4 decimal places (margin percentages) */
export function round4(value: number): number {
  return Math.round((value + Number.EPSILON) * 10000) / 10000;
}

/** Calculate product price from cost and target margin */
export function calculateProductPrice(
  unitCost: number,
  targetMargin: number
): number {
  if (targetMargin >= 1) return unitCost; // 100% margin is invalid, return cost
  if (targetMargin <= 0) return unitCost; // 0% margin = sell at cost
  return round2(unitCost / (1 - targetMargin));
}

/** Calculate actual margin from cost and price */
export function calculateMargin(
  unitCost: number,
  productPrice: number
): number {
  if (productPrice <= 0) return 0;
  return round4((productPrice - unitCost) / productPrice);
}

/** Calculate extended cost (cost × quantity) */
export function calculateExtCost(unitCost: number, quantity: number): number {
  return round2(unitCost * quantity);
}

/** Calculate total price (price × quantity) */
export function calculateTotalPrice(
  productPrice: number,
  quantity: number
): number {
  return round2(productPrice * quantity);
}

/** Calculate tariff amount from total price and tariff percentage */
export function calculateTariffAmount(
  totalPrice: number,
  tariffPercent: number
): number {
  return round2(totalPrice * (tariffPercent / 100));
}

/** Calculate default shipping fee (5% of total equipment cost) */
export function calculateShippingFee(totalExtCost: number): number {
  return round2(totalExtCost * 0.05);
}

/** Line item pricing data */
export interface LineItemPricing {
  unitCost: number;
  quantity: number;
  targetMargin: number;
  productPrice: number;
  priceOverride: boolean;
  tariffPercent: number;
}

/** Computed values for a single line item */
export interface LineItemComputed {
  productPrice: number;
  extCost: number;
  totalPrice: number;
  margin: number;
  tariffAmount: number;
}

/** Compute all derived values for a single line item */
export function computeLineItem(input: LineItemPricing): LineItemComputed {
  const productPrice = input.priceOverride
    ? input.productPrice
    : calculateProductPrice(input.unitCost, input.targetMargin);

  const extCost = calculateExtCost(input.unitCost, input.quantity);
  const totalPrice = calculateTotalPrice(productPrice, input.quantity);
  const margin = calculateMargin(input.unitCost, productPrice);
  const tariffAmount = calculateTariffAmount(totalPrice, input.tariffPercent);

  return { productPrice, extCost, totalPrice, margin, tariffAmount };
}

/** Summary data for the entire configuration */
export interface ConfigSummaryInput {
  lineItems: Array<{
    extCost: number;
    totalPrice: number;
    quantity: number;
  }>;
  shippingFee?: number;
  shippingOverride?: boolean;
}

/** Computed summary for the entire configuration */
export interface ConfigSummaryComputed {
  totalEquipmentCost: number;
  totalPrice: number;
  shippingFee: number;
  subtotal: number;
  overallMargin: number;
  lineCount: number;
  totalQuantity: number;
}

/** Compute summary values for the entire configuration */
export function computeConfigSummary(
  input: ConfigSummaryInput
): ConfigSummaryComputed {
  const totalEquipmentCost = round2(
    input.lineItems.reduce((sum, li) => sum + li.extCost, 0)
  );
  const totalPrice = round2(
    input.lineItems.reduce((sum, li) => sum + li.totalPrice, 0)
  );
  const totalQuantity = input.lineItems.reduce(
    (sum, li) => sum + li.quantity,
    0
  );

  const shippingFee =
    input.shippingOverride && input.shippingFee !== undefined
      ? input.shippingFee
      : calculateShippingFee(totalEquipmentCost);

  const subtotal = round2(totalPrice + shippingFee);

  const overallMargin =
    totalPrice > 0
      ? round4((totalPrice - totalEquipmentCost) / totalPrice)
      : 0;

  return {
    totalEquipmentCost,
    totalPrice,
    shippingFee,
    subtotal,
    overallMargin,
    lineCount: input.lineItems.length,
    totalQuantity,
  };
}
