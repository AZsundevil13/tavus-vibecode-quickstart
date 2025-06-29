import React, { useState, useEffect } from 'react';
import { DialogWrapper, AnimatedTextBlockWrapper } from '@/components/DialogWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAtom } from 'jotai';
import { clientsAtom, selectedClientAtom, loadClientsAtom, saveClientsAtom, Client } from '@/store/client';
import { screenAtom } from '@/store/screens';
import { Users, Plus, Edit, Calendar, Target, FileText } from 'lucide-react';

export const ClientManagement: React.FC = () => {
  const [clients, setClients] = useAtom(clientsAtom);
  const [selectedClient, setSelectedClient] = useAtom(selectedClientAtom);
  const [, setScreenState] = useAtom(screenAtom);
  const [, loadClients] = useAtom(loadClientsAtom);
  const [, saveClients] = useAtom(saveClientsAtom);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    diagnosis: '',
    grade: '',
    school: '',
    parentGuardian: '',
    email: '',
    phone: '',
    address: '',
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  const handleAddClient = () => {
    const newClient: Client = {
      id: `client_${Date.now()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: new Date(formData.dateOfBirth),
      diagnosis: formData.diagnosis.split(',').map(d => d.trim()),
      grade: formData.grade,
      school: formData.school,
      parentGuardian: formData.parentGuardian,
      contactInfo: {
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      },
      emergencyContact: {
        name: formData.emergencyName,
        relationship: formData.emergencyRelationship,
        phone: formData.emergencyPhone
      },
      currentGoals: [],
      createdAt: new Date()
    };

    setClients([...clients, newClient]);
    saveClients();
    setShowAddForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      diagnosis: '',
      grade: '',
      school: '',
      parentGuardian: '',
      email: '',
      phone: '',
      address: '',
      emergencyName: '',
      emergencyRelationship: '',
      emergencyPhone: ''
    });
  };

  const selectClientForSession = (client: Client) => {
    setSelectedClient(client);
    setScreenState({ currentScreen: 'instructions' });
  };

  if (showAddForm) {
    return (
      <DialogWrapper>
        <AnimatedTextBlockWrapper>
          <div className="w-full max-w-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Add New Client</h2>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">First Name</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="bg-black/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Last Name</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="bg-black/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Date of Birth</label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    className="bg-black/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Grade</label>
                  <Input
                    value={formData.grade}
                    onChange={(e) => setFormData({...formData, grade: e.target.value})}
                    placeholder="e.g., 3rd Grade, Pre-K"
                    className="bg-black/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">Diagnosis (comma-separated)</label>
                <Input
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                  placeholder="e.g., Autism Spectrum Disorder, ADHD"
                  className="bg-black/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">School</label>
                <Input
                  value={formData.school}
                  onChange={(e) => setFormData({...formData, school: e.target.value})}
                  className="bg-black/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">Parent/Guardian</label>
                <Input
                  value={formData.parentGuardian}
                  onChange={(e) => setFormData({...formData, parentGuardian: e.target.value})}
                  className="bg-black/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="bg-black/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-black/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">Address</label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="bg-black/20"
                  rows={2}
                />
              </div>

              <h3 className="text-lg font-semibold text-white mt-6 mb-3">Emergency Contact</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Name</label>
                  <Input
                    value={formData.emergencyName}
                    onChange={(e) => setFormData({...formData, emergencyName: e.target.value})}
                    className="bg-black/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Relationship</label>
                  <Input
                    value={formData.emergencyRelationship}
                    onChange={(e) => setFormData({...formData, emergencyRelationship: e.target.value})}
                    className="bg-black/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">Emergency Phone</label>
                <Input
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})}
                  className="bg-black/20"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button onClick={handleAddClient} className="flex-1">
                Add Client
              </Button>
              <Button 
                onClick={() => {setShowAddForm(false); resetForm();}} 
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </AnimatedTextBlockWrapper>
      </DialogWrapper>
    );
  }

  return (
    <DialogWrapper>
      <AnimatedTextBlockWrapper>
        <div className="w-full max-w-4xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="size-6" />
              Client Management
            </h2>
            <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
              <Plus className="size-4" />
              Add Client
            </Button>
          </div>

          {clients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="size-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No clients added yet</p>
              <Button onClick={() => setShowAddForm(true)}>
                Add Your First Client
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="bg-black/30 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">
                        {client.firstName} {client.lastName}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Age: {Math.floor((Date.now() - client.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
                        {client.grade && ` • Grade: ${client.grade}`}
                      </p>
                      <p className="text-sm text-gray-400">
                        Diagnosis: {client.diagnosis.join(', ')}
                      </p>
                      {client.school && (
                        <p className="text-sm text-gray-400">School: {client.school}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => selectClientForSession(client)}
                        className="flex items-center gap-1"
                      >
                        <Calendar className="size-4" />
                        Start Session
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingClient(client)}
                      >
                        <Edit className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-4 text-sm">
                    <span className="text-green-400">
                      Goals: {client.currentGoals?.length || 0}
                    </span>
                    <span className="text-blue-400">
                      Last Session: {client.lastSession ? client.lastSession.toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AnimatedTextBlockWrapper>
    </DialogWrapper>
  );
};