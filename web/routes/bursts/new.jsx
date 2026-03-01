import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAction, useFindFirst, useUser } from '@gadgetinc/react';
import { api } from '../../api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

export default function CreateBurst() {
  const navigate = useNavigate();
  const user = useUser();
  const [burstName, setBurstName] = useState('');
  const [emailTemplates, setEmailTemplates] = useState([
    { subject: '', bcc: '', body: '', delayOffset: 0 }
  ]);
  
  const [{ data: settings }] = useFindFirst(api.userSettings);
  const [{ fetching: creatingBurst }, createBurst] = useAction(api.burst.create);

  useEffect(() => {
    if (settings?.globalBcc) {
      setEmailTemplates(prevTemplates => 
        prevTemplates.map(template => ({
          ...template,
          bcc: settings.globalBcc
        }))
      );
    }
  }, [settings?.globalBcc]);

  const addEmailTemplate = () => {
    const previousTemplate = emailTemplates[emailTemplates.length - 1];
    const nextDelayOffset = previousTemplate ? previousTemplate.delayOffset + 1 : 0;
    
    setEmailTemplates([
      ...emailTemplates,
      { subject: '', bcc: settings?.globalBcc || '', body: '', delayOffset: nextDelayOffset }
    ]);
  };

  const removeEmailTemplate = (index) => {
    if (emailTemplates.length === 1) {
      toast.error('You must have at least one email template');
      return;
    }
    setEmailTemplates(emailTemplates.filter((_, i) => i !== index));
  };

  const updateEmailTemplate = (index, field, value) => {
    const updated = [...emailTemplates];
    updated[index] = { ...updated[index], [field]: value };
    setEmailTemplates(updated);
  };

  const handleSaveAsDraft = async () => {
    if (!user?.id) {
      toast.error('User not loaded yet, please try again');
      return;
    }

    if (!burstName.trim()) {
      toast.error('Please enter a burst name');
      return;
    }

    try {
      console.log('Creating burst with data:', {
        name: burstName,
        status: 'Draft',
        createdDate: new Date().toISOString(),
        numberOfEnrolledContacts: 0
      });

      const response = await createBurst({
        name: burstName,
        status: 'Draft',
        createdDate: new Date().toISOString(),
        numberOfEnrolledContacts: 0
      });

      console.log('Create burst response:', response);
      
      // The result from useAction can be the record directly or wrapped in a result object
      const burstRecord = response?.data || response;
      
      console.log('Burst record:', burstRecord);
      console.log('Burst ID:', burstRecord?.id);

      if (!burstRecord?.id) {
        console.error('Invalid burst result - no ID found. Full result:', response);
        throw new Error('Failed to create burst - no ID returned');
      }

      for (let i = 0; i < emailTemplates.length; i++) {
        const template = emailTemplates[i];
        
        // Skip templates that don't have a subject
        if (!template.subject.trim()) {
          console.log(`Skipping email template ${i + 1} - no subject`);
          continue;
        }

        const templateData = {
          subject: template.subject,
          body: {
            markdown: template.body || ''
          },
          delayOffset: template.delayOffset,
          burst: {
            _link: burstRecord.id
          },
          user: {
            _link: user.id
          }
        };

        console.log(`Creating email template ${i + 1} with data:`, templateData);

        try {
          const result = await api.emailTemplate.create(templateData);
          console.log(`Email template ${i + 1} created successfully:`, result);
        } catch (templateError) {
          console.error(`Error creating email template ${i + 1}:`, templateError);
          toast.error(`Failed to create email template ${i + 1}: ${templateError.message || 'Unknown error'}`);
          throw templateError;
        }
      }

      toast.success('Burst saved as draft');
      navigate('/signed-in');
    } catch (error) {
      console.error('Error saving burst:', error);
      toast.error(error.message || 'Failed to save burst');
    }
  };

  const handleCancel = () => {
    navigate('/signed-in');
  };

  const isSaving = creatingBurst;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Create New Burst</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Burst Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label htmlFor="burstName" className="text-sm font-medium">
                  Burst Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="burstName"
                  value={burstName}
                  onChange={(e) => setBurstName(e.target.value)}
                  placeholder="Enter burst name"
                  disabled={isSaving}
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Email Templates</h2>
              <Button
                onClick={addEmailTemplate}
                disabled={isSaving}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Email Template
              </Button>
            </div>

            {emailTemplates.map((template, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Email {index + 1}</CardTitle>
                    {emailTemplates.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEmailTemplate(index)}
                        disabled={isSaving}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor={`subject-${index}`} className="text-sm font-medium">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id={`subject-${index}`}
                      value={template.subject}
                      onChange={(e) => updateEmailTemplate(index, 'subject', e.target.value)}
                      placeholder="Enter email subject"
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`bcc-${index}`} className="text-sm font-medium">
                      BCC (optional)
                    </label>
                    <Input
                      id={`bcc-${index}`}
                      value={template.bcc}
                      onChange={(e) => updateEmailTemplate(index, 'bcc', e.target.value)}
                      placeholder="Enter BCC email address"
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`body-${index}`} className="text-sm font-medium">
                      Body
                    </label>
                    <Textarea
                      id={`body-${index}`}
                      value={template.body}
                      onChange={(e) => updateEmailTemplate(index, 'body', e.target.value)}
                      placeholder="Enter email body (Markdown supported)"
                      rows={6}
                      disabled={isSaving}
                    />
                    <p className="text-xs text-gray-500">
                      You can use variables like {`{{first_name}}`} in your email body
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`delay-${index}`} className="text-sm font-medium">
                      Delay Offset (days)
                    </label>
                    <Input
                      id={`delay-${index}`}
                      type="number"
                      min="0"
                      value={template.delayOffset}
                      onChange={(e) => updateEmailTemplate(index, 'delayOffset', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      disabled={isSaving}
                    />
                    <p className="text-xs text-gray-500">
                      {index === 0 
                        ? 'Days after enrollment (0 for immediate)'
                        : 'Days after previous email'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-4 justify-end pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAsDraft}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save as Draft'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}