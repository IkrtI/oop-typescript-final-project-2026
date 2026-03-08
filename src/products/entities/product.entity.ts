import { BaseEntity } from "../../common/entities/base.entity";
import { ProductCategory } from "../enums/product-category.enum";
import { ProductStatus } from "../enums/product-status.enum";

export class Product extends BaseEntity {
  name!: string;

  description!: string;

  price!: number;

  stockQuantity!: number;

  sku!: string;

  category!: ProductCategory;

  brand!: string;

  images!: string[];

  weight!: number | null;

  status!: ProductStatus;
}
