import { useState } from "react";
import { useAction, useUser } from "@gadgetinc/react";
import { toast } from "sonner";
import { api } from "../api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const AddContactModal = ({ open, onOpenChange, burstId, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = useUser();
  const [{ error: contactError }, createContact] = useAction(api.contact.create);
  const [{ error: enrollmentError }, createEnrollment] = useAction(api.enrollment.create);

  const resetForm = () => {
    setEmail("");
    setFirstName("");
    setLastName("");
    setCompany("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error('User not loaded yet, please try again');
      return;
    }

    if (!email) {
      toast.error("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const contactResponse = await createContact({
        email,
        firstName: firstName || null,
        name: lastName || null,
        company: company || null,
        enrollmentDate: new Date().toISOString(),
        status: "Active",
        user: {
          _link: user.id
        }
      });

      if (contactError || contactResponse?.error) {
        toast.error(`Failed to create contact: ${contactError?.message || contactResponse?.error?.message}`);
        setIsSubmitting(false);
        return;
      }

      const contactResult = contactResponse?.data || contactResponse;

      const enrollmentResponse = await createEnrollment({
        contact: {
          _link: contactResult.id,
        },
        burst: {
          _link: burstId,
        },
        enrolledAt: new Date().toISOString(),
        user: {
          _link: user.id
        }
      });

      if (enrollmentError || enrollmentResponse?.error) {
        toast.error(`Failed to enroll contact: ${enrollmentError?.message || enrollmentResponse?.error?.message}`);
        setIsSubmitting(false);
        return;
      }

      toast.success("Contact added successfully");
      resetForm();
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Contact to Burst</DialogTitle>
          <DialogDescription>
            Enter the contact details to add them to this burst.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@example.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Inc."
              disabled={isSubmitting}
            />
          </div>

          {(contactError || enrollmentError) && (
            <div className="text-sm text-red-500">
              {contactError?.message || enrollmentError?.message}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Contact"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};