"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { api, getErrorMessage } from "@/lib/api-client";
import type {
  Advertiser,
  AdvertiserContact,
  AdvertiserBankAccount,
  AdvertiserType,
  ContactType,
} from "@/lib/types";

const advertiserSchema = z.object({
  advertiser_code: z.string().min(1).max(255),
  advertiser_name: z.string().min(1).max(500),
  advertiser_type: z.enum(["individual", "business", "enterprise", "agency"]),
  address_line_1: z.string().min(1).max(500),
  address_line_2: z.string().max(500).optional(),
  city: z.string().min(1).max(255),
  state_province: z.string().min(1).max(255),
  postal_code: z.string().min(1).max(20),
  country: z.string().min(1).max(255),
  timezone: z.string().min(1).max(100),
});

const contactSchema = z.object({
  contact_name: z.string().min(1, "Name is required"),
  contact_email: z.string().email("Invalid email"),
  contact_phone: z.string().min(1, "Phone is required"),
  contact_type: z.string().min(1),
  is_point_of_contact: z.boolean().optional(),
});

const bankSchema = z.object({
  bank_name: z.string().min(1, "Bank name is required"),
  bank_account_number: z.string().min(1, "Account number is required"),
  bank_account_name: z.string().min(1, "Account name is required"),
  bank_account_currency: z.string().length(3, "Use 3-letter ISO code"),
  is_default: z.boolean().optional(),
});

type AdvertiserFormData = z.infer<typeof advertiserSchema>;
type ContactFormData = z.infer<typeof contactSchema>;
type BankFormData = z.infer<typeof bankSchema>;

const ADVERTISER_TYPES: AdvertiserType[] = ["individual", "business", "enterprise", "agency"];
const CONTACT_TYPES: ContactType[] = [
  "admin",
  "manager",
  "sales",
  "support",
  "marketing",
  "tech",
  "it",
  "hr",
  "finance",
  "operations",
  "technical",
];

