import { ProductInterface } from '../../product/entities/product.entity';

export interface ProductImageInterface {
  id: string;
  productId: string;
  url: string;
  product?: ProductInterface;
}
