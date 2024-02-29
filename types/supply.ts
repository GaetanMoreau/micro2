export interface SupplyProductDto {
    ean: string;
    name: string;
    description: string;
    purchasePricePerUnit: number;
    quantity: number;
}

export interface SupplyInputDto {
    supplyId: string;
    products: SupplyProductDto[];
}

export interface SupplySummaryDto {
    nbSupplies: number;
    totalNbProducts: number;
    totalPurchasePrice: number;
}

export interface RequiredSupplyDto {
    productId: string;
}