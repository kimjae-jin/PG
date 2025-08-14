import React from 'react';
import useApi from '../hooks/useApi';
import DataTable from '../components/DataTable';
import Button from '../components/ui/Button';
import { PlusCircle } from 'lucide-react';

const BidsPage = () => {
    const { data: bids, loading, error } = useApi('/bids');

    const columns = [
        { Header: 'ID', accessor: 'bid_id' },
        { Header: 'Name', accessor: 'bid_name' },
        { Header: 'Client', accessor: 'client' },
        { Header: 'Type', accessor: 'bid_type' },
        { Header: 'Amount', accessor: 'bid_amount', Cell: (amount) => amount ? `$${Number(amount).toLocaleString()}` : 'N/A' },
        { Header: 'Status', accessor: 'status', Cell: (status) => {
            const statusColors = {
                Planning: 'bg-yellow-100 text-yellow-800',
                Submitted: 'bg-blue-100 text-blue-800',
                Won: 'bg-green-100 text-green-800',
                Lost: 'bg-red-100 text-red-800',
                Canceled: 'bg-gray-100 text-gray-800',
                Evaluating: 'bg-purple-100 text-purple-800'
            };
            return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>
        }},
        { Header: 'Closing Date', accessor: 'closing_date' },
    ];
    
    // Add/Edit/Delete functionality can be implemented similarly to TechniciansPage
    const handleAdd = () => alert('Add functionality not implemented yet.');
    const handleEdit = (row) => alert(`Editing ${row.bid_name}`);
    const handleDelete = (id) => alert(`Deleting bid ${id}`);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-primary">Bids</h1>
                <Button onClick={handleAdd} variant="primary">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Add Bid
                </Button>
            </div>
            
            {loading && <p>Loading bids...</p>}
            {error && <p className="text-red-500">Failed to load bids.</p>}
            
            {!loading && !error && <DataTable columns={columns} data={bids} onEdit={handleEdit} onDelete={handleDelete}/>}
        </div>
    );
};

export default BidsPage;
