import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { BloodGroup, Priority } from '../../types';

export function CreateRequestPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bloodGroup: 'O+' as BloodGroup,
    unitsRequired: 2,
    hospitalName: '',
    location: '',
    requiredDate: '',
    priority: 'high' as Priority,
    notes: '',
  });

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const priorities: Priority[] = ['critical', 'high', 'medium', 'low'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = () => {
    navigate('/admin/requests');
  };

  const handleDraft = () => {
    navigate('/admin/requests');
  };

  return (
    <div className="space-y-6">
      <Link to="/admin/requests" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
        <ArrowLeft className="h-4 w-4" />
        Back to Requests
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Blood Request</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Create a new blood request for a patient</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Request ID</label>
              <input type="text" value="REQ-AUTO" disabled className="input-field mt-2 bg-gray-100 dark:bg-gray-800" />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Auto-generated</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Blood Group *</label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="input-field mt-2">
                {bloodGroups.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Units Required *</label>
              <input type="number" name="unitsRequired" min="1" max="20" value={formData.unitsRequired} onChange={handleChange} className="input-field mt-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority *</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="input-field mt-2">
                {priorities.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hospital Name *</label>
              <input type="text" name="hospitalName" placeholder="e.g. Agha Khan Hospital" value={formData.hospitalName} onChange={handleChange} className="input-field mt-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location *</label>
              <input type="text" name="location" placeholder="e.g. Karachi" value={formData.location} onChange={handleChange} className="input-field mt-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Required Date *</label>
            <input type="date" name="requiredDate" value={formData.requiredDate} onChange={handleChange} className="input-field mt-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
            <textarea name="notes" rows={4} placeholder="Add any additional notes about this request..." value={formData.notes} onChange={handleChange} className="input-field mt-2" />
          </div>

          <div className="flex gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
            <button onClick={handleCreate} className="btn-primary">
              Create Request
            </button>
            <button onClick={handleDraft} className="btn-secondary">
              Save Draft
            </button>
            <Link to="/admin/requests" className="btn-ghost">
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
