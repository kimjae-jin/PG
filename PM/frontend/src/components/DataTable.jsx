import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const DataTable = ({ columns, data, onEdit, onDelete }) => {
    return (
        <div className="bg-surface rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-gray-800">
                        <tr>
                            {columns.map((col) => (
                                <th key={col.accessor} scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                    {col.Header}
                                </th>
                            ))}
                            {(onEdit || onDelete) && (
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-border">
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-700/50 transition-colors">
                                {columns.map((col) => (
                                    <td key={col.accessor} className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                                        {col.Cell ? col.Cell(row[col.accessor]) : row[col.accessor]}
                                    </td>
                                ))}
                                {(onEdit || onDelete) && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            {onEdit && (
                                                <button onClick={() => onEdit(row)} className="text-primary hover:text-blue-400 p-1">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button onClick={() => onDelete(row[columns[0].accessor])} className="text-red-500 hover:text-red-400 p-1">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {data.length === 0 && <p className="text-center py-8 text-text-secondary">No data available.</p>}
            </div>
        </div>
    );
};

export default DataTable;
