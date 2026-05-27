import { Asset } from "@/types";

export const mockAssets: Asset[] = [
  { id: "ast-1", name: "CAT 320 Excavator", categoryId: "cat-1", categoryName: "Heavy Equipment", dailyRate: 850, depositAmount: 5000, status: "rented", description: "20-ton hydraulic excavator", serialNumber: "CAT-320-001", createdAt: "2024-01-10" },
  { id: "ast-2", name: "Komatsu D65 Bulldozer", categoryId: "cat-1", categoryName: "Heavy Equipment", dailyRate: 750, depositAmount: 4500, status: "available", description: "Mid-size crawler bulldozer", serialNumber: "KOM-D65-002", createdAt: "2024-01-15" },
  { id: "ast-3", name: "Ford Transit Van", categoryId: "cat-2", categoryName: "Vehicles", dailyRate: 120, depositAmount: 1000, status: "available", description: "High-roof cargo van", serialNumber: "FORD-TRN-003", createdAt: "2024-02-01" },
  { id: "ast-4", name: "Toyota Forklift 3T", categoryId: "cat-2", categoryName: "Vehicles", dailyRate: 180, depositAmount: 2000, status: "rented", description: "3-ton electric forklift", serialNumber: "TOY-FLT-004", createdAt: "2024-02-10" },
  { id: "ast-5", name: "Hilti TE 60 Rotary Hammer", categoryId: "cat-3", categoryName: "Power Tools", dailyRate: 45, depositAmount: 300, status: "available", description: "SDS Max rotary hammer drill", serialNumber: "HLT-TE60-005", createdAt: "2024-02-20" },
  { id: "ast-6", name: "Atlas Copco Generator 50kVA", categoryId: "cat-5", categoryName: "Compressors", dailyRate: 220, depositAmount: 2500, status: "maintenance", description: "50kVA diesel generator", serialNumber: "AC-50KVA-006", createdAt: "2024-03-01" },
  { id: "ast-7", name: "Layher Scaffolding Set", categoryId: "cat-4", categoryName: "Scaffolding", dailyRate: 95, depositAmount: 800, status: "rented", description: "Complete scaffolding set 100m²", serialNumber: "LAY-SCF-007", createdAt: "2024-03-05" },
  { id: "ast-8", name: "Manitou Telehandler 17m", categoryId: "cat-2", categoryName: "Vehicles", dailyRate: 480, depositAmount: 3500, status: "available", description: "17m reach telescopic handler", serialNumber: "MAN-TLH-008", createdAt: "2024-03-15" },
];
