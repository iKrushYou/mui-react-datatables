import React, {useEffect, useMemo, useRef, useState} from "react";
import {Collapse, makeStyles, Select, TableFooter, Tooltip, Typography} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Chip from "@material-ui/core/Chip";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search"
import SaveIcon from "@material-ui/icons/Save"
import CloseIcon from "@material-ui/icons/Close"
import FilterListIcon from "@material-ui/icons/FilterList"
import ViewColumnIcon from "@material-ui/icons/ViewColumn"
import Menu from "@material-ui/core/Menu";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Grid from "@material-ui/core/Grid";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import TablePagination from "@material-ui/core/TablePagination";
import {CSVLink} from "react-csv";
import TableHeadButton from "./components/TableHeadButton";

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        overflowX: 'auto',
    },
    table: {
        minWidth: 650,
    },
}));

const defaultOptions = {
    fillEmptyRows: false,
    rowsPerPage: 10,
    csvExport: true,
    initialSorts: [],
    initialFilters: [],
}

const defaultColumnValues = {
    visible: true,
    sortable: true,
    hideable: true,
    filterable: true,
    filterMatch: "exact",
}

MUIDatatable.defaultProps = {
    data: [],
    columns: [],
    options: {},
    title: "",
    buttons: [],
    filtersRef: () => {
    },
    sortsRef: () => {
    },
}

const mapObject = (source, destination) => {

    if (source == null) {
        return destination
    }

    if (destination == null) {
        return source
    }

    return {...destination, ...source}
}

