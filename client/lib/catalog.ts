export type ServiceIcon = "scissors" | "droplets" | "heart" | "sparkles";

export type Service = {
  id: string;
  name: string;
  description: string;
  durationLabel: string;
  durationMinutes: number;
  price: number;
  tag: string;
  icon: ServiceIcon;
  tone: string;
};

export type SelectedServices = Record<string, number>;

export type PetParentDetails = {
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  petName: string;
  petBreed: string;
  appointmentDate: string;
  printedName: string;
  signature: string;
};

export type Booking = {
  dateKey: string;
  dateLabel: string;
  time: string;
  durationMinutes: number;
  selected: SelectedServices;
  petParent?: PetParentDetails;
};

export type PetParentMember = {
  id: string;
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  pets: { name: string; breed: string }[];
};

const SERVICES_KEY = "good-groomed-services-v1";
const ESTIMATE_KEY = "good-groomed-estimate-v1";
const BOOKING_KEY = "good-groomed-booking-v1";
const PET_PARENT_MEMBERS_KEY = "good-groomed-pet-parent-members-v1";
export const SERVICES_UPDATED_EVENT = "good-groomed-services-updated";

export const DEFAULT_SERVICES: Service[] = [
  {
    id: "full-groom",
    name: "Full groom",
    description: "Bath, blow dry, haircut & finishing touches",
    durationLabel: "90–120 min",
    durationMinutes: 120,
    price: 78,
    tag: "Most popular",
    icon: "scissors",
    tone: "bg-[#e8f0dd] text-[#4f7035]",
  },
  {
    id: "bath-brush",
    name: "Bath & brush",
    description: "A fresh wash, fluff dry and thorough brush out",
    durationLabel: "45–60 min",
    durationMinutes: 60,
    price: 46,
    tag: "Good to know",
    icon: "droplets",
    tone: "bg-[#e6edf5] text-[#49647f]",
  },
  {
    id: "pawdicure",
    name: "Pawdicure",
    description: "Nail trim, paw balm and a little tidy-up",
    durationLabel: "20–30 min",
    durationMinutes: 30,
    price: 24,
    tag: "Quick add-on",
    icon: "heart",
    tone: "bg-[#f8e2db] text-[#ad5c4d]",
  },
  {
    id: "deshed",
    name: "De-shed treatment",
    description: "Helps lift loose undercoat and keep shedding in check",
    durationLabel: "30–45 min",
    durationMinutes: 45,
    price: 32,
    tag: "Seasonal",
    icon: "sparkles",
    tone: "bg-[#f2ead6] text-[#927337]",
  },
];

const cloneDefaults = () => DEFAULT_SERVICES.map((service) => ({ ...service }));

export function getServices(): Service[] {
  if (typeof window === "undefined") return cloneDefaults();
  const stored = window.localStorage.getItem(SERVICES_KEY);
  if (!stored) return cloneDefaults();
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as Service[]) : cloneDefaults();
  } catch {
    return cloneDefaults();
  }
}

export function saveServices(services: Service[]) {
  window.localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
  window.dispatchEvent(new Event(SERVICES_UPDATED_EVENT));
}

export function saveEstimate(selected: SelectedServices) {
  window.localStorage.setItem(ESTIMATE_KEY, JSON.stringify(selected));
}

export function getEstimate(): SelectedServices {
  if (typeof window === "undefined") return {};
  const stored = window.localStorage.getItem(ESTIMATE_KEY);
  if (!stored) return {};
  try {
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === "object" ? (parsed as SelectedServices) : {};
  } catch {
    return {};
  }
}

export function saveBooking(booking: Booking) {
  window.localStorage.setItem(BOOKING_KEY, JSON.stringify(booking));
}

export function getBooking(): Booking | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(BOOKING_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as Booking;
  } catch {
    return null;
  }
}

export function getPetParentMembers(): PetParentMember[] {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(PET_PARENT_MEMBERS_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as PetParentMember[]) : [];
  } catch {
    return [];
  }
}

export function savePetParentMember(details: Pick<PetParentDetails, "firstName" | "lastName" | "city" | "state" | "petName" | "petBreed">) {
  const members = getPetParentMembers();
  const normalizedName = `${details.firstName} ${details.lastName}`.trim().toLowerCase();
  const existing = members.find((member) => `${member.firstName} ${member.lastName}`.trim().toLowerCase() === normalizedName);
  const pet = { name: details.petName.trim(), breed: details.petBreed.trim() };
  const nextMember: PetParentMember = existing
    ? {
        ...existing,
        city: details.city.trim(),
        state: details.state.trim(),
        pets: existing.pets.some((savedPet) => savedPet.name.toLowerCase() === pet.name.toLowerCase())
          ? existing.pets.map((savedPet) => savedPet.name.toLowerCase() === pet.name.toLowerCase() ? pet : savedPet)
          : [...existing.pets, pet],
      }
    : {
        id: `member-${Date.now()}`,
        firstName: details.firstName.trim(),
        lastName: details.lastName.trim(),
        city: details.city.trim(),
        state: details.state.trim(),
        pets: [pet],
      };
  const nextMembers = existing ? members.map((member) => member.id === existing.id ? nextMember : member) : [...members, nextMember];
  window.localStorage.setItem(PET_PARENT_MEMBERS_KEY, JSON.stringify(nextMembers));
  return nextMember;
}

export function getSelectedDuration(selected: SelectedServices, services: Service[]) {
  return services.reduce(
    (total, service) => total + (selected[service.id] || 0) * service.durationMinutes,
    0,
  );
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (!hours) return `${remainingMinutes} min`;
  if (!remainingMinutes) return `${hours} hr`;
  return `${hours} hr ${remainingMinutes} min`;
}

export const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
