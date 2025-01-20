import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Customer, Visit } from '../types/customer';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';

export default function VisitList() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [newVisit, setNewVisit] = useState({ date: '', summary: '' });

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id) return;
      const docRef = doc(db, 'customers', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCustomer({
          ...data,
          id: docSnap.id,
          visits: (data.visits || []).map((visit: any) => ({
            ...visit,
            date: visit.date?.toDate() || new Date(visit.date)
          })),
        } as Customer);
      }
    };
    fetchCustomer();
  }, [id]);

  const handleAddVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !id) return;

    const visit: Visit = {
      id: Date.now().toString(),
      date: new Date(newVisit.date),
      summary: newVisit.summary,
    };

    const updatedVisits = [...customer.visits, visit];
    await updateDoc(doc(db, 'customers', id), {
      visits: updatedVisits,
      lastVisit: visit.date,
    });

    setCustomer({
      ...customer,
      visits: updatedVisits,
      lastVisit: visit.date,
    });
    setNewVisit({ date: '', summary: '' });
  };

  const handleDeleteVisit = async (visitId: string) => {
    if (!customer || !id) return;
    const updatedVisits = customer.visits.filter(v => v.id !== visitId);
    const lastVisit = updatedVisits.length > 0 
      ? updatedVisits[updatedVisits.length - 1].date 
      : null;

    await updateDoc(doc(db, 'customers', id), {
      visits: updatedVisits,
      lastVisit,
    });

    setCustomer({
      ...customer,
      visits: updatedVisits,
      lastVisit,
    });
  };

  if (!customer) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Visit History for {customer.name}
      </h1>

      <form onSubmit={handleAddVisit} className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Add New Visit</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Date
            </label>
            <input
              type="date"
              value={newVisit.date}
              onChange={(e) => setNewVisit({ ...newVisit, date: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Summary
            </label>
            <input
              type="text"
              value={newVisit.summary}
              onChange={(e) => setNewVisit({ ...newVisit, summary: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center gap-2"
          >
            <Plus size={20} /> Add Visit
          </button>
        </div>
      </form>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customer.visits
              .sort((a, b) => b.date.getTime() - a.date.getTime())
              .map((visit) => (
                <tr key={visit.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(visit.date), 'PP')}
                  </td>
                  <td className="px-6 py-4">{visit.summary}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteVisit(visit.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}