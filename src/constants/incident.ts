import { Shield, Car, Siren, Wrench, HelpCircle } from 'lucide-react';

export const INCIDENT_TYPE_ICONS: { [key: string]: React.ComponentType<any> } = {
  'An ninh': Shield,
  'Giao thông': Car,
  'Cứu hộ, cứu nạn': Siren,
  'Hạ tầng': Wrench,
  'Khác': HelpCircle,
};

export const getIncidentIcon = (type: string) => {
  return INCIDENT_TYPE_ICONS[type] || HelpCircle;
};
