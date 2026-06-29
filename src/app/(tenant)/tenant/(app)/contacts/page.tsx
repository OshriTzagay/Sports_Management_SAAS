import { FormDialog } from "@/components/ui/form-dialog";
import { requireUser } from "@/features/tenant-auth";
import { listContacts } from "@/features/contacts";
import { ContactList } from "@/features/contacts/contact-list";
import { CreateContactForm } from "@/features/contacts/create-contact-form";

export default async function ContactsPage() {
  await requireUser();
  const contacts = await listContacts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-text-primary text-xl font-bold">אנשי קשר</h1>
        <FormDialog triggerLabel="+ איש קשר" title="איש קשר חדש">
          <CreateContactForm />
        </FormDialog>
      </div>
      <ContactList contacts={contacts} />
    </div>
  );
}