export default function AdvertiserEditPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);
  const [deleteBankId, setDeleteBankId] = useState<string | null>(null);
  const [deleteAdvertiserOpen, setDeleteAdvertiserOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);

  const { data: advertiser, isLoading } = useQuery({
    queryKey: ["advertiser", id],
    queryFn: () => api.get<Advertiser>(`/api/advertisers/${id}`),
    enabled: !!id,
  });

  const { data: contactsData } = useQuery({
    queryKey: ["advertiser-contacts", id],
    queryFn: () =>
      api.get<{ data: AdvertiserContact[] }>(`/api/advertisers/${id}/contacts`),
    enabled: !!id,
  });

  const { data: banksData } = useQuery({
    queryKey: ["advertiser-banks", id],
    queryFn: () =>
      api.get<{ data: AdvertiserBankAccount[] }>(`/api/advertisers/${id}/bank-accounts`),
    enabled: !!id,
  });

  const form = useForm<AdvertiserFormData>({
    resolver: zodResolver(advertiserSchema),
    values: advertiser
      ? {
          advertiser_code: advertiser.advertiser_code,
          advertiser_name: advertiser.advertiser_name,
          advertiser_type: advertiser.advertiser_type,
          address_line_1: advertiser.address_line_1,
          address_line_2: advertiser.address_line_2 ?? "",
          city: advertiser.city,
          state_province: advertiser.state_province,
          postal_code: advertiser.postal_code,
          country: advertiser.country,
          timezone: advertiser.timezone,
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (body: AdvertiserFormData) =>
      api.put<Advertiser>(`/api/advertisers/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advertiser", id] });
      toast.success("Advertiser updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/api/advertisers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advertisers"] });
      toast.success("Advertiser deleted");
      router.push("/advertisers");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteContactMutation = useMutation({
    mutationFn: (contactId: string) =>
      api.delete(`/api/advertisers/${id}/contacts/${contactId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advertiser-contacts", id] });
      toast.success("Contact deleted");
      setDeleteContactId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteBankMutation = useMutation({
    mutationFn: (bankId: string) =>
      api.delete(`/api/advertisers/${id}/bank-accounts/${bankId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advertiser-banks", id] });
      toast.success("Bank account deleted");
      setDeleteBankId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const contacts = contactsData?.data ?? [];
  const banks = banksData?.data ?? [];

  if (!id) return null;
  if (isLoading || !advertiser) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={advertiser.advertiser_name}
        description={`Edit advertiser ${advertiser.advertiser_code}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild className="rounded-xl">
              <Link href="/advertisers">Back</Link>
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={() => setDeleteAdvertiserOpen(true)}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="rounded-xl">
          <TabsTrigger value="details" className="rounded-lg">Details</TabsTrigger>
          <TabsTrigger value="contacts" className="rounded-lg">Contacts</TabsTrigger>
          <TabsTrigger value="banks" className="rounded-lg">Bank accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card className="rounded-xl border border-border shadow-sm">
            <CardHeader>
              <CardTitle>Advertiser details</CardTitle>
              <CardDescription>Update and save.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Code</Label>
                    <Input className="rounded-xl" {...form.register("advertiser_code")} />
                    {form.formState.errors.advertiser_code && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.advertiser_code.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input className="rounded-xl" {...form.register("advertiser_name")} />
                    {form.formState.errors.advertiser_name && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.advertiser_name.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={form.watch("advertiser_type")}
                    onValueChange={(v) => form.setValue("advertiser_type", v as AdvertiserType)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ADVERTISER_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Address line 1</Label>
                  <Input className="rounded-xl" {...form.register("address_line_1")} />
                  {form.formState.errors.address_line_1 && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.address_line_1.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Address line 2</Label>
                  <Input className="rounded-xl" {...form.register("address_line_2")} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input className="rounded-xl" {...form.register("city")} />
                    {form.formState.errors.city && (
                      <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>State / Province</Label>
                    <Input className="rounded-xl" {...form.register("state_province")} />
                    {form.formState.errors.state_province && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.state_province.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Postal code</Label>
                    <Input className="rounded-xl" {...form.register("postal_code")} />
                    {form.formState.errors.postal_code && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.postal_code.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input className="rounded-xl" {...form.register("country")} />
                    {form.formState.errors.country && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.country.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Input className="rounded-xl" {...form.register("timezone")} />
                    {form.formState.errors.timezone && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.timezone.message}
                      </p>
                    )}
                  </div>
                </div>
                <Button type="submit" className="rounded-xl" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card className="rounded-xl border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Contacts</CardTitle>
                <CardDescription>Add and manage contacts for this advertiser.</CardDescription>
              </div>
              <Button className="rounded-xl shadow-sm" onClick={() => setContactOpen(true)}>
                Add contact
              </Button>
            </CardHeader>
            <CardContent>
              {contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No contacts yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((c) => (
                      <TableRow key={c.contact_id}>
                        <TableCell>{c.contact_name}</TableCell>
                        <TableCell>{c.contact_email}</TableCell>
                        <TableCell>{c.contact_phone}</TableCell>
                        <TableCell>{c.contact_type}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => setDeleteContactId(c.contact_id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banks" className="space-y-4">
          <Card className="rounded-xl border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Bank accounts</CardTitle>
                <CardDescription>Add and manage bank accounts.</CardDescription>
              </div>
              <Button className="rounded-xl shadow-sm" onClick={() => setBankOpen(true)}>
                Add bank account
              </Button>
            </CardHeader>
            <CardContent>
              {banks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bank accounts yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bank name</TableHead>
                      <TableHead>Account name</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {banks.map((b) => (
                      <TableRow key={b.bank_id}>
                        <TableCell>{b.bank_name}</TableCell>
                        <TableCell>{b.bank_account_name}</TableCell>
                        <TableCell>{b.bank_account_currency}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => setDeleteBankId(b.bank_id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddContactDialog
        open={contactOpen}
        onOpenChange={setContactOpen}
        advertiserId={id}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["advertiser-contacts", id] });
          setContactOpen(false);
        }}
      />

      <AddBankDialog
        open={bankOpen}
        onOpenChange={setBankOpen}
        advertiserId={id}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["advertiser-banks", id] });
          setBankOpen(false);
        }}
      />

      <ConfirmDialog
        open={deleteAdvertiserOpen}
        onOpenChange={setDeleteAdvertiserOpen}
        title="Delete advertiser"
        description="Are you sure you want to delete this advertiser? All contacts and bank accounts will be removed. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={async () => deleteMutation.mutate()}
      />

      <ConfirmDialog
        open={!!deleteContactId}
        onOpenChange={(open) => !open && setDeleteContactId(null)}
        title="Delete contact"
        description="Are you sure you want to remove this contact? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteContactMutation.isPending}
        onConfirm={async () => {
          if (deleteContactId) await deleteContactMutation.mutateAsync(deleteContactId);
        }}
      />

      <ConfirmDialog
        open={!!deleteBankId}
        onOpenChange={(open) => !open && setDeleteBankId(null)}
        title="Delete bank account"
        description="Are you sure you want to remove this bank account? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteBankMutation.isPending}
        onConfirm={async () => {
          if (deleteBankId) await deleteBankMutation.mutateAsync(deleteBankId);
        }}
      />
    </div>
  );
}

function AddContactDialog({
  open,
  onOpenChange,
  advertiserId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  advertiserId: string;
  onSuccess: () => void;
}) {
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      contact_type: "manager",
      is_point_of_contact: false,
    },
  });

  const mutation = useMutation({
    mutationFn: (body: ContactFormData) =>
      api.post(`/api/advertisers/${advertiserId}/contacts`, body),
    onSuccess: () => {
      toast.success("Contact added");
      form.reset();
      onSuccess();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>Add contact</DialogTitle>
          <DialogDescription>Add a new contact for this advertiser.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Name</Label>
            <Input className="rounded-xl" {...form.register("contact_name")} />
            {form.formState.errors.contact_name && (
              <p className="text-sm text-destructive">{form.formState.errors.contact_name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" className="rounded-xl" {...form.register("contact_email")} />
            {form.formState.errors.contact_email && (
              <p className="text-sm text-destructive">{form.formState.errors.contact_email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input className="rounded-xl" {...form.register("contact_phone")} />
            {form.formState.errors.contact_phone && (
              <p className="text-sm text-destructive">{form.formState.errors.contact_phone.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={form.watch("contact_type")}
              onValueChange={(v) => form.setValue("contact_type", v)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl" disabled={mutation.isPending}>
              {mutation.isPending ? "Adding..." : "Add contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddBankDialog({
  open,
  onOpenChange,
  advertiserId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  advertiserId: string;
  onSuccess: () => void;
}) {
  const form = useForm<BankFormData>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      bank_name: "",
      bank_account_number: "",
      bank_account_name: "",
      bank_account_currency: "USD",
      is_default: false,
    },
  });

  const mutation = useMutation({
    mutationFn: (body: BankFormData) =>
      api.post(`/api/advertisers/${advertiserId}/bank-accounts`, body),
    onSuccess: () => {
      toast.success("Bank account added");
      form.reset();
      onSuccess();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>Add bank account</DialogTitle>
          <DialogDescription>Add a new bank account for this advertiser.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Bank name</Label>
            <Input className="rounded-xl" {...form.register("bank_name")} />
            {form.formState.errors.bank_name && (
              <p className="text-sm text-destructive">{form.formState.errors.bank_name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Account number</Label>
            <Input className="rounded-xl" {...form.register("bank_account_number")} />
            {form.formState.errors.bank_account_number && (
              <p className="text-sm text-destructive">
                {form.formState.errors.bank_account_number.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Account name</Label>
            <Input className="rounded-xl" {...form.register("bank_account_name")} />
            {form.formState.errors.bank_account_name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.bank_account_name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Currency (ISO 4217, e.g. USD)</Label>
            <Input className="rounded-xl" {...form.register("bank_account_currency")} />
            {form.formState.errors.bank_account_currency && (
              <p className="text-sm text-destructive">
                {form.formState.errors.bank_account_currency.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl" disabled={mutation.isPending}>
              {mutation.isPending ? "Adding..." : "Add bank account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
