import React, { useState, useEffect } from 'react';

const DataGrid = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortColumn, setSortColumn] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:5000/api/data');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...data];

    if (selectedFilter) {
      if (selectedFilter === 'All Locations') {
        const aggregated = {};
        data.forEach((item) => {
          if (!aggregated[item.Location]) {
            aggregated[item.Location] = {
              ...item,
              Branch: 'Total',
              'Potential Revenue': 0,
              'Annualized Competitor': 0,
              'Processing Volume': 0,
              Merchant: 0,
              'Annualized Market Share': 0,
              "Commercial DDA's": 0,
            };
          }
          aggregated[item.Location]['Potential Revenue'] +=
            item['Potential Revenue'];
          aggregated[item.Location]['Annualized Competitor'] +=
            item['Annualized Competitor'];
          aggregated[item.Location]['Processing Volume'] +=
            item['Processing Volume'];
          aggregated[item.Location]['Merchant'] += item['Merchant'];
          aggregated[item.Location]['Annualized Market Share'] +=
            item['Annualized Market Share'];
          aggregated[item.Location]["Commercial DDA's"] +=
            item["Commercial DDA's"];
        });
        filtered = Object.values(aggregated);
      } else if (data.some((item) => item.Location === selectedFilter)) {
        filtered = data.filter((item) => item.Location === selectedFilter);
      } else {
        filtered = data.filter((item) => item.Branch === selectedFilter);
      }
    }

    if (sortColumn) {
      filtered.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return 0;
      });
    }

    setFilteredData(filtered);
  }, [data, selectedFilter, sortOrder, sortColumn]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const calculateTotal = (column) => {
    let total = 0;
    filteredData.forEach((row) => {
      if (typeof row[column] === 'number') {
        total += row[column];
      }
    });
    return total;
  };

  const handleFilterChange = (event) => {
    setSelectedFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleSort = (column) => {
    setSortOrder(sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc');
    setSortColumn(column);
  };

  const handleDeleteRow = (index) => {
    const updatedData = [...data];
    updatedData.splice(index, 1);
    setData(updatedData);
  };

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    } else {
      return `$${value}`;
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = parseInt(event.target.value, 10);
    if (!isNaN(newPageSize) && newPageSize > 0) {
      setPageSize(newPageSize);
      setCurrentPage(1);
    }
  };

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const allFilters = [
    'All Locations',
    ...new Set(data.map((row) => row.Location)),
    ...new Set(data.map((row) => row.Branch)),
  ];

  const handleLocationClick = (location) => {
    setSelectedFilter(location);
    setCurrentPage(1);
  };

  return (
    <div>
      <select value={selectedFilter} onChange={handleFilterChange}>
        <option value="">Select a Filter</option>
        {allFilters.map((filter) => (
          <option key={filter} value={filter}>
            {filter}
          </option>
        ))}
      </select>

      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('Location')}>Location</th>
            <th onClick={() => handleSort('Branch')}>Branch</th>
            <th onClick={() => handleSort('Potential Revenue')}>
              Potential Revenue
            </th>
            <th onClick={() => handleSort('Annualized Competitor')}>
              Annualized Competitor
            </th>
            <th onClick={() => handleSort('Processing Volume')}>
              Processing Volume
            </th>
            <th onClick={() => handleSort('Merchant')}>Merchant</th>
            <th onClick={() => handleSort('Annualized Market Share')}>
              Annualized Market Share
            </th>
            <th onClick={() => handleSort("Commercial DDA's")}>
              Commercial DDA's
            </th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>**Total**</td>
            <td></td>
            <td>{formatCurrency(calculateTotal('Potential Revenue'))}</td>
            <td>{formatCurrency(calculateTotal('Annualized Competitor'))}</td>
            <td>{calculateTotal('Processing Volume')}</td>
            <td>{calculateTotal('Merchant')}</td>
            <td>{calculateTotal('Annualized Market Share').toFixed(2)}</td>
            <td>{calculateTotal("Commercial DDA's")}</td>
            <td></td>
          </tr>
          {paginatedData.map((row, index) => (
            <tr key={index}>
              <td
                onClick={() => handleLocationClick(row.Location)}
                style={{ cursor: 'pointer' }}
              >
                {row.Location}
              </td>
              <td>{row.Branch}</td>
              <td>{formatCurrency(row['Potential Revenue'])}</td>
              <td>{formatCurrency(row['Annualized Competitor'])}</td>
              <td>{row['Processing Volume']}</td>
              <td>{row['Merchant']}</td>
              <td>{row['Annualized Market Share'].toFixed(2)}</td>
              <td>{row["Commercial DDA's"]}</td>
              <td>
                <button onClick={() => handleDeleteRow(index)}>X</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
        <input
          type="number"
          value={pageSize}
          onChange={handlePageSizeChange}
          min="1"
          style={{ width: '50px', margin: '0 5px' }}
        />
      </div>
    </div>
  );
};

export default DataGrid;