export default function MUIDatatable({data: dataInput, options: optionsInput, columns: columnsInput, title, buttons, filtersRef, sortsRef}) {

    const classes = useStyles();

    const options = useMemo(() => mapObject(optionsInput, defaultOptions), [optionsInput])

    const columns = useMemo(() => [...columnsInput.map((column, index) => ({id: index, ...mapObject(column, defaultColumnValues)}))], [columnsInput])

    const getColumn = (columnId) => columns.find(x => x.id === columnId)


    let data = [...dataInput]


    /*  Sorting  */

    const [sorts, setSorts] = useState([])

    useEffect(() => {
        setSorts([...options.initialSorts])
    }, [options.initialSorts])

    const addSort = (columnId, direction, clear = false) => {
        setSorts(prev => {

            if (!direction) return [...prev.filter(x => x.columnId !== columnId)]

            if (clear) prev = prev.filter(x => x.columnId === columnId)

            const index = prev.findIndex(x => x.columnId === columnId)

            if (index > -1) {
                prev[index].direction = direction
            } else {
                prev.push({columnId, direction})
            }

            return [...prev]
        })
    }

    const sortColumn = (event, columnId) => {
        const sortColumn = sorts.find(x => x.columnId === columnId)

        let direction = 'asc'
        if (!!sortColumn) {
            if (sortColumn.direction === 'asc') {
                direction = 'desc'
            } else if (event.shiftKey) {
                direction = null
            }
        }
        addSort(columnId, direction, !event.shiftKey)
    }

    const colValue = (row, columnId) => {
        const c = getColumn(columnId)
        return (typeof c.Cell === "function" && c.Cell(row))
            || row[c.accessor]
    }

    const sortValue = (row, columnId) => {
        const c = getColumn(columnId)
        return (typeof c.sortValue === "function" && c.sortValue(row))
            || row[c.accessor]
            || colValue(row, columnId)
    }

    const compareItems = (a, b, sortColumn) => {
        const aValue = sortValue(a, sortColumn.columnId)
        const bValue = sortValue(b, sortColumn.columnId)

        if (typeof getColumn(sortColumn.columnId).sort === "function") {
            return getColumn(sortColumn.columnId).sort(a, b, sortColumn.direction)
        } else if (typeof aValue === "number") {
            return sortColumn.direction === 'desc'
                ? bValue - aValue
                : aValue - bValue
        } else {
            return sortColumn.direction === 'desc'
                ? String(bValue).localeCompare(aValue)
                : String(aValue).localeCompare(bValue)
        }
    }

    sorts.slice().reverse().forEach(sortColumn => {
        data.sort((a, b) => compareItems(a, b, sortColumn))
    })


    /*  Column Visibility  */

    const [toggledColumns, setToggledColumns] = useState({})

    useEffect(() => {
        setToggledColumns(prev => ({
            ...columns.reduce((toggled, column) => {
                toggled[column.id] = column.visible
                return toggled
            }, {}),
            ...prev
        }))
    }, [columns])

    const handleToggleColumnVisible = (columnId) => {
        setToggledColumns(prev => ({
            ...prev,
            [columnId]: !prev[columnId]
        }))
    }

    const visibleColumns = columns.filter(column => toggledColumns[column.id])


    /*  Search Filtering  */

    const [filters, setFilters] = useState([])

    useEffect(() => {
        setFilters([...options.initialFilters])
    }, [options.initialFilters])

    const addFilter = (value, columnId = -1, type = "default") => {
        setFilters(prev => {
            prev = prev.filter(x => x.columnId !== columnId)

            if (!!value && value !== "") prev.push({value, columnId, type})

            return [...prev]
        })
        setCurrentPage(0)
    }

    const removeFilter = (filterId) => {
        setFilters(prev => {
            prev.splice(filterId, 1)
            return [...prev]
        })
    }

    const filterValue = (row, columnId) => {
        const c = getColumn(columnId)
        return (typeof c.filterValue === "function" && c.filterValue(row))
            || row[c.accessor]
            || colValue(row, columnId)
    }

    const filterFn = (data, filter) => {
        if (filter.value == null || filter.value === "") return data

        if (filter.type === "exact") return data.filter(x => String(filterValue(x, filter.columnId)) === String(filter.value))
        if (filter.type === "lt") return data.filter(x => filterValue(x, filter.columnId) < filter.value)
        if (filter.type === "lte") return data.filter(x => filterValue(x, filter.columnId) <= filter.value)
        if (filter.type === "gt") return data.filter(x => filterValue(x, filter.columnId) > filter.value)
        if (filter.type === "gte") return data.filter(x => filterValue(x, filter.columnId) >= filter.value)
        return data.filter(x => String(filterValue(x, filter.columnId)).toLowerCase().includes(String(filter.value).toLowerCase()))
    }

    filters.forEach(filter => {
        if (filter.columnId === -1) {
            data = data.filter(row =>
                visibleColumns
                    .reduce((acc, column) => acc || String(colValue(row, column.id)).toLowerCase().includes(String(filter.value).toLowerCase())
                        , false)
            )
        } else {
            data = filterFn(data, filter)
        }
    })

    const [showSearch, setShowSearch] = useState(false)
    const searchTerm = (filters.find(x => x.columnId === -1) || {}).value || ""

    const searchFieldRef = useRef()

    const handleToggleSearch = () => {
        setShowSearch(prev => {
            if (!prev) searchFieldRef.current.focus()
            return !prev
        })
    }


    /*  Refs  */

    filtersRef(filters)
    sortsRef(sorts)


    /*  Pagination  */

    const [currentPage, setCurrentPage] = useState(0)

    const pageData = data.slice(currentPage * options.rowsPerPage, (currentPage + 1) * options.rowsPerPage)

    const emptyRows = new Array(Math.max(0, options.rowsPerPage - pageData.length)).fill(0)


    /*  CSV Download  */

    const csvValue = (row, columnId) => {
        const c = getColumn(columnId)
        return (typeof c.csvValue === "function" && c.csvValue(row))
            || row[c.accessor]
            || colValue(row, columnId)
    }

    const generateCsvData = () => {
        if (!data) return [[]]
        const headers = visibleColumns.map(column => column.csvHeader || column.title)
        const csvData = [
            headers,
            ...data.map(row => visibleColumns.map(column => csvValue(row, column.id)))
        ]
        return csvData
    }


    /*  Rendering  */

    return (
        <Paper className={classes.root}>
            <div style={{display: "flex", margin: 16}}>
                <TitleSearchBar
                    title={title}
                    showSearch={showSearch}
                    setShowSearch={setShowSearch}
                    searchFieldRef={searchFieldRef}
                    searchTerm={searchTerm}
                    addFilter={addFilter}
                />
                <div style={{flex: 1}}/>
                <div style={{flex: -1, display: 'flex', flexDirection: "row-reverse"}}>
                    {buttons}
                    <FilterColumnButton
                        filters={filters}
                        columns={visibleColumns}
                        data={data}
                        filterValue={filterValue}
                        onSetFilter={addFilter}
                    />
                    <ToggleColumnButton
                        columns={columns}
                        toggledColumns={toggledColumns}
                        onToggleColumnVisible={handleToggleColumnVisible}
                    />
                    {options.csvExport && (
                        <Tooltip title={"Save to CSV"} placement={"top"}>
                            <CSVLink data={generateCsvData()}
                                     filename={options.csvFilename || title || "table"}>
                                <IconButton>
                                    <SaveIcon/>
                                </IconButton>
                            </CSVLink>
                        </Tooltip>
                    )}
                    <Tooltip title={"Search"} placement={"top"}>
                        <IconButton onClick={handleToggleSearch}>
                            <SearchIcon/>
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
            <FiltersSummary filters={filters} onRemoveFilter={removeFilter} columns={columns}/>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        {!!visibleColumns && visibleColumns.map((column) => (
                                <TableHeadButton column={column} onSortColumn={sortColumn} sorts={sorts}/>
                            )
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {!!pageData && pageData.map((item, itemIndex) => (
                        <TableRow key={itemIndex}>
                            {!!visibleColumns && visibleColumns.map((column) => (
                                <TableCell key={column.id} align={column.align}
                                >
                                    {colValue(item, column.id)}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                    {options.fillEmptyRows && emptyRows.map((x, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={'100%'}
                                       style={{borderWidth: i === options.rowsPerPage - pageData.length - 1 ? null : 0}}>&nbsp;</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        {!!visibleColumns && visibleColumns.map((column) => (
                            <TableCell key={`${column.title}-${column.id}`} {...column.props}
                                       align={column.align}
                                       style={{width: !!column.shrink ? 1 : null}}
                            >
                                {typeof column.Footer === "function" ? column.Footer(data) : <></>}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableFooter>
            </Table>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={data.length}
                rowsPerPage={options.rowsPerPage}
                page={currentPage}
                backIconButtonProps={{
                    'aria-label': 'previous page',
                }}
                nextIconButtonProps={{
                    'aria-label': 'next page',
                }}
                onChangePage={(event, newPage) => setCurrentPage(newPage)}
                onChangeRowsPerPage={() => {
                }}
            />
        </Paper>
    )
}

function TitleSearchBar({title, showSearch, setShowSearch, searchFieldRef, searchTerm, addFilter}) {
    return (
        <>
            <div style={{
                flex: showSearch ? 2 : 0,
                display: 'flex',
                overflow: "hidden",
                transition: 'flex 0.2s ease-out'
            }}>
                <TextField
                    inputRef={searchFieldRef}
                    style={{flex: 1}}
                    label={"Search"}
                    value={searchTerm}
                    onChange={(event) => addFilter(event.target.value)}
                />
                <IconButton style={{flex: -1}} onClick={() => setShowSearch(false)} color={"secondary"}>
                    <CloseIcon/>
                </IconButton>
            </div>
            <Typography variant={"h4"}
                        style={{flex: showSearch ? 0 : 2, overflow: "hidden", transition: 'flex 0.2s ease-out'}}
                        noWrap>
                {title}
            </Typography>
        </>
    )
}

function ToggleColumnButton({columns, toggledColumns, onToggleColumnVisible}) {

    const [anchorEl, setAnchorEl] = React.useState(null);

    function handleClick(event) {
        setAnchorEl(event.currentTarget);
    }

    function handleClose() {
        setAnchorEl(null);
    }

    return (
        <>
            <Tooltip title={"Toggle Columns"} placement={"top"}>
                <IconButton aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
                    <ViewColumnIcon/>
                </IconButton>
            </Tooltip>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                getContentAnchorEl={null}
                anchorOrigin={{vertical: "bottom", horizontal: "center"}}
                transformOrigin={{vertical: "top", horizontal: "center"}}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <FormControl
                    component="fieldset"
                    style={{margin: 16, minWidth: 200}}
                >
                    <FormLabel component="legend">Toggle Columns</FormLabel>
                    <FormGroup>
                        {!!columns && columns.filter(column => !!column.hideable).map(column => (
                            <FormControlLabel
                                key={column.id}
                                control={<Checkbox checked={toggledColumns[column.id]}
                                                   onChange={() => onToggleColumnVisible(column.id)}/>}
                                label={column.title}
                            />
                        ))}
                    </FormGroup>
                </FormControl>

            </Menu>
        </>
    )
}


function FilterColumnButton({filters, columns, data, filterValue, onSetFilter}) {

    const [anchorEl, setAnchorEl] = React.useState(null);

    function handleClick(event) {
        setAnchorEl(event.currentTarget);
    }

    function handleClose() {
        setAnchorEl(null);
    }

    const comparisonRef = useRef()

    return (
        <>
            <Tooltip title={"Filter"} placement={"top"}>
                <IconButton aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
                    <FilterListIcon/>
                </IconButton>
            </Tooltip>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                getContentAnchorEl={null}
                anchorOrigin={{vertical: "bottom", horizontal: "center"}}
                transformOrigin={{vertical: "top", horizontal: "center"}}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <div
                    style={{margin: 16, minWidth: 200, maxWidth: 500}}
                >
                    <Grid container spacing={2}>
                        {!!columns && columns.filter(column => !!column.filterable).map(column => (
                            <Grid key={column.id} item xs={12} md={6}>
                                {column.filterType === "text" ? (
                                    <TextFilter filters={filters} column={column} onSetFilter={onSetFilter}/>
                                ) : column.filterType === "numeric" ? (
                                    <NumericFilter filters={filters} column={column} onSetFilter={onSetFilter}/>
                                ) : (
                                    <SelectFilter filters={filters} on onSetFilter={onSetFilter} column={column}
                                                  data={data} filterValue={filterValue}/>
                                )}
                            </Grid>
                        ))}
                    </Grid>
                </div>

            </Menu>
        </>
    )
}

function TextFilter({filters, column, onSetFilter}) {
    return (
        <FormControl fullWidth>
            <TextField
                label={column.title}
                value={(filters.find(x => x.columnId === column.id) || {}).value || ""}
                onChange={event => onSetFilter(event.target.value, column.id, "default")}
            />
        </FormControl>
    )
}

function NumericFilter({filters, column, onSetFilter}) {

    const [comparison, setComparison] = useState((filters.find(x => x.columnId === column.id) || {}).type || "eq")
    const [value, setValue] = useState((filters.find(x => x.columnId === column.id) || {}).value || "")

    useEffect(() => {
        onSetFilter(value, column.id, comparison)
    }, [value, column.id, comparison])

    return (
        <div style={{display: "flex"}}>
            <FormControl style={{flex: -1}}>
                <InputLabel/>
                <Select
                    style={{flex: -1}}
                    value={comparison}
                    onChange={event => setComparison(event.target.value)}
                >
                    <MenuItem value={"lt"}>&lt;</MenuItem>
                    <MenuItem value={"lte"}>&le;</MenuItem>
                    <MenuItem value={"eq"}>=</MenuItem>
                    <MenuItem value={"gt"}>&gt;</MenuItem>
                    <MenuItem value={"gte"}>&ge;</MenuItem>
                </Select>
            </FormControl>
            <FormControl style={{flex: 1}}>
                <TextField
                    label={column.title}
                    value={value}
                    onChange={event => setValue(event.target.value)}
                />
            </FormControl>
        </div>
    )
}

function SelectFilter({filters, onSetFilter, column, data, filterValue}) {

    const rowSet = data.reduce((acc, row) => {
        const value = filterValue(row, column.id)
        acc[value] = row
        return acc
    }, {})

    return (
        <FormControl fullWidth>
            <InputLabel>{column.title}</InputLabel>
            <Select
                value={(filters.find(x => x.columnId === column.id) || {}).value || ""}
                onChange={event => onSetFilter(event.target.value, column.id, "exact")}
            >
                <MenuItem value={""}>All</MenuItem>
                {Object.keys(rowSet).map(value => (
                    <MenuItem key={value} value={value}>
                        {typeof column.filterMenuItem === "function" ? column.filterMenuItem(rowSet[value]) : value}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}

const FiltersSummary = ({filters, columns, onRemoveFilter}) => (
    <Collapse in={!!filters && filters.length > 0}>
        <div style={{display: "flex", margin: 16}}>
            <Typography style={{marginRight: 16}}>Filters:</Typography>
            <div style={{display: "flex", margin: -4}}>
                {filters.map((filter, filterId) => (
                    <Chip
                        key={filterId}
                        style={{margin: 4}}
                        label={`${filter.columnId === -1 ? "" : `${columns.find(x => x.id === filter.columnId).title}: `}${filter.value}`}
                        onDelete={() => onRemoveFilter(filterId)}
                    />
                ))}
            </div>
        </div>
    </Collapse>
)