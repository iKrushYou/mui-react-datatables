import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Collapse, makeStyles, Select, TableFooter, Tooltip, Typography } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Chip from '@material-ui/core/Chip';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';
import FilterListIcon from '@material-ui/icons/FilterList';
import ViewColumnIcon from '@material-ui/icons/ViewColumn';
import Menu from '@material-ui/core/Menu';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import TablePagination from '@material-ui/core/TablePagination';
import { CSVLink } from 'react-csv';
import TableHeadButton from './components/TableHeadButton';
import MUITableRow from './components/MUITableRow';
import Skeleton from 'react-loading-skeleton';
import MUITableFooterCell from './components/MUITableFooterCell';
import InputAdornment from '@material-ui/core/InputAdornment';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    overflow: 'hide',
  },
  tableContainer: {
    overflowX: 'scroll',
  },
  table: {
    // minWidth: 650,
  },
  tableRowClick: {
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: '#eaeaea',
    },
    '&:active': {
      backgroundColor: '#dadada',
    },
  },
  tableCellNoWrap: {
    whiteSpace: 'nowrap',
  },
}));

const defaultOptions = {
  fillEmptyRows: false,
  rowsPerPage: 10,
  csvExport: true,
  initialSorts: [],
  initialFilters: [],
  onRowClick: null,
  maxRowHeight: null,
  footerRow: false,
  selectedRowId: null,
  loading: false,
};

const defaultColumnValues = {
  visible: true,
  sortable: true,
  hideable: true,
  filterable: true,
  filterMatch: 'exact',
  noWrap: true,
  minWidth: 0,
  padding: {
    top: 14,
    right: 40,
    bottom: 14,
    left: 16,
  },
};

MUIDatatable.defaultProps = {
  data: [],
  columns: [],
  options: {},
  title: '',
  buttons: [],
  filtersRef: () => {},
  sortsRef: () => {},
  filteredDataRef: () => {},
};

const mapObject = (source, destination) => {
  if (source == null) {
    return destination;
  }

  if (destination == null) {
    return source;
  }

  return { ...destination, ...source };
};

export default function MUIDatatable({
  data: dataInput,
  options: optionsInput,
  columns: columnsInput,
  title,
  buttons,
  filtersRef,
  sortsRef,
  filteredDataRef,
}) {
  const classes = useStyles();

  const options = useMemo(() => mapObject(optionsInput, defaultOptions), [optionsInput]);
  //console.log('options', options);

  const [rowsPerPage, setRowsPerPage] = useState(defaultOptions.rowsPerPage);

  useEffect(() => {
    setRowsPerPage(options.rowsPerPage);
  }, [options.rowsPerPage]);

  const columns = useMemo(() => {
    columnsInput.forEach(column => {
      if (typeof column.padding === 'number') {
        column.padding = {
          top: column.padding,
          right: column.padding,
          bottom: column.padding,
          left: column.padding,
        };
      }
    });
    return [
      ...columnsInput.map((column, index) => ({
        id: index,
        ...mapObject(column, defaultColumnValues),
      })),
    ];
  }, [columnsInput]);

  const getColumn = columnId => columns.find(x => x.id === columnId);

  const [data, setData] = useState([]);
  useEffect(() => setData([...dataInput]), [dataInput]);

  /*  Sorting  */

  const [sorts, setSorts] = useState([]);

  useEffect(() => {
    setSorts([...options.initialSorts]);
  }, [options.initialSorts]);

  const addSort = (columnId, direction, clear = false) => {
    setSorts(prev => {
      if (!direction) return [...prev.filter(x => x.columnId !== columnId)];

      if (clear) prev = prev.filter(x => x.columnId === columnId);

      const index = prev.findIndex(x => x.columnId === columnId);

      if (index > -1) {
        prev[index].direction = direction;
      } else {
        prev.push({ columnId, direction });
      }

      return [...prev];
    });
  };

  const sortColumn = (event, columnId) => {
    const sortColumn = sorts.find(x => x.columnId === columnId);

    let direction = 'asc';
    if (sortColumn) {
      if (sortColumn.direction === 'asc') {
        direction = 'desc';
      } else if (event.shiftKey) {
        direction = null;
      }
    }
    addSort(columnId, direction, !event.shiftKey);
  };

  const colValue = (row, columnId) => {
    const c = getColumn(columnId);
    return (typeof c.Cell === 'function' && c.Cell(row[c.accessor], row)) || row[c.accessor];
  };

  const sortValue = (row, columnId) => {
    const c = getColumn(columnId);
    return (
      (typeof c.sortValue === 'function' && c.sortValue(row[c.accessor], row)) ||
      row[c.accessor] ||
      colValue(row, columnId)
    );
  };

  const compareItems = (a, b, sortColumn) => {
    const aValue = sortValue(a, sortColumn.columnId);
    const bValue = sortValue(b, sortColumn.columnId);

    if (typeof getColumn(sortColumn.columnId).sort === 'function') {
      return getColumn(sortColumn.columnId).sort(a, b, sortColumn.direction);
    } else if (typeof aValue === 'number') {
      return sortColumn.direction === 'desc' ? bValue - aValue : aValue - bValue;
    } else {
      return sortColumn.direction === 'desc'
        ? String(bValue).localeCompare(aValue)
        : String(aValue).localeCompare(bValue);
    }
  };

  sorts
    .slice()
    .reverse()
    .forEach(sortColumn => {
      data.sort((a, b) => compareItems(a, b, sortColumn));
    });

  /*  Column Visibility  */

  const [toggledColumns, setToggledColumns] = useState({});

  useEffect(() => {
    setToggledColumns(prev => ({
      ...columns.reduce((toggled, column) => {
        toggled[column.id] = column.visible;
        return toggled;
      }, {}),
      ...prev,
    }));
  }, [columnsInput]);

  const handleToggleColumnVisible = columnId => {
    setToggledColumns(prev => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const visibleColumns = useMemo(() => columns.filter(column => toggledColumns[column.id]), [columns, toggledColumns]);

  /*  Search Filtering  */

  const [filters, setFilters] = useState([]);

  useEffect(() => {
    setFilters([...options.initialFilters]);
  }, [options.initialFilters]);

  const addFilter = (value, columnId = -1, type = 'default') => {
    setFilters(prev => {
      prev = prev.filter(x => x.columnId !== columnId);

      if (!!value && value !== '') prev.push({ value, columnId, type });

      return [...prev];
    });
    setCurrentPage(0);
  };

  const removeFilter = filterId => {
    setFilters(prev => {
      prev.splice(filterId, 1);
      return [...prev];
    });
  };

  const filterValue = (row, columnId) => {
    const c = getColumn(columnId);
    return (
      (typeof c.filterValue === 'function' && c.filterValue(row[c.accessor], row)) ||
      row[c.accessor] ||
      colValue(row, columnId)
    );
  };

  const filterMenuItem = (row, columnId) => {
    const c = getColumn(columnId);
    return (
      (typeof c.filterMenuItem === 'function' && c.filterMenuItem(row[c.accessor], row)) || colValue(row, columnId)
    );
  };

  const filterFn = (data, filter) => {
    if (filter.value == null || filter.value === '') return data;

    if (filter.type === 'exact')
      return data.filter(x => String(filterValue(x, filter.columnId)) === String(filter.value));
    if (filter.type === 'lt') return data.filter(x => filterValue(x, filter.columnId) < filter.value);
    if (filter.type === 'lte') return data.filter(x => filterValue(x, filter.columnId) <= filter.value);
    if (filter.type === 'gt') return data.filter(x => filterValue(x, filter.columnId) > filter.value);
    if (filter.type === 'gte') return data.filter(x => filterValue(x, filter.columnId) >= filter.value);
    return data.filter(x =>
      String(filterValue(x, filter.columnId))
        .toLowerCase()
        .includes(String(filter.value).toLowerCase()),
    );
  };

  const filteredData = useMemo(() => {
    let tempData = [...data];

    filters.forEach(filter => {
      if (filter.columnId === -1) {
        tempData = tempData.filter(row =>
          visibleColumns.reduce(
            (acc, column) =>
              acc ||
              String(colValue(row, column.id))
                .toLowerCase()
                .includes(String(filter.value).toLowerCase()),
            false,
          ),
        );
      } else {
        tempData = filterFn(data, filter);
      }
    });

    //console.log('generate filteredData rows: ' + tempData.length);

    return tempData;
  }, [data, filters, columnsInput, toggledColumns, sorts]);

  const [showSearch, setShowSearch] = useState(false);
  const searchTerm = (filters.find(x => x.columnId === -1) || {}).value || '';

  const searchFieldRef = useRef();

  const handleToggleSearch = () => {
    setShowSearch(prev => {
      if (!prev) searchFieldRef.current.focus();
      return !prev;
    });
  };

  /*  Refs  */

  useEffect(() => filtersRef(filters), [filters]);
  useEffect(() => sortsRef(sorts), [sorts]);
  useEffect(() => filteredDataRef(filteredData), [filteredData]);

  /*  Pagination  */

  const [currentPage, setCurrentPage] = useState(0);

  const pageData = filteredData.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  const emptyRows = new Array(Math.max(0, rowsPerPage - pageData.length)).fill(0);

  /*  CSV Download  */

  const csvValue = (row, columnId) => {
    const c = getColumn(columnId);
    return (
      (typeof c.csvValue === 'function' && c.csvValue(row[c.accessor], row)) ||
      row[c.accessor] ||
      colValue(row, columnId)
    );
  };

  const generateCsvData = () => {
    if (!filteredData) return [[]];
    const headers = visibleColumns.map(column => column.csvHeader || column.title);
    const csvData = [headers, ...filteredData.map(row => visibleColumns.map(column => csvValue(row, column.id)))];
    return csvData;
  };

  /* Row Click */

  const handleOnRowClick = (event, row) => {
    if (typeof options.onRowClick === 'function') {
      options.onRowClick(row, event);
    }
  };

  /*  Rendering  */

  //console.log('render');

  return (
    <Paper className={classes.root}>
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex' }}>
          <TitleSearchBar
            title={title}
            showSearch={showSearch}
            setShowSearch={setShowSearch}
            searchFieldRef={searchFieldRef}
            searchTerm={searchTerm}
            addFilter={addFilter}
          />
          <div style={{ flex: 1 }} />
          <div style={{ flex: -1, display: 'flex', flexDirection: 'row-reverse' }}>
            {buttons}
            <FilterColumnButton
              filters={filters}
              columns={visibleColumns}
              data={filteredData}
              filterValue={filterValue}
              filterMenuItem={filterMenuItem}
              onSetFilter={addFilter}
            />
            <ToggleColumnButton
              columns={columns}
              toggledColumns={toggledColumns}
              onToggleColumnVisible={handleToggleColumnVisible}
            />
            {options.csvExport && (
              <Tooltip title={'Save to CSV'} placement={'top'}>
                <CSVLink data={generateCsvData()} filename={options.csvFilename || title || 'table'}>
                  <IconButton>
                    <SaveIcon />
                  </IconButton>
                </CSVLink>
              </Tooltip>
            )}
            <Tooltip title={'Search'} placement={'top'}>
              <IconButton onClick={handleToggleSearch}>
                <SearchIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <FiltersSummary filters={filters} onRemoveFilter={removeFilter} columns={columns} />
      </div>
      <div className={classes.tableContainer}>
        <Table className={classes.table}>
          {/*{options.loading ? (*/}
          {/*  <TableRow>*/}
          {/*    <TableCell style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>*/}
          {/*      {typeof options.LoadingCell === 'function' ? (*/}
          {/*        options.LoadingCell()*/}
          {/*      ) : (*/}
          {/*        <div style={{ margin: 32 }}>*/}
          {/*          <CircularProgress indeterminate />*/}
          {/*        </div>*/}
          {/*      )}*/}
          {/*    </TableCell>*/}
          {/*  </TableRow>*/}
          {!options.loading && filteredData.length === 0 ? (
            <TableRow>
              <TableCell style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {typeof options.NoRowsCell === 'function' ? (
                  options.NoRowsCell()
                ) : (
                  <div style={{ margin: 32 }}>No data available</div>
                )}
              </TableCell>
            </TableRow>
          ) : (
            <>
              <TableHead>
                <TableRow>
                  {!!visibleColumns &&
                    visibleColumns.map(column => (
                      <TableHeadButton column={column} onSortColumn={sortColumn} sorts={sorts} />
                    ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {options.loading
                  ? new Array(rowsPerPage).fill(0).map((x, i) => (
                      <TableRow key={i}>
                        {visibleColumns.map(column => (
                          <TableCell
                            key={column.id}
                            style={{ padding: 14, borderWidth: i === rowsPerPage - pageData.length - 1 ? null : 0 }}>
                            <Skeleton height={20} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : !!pageData &&
                    pageData.map((row, itemIndex) => (
                      <MUITableRow
                        key={itemIndex}
                        row={row}
                        options={options}
                        colValue={colValue}
                        onRowClick={handleOnRowClick}
                        visibleColumns={visibleColumns}
                      />
                    ))}
                {!options.loading &&
                  options.fillEmptyRows &&
                  emptyRows.map((x, i) => (
                    <TableRow key={i}>
                      <TableCell
                        colSpan={'100%'}
                        style={{ borderWidth: i === rowsPerPage - pageData.length - 1 ? null : 0 }}>
                        &nbsp;
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
              {options.footerRow && (
                <TableFooter>
                  <TableRow>
                    {!!visibleColumns &&
                      visibleColumns.map((column, index) => (
                        <MUITableFooterCell
                          key={`${column.title}-${column.id}`}
                          column={column}
                          options={options}
                          filteredData={filteredData}
                          lastCol={index === visibleColumns.length - 1}
                        />
                      ))}
                  </TableRow>
                </TableFooter>
              )}
            </>
          )}
        </Table>
      </div>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={currentPage}
        backIconButtonProps={{
          'aria-label': 'previous page',
        }}
        nextIconButtonProps={{
          'aria-label': 'next page',
        }}
        onChangePage={(event, newPage) => setCurrentPage(newPage)}
        onChangeRowsPerPage={event => setRowsPerPage(event.target.value)}
      />
    </Paper>
  );
}

function TitleSearchBar({ title, showSearch, setShowSearch, searchFieldRef, searchTerm, addFilter }) {
  return (
    <>
      <div
        style={{
          flex: showSearch ? 2 : 0,
          display: 'flex',
          overflow: 'hidden',
          transition: 'flex 0.2s ease-out',
        }}>
        <TextField
          inputRef={searchFieldRef}
          style={{ flex: 1 }}
          label={'Search'}
          value={searchTerm}
          onChange={event => addFilter(event.target.value)}
        />
        <IconButton style={{ flex: -1 }} onClick={() => setShowSearch(false)} color={'secondary'}>
          <CloseIcon />
        </IconButton>
      </div>
      <Typography
        variant={'h4'}
        style={{ flex: showSearch ? 0 : 2, overflow: 'hidden', transition: 'flex 0.2s ease-out' }}
        noWrap>
        {title}
      </Typography>
    </>
  );
}

function ToggleColumnButton({ columns, toggledColumns, onToggleColumnVisible }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <>
      <Tooltip title={'Toggle Columns'} placement={'top'}>
        <IconButton aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
          <ViewColumnIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={Boolean(anchorEl)}
        onClose={handleClose}>
        <FormControl component="fieldset" style={{ margin: 16, minWidth: 200 }}>
          <FormLabel component="legend">Toggle Columns</FormLabel>
          <FormGroup>
            {!!columns &&
              columns
                .filter(column => !!column.hideable)
                .map(column => (
                  <FormControlLabel
                    key={column.id}
                    control={
                      <Checkbox checked={toggledColumns[column.id]} onChange={() => onToggleColumnVisible(column.id)} />
                    }
                    label={column.title}
                  />
                ))}
          </FormGroup>
        </FormControl>
      </Menu>
    </>
  );
}

function FilterColumnButton({ filters, columns, data, filterValue, filterMenuItem, onSetFilter }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  const comparisonRef = useRef();

  return (
    <>
      <Tooltip title={'Filter'} placement={'top'}>
        <IconButton aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
          <FilterListIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={Boolean(anchorEl)}
        onClose={handleClose}>
        <div style={{ margin: 16, minWidth: 200, maxWidth: 500 }}>
          <Grid container spacing={2}>
            {!!columns &&
              columns
                .filter(column => !!column.filterable)
                .map(column => (
                  <Grid key={column.id} item xs={12} md={6}>
                    {column.filterType === 'text' ? (
                      <TextFilter filters={filters} column={column} onSetFilter={onSetFilter} />
                    ) : column.filterType === 'numeric' ? (
                      <NumericFilter filters={filters} column={column} onSetFilter={onSetFilter} />
                    ) : (
                      <SelectFilter
                        filters={filters}
                        on
                        onSetFilter={onSetFilter}
                        column={column}
                        data={data}
                        filterValue={filterValue}
                        filterMenuItem={filterMenuItem}
                      />
                    )}
                  </Grid>
                ))}
          </Grid>
        </div>
      </Menu>
    </>
  );
}

function TextFilter({ filters, column, onSetFilter }) {
  return (
    <FormControl fullWidth>
      <TextField
        label={column.title}
        value={(filters.find(x => x.columnId === column.id) || {}).value || ''}
        onChange={event => onSetFilter(event.target.value, column.id, 'default')}
      />
    </FormControl>
  );
}

const operators = {
  lt: '<',
  lte: '≤',
  eq: '=',
  gt: '>',
  gte: '≥',
};

function NumericFilter({ filters, column, onSetFilter }) {
  const [comparison, setComparison] = useState((filters.find(x => x.columnId === column.id) || {}).type || 'eq');
  const [value, setValue] = useState((filters.find(x => x.columnId === column.id) || {}).value || '');

  useEffect(() => {
    onSetFilter(value, column.id, comparison);
  }, [value, column.id, comparison]);

  return (
    <div style={{ display: 'flex' }}>
      <FormControl style={{ flex: 1 }}>
        <TextField
          type="number"
          label={column.title}
          value={value}
          onChange={event => setValue(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Select
                  style={{ flex: -1 }}
                  value={comparison}
                  onChange={event => setComparison(event.target.value)}
                  disableUnderline>
                  {Object.keys(operators).map(key => (
                    <MenuItem value={key}>{operators[key]}</MenuItem>
                  ))}
                </Select>
              </InputAdornment>
            ),
          }}
        />
      </FormControl>
    </div>
  );
}

function SelectFilter({ filters, onSetFilter, column, data, filterValue, filterMenuItem }) {
  const rowSet = data.reduce((acc, row) => {
    const value = filterValue(row, column.id);
    acc[value] = row;
    return acc;
  }, {});

  return (
    <FormControl fullWidth>
      <InputLabel>{column.title}</InputLabel>
      <Select
        value={(filters.find(x => x.columnId === column.id) || {}).value || ''}
        onChange={event => onSetFilter(event.target.value, column.id, 'exact')}>
        <MenuItem value={''}>All</MenuItem>
        {Object.keys(rowSet).map(value => (
          <MenuItem key={value} value={value}>
            {filterMenuItem(rowSet[value], column.id)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

const FiltersSummary = ({ filters, columns, onRemoveFilter }) => (
  <Collapse in={!!filters && filters.length > 0}>
    <div style={{ display: 'flex' }}>
      <Typography style={{ marginRight: 16 }}>Filters:</Typography>
      <div style={{ display: 'flex', margin: -4 }}>
        {filters.map((filter, filterId) => {
          const filterLabel = `${
            filter.columnId === -1 ? '' : `${columns.find(x => x.id === filter.columnId).title}: `
          }${operators[filter.type] || ''}${filter.value}`;

          return (
            <Chip key={filterId} style={{ margin: 4 }} label={filterLabel} onDelete={() => onRemoveFilter(filterId)} />
          );
        })}
      </div>
    </div>
  </Collapse>
);
