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
  id?: string;
  dateKey: string;
  dateLabel: string;
  time: string;
  durationMinutes: number;
  selected: SelectedServices;
  petParent?: PetParentDetails;
};

export type Appointment = Booking & {
  id: string;
  createdAt: number;
};

export type PetParentMember = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  state: string;
  pets: { name: string; breed: string }[];
};

export type StudioUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
};

export type EmployeeCredentials = StudioUser & { password: string };

type StoredUser = EmployeeCredentials;

export const DEFAULT_ADMIN_USER: StudioUser = {
  id: "admin-elle",
  name: "Elle",
  email: "ellecarmean@gmail.com",
  role: "admin",
};

const ADMIN_PASSWORD = "Kevineleven!3";
const SERVICES_KEY = "good-groomed-services-v1";
const ESTIMATE_KEY = "good-groomed-estimate-v1";
const BOOKING_KEY = "good-groomed-booking-v1";
const APPOINTMENTS_KEY = "good-groomed-appointments-v1";
const PET_PARENT_MEMBERS_KEY = "good-groomed-pet-parent-members-v1";
const EMPLOYEES_KEY = "good-groomed-employees-v1";
const SESSION_KEY = "good-groomed-admin-session";
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
  const appointment: Appointment = {
    ...booking,
    id: booking.id || `appointment-${Date.now()}`,
    createdAt: Date.now(),
  };
  const appointments = getBookings().filter((item) => item.id !== appointment.id);
  window.localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify([...appointments, appointment]));
  window.localStorage.setItem(BOOKING_KEY, JSON.stringify(appointment));
}

export function getBookings(): Appointment[] {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(APPOINTMENTS_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed as Appointment[];
    } catch {
      return [];
    }
  }
  const legacy = window.localStorage.getItem(BOOKING_KEY);
  if (!legacy) return [];
  try {
    const booking = JSON.parse(legacy) as Booking;
    return [{ ...booking, id: booking.id || "legacy-appointment", createdAt: Date.now() }];
  } catch {
    return [];
  }
}

export function deleteBooking(id: string) {
  const remaining = getBookings().filter((appointment) => appointment.id !== id);
  if (remaining.length) {
    window.localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(remaining));
    window.localStorage.setItem(BOOKING_KEY, JSON.stringify(remaining[remaining.length - 1]));
  } else {
    window.localStorage.removeItem(APPOINTMENTS_KEY);
    window.localStorage.removeItem(BOOKING_KEY);
  }
}

export function getBooking(): Booking | null {
  const appointments = getBookings();
  return appointments.length ? appointments[appointments.length - 1] : null;
}

export function savePetParentMembers(members: PetParentMember[]) {
  window.localStorage.setItem(PET_PARENT_MEMBERS_KEY, JSON.stringify(members));
}

export function deletePetParentMember(id: string) {
  savePetParentMembers(getPetParentMembers().filter((member) => member.id !== id));
}

export function getPetParentMembers(): PetParentMember[] {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(PET_PARENT_MEMBERS_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed)
      ? (parsed as Partial<PetParentMember>[]).map((member) => ({
          ...member,
          phone: member.phone || "",
          pets: Array.isArray(member.pets) ? member.pets : [],
        })) as PetParentMember[]
      : [];
  } catch {
    return [];
  }
}

export function savePetParentMember(details: Pick<PetParentDetails, "firstName" | "lastName" | "city" | "state" | "petName" | "petBreed"> & { phone?: string }) {
  const members = getPetParentMembers();
  const normalizedName = `${details.firstName} ${details.lastName}`.trim().toLowerCase();
  const existing = members.find((member) => `${member.firstName} ${member.lastName}`.trim().toLowerCase() === normalizedName);
  const pet = { name: details.petName.trim(), breed: details.petBreed.trim() };
  const nextMember: PetParentMember = existing
    ? {
        ...existing,
        phone: details.phone?.trim() || existing.phone,
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
        phone: details.phone?.trim() || "",
        city: details.city.trim(),
        state: details.state.trim(),
        pets: [pet],
      };
  const nextMembers = existing ? members.map((member) => member.id === existing.id ? nextMember : member) : [...members, nextMember];
  window.localStorage.setItem(PET_PARENT_MEMBERS_KEY, JSON.stringify(nextMembers));
  return nextMember;
}

function getStoredUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(EMPLOYEES_KEY);
  let employees: StoredUser[] = [];
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      employees = Array.isArray(parsed) ? (parsed as StoredUser[]) : [];
    } catch {
      employees = [];
    }
  }
  return [{ ...DEFAULT_ADMIN_USER, password: ADMIN_PASSWORD }, ...employees];
}

export function authenticateUser(email: string, password: string): StudioUser | null {
  const user = getStoredUsers().find((candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase() && candidate.password === password);
  if (!user) return null;
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export function saveEmployee(employee: { name: string; email: string; password: string }) {
  const employees = getStoredUsers().filter((user) => user.role === "employee");
  const nextEmployee: StoredUser = { ...employee, id: `employee-${Date.now()}`, role: "employee" };
  const next = [...employees.filter((user) => user.email.toLowerCase() !== employee.email.trim().toLowerCase()), nextEmployee];
  window.localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(next));
  return nextEmployee;
}

export function getEmployees(): StudioUser[] {
  return getStoredUsers().filter((user) => user.role === "employee").map(({ password: _password, ...user }) => user);
}

export function getEmployeeCredentials(): EmployeeCredentials[] {
  return getStoredUsers().filter((user) => user.role === "employee");
}

export function getCurrentUser(): StudioUser | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(SESSION_KEY);
  if (stored === "true") return DEFAULT_ADMIN_USER;
  if (!stored) return null;
  try {
    return JSON.parse(stored) as StudioUser;
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: StudioUser) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearCurrentUser() {
  window.localStorage.removeItem(SESSION_KEY);
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
