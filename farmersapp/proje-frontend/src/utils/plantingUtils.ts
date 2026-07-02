import { Planting } from '../types';

export const getPlantingInfo = (planting?: Planting): string => {
  if (!planting) return 'Bilinmiyor';
  
  const location = planting.field 
    ? `Tarla: ${planting.field.name}`
    : planting.greenhouse 
      ? `Sera: ${planting.greenhouse.name}`
      : 'Konum belirtilmemiş';

  const product = planting.product 
    ? ` - ${planting.product.name}`
    : ' - Ürün belirtilmemiş';

  return `${location}${product}`;
}; 