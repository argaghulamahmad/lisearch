import React from 'react';
import CopyToClipboard from './CopyToClipboard';

const renderWithCopy = (text) => (
    <div>
        <a href={`https://www.google.com/search?q=${text}`} target="_blank" rel="noreferrer">{text}</a>
        <CopyToClipboard value={text} />
    </div>
);

export const connectionColumns = [
    {
        title: 'Full Name',
        dataIndex: 'fullName',
        render: renderWithCopy,
        sorter: (a, b) => a.fullName.localeCompare(b.fullName),
        width: 300,
    },
    {
        title: 'Position',
        dataIndex: 'position',
        render: renderWithCopy,
        width: 300,
    }
];

export const companyColumns = [
    {
        title: 'Company',
        dataIndex: 'company',
        render: renderWithCopy,
        sorter: (a, b) => a.company.localeCompare(b.company),
        width: 300,
        fixed: 'left',
    },
    {
        title: 'Number of Employee',
        dataIndex: 'connections',
        render: connections => <div>{connections.length}</div>,
        sorter: (a, b) => a.connections.length - b.connections.length,
        width: 200,
    },
    {
        title: 'Last Updated',
        dataIndex: 'updatedAt',
        render: timestamp => new Date(timestamp).toLocaleDateString(),
        width: 150,
    }
];