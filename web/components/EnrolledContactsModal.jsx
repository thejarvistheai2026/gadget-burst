import { useState, useEffect } from "react";
import { useFindMany, useAction } from "@gadgetinc/react";
import { api } from "../api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit2, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export function EnrolledContactsModal({ open, onOpenChange, burstId, onContactDeleted }) {
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState(null);

  const [{ data: enrollments, fetching, error }, refetch] = useFindMany(api.enrollment, {
    filter: { burstId: { equals: burstId } },
    select: {
      id: true,
      enrolledAt: true,
      contact: {
        id: true,
        email: true,
        firstName: true,
        name: true,
        company: true,
        status: true,
        sentEmails: {
          edges: {
            node: {
              id: true,
              status: true,
              emailTemplate: {
                id: true,
                delayOffset: true
              }
            }
          }
        }
      },
    },
  });

  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open]);

  const [{ fetching: deleting }, deleteEnrollment] = useAction(api.enrollment.delete);

  const handleEditClick = () => {
    toast("Edit contact coming soon");
  };

  const handleDeleteClick = (enrollment) => {
    setEnrollmentToDelete(enrollment);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!enrollmentToDelete) return;

    try {
      await deleteEnrollment({ id: enrollmentToDelete.id });
      toast.success("Contact removed from burst");
      await refetch();
      if (onContactDeleted) {
        onContactDeleted();
      }
    } catch (error) {
      toast.error("Failed to remove contact");
    } finally {
      setDeleteConfirmOpen(false);
      setEnrollmentToDelete(null);
    }
  };

  const getNextEmail = (contact) => {
    if (!contact?.sentEmails?.edges) return 'Email 1';
    
    const sentCount = contact.sentEmails.edges.filter(edge => edge.node.status === 'sent').length;
    const nextEmailNumber = sentCount + 1;
    
    return `Email ${nextEmailNumber}`;
  };

  const getContactName = (contact) => {
    if (!contact) return "-";
    if (contact.firstName && contact.name) {
      return `${contact.firstName} ${contact.name}`;
    }
    return contact.firstName || contact.name || "-";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enrolled Contacts</DialogTitle>
            <DialogDescription>
              Manage contacts enrolled in this burst
            </DialogDescription>
          </DialogHeader>

          {fetching && <div className="text-center py-8">Loading contacts...</div>}
          
          {error && (
            <div className="text-center py-8 text-red-500">
              Error loading contacts: {error.toString()}
            </div>
          )}

          {!fetching && !error && enrollments && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No contacts enrolled in this burst yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    enrollments.filter(enrollment => enrollment.contact).map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">
                          {enrollment.contact?.email || "-"}
                        </TableCell>
                        <TableCell>{getContactName(enrollment.contact)}</TableCell>
                        <TableCell>{enrollment.contact?.company || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={enrollment.contact?.status === "Active" ? "default" : "secondary"}>
                            {enrollment.contact?.status || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>{getNextEmail(enrollment.contact)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate('/contacts', { state: { selectedContactId: enrollment.contact.id } })}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleEditClick}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(enrollment)}
                              disabled={deleting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove contact from burst?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {enrollmentToDelete?.contact?.email} from this burst. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}