import type { LeadItem, LeadType } from '../types/admin';
import { createId } from './adminStorage';

export interface LeadInput {
  type: LeadType;
  name: string;
  phone: string;
  car?: string;
  service?: string;
  dealer?: string;
  comment?: string;
}

const apiBase = (import.meta.env.VITE_API_BASE as string | undefined) ?? '';

const sendLeadToServer = async (lead: LeadItem) => {
  try {
    const response = await fetch(`${apiBase}/api/telegram/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...lead,
        pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
        if (!import.meta.env.PROD) {
          console.warn('Lead API request failed (lead saved locally):', text);
        }
    }
  } catch (err) {
     if (!import.meta.env.PROD) {
      console.warn('Lead API request failed (lead saved locally):', err);
     }
  }
};

export const submitLead = async (input: LeadInput) => {
  const lead: LeadItem = {
    id: createId(),
    type: input.type,
    name: input.name,
    phone: input.phone,
    car: input.car,
    service: input.service,
    dealer: input.dealer,
    comment: input.comment,
    createdAt: new Date().toISOString(),
  };
  await sendLeadToServer(lead);
  return lead;
};
