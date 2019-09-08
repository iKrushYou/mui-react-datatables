import React, {useState} from "react";
import ReactDOM from "react-dom";
import data from "./data.json";
import {Card, CardContent, Divider, FormControlLabel, Grid, Switch, TextField, Typography} from "@material-ui/core";

import "./styles.css";
import MUIDatatable from "../../src";

function App() {
    const columns = [
        {
            id: 'name',
            title: "Name",
            Cell: item => `${item.name.first} ${item.name.last}`,
            filterType: "text",
        },
        {
            title: "Company",
            accessor: "company",
            filterType: "text",
        },
        {
            id: "age",
            title: "Age",
            accessor: "age",
            align: "right",
            Footer: data => `Avg: ${(data.reduce((acc, cur) => acc + cur.age, 0) / data.length).toFixed(2)}`,
            filterType: "numeric",
        },
        {
            title: "Eye Color",
            accessor: "eyeColor",
            Cell: row => <div style={{width: 16, height: 16, borderRadius: 4, backgroundColor: row.eyeColor}} />,
            shrink: true,
        },
        {
            title: "Phone",
            accessor: "phone",
            align: "right",
            sortValue: item => parseInt(item.phone.replace(/[^0-9]+/g, "")),
            filterType: "text",
        },
        {
            title: "Balance",
            accessor: "balance",
            align: "right",
            sortValue: item => parseFloat(item.balance.replace(/[^0-9.-]+/g, "")),
            Footer: data =>
                `$${(
                    data.reduce(
                        (acc, cur) =>
                            acc + parseFloat(cur.balance.replace(/[^0-9.-]+/g, "")),
                        0
                    ) / data.length
                ).toFixed(2)}`,
            filterType: "numeric",
        },
        {
            title: "Picture",
            Cell: row => <img src={row.picture} style={{width: 32, height: 32}}/>,
            shrink: true,
            csvValue: row => row.picture,
            filterValue: row => row.picture,
            filterMenuItem: row => <img src={row.picture} style={{width: 32, height: 32}}/>
        }
    ];
    const [options, setOptions] = useState({
        fillEmptyRows: false,
        rowsPerPage: 10,
        csvExport: false,
        csvFilename: "my_table_export",
        initialSorts: [
            {columnId: 'age', direction: "asc"},
            {columnId: 'name', direction: "asc"},
        ],
        initialFilters: [
            // {columnId: 'name', value: "se", type: "exact"},
        ],
    });
    const [filters, setFilters] = useState([]);
    const [sorts, setSorts] = useState([]);

    return (
        <div className="App">
            <>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant={"h4"}>&lt;MUIDatatables /&gt;</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant={"h5"}>options</Typography>
                                <Grid container spacing={2}>
                                    {Object.keys(options).map(optionKey => {
                                        const optionValue = options[optionKey];

                                        if (typeof optionValue === "boolean") {
                                            return (
                                                <Grid key={optionKey} item xs={12} sm={6}>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={optionValue}
                                                                onChange={event =>
                                                                    setOptions(prev => ({
                                                                        ...prev,
                                                                        [event.target.value]: event.target.checked
                                                                    }))
                                                                }
                                                                value={optionKey}
                                                            />
                                                        }
                                                        label={optionKey}
                                                    />
                                                </Grid>
                                            );
                                        } else if (typeof optionValue === "number") {
                                            return (
                                                <Grid key={optionKey} item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label={optionKey}
                                                        value={optionValue}
                                                        onChange={event =>
                                                            setOptions(prev => ({
                                                                ...prev,
                                                                [optionKey]: parseInt(event.target.value)
                                                            }))
                                                        }
                                                        type="number"
                                                    />
                                                </Grid>
                                            );
                                        } else {
                                            return <React.Fragment key={optionKey}/>;
                                        }
                                    })}
                                </Grid>
                                <pre style={{marginTop: 32}}>{JSON.stringify(options, null, 2)}</pre>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12}>
                        <Divider/>
                    </Grid>
                    <Grid item xs={12}>
                        <MUIDatatable
                            title={"My Table"}
                            options={options}
                            columns={columns}
                            data={data}
                            filtersRef={setFilters}
                            sortsRef={setSorts}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Divider/>
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

const rootElement = document.getElementById("root");
ReactDOM.render(<App/>, rootElement);
