import React from 'react';
import useApi from '../hooks/useApi';
import DataTable from '../components/DataTable';
import Button from '../components/ui/Button';
import { PlusCircle } from 'lucide-react';

const ContractsPage = () => {
    const { data: contracts, loading, error } = useApi('/contracts');

    const columns = [
        { Header: 'ID', accessor: 'contract_id' },
        { Header: 'Name', accessor: 'contract_name' },
        { Header: 'Client', accessor: 'client_name' },
        { Header: 'Amount', accessor: 'current_amount', Cell: (amount) => `$${Number(amount).toLocaleString()}` },
        { Header: 'Status', accessor: 'status', Cell: (status) => {
            const statusColors = {
                'In Progress': 'bg-blue-100 text-blue-800',
                'Completed': 'bg-green-100 text-green-800',
                'Halted': 'bg-yellow-100 text-yellow-800',
                'Canceled': 'bg-red-100 text-red-800'
            };
            return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>
        }},
        { Header: 'End Date', accessor: 'end_date' },
    ];
    
    // Add/Edit/Delete functionality can be implemented similarly to TechniciansPage
    const handleAdd = () => alert('Add functionality not implemented yet.');
    const handleEdit = (row) => alert(`Editing ${row.contract_name}`);
    const handleDelete = (id) => alert(`Deleting contract ${id}`);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-primary">Contracts</h1>
                <Button onClick={handleAdd} variant="primary">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Add Contract
                </Button>
            </div>
            
            {loading && <p>Loading contracts...</p>}
            {error && <p className="text-red-500">Failed to load contracts.</p>}
            
            {!loading && !error && <DataTable columns={columns} data={contracts} onEdit={handleEdit} onDelete={handleDelete}/>}
        </div>
    );
};

export default ContractsPage;
