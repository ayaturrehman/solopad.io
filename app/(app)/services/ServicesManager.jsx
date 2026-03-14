"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Archive, Pencil, Plus, Tag, Trash2,
} from "lucide-react";
import CollectionPageHeader, { collectionPageHeaderPrimaryActionClassName } from "@/components/shared/CollectionPageHeader";
import { CollectionDataTable, CollectionEmptyState } from "@/components/shared/CollectionDataTable";
import Modal from "@/components/shared/Modal";
import Button from "@/components/ui/Button";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  SERVICE_FILTERS,
  SERVICE_STATUS_BADGES,
  SERVICE_STATUS_OPTIONS,
  SERVICE_UNIT_LABELS,
} from "@/lib/services";

function getHeaderLabel(filterKey) {
  if (filterKey === "all") return "Services";
  if (filterKey === "archived") return "Archived Services";
  return "Active Services";
}

function getInitialForm(service) {
  return {
    name: service?.name || "",
    description: service?.description || "",
    defaultRate: service?.defaultRate ?? "",
    unit: service?.unit || "flat",
    status: service?.status || "active",
  };
}

function ServiceFormModal({
  open,
  mode,
  initialService,
  loading,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(() => getInitialForm(initialService));

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "edit" ? "Edit service" : "Add service"}
      description="Manage reusable services for invoices and future pricing flows."
      className="max-w-xl"
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-700">Service name</label>
          <input
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="h-10 w-full rounded border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-900"
            placeholder="e.g. Website design"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-700">Description</label>
          <textarea
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            className="min-h-24 w-full rounded border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900"
            placeholder="Optional description shown when this service is reused"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-700">Default rate</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.defaultRate}
              onChange={(event) => updateField("defaultRate", event.target.value)}
              className="h-10 w-full rounded border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-900"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-700">Unit</label>
            <select
              value={form.unit}
              onChange={(event) => updateField("unit", event.target.value)}
              className="h-10 w-full rounded border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-900"
            >
              {Object.entries(SERVICE_UNIT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-700">Status</label>
            <select
              value={form.status}
              onChange={(event) => updateField("status", event.target.value)}
              className="h-10 w-full rounded border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-900"
            >
              {SERVICE_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            loading={loading}
            disabled={!form.name.trim()}
            onClick={() => onSubmit(form)}
          >
            {mode === "edit" ? "Save changes" : "Add service"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ServiceStatusModal({ open, service, loading, onClose, onSubmit }) {
  const [status, setStatus] = useState(service?.status || "active");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change service status"
      description="Archived services stay in your library but should no longer be used for new invoices."
      className="max-w-md"
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-zinc-900">{service?.name}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {service?.usageCount > 0
              ? `Used in ${service.usageCount} invoice${service.usageCount === 1 ? "" : "s"}`
              : "Not used in any invoices yet"}
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-700">Status</label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 w-full rounded border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-900"
          >
            {SERVICE_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" loading={loading} onClick={() => onSubmit(status)}>
            Update status
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function ServicesManager({ initialServices }) {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") || "").trim().toLowerCase();

  const [services, setServices] = useState(initialServices);
  const [filter, setFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [statusService, setStatusService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkError, setBulkError] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  const filterOptions = useMemo(
    () => SERVICE_FILTERS.filter((option) =>
      option.label.toLowerCase().includes(filterSearch.trim().toLowerCase())
    ),
    [filterSearch]
  );

  const filteredServices = useMemo(() => {
    let list = filter === "all"
      ? services
      : services.filter((service) => service.status === filter);

    if (!query) return list;

    return list.filter((service) =>
      service.name.toLowerCase().includes(query) ||
      (service.description || "").toLowerCase().includes(query) ||
      SERVICE_UNIT_LABELS[service.unit].toLowerCase().includes(query)
    );
  }, [filter, query, services]);

  useEffect(() => {
    setSelectedIds([]);
    setBulkError("");
  }, [filter, query]);

  const visibleServiceIds = filteredServices.map((service) => service.id);
  const selectedCount = selectedIds.length;
  const selectedVisibleCount = visibleServiceIds.filter((id) => selectedIds.includes(id)).length;
  const allVisibleSelected = visibleServiceIds.length > 0 && selectedVisibleCount === visibleServiceIds.length;
  const canSelectMore = selectedCount < 25;
  const selectedServices = filteredServices.filter((service) => selectedIds.includes(service.id));
  const canDeleteSelected = selectedServices.every((service) => (service.usageCount || 0) === 0);

  function resetMessages() {
    setFeedback("");
    setError("");
  }

  async function submitService(form) {
    resetMessages();
    setLoading(true);

    try {
      const isEdit = Boolean(editingService);
      const res = await fetch(isEdit ? `/api/services/${editingService.id}` : "/api/services", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not save the service.");
        return;
      }

      if (isEdit) {
        setServices((current) => current.map((service) => (service.id === data.id ? data : service)));
        setFeedback("Service updated.");
      } else {
        setServices((current) => [data, ...current]);
        setFeedback("Service added.");
      }

      setFormOpen(false);
      setEditingService(null);
    } catch {
      setError("Could not save the service.");
    } finally {
      setLoading(false);
    }
  }

  async function submitStatus(status) {
    if (!statusService) return;

    resetMessages();
    setLoading(true);

    try {
      const res = await fetch(`/api/services/${statusService.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not update the service status.");
        return;
      }

      setServices((current) => current.map((service) => (service.id === data.id ? data : service)));
      setFeedback(`Service marked as ${data.status}.`);
      setStatusService(null);
    } catch {
      setError("Could not update the service status.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(service) {
    resetMessages();

    if (!window.confirm(`Delete "${service.name}"?`)) return;

    const res = await fetch(`/api/services/${service.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error || "Could not delete the service.");
      return;
    }

    setServices((current) => current.filter((item) => item.id !== service.id));
    setFeedback("Service deleted.");
  }

  function toggleOne(id, checked) {
    setBulkError("");
    setSelectedIds((current) => {
      if (!checked) return current.filter((value) => value !== id);
      if (current.includes(id)) return current;
      if (current.length >= 25) {
        setBulkError("You can select up to 25 services at a time.");
        return current;
      }
      return [...current, id];
    });
  }

  function toggleAllVisible() {
    setBulkError("");
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleServiceIds.includes(id));
      }

      const next = [...current];
      for (const id of visibleServiceIds) {
        if (next.includes(id)) continue;
        if (next.length >= 25) {
          setBulkError("You can select up to 25 services at a time.");
          break;
        }
        next.push(id);
      }
      return next;
    });
  }

  async function bulkUpdateStatus(nextStatus) {
    if (!selectedCount || bulkLoading) return;
    setBulkLoading(true);
    setBulkError("");
    resetMessages();

    try {
      const responses = await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/services/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: nextStatus }),
          })
        )
      );

      const payloads = await Promise.all(responses.map((response) => response.json().catch(() => ({}))));
      const failedIndex = responses.findIndex((response) => !response.ok);
      if (failedIndex >= 0) {
        throw new Error(payloads[failedIndex]?.error || "Could not update selected services.");
      }

      const updatesById = new Map(payloads.map((service) => [service.id, service]));
      setServices((current) => current.map((service) => updatesById.get(service.id) || service));
      setSelectedIds([]);
      setFeedback(`Updated ${payloads.length} service${payloads.length === 1 ? "" : "s"}.`);
    } catch (bulkActionError) {
      setBulkError(bulkActionError.message || "Could not update selected services.");
    } finally {
      setBulkLoading(false);
    }
  }

  async function bulkDelete() {
    if (!selectedCount || bulkLoading) return;
    if (!canDeleteSelected) {
      setBulkError("Used services cannot be deleted. Archive them instead.");
      return;
    }
    if (!window.confirm(`Delete ${selectedCount} service${selectedCount === 1 ? "" : "s"}?`)) return;

    setBulkLoading(true);
    setBulkError("");
    resetMessages();

    try {
      const responses = await Promise.all(
        selectedIds.map((id) => fetch(`/api/services/${id}`, { method: "DELETE" }))
      );
      const payloads = await Promise.all(responses.map((response) => response.json().catch(() => ({}))));
      const failedIndex = responses.findIndex((response) => !response.ok);
      if (failedIndex >= 0) {
        throw new Error(payloads[failedIndex]?.error || "Could not delete selected services.");
      }

      const selectedSet = new Set(selectedIds);
      setServices((current) => current.filter((service) => !selectedSet.has(service.id)));
      setSelectedIds([]);
      setFeedback(`Deleted ${responses.length} service${responses.length === 1 ? "" : "s"}.`);
    } catch (bulkActionError) {
      setBulkError(bulkActionError.message || "Could not delete selected services.");
    } finally {
      setBulkLoading(false);
    }
  }

  return (
    <div>
      <CollectionPageHeader
        title={getHeaderLabel(filter)}
        filterOpen={filterOpen}
        onToggleFilter={() => setFilterOpen((current) => !current)}
        filterSearch={filterSearch}
        onFilterSearchChange={setFilterSearch}
        filterOptions={filterOptions}
        selectedFilterKey={filter}
        onSelectFilter={(key) => {
          setFilter(key);
          setFilterOpen(false);
          setFilterSearch("");
        }}
        actions={(
          
          <button
            type="button"
            className={collectionPageHeaderPrimaryActionClassName}
            onClick={() => {
              resetMessages();
              setEditingService(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New service
          </button>
        )}
      />

      {feedback && (
        <div className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {feedback}
        </div>
      )}
      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <ServiceFormModal
        key={editingService?.id || "create-service"}
        open={formOpen}
        mode={editingService ? "edit" : "create"}
        initialService={editingService}
        loading={loading}
        onClose={() => {
          setFormOpen(false);
          setEditingService(null);
        }}
        onSubmit={submitService}
      />

      <ServiceStatusModal
        key={statusService?.id || "change-service-status"}
        open={Boolean(statusService)}
        service={statusService}
        loading={loading}
        onClose={() => setStatusService(null)}
        onSubmit={submitStatus}
      />

      {filteredServices.length === 0 ? (
        <CollectionEmptyState
          icon={Tag}
          title={services.length === 0 ? "No services yet" : "No services match this view"}
          description={services.length === 0
            ? "Create reusable services for invoice line items and future proposal pricing."
            : "Try a different search or status filter."}
          className="border-dashed"
        />
      ) : (
        <CollectionDataTable
          rows={filteredServices}
          tableClassName="w-full min-w-[400px] text-sm"
          bodyClassName="divide-y divide-zinc-100"
          selection={{
            allVisibleSelected,
            onToggleAll: toggleAllVisible,
            isSelected: (service) => selectedIds.includes(service.id),
            isRowDisabled: (service) => !selectedIds.includes(service.id) && !canSelectMore,
            onToggleRow: (service, checked) => toggleOne(service.id, checked),
            getRowLabel: (service) => `Select ${service.name}`,
          }}
          bulkActions={{
            count: selectedCount,
            maxCount: 25,
            error: bulkError,
            isSubmitting: bulkLoading,
            actions: [
              { key: "active", label: "Mark active", onClick: () => bulkUpdateStatus("active") },
              { key: "archived", label: "Archive", onClick: () => bulkUpdateStatus("archived") },
              { key: "delete", label: bulkLoading ? "Working..." : "Delete", onClick: bulkDelete, variant: "danger", disabled: !canDeleteSelected },
            ],
            onClear: () => {
              setSelectedIds([]);
              setBulkError("");
            },
          }}
          columns={[
            { key: "name", header: "Name" },
            { key: "description", header: "Description" },
            { key: "rate", header: "Rate", headerClassName: "text-right" },
            { key: "unit", header: "Unit" },
            { key: "status", header: "Status" },
            { key: "used", header: "Used", headerClassName: "text-center" },
            { key: "added", header: "Added" },
            { key: "actions", header: "Actions", headerClassName: "text-right" },
          ]}
          renderRow={(service) => (
            <>
              <td className="px-5 py-3.5">
                <div className="font-medium text-zinc-900">{service.name}</div>
              </td>
              <td className="max-w-sm px-5 py-3.5 text-zinc-500">
                <span className="block truncate">{service.description || "—"}</span>
              </td>
              <td className="px-5 py-3.5 text-right font-medium text-zinc-900">
                {formatCurrency(service.defaultRate || 0)}
              </td>
              <td className="px-5 py-3.5 text-zinc-500">{SERVICE_UNIT_LABELS[service.unit]}</td>
              <td className="px-5 py-3.5">
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", SERVICE_STATUS_BADGES[service.status] || SERVICE_STATUS_BADGES.active)}>
                  {service.status === "archived" ? "Archived" : "Active"}
                </span>
              </td>
              <td className="px-5 py-3.5 text-center text-zinc-500">{service.usageCount || 0}</td>
              <td className="px-5 py-3.5 text-zinc-500">{formatDate(service.createdAt)}</td>
              <td className="px-5 py-3.5">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetMessages();
                      setEditingService(service);
                      setFormOpen(true);
                    }}
                    className="inline-flex items-center gap-1 rounded border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetMessages();
                      setStatusService(service);
                    }}
                    className="inline-flex items-center gap-1 rounded border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                  >
                    <Archive className="h-3.5 w-3.5" />
                    Status
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(service)}
                    disabled={(service.usageCount || 0) > 0}
                    className="inline-flex items-center gap-1 rounded border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                    title={(service.usageCount || 0) > 0 ? "Used services cannot be deleted" : "Delete service"}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </td>
            </>
          )}
        />
      )}
    </div>
  );
}
