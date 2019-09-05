import React, {useEffect, useRef, useState} from "react";
import {Collapse, makeStyles, Select, TableFooter, Tooltip, Typography} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import hash from 'object-hash'
import ButtonBase from "@material-ui/core/ButtonBase";
import Chip from "@material-ui/core/Chip";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search"
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

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        marginTop: theme.spacing(3),
        overflowX: 'auto',
    },
    table: {
        minWidth: 650,
    },
    sortIndicatorDesc: {
        position: "absolute", backgroundColor: "#3498db", top: 0, left: 0, right: 0, height: 4,
    },
    sortIndicatorAsc: {
        position: "absolute", backgroundColor: "#3498db", bottom: 0, left: 0, right: 0, height: 4,
    }
}));

const defaultOptions = {
    fillEmptyRows: false,
    rowsPerPage: 10,
}

const defaultColumnValues = {
    visible: true,
    sortable: true,
    hideable: true,
    filterable: true,
}

MUIDatatable.defaultProps = {
    data: [],
    columns: [],
    options: {},
    title: "",
    buttons: [],
    filtersRef: () => {},
    sortsRef: () => {},
}

export default function MUIDatatable({data: dataInput, options, columns: columnsInput, title, buttons, filtersRef, sortsRef}) {

    const classes = useStyles();

    options = {...defaultOptions, ...options}

    const [columns, setColumns] = useState([])
    useEffect(() => {
        setColumns([...columnsInput.map((column, index) => ({id: index, ...defaultColumnValues, ...column}))]) // enforce default values
    }, [columnsInput])

    let data = [...dataInput]


    /*  Sorting  */

    const [sorts, setSorts] = useState([])

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

        let direction = 'desc'
        if (!!sortColumn) {
            if (sortColumn.direction === 'desc') {
                direction = 'asc'
            } else if (event.shiftKey) {
                direction = null
            }
        }
        addSort(columnId, direction, !event.shiftKey)
    }

    const colValue = (item, columnId) => {
        const c = columns[columnId]
        return (!!c.accessor && item[c.accessor])
            || c.Cell(item)
    }

    const sortValue = (item, columnId) => {
        const c = columns[columnId]
        return (typeof c.sortValue === "function" && c.sortValue(item))
            || colValue(item, columnId)
    }

    const compareItems = (a, b, sortColumn) => {
        const aValue = sortValue(a, sortColumn.columnId)
        const bValue = sortValue(b, sortColumn.columnId)

        if (typeof columns[sortColumn.columnId].sort === "function") {
            return columns[sortColumn.columnId].sort(a, b, sortColumn.direction)
        } else if (typeof aValue === "number") {
            return sortColumn.direction === 'asc'
                ? aValue - bValue
                : bValue - aValue
        } else {
            return sortColumn.direction === 'asc'
                ? String(bValue).localeCompare(aValue)
                : String(aValue).localeCompare(bValue)
        }
    }

    sorts.reverse().forEach(sortColumn => {
        data.sort((a, b) => compareItems(a, b, sortColumn))
    })


    /*  Column Visibility  */

    const handleToggleColumnVisible = (columnId) => {
        setColumns(prev => [...prev.map((column) => {
            if (column.id === columnId) {
                column.visible = !column.visible
            }
            return column
        })])
    }

    const visibleColumns = columns.filter(column => !!column.visible)


    /*  Search Filtering  */

    const [filters, setFilters] = useState([])

    const addFilter = (value, columnId = -1) => {
        setFilters(prev => {
            prev = prev.filter(x => x.columnId !== columnId)

            if (!!value && value !== "") prev.push({value, columnId})

            return [...prev]
        })
    }

    const removeFilter = (filterId) => {
        setFilters(prev => {
            prev.splice(filterId, 1)
            return [...prev]
        })
    }

    filters.forEach(filter => {
        if (filter.columnId === -1) {
            data = data.filter(item =>
                visibleColumns
                    .reduce((acc, current, index) =>
                        acc || String(colValue(item, index)).toLowerCase().includes(String(filter.value).toLowerCase())
                        , false)
            )
        } else {
            data = data.filter(x => String(colValue(x, filter.columnId)).toLowerCase().includes(String(filter.value).toLowerCase()))
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


    /*  Rendering  */

    return (
        <Paper className={classes.root}>
            <div style={{display: "flex", margin: 16}}>
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
                <div style={{flex: 1}}/>
                <div style={{flex: -1, display: 'flex', flexDirection: "row-reverse"}}>
                    {buttons}
                    <FilterColumnButton
                        filters={filters}
                        columns={columns}
                        data={data}
                        colValue={colValue}
                        onSetFilter={(value, columnId) => addFilter(value, columnId)}
                    />
                    <ToggleColumnButton
                        columns={columns}
                        onToggleColumnVisible={handleToggleColumnVisible}
                    />
                    <Tooltip title={"Search"} placement={"top"}>
                        <IconButton onClick={handleToggleSearch}>
                            <SearchIcon/>
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
            <Collapse in={!!filters && filters.length > 0}>
                <div style={{display: "flex", margin: 16}}>
                    <Typography style={{marginRight: 16}}>Filters:</Typography>
                    <div style={{display: "flex", margin: -4}}>
                        {filters.map((filter, filterId) => (
                            <Chip
                                style={{margin: 4}}
                                label={`${filter.columnId === -1 ? "" : `${visibleColumns[filter.columnId].title}: `}${filter.value}`}
                                onDelete={() => removeFilter(filterId)}
                            />
                        ))}
                    </div>
                </div>
            </Collapse>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        {!!visibleColumns && visibleColumns.map((column) => {
                                const columnSort = sorts.find(x => x.columnId === column.id)
                                const sortClass = !!columnSort
                                    ? columnSort.direction === 'asc'
                                        ? classes.sortIndicatorAsc
                                        : classes.sortIndicatorDesc
                                    : null
                                return (
                                    <TableCell key={hash(column)} {...column.props}
                                               style={{
                                                   width: !!column.shrink ? 1 : null,
                                                   position: "relative",
                                                   padding: 0
                                               }}
                                    >
                                        <ButtonBase
                                            style={{
                                                display: "table-cell",
                                                width: '100%',
                                                padding: '14px 40px 14px 16px',
                                                textAlign: column.align || 'left'
                                            }}
                                            disabled={!column.sortable}
                                            onClick={(event) => sortColumn(event, column.id)}
                                        >
                                            {column.title || <span>&nbsp;</span>}
                                            <div className={sortClass}/>
                                        </ButtonBase>
                                    </TableCell>
                                )
                            }
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {!!data && data.map((item, itemIndex) => (
                        <TableRow key={hash(item) + itemIndex}>
                            {!!visibleColumns && visibleColumns.map((column) => (
                                <TableCell key={hash(column)} align={column.align}>
                                    {colValue(item, column.id)}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                    {!!data
                    && options.fillEmptyRows
                    && new Array(Math.max(0, options.rowsPerPage - data.length)).fill(0).map((x, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={'100%'}
                                       style={{borderWidth: i === options.rowsPerPage - data.length - 1 ? null : 0}}>&nbsp;</TableCell>
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
        </Paper>
    )
}

function ToggleColumnButton({columns, onToggleColumnVisible}) {

    const [anchorEl, setAnchorEl] = React.useState(null);

    function handleClick(event) {
        setAnchorEl(event.currentTarget);
    }

    function handleClose() {
        setAnchorEl(null);
    }

    return (
        <>
            <IconButton aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
                <ViewColumnIcon/>
            </IconButton>
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
                        {!!columns && columns.filter(column => !!column.hideable).map((column, columnId) => (
                            <FormControlLabel
                                key={columnId}
                                control={<Checkbox checked={!!column.visible}
                                                   onChange={() => onToggleColumnVisible(columnId)}/>}
                                label={column.title}
                            />
                        ))}
                    </FormGroup>
                </FormControl>

            </Menu>
        </>
    )
}


function FilterColumnButton({filters, columns, data, colValue, onSetFilter}) {

    const [anchorEl, setAnchorEl] = React.useState(null);

    function handleClick(event) {
        setAnchorEl(event.currentTarget);
    }

    function handleClose() {
        setAnchorEl(null);
    }

    return (
        <>
            <IconButton aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
                <FilterListIcon/>
            </IconButton>
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
                    style={{margin: 16, minWidth: 200}}
                >
                    <Grid container spacing={2}>
                        {!!columns && columns.filter(column => !!column.filterable).map((column, columnId) => (
                            <Grid key={columnId} item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>{column.title}</InputLabel>
                                    <Select
                                        value={(filters.find(x => x.columnId === column.id) || {}).value || ""}
                                        onChange={event => onSetFilter(event.target.value, column.id)}
                                    >
                                        <MenuItem value={""}>All</MenuItem>
                                        {[...new Set(data.map(item => colValue(item, column.id)))].map(option => (
                                            <MenuItem key={option} value={option}>{option}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        ))}
                    </Grid>
                </div>

            </Menu>
        </>
    )
}