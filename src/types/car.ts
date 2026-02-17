export interface Car {
  id: string;
  brand: string;
  model: string;
  modelDisplay?: string;
  year: number;
  price: number;
  mileage: number;
  images: string[];
  image360?: string[];
  featured: boolean;
  availability?: 'inStock' | 'preOrder' | 'incoming' | 'В наличии' | 'Под заказ' | 'Ожидается';
  specifications: {
    engine: string;
    power: string;
    acceleration: string;
    topSpeed: string;
    transmission: string;
    drivetrain: string;
    fuelType: string;
    consumption: string;
    seats: number;
  };
  colors: {
    name: string;
    hex: string;
    image?: string;
  }[];
  interiors: {
    name: string;
    description: string;
    image?: string;
  }[];
  wheels: {
    name: string;
    size: string;
    image?: string;
  }[];
  description?: string;
}

export interface CarFilters {
  brands: string[];
  yearRange: [number, number];
  priceRange: [number, number];
}
