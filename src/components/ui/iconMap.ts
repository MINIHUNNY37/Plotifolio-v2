import type { LucideIcon } from 'lucide-react';
import {
  BadgeDollarSign,
  BanknoteArrowDown,
  Building2,
  Factory,
  Globe2,
  Landmark,
  Layers3,
  LibraryBig,
  Map,
  Network,
  ScrollText,
  ShieldAlert,
  SlidersHorizontal,
  TriangleAlert,
  Wallet,
  Waypoints,
} from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
  'badge-dollar-sign': BadgeDollarSign,
  'banknote-arrow-down': BanknoteArrowDown,
  'building-2': Building2,
  factory: Factory,
  'globe-2': Globe2,
  landmark: Landmark,
  'layers-3': Layers3,
  'library-big': LibraryBig,
  map: Map,
  network: Network,
  'scroll-text': ScrollText,
  'shield-alert': ShieldAlert,
  'sliders-horizontal': SlidersHorizontal,
  'triangle-alert': TriangleAlert,
  wallet: Wallet,
  waypoints: Waypoints,
};

export const resolveIcon = (name: string) => iconMap[name] ?? Building2;
