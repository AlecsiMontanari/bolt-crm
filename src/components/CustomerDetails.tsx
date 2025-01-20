import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Customer } from '../types/customer';
import { format } from 'date-fns';
import { ArrowLeft, Mail, Phone, Calendar, FileText, Plus, Pencil } from 'lucide-react';
import VisitList from './VisitList';

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'customers', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCustomer({
            ...data,
            id: docSnap.id,
            lastVisit: data.lastVisit?.toDate() || null,
          } as Customer);
        }
      } catch (error) {
        console.error('Error fetching customer:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Customer not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/customers')}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Customers
          </button>
          <button
            onClick={() => navigate(`/customers/${id}/edit`)}
            className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit Customer
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{customer.name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center text-gray-600">
                <Mail className="w-5 h-5 mr-2" />
                <a href={`mailto:${customer.email}`} className="hover:text-blue-500">
                  {customer.email}
                </a>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-5 h-5 mr-2" />
                <a href={`tel:${customer.phone}`} className="hover:text-blue-500">
                  {customer.phone}
                </a>
              </div>
            </div>

            {customer.lastVisit && (
              <div className="flex items-center text-gray-600 mb-6">
                <Calendar className="w-5 h-5 mr-2" />
                Last Visit: {format(new Date(customer.lastVisit), 'PPP')}
              </div>
            )}

            {customer.summary && (
              <div className="flex items-start text-gray-600 mb-6">
                <FileText className="w-5 h-5 mr-2 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <p className="whitespace-pre-wrap">{customer.summary}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Visit History</h2>
            <button
              onClick={() => navigate(`/customers/${id}/visits`)}
              className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Visit
            </button>
          </div>
          <VisitList customerId={id} />
        </div>
      </div>
    </div>
  );
}