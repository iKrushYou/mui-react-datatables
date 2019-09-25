import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import data from './data.json';
import {
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from '@material-ui/core';

import './styles.css';
import MUIDatatable from '../../src';
import { ResponsivePie } from '@nivo/pie';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';

function App() {
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [options, setOptions] = useState({
    fillEmptyRows: false,
    rowsPerPage: 10,
    csvExport: true,
    csvFilename: 'my_table_export',
    initialSorts: [{ columnId: 'age', direction: 'asc' }, { columnId: 'name', direction: 'asc' }],
    initialFilters: [
      // {columnId: 'name', value: "se", type: "exact"},
    ],
    onRowClick: (row, event) => {
      if (event.ctrlKey || event.metaKey) {
        // alert('ctrl clicked row ' + JSON.stringify(row));
      } else {
        // alert('clicked row ' + JSON.stringify(row));
      }
      setOptions(prev => ({ ...prev, selectedRowId: row.id }));
    },
    maxRowHeight: 50,
    footerRow: true,
    selectedRowId: selectedRowId,
  });

  const [columns, setColumns] = useState([
    {
      title: 'Active',
      accessor: 'isActive',
      Cell: (value, row) => <Checkbox checked={value} />,
      shrink: true,
      padding: 0,
    },
    {
      id: 'name',
      title: 'Name',
      accessor: 'name',
      Cell: (value, row) => `${value.first} ${value.last}`,
      sortValue: value => `${value.first} ${value.last}`,
      filterType: 'text',
    },
    {
      title: 'Company',
      accessor: 'company',
      filterType: 'text',
    },
    {
      id: 'age',
      title: 'Age',
      accessor: 'age',
      align: 'right',
      Footer: (data, column) =>
        `Avg: ${(data.reduce((acc, cur) => acc + cur[column.accessor], 0) / data.length).toFixed(2)}`,
      filterType: 'numeric',
    },
    {
      title: 'Gender',
      accessor: 'gender',
      Cell: value => (
        <div
          style={{
            height: 16,
            width: 16,
            borderRadius: 8,
            backgroundColor: value === 'male' ? '#3da6ff' : '#ff77b0',
          }}
        />
      ),
      shrink: true,
    },
    {
      title: 'Eye Color',
      accessor: 'eyeColor',
      Cell: value => (
        <div style={{ display: 'flex' }}>
          <div style={{ width: 32, height: 16, borderRadius: 8, backgroundColor: value }} />
          <div style={{ width: 4 }} />
          <div style={{ width: 32, height: 16, borderRadius: 8, backgroundColor: value }} />
        </div>
      ),
      shrink: true,
    },
    {
      title: 'Phone',
      accessor: 'phone',
      align: 'right',
      sortValue: value => parseInt(value.replace(/[^0-9]+/g, '')),
      filterType: 'text',
    },
    {
      title: 'Balance',
      accessor: 'balance',
      align: 'right',
      sortValue: value => parseFloat(value.replace(/[^0-9.-]+/g, '')),
      Footer: (data, column) =>
        `$${(
          data.reduce((acc, cur) => acc + parseFloat(cur[column.accessor].replace(/[^0-9.-]+/g, '')), 0) / data.length
        ).toFixed(2)}`,
      filterType: 'numeric',
    },
    {
      title: 'Address',
      accessor: 'address',
      filterType: 'text',
    },
    {
      title: 'Picture',
      accessor: 'picture',
      Cell: value => <img src={value} style={{ width: 32, height: 32 }} />,
      shrink: true,
      csvValue: value => value,
      filterValue: value => value,
      filterMenuItem: (value, row) => <img src={value} style={{ width: 32, height: 32 }} />,
    },
    {
      title: 'About',
      accessor: 'about',
      filterType: 'text',
      noWrap: false,
      minWidth: 500,
    },
  ]);

  const [filters, setFilters] = useState([]);
  const [sorts, setSorts] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const genderCounts = filteredData.reduce(
    (map, row) => {
      map[row.gender]++;
      return map;
    },
    { male: 0, female: 0 },
  );
  const genderPieData = [
    {
      id: 'male',
      value: genderCounts.male,
    },
    {
      id: 'female',
      value: genderCounts.female,
    },
  ];
  const genderColors = ['#3da6ff', '#ff77b0'];

  return (
    <div className="App">
      <>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant={'h4'}>&lt;MUIDatatables /&gt;</Typography>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant={'h5'}>options</Typography>
                <Grid container spacing={2}>
                  {Object.keys(options).map(optionKey => {
                    const optionValue = options[optionKey];

                    if (typeof optionValue === 'boolean') {
                      return (
                        <Grid key={optionKey} item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={optionValue}
                                onChange={event =>
                                  setOptions(prev => ({
                                    ...prev,
                                    [event.target.value]: event.target.checked,
                                  }))
                                }
                                value={optionKey}
                              />
                            }
                            label={optionKey}
                          />
                        </Grid>
                      );
                    } else if (typeof optionValue === 'number') {
                      return (
                        <Grid key={optionKey} item xs={12} sm={6} md={4}>
                          <TextField
                            fullWidth
                            label={optionKey}
                            value={optionValue}
                            onChange={event =>
                              setOptions(prev => ({
                                ...prev,
                                [optionKey]: parseInt(event.target.value),
                              }))
                            }
                            type="number"
                          />
                        </Grid>
                      );
                    } else if (typeof optionValue === 'string') {
                      return (
                        <Grid key={optionKey} item xs={12} sm={6} md={4}>
                          <TextField
                            fullWidth
                            label={optionKey}
                            value={optionValue}
                            onChange={event =>
                              setOptions(prev => ({
                                ...prev,
                                [optionKey]: event.target.value,
                              }))
                            }
                          />
                        </Grid>
                      );
                    } else {
                      return <React.Fragment key={optionKey} />;
                    }
                  })}
                </Grid>
                <pre style={{ marginTop: 32 }}>{JSON.stringify(options, null, 2)}</pre>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant={'h4'}>Gender</Typography>
                <CountPieChart
                  data={filteredData}
                  accessor={'gender'}
                  colors={{
                    male: '#3da6ff',
                    female: '#ff77b0',
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant={'h4'}>Eye Color</Typography>
                <CountPieChart
                  data={filteredData}
                  accessor={'eyeColor'}
                  colors={{
                    green: '#31aa43',
                    blue: '#268baa',
                    brown: '#683028',
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <MUIDatatable
              title={'My Table'}
              options={options}
              columns={columns}
              data={data}
              filtersRef={filters => {
                console.log('setting filters', filters);
                setFilters(filters);
              }}
              sortsRef={sorts => {
                console.log('setting sorts', sorts);
                setSorts(sorts);
              }}
              filteredDataRef={data => {
                console.log('setting data', data);
                setFilteredData(data);
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography>Filtered Data</Typography>
                <pre>Number of rows: {filteredData.length}</pre>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography>filters</Typography>
                <pre>{JSON.stringify(filters, null, 2)}</pre>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography>sorts</Typography>
                <pre>{JSON.stringify(sorts, null, 2)}</pre>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </>
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);

function CountPieChart({ data, accessor, colors }) {
  const counts = data.reduce((counts, row) => {
    if (!counts[row[accessor]]) counts[row[accessor]] = 0;
    counts[row[accessor]]++;
    return counts;
  }, {});

  console.log('counts', counts);

  const chartData = Object.keys(counts).map(key => ({ name: key, value: counts[key], fill: colors[key] }));

  return (
    <PieChart width={250} height={250}>
      <Pie dataKey="value" data={chartData}>
        {chartData.map((entry, index) => (
          <Cell key={index} fill={entry.fill} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
}
