import { IProductImage } from "../../types";

export interface IHeroSlide {
  _id: string;
  productUuid: string;
  title: string;
  subtitle?: string;
  buttonText: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor: string;
  isActive: boolean;
  sortOrder: number;
  product?: {
    name: string;
    slug: string;
    category: { name: string; slug: string };
    images: IProductImage[];
    price: number;
  };
  createdAt: Date;
  updatedAt: Date;
}