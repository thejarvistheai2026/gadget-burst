import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router';
import { useFindOne, useFindMany, useUser, useAction } from '@gadgetinc/react';
import { AutoTable } from '@/components/auto';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Edit2, Eye, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../api';

const AddContactToBurstModal = ({ open, onOpenChange, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [selectedBurstId, setSelectedBurstId] = useState('');

  const user = useUser();
  const [{ data: bursts }] = useFindMany(api.burst, {
    select: { id: true, name: true }
  });

  const [{ fetching: creatingContact }, createContact] = useAction(api.contact.create);
  const [{ fetching: creatingEnrollment }, createEnrollment] = useAction(api.enrollment.create);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !selectedBurstId) {
      toast.error('Email and burst are required');
      return;
    }

    try {
      const contactResult = await createContact({
        email,
        firstName,
        name: lastName,
        company,
        enrollmentDate: new Date().toISOString(),
        status: 'Active',
        user: { _link: user.id }
      });

      if (contactResult.error) {
        throw contactResult.error;
      }

      const enrollmentResult = await createEnrollment({
        contact: { _link: contactResult.data.id },
        burst: { _link: selectedBurstId },
        enrolledAt: new Date().toISOString(),
        user: { _link: user.id }
      });

      if (enrollmentResult.error) {
        throw enrollmentResult.error;
      }

      setEmail('');
      setFirstName('');
      setLastName('');
      setCompany('');
      setSelectedBurstId('');
      
      onSuccess();
    } catch (error) {
      toast.error(`Failed to add contact: ${error.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Contact to Burst</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="burst">Burst *</Label>
            <Select value={selectedBurstId} onValueChange={setSelectedBurstId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a burst" />
              </SelectTrigger>
              <SelectContent>
                {bursts?.map((burst) => (
                  <SelectItem key={burst.id} value={burst.id}>
                    {burst.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creatingContact || creatingEnrollment}>
              {creatingContact || creatingEnrollment ? 'Adding...' : 'Add Contact'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function Contacts() {
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [addContactModalOpen, setAddContactModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.selectedContactId) {
      setSelectedContactId(location.state.selectedContactId);
    }
  }, [location]);
  
  const [{ data: allEnrollments }] = useFindMany(api.enrollment, {
    select: { id: true, contactId: true }
  });

  const enrollmentCountByContact = useMemo(() => {
    const counts = {};
    allEnrollments?.forEach(enrollment => {
      counts[enrollment.contactId] = (counts[enrollment.contactId] || 0) + 1;
    });
    return counts;
  }, [allEnrollments]);

  const [{ data: selectedContact }] = useFindOne(api.contact, selectedContactId, {
    skip: !selectedContactId,
    select: {
      id: true,
      email: true,
      firstName: true,
      name: true,
      company: true,
      status: true,
      bursts: {
        edges: {
          node: {
            id: true,
            name: true
          }
        }
      },
      sentEmails: {
        edges: {
          node: {
            id: true,
            sentAt: true,
            status: true,
            subject: true,
            burst: { id: true, name: true },
            emailTemplate: { id: true, subject: true }
          }
        }
      }
    }
  });

  const sortedSentEmails = useMemo(() => {
    if (!selectedContact?.sentEmails?.edges) return [];
    return [...selectedContact.sentEmails.edges]
      .sort((a, b) => new Date(b.node.sentAt) - new Date(a.node.sentAt));
  }, [selectedContact?.sentEmails]);

  const columns = [
    'email',
    'firstName',
    'name',
    'company',
    'status',
    {
      header: 'Bursts',
      render: ({ record }) => {
        return <span>{enrollmentCountByContact[record.id] || 0}</span>;
      }
    },
    {
      header: 'Actions',
      render: ({ record }) => {
        return (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => toast('Edit contact coming soon')}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedContactId(record.id)}>
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Contacts</h1>
        <Button onClick={() => setAddContactModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <AutoTable 
          model={api.contact} 
          columns={columns}
        />
      </div>

      <Dialog open={!!selectedContactId} onOpenChange={() => setSelectedContactId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{selectedContact.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">
                  {selectedContact.firstName} {selectedContact.name}
                </p>
              </div>
              {selectedContact.company && (
                <div>
                  <p className="text-sm font-medium">Company</p>
                  <p className="text-sm text-muted-foreground">{selectedContact.company}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-sm text-muted-foreground">{selectedContact.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Enrolled Bursts</p>
                {selectedContact.bursts?.edges?.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {selectedContact.bursts.edges.map((edge) => (
                      <li key={edge.node.id}>{edge.node.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No bursts enrolled</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Email History</p>
                {sortedSentEmails.length > 0 ? (
                  <div className="space-y-2">
                    {sortedSentEmails.map((edge) => (
                      <div key={edge.node.id} className="border rounded p-3 text-sm">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium">{edge.node.subject}</span>
                          <Badge variant={edge.node.status === 'sent' ? 'default' : 'destructive'}>
                            {edge.node.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">
                          Burst: {edge.node.burst?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(edge.node.sentAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No emails sent yet</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddContactToBurstModal
        open={addContactModalOpen}
        onOpenChange={setAddContactModalOpen}
        onSuccess={() => {
          setAddContactModalOpen(false);
          toast.success('Contact added successfully');
        }}
      />
    </div>
  );
}