export const SERVICE_UNIT_LABELS = {
  flat: "Flat fee",
  hour: "Per hour",
  day: "Per day",
  word: "Per word",
};

export const SERVICE_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

export const SERVICE_FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "archived", label: "Archived" },
];

export const SERVICE_STATUS_BADGES = {
  active: "bg-green-50 text-green-700",
  archived: "bg-zinc-100 text-zinc-500",
};

export function normalizeServiceStatus(value) {
  return value === "archived" ? "archived" : "active";
}

export function normalizeServiceInput(input = {}) {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const rawRate = input.defaultRate;
  const parsedRate = rawRate === "" || rawRate === null || rawRate === undefined
    ? 0
    : Number.parseFloat(rawRate);

  const errors = [];
  if (!name) errors.push("Service name is required");
  if (Number.isNaN(parsedRate) || parsedRate < 0) {
    errors.push("Default rate must be a valid number");
  }

  return {
    errors,
    data: {
      name,
      description: description || null,
      defaultRate: Number.isNaN(parsedRate) ? 0 : parsedRate,
      unit: SERVICE_UNIT_LABELS[input.unit] ? input.unit : "flat",
      status: normalizeServiceStatus(input.status),
    },
  };
}

export function parseInvoiceLineItems(lineItems) {
  try {
    const parsed = typeof lineItems === "string" ? JSON.parse(lineItems) : lineItems;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function lineItemUsesService(lineItem, service) {
  if (!lineItem || !service) return false;
  if (lineItem.serviceId && lineItem.serviceId === service.id) return true;

  const description = typeof lineItem.description === "string" ? lineItem.description.trim() : "";
  const rate = Number.parseFloat(lineItem.rate);
  const matchesName = description === service.name;
  const matchesRate = Number.isFinite(rate) && Number(rate) === Number(service.defaultRate);

  return matchesName && matchesRate;
}

export function buildServiceUsageMap(services = [], invoices = []) {
  const usageMap = Object.fromEntries(services.map((service) => [service.id, 0]));

  invoices.forEach((invoice) => {
    const usedServiceIds = new Set();
    const lineItems = parseInvoiceLineItems(invoice.lineItems);

    services.forEach((service) => {
      if (lineItems.some((lineItem) => lineItemUsesService(lineItem, service))) {
        usedServiceIds.add(service.id);
      }
    });

    usedServiceIds.forEach((serviceId) => {
      usageMap[serviceId] = (usageMap[serviceId] || 0) + 1;
    });
  });

  return usageMap;
}
