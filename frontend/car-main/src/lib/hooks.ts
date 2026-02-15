import { useMemo } from 'react';
import {
  getCar,
  getCatalog,
  getDealers,
  getHome,
  getOffers,
  getServices,
  type CarDto,
  type DealerCenterDto,
  type HomeDto,
  type OfferDto,
  type ServiceItemDto,
} from './api';
import { useApi } from './useApi';

export function useHome() {
  return useApi<HomeDto>(() => getHome(), []);
}

export function useCatalog(params?: { makeId?: number; modelId?: number; q?: string }) {
  const key = useMemo(() => JSON.stringify(params || {}), [params]);
  return useApi<CarDto[]>(() => getCatalog(params), [key]);
}

export function useCar(id?: number) {
  return useApi<CarDto>(() => {
    if (!id) return Promise.reject(new Error('Missing car id'));
    return getCar(id);
  }, [id]);
}

export function useOffers() {
  return useApi<OfferDto[]>(() => getOffers(), []);
}

export function useServices() {
  return useApi<ServiceItemDto[]>(() => getServices(), []);
}

export function useDealers() {
  return useApi<DealerCenterDto[]>(() => getDealers(), []);
}
