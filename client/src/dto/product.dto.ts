export interface ProductDTO {
  id: string;
  title: string;
  category: string;
  manufacturer: string;
  imageUrl: string;
  price: number;
  quantity: number;
  description: string;
}

export interface CreateProductDTO extends Omit<ProductDTO, "id"> {}
export interface UpdateProductDTO extends ProductDTO {}
