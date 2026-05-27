import { Customer } from "@/types";

export const mockCustomers: Customer[] = [
  { id: "cus-1", name: "BuildCorp Ltd", email: "projects@buildcorp.com", phone: "+1 555-0101", address: "123 Industrial Ave, Chicago IL 60601", idType: "national_id", idNumber: "BC-2024-001", totalBookings: 14, totalSpent: 48200, createdAt: "2023-08-15" },
  { id: "cus-2", name: "Metro Construction", email: "rentals@metrocon.com", phone: "+1 555-0202", address: "456 Builder St, Detroit MI 48201", idType: "national_id", idNumber: "MC-2024-002", totalBookings: 9, totalSpent: 32700, createdAt: "2023-10-01" },
  { id: "cus-3", name: "John Harrison", email: "john.h@email.com", phone: "+1 555-0303", address: "789 Oak Lane, Cleveland OH 44101", idType: "drivers_license", idNumber: "DL-OH-9876543", totalBookings: 3, totalSpent: 8400, createdAt: "2024-01-20" },
  { id: "cus-4", name: "Summit Scaffolding Inc", email: "ops@summitscaff.com", phone: "+1 555-0404", address: "321 Steel Blvd, Pittsburgh PA 15201", idType: "national_id", idNumber: "SS-2024-004", totalBookings: 22, totalSpent: 91500, createdAt: "2023-05-10" },
  { id: "cus-5", name: "Rapid Earthworks", email: "hire@rapidearth.com", phone: "+1 555-0505", address: "654 Quarry Rd, Columbus OH 43201", idType: "national_id", idNumber: "RE-2024-005", totalBookings: 7, totalSpent: 28900, createdAt: "2023-12-01" },
];
