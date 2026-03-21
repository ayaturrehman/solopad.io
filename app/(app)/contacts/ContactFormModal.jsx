"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/shared/Modal";
import Button from "@/components/ui/Button";
import Input, { textareaClassName } from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import {
  CONTACT_ENTITY_TYPE_OPTIONS,
  CONTACT_STATUS_OPTIONS,
} from "@/lib/contacts";

function getInitialForm(contact) {
  return {
    name: contact?.name || "",
    entityType: contact?.entityType || "individual",
    jobTitle: contact?.jobTitle || "",
    email: contact?.email || "",
    phone: contact?.phone || "",
    website: contact?.website || "",
    company: contact?.company || "",
    companyAddressLine1: contact?.companyAddressLine1 || "",
    companyCity: contact?.companyCity || "",
    companyState: contact?.companyState || "",
    companyPostalCode: contact?.companyPostalCode || "",
    companyCountry: contact?.companyCountry || "",
    status: contact?.status || "lead",
    source: contact?.source || "",
    value: contact?.value === null || contact?.value === undefined ? "" : String(contact.value),
    notes: contact?.notes || "",
  };
}

function TextareaField({ label, value, onChange, placeholder, rows = 4, error, required = false }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-zinc-700">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className={`${textareaClassName} min-h-[88px] resize-y${error ? " border-red-400 focus:border-red-400" : ""}`}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function validateContactForm(form) {
  const nextErrors = {};

  if (!form.name.trim()) {
    nextErrors.name = "Full name is required.";
  }

  if (!form.entityType) {
    nextErrors.entityType = "Type is required.";
  }

  if (!form.status) {
    nextErrors.status = "Status is required.";
  }

  if (form.entityType === "organization" && !form.company.trim()) {
    nextErrors.company = "Organisation name is required.";
  }

  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    nextErrors.email = "Enter a valid email address.";
  }

  if (form.value.trim() && Number.isNaN(Number.parseFloat(form.value))) {
    nextErrors.value = "Estimated value must be a valid number.";
  }

  return nextErrors;
}

export default function ContactFormModal({
  open,
  onOpenChange,
  contact,
  title,
  description,
  onSaved,
}) {
  const router = useRouter();
  const [form, setForm] = useState(getInitialForm(contact));
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(contact?.id);
  const isLead = form.status === "lead";

  useEffect(() => {
    if (open) {
      setForm(getInitialForm(contact));
      setFieldErrors({});
      setTouched({});
      setError("");
      setLoading(false);
    }
  }, [contact, open]);

  const modalTitle = title || (isEditing ? "Edit contact" : "New contact");

  const submitLabel = useMemo(() => {
    if (loading) return isEditing ? "Saving..." : "Creating...";
    return isEditing ? "Save changes" : "Save contact";
  }, [isEditing, loading]);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const newErrors = { ...fieldErrors };

    if (field === "name" && !form.name?.trim()) {
      newErrors.name = "Full name is required.";
    } else if (field === "name") {
      delete newErrors.name;
    }

    if (field === "email" && form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address.";
    } else if (field === "email") {
      delete newErrors.email;
    }

    if (field === "company" && form.entityType === "organization" && !form.company?.trim()) {
      newErrors.company = "Organisation name is required.";
    } else if (field === "company") {
      delete newErrors.company;
    }

    setFieldErrors(newErrors);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setTouched({ name: true, email: true, company: true });
    const nextErrors = validateContactForm(form);
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      setError("Please fix the required fields and try again.");
      return;
    }

    setFieldErrors({});
    setError("");
    setLoading(true);

    try {
      const res = await fetch(isEditing ? `/api/contacts/${contact.id}` : "/api/contacts", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to save contact.");
      }

      onSaved?.(data);
      onOpenChange(false);
      router.refresh();
    } catch (submitError) {
      setError(submitError.message || "Failed to save contact.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={modalTitle}
      layout="side"
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Section: Contact details */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Full name"
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
            onBlur={() => handleBlur("name")}
            required
            error={(touched.name || loading) && fieldErrors.name ? fieldErrors.name : ""}
          />
          <Select
            label="Type"
            value={form.entityType}
            onChange={(event) => setField("entityType", event.target.value)}
            required
            error={fieldErrors.entityType}
          >
            {CONTACT_ENTITY_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
          <Input
            label={form.entityType === "organization" ? "Organisation name" : "Company"}
            value={form.company}
            onChange={(event) => setField("company", event.target.value)}
            onBlur={() => handleBlur("company")}
            required={form.entityType === "organization"}
            error={(touched.company || loading) && fieldErrors.company ? fieldErrors.company : ""}
          />
          <Input
            label="Job title"
            value={form.jobTitle}
            onChange={(event) => setField("jobTitle", event.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) => setField("email", event.target.value)}
            onBlur={() => handleBlur("email")}
            error={(touched.email || loading) && fieldErrors.email ? fieldErrors.email : ""}
          />
          <Input
            label="Phone"
            type="tel"
            value={form.phone}
            onChange={(event) => setField("phone", event.target.value)}
          />
          <Input
            label="Website"
            value={form.website}
            onChange={(event) => setField("website", event.target.value)}
            className="sm:col-span-2"
          />
        </div>

        {/* Section: CRM */}
        <div className="border-t border-zinc-100 pt-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">CRM</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Select
              label="Status"
              value={form.status}
              onChange={(event) => setField("status", event.target.value)}
              required
              error={fieldErrors.status}
            >
              {CONTACT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
            <Input
              label="Lead source"
              value={form.source}
              onChange={(event) => setField("source", event.target.value)}
            />
            <Input
              label="Est. value"
              type="text"
              inputMode="decimal"
              value={form.value}
              onChange={(event) => setField("value", event.target.value)}
              error={fieldErrors.value}
            />
          </div>
        </div>

        {/* Section: Address */}
        <div className="border-t border-zinc-100 pt-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Address</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Street address"
              value={form.companyAddressLine1}
              onChange={(event) => setField("companyAddressLine1", event.target.value)}
              className="sm:col-span-2"
            />
            <Input
              label="City"
              value={form.companyCity}
              onChange={(event) => setField("companyCity", event.target.value)}
            />
            <Input
              label="State / county"
              value={form.companyState}
              onChange={(event) => setField("companyState", event.target.value)}
            />
            <Input
              label="Postal code"
              value={form.companyPostalCode}
              onChange={(event) => setField("companyPostalCode", event.target.value)}
            />
            <Input
              label="Country"
              value={form.companyCountry}
              onChange={(event) => setField("companyCountry", event.target.value)}
            />
          </div>
        </div>

        {/* Section: Notes */}
        <div className="border-t border-zinc-100 pt-4">
          <TextareaField
            label="Notes"
            value={form.notes}
            onChange={(event) => setField("notes", event.target.value)}
            placeholder="Any additional notes about this contact…"
            rows={3}
          />
        </div>

        {error ? <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

        <div className="flex items-center justify-end gap-2 border-t border-zinc-100 pt-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={loading}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
