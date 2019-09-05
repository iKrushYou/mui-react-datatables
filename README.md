## Material-UI React Datatablrs

|  | build status | build version | downloads |
| ------------ | ------------ | ------------ | ------------ |
| latest | [![Build Status](https://travis-ci.com/iKrushYou/mui-react-datatables.svg?branch=master)](https://travis-ci.com/iKrushYou/mui-react-datatables) | [![npm package](https://img.shields.io/npm/v/mui-react-datatables/latest.svg)](https://www.npmjs.com/package/mui-react-datatables) | [![NPM Downloads](https://img.shields.io/npm/dt/mui-react-datatables.svg?style=flat)](https://npmcharts.com/compare/mui-react-datatables?minimal=true) |
| dev | [![Build Status](https://travis-ci.com/iKrushYou/mui-react-datatables.svg?branch=development)](https://travis-ci.com/iKrushYou/mui-react-datatables) | [![npm package](https://img.shields.io/npm/v/mui-react-datatables/dev.svg)](https://www.npmjs.com/package/mui-react-datatables) | [![NPM Downloads](https://img.shields.io/npm/dt/mui-react-datatables.svg?style=flat)](https://npmcharts.com/compare/mui-react-datatables?minimal=true) |

MUI Datatables is a library that takes an array of json data and displays it in a simple, configurable way. This library was inspired by [mui-datatables](https://github.com/gregnb/mui-datatables "mui-datatables") however I plan to address many of the shortcomings of this library in my own implementation such as: a footer row to be used for totals, multi-sorting of columns, key-driven configuration (vs index-based), and more to come.

## Getting Started
### Installation

```bash
npm install mui-react-datatables
```
or
```bash
yarn add mui-react-datatables
```
### Using the table
```javascript
import MUIDatatable from 'mui-react-datatables'
```
#### Table Options
```javascript
const options = {
	fillEmptyRows: true,
	rowsPerPage: 10,
}
```
#### Column Options
```javascript
const columns = [
    {
        title: "Name",
        Cell: item => `${item.name.first} ${item.name.last}`
    },
    {
        title: "Company",
        accessor: "company",
    },
    {
        title: "Age",
        accessor: "age",
    },
    {
        title: "Phone",
        accessor: "phone",
        sortValue: item => parseInt(item.phone.replace(/[^0-9]+/g,"")),
    },
    {
        title: "Balance",
        accessor: "balance",
        sortValue: item => parseFloat(item.balance.replace(/[^0-9.-]+/g,"")),
    },
    {
        title: "Picture",
        Cell: (item) => <img src={item.picture} style={{width: 32, height: 32}} />,
        visible: false,
    },
]
```
#### Optional Refs
```javascript
const [filters, setFilters] = useState([])
const [sorts, setSorts] = useState([])
```
#### Implementation
```javascript
<MUIDatatable
	title={"My Table"}
	data={data}
	columns={columns}
	options={options}
	filtersRef={setFilters}
	sortsRef={setSorts}
/>
```
## API
#### &lt;MUIDatatable />

The component accepts the following props:

|Name|Type|Default|Required|Description
|:--:|:-----|:-----|:-----|:-----|
|**`title`**|string|`""`|false|Title of the table
|**`options`**|object|`{}`|true|[`Options`](#options-field) to be supplied to table.
|**`columns`**|[object]|`[]`|true|[`Columns`](#columns-field) to be displayed in the table.
|**`data`**|[object]|`[]`|true|Data to be supplied to table.
|**`filtersRef`**|function||false|Accessor for filters array. <br /> `(filters) => {}`
|**`sortsRef`**|function||false|Accessor for sorts array. <br /> `(sorts) => {}`

#### <a name="options-field"></a>options:
|Name|Type|Default|Required|Description
|:--:|:-----|:--|:-----|:-----|
|**`fillEmptyRows`**|bool|`false`|false|Should the table fill empty rows with blanks.
|**`rowsPerPage`**|number|`10`|false|INumber of rows displayed on a page.


#### <a name="columns-field"></a>columns[]:
|Name|Type|Default|Required|Description
|:--:|:-----|:--|:-----|:-----|
|**`title`**|string||true|Title of the column
|**`accessor`**|string||true*|Key of value in row to display.<br />*not required if using `Cell`
|**`Cell`**|function||false|Render function of the cell. Overridden by `accessor` <br/>`(row) => {}`
|**`sortValue`**|bool||false|Custom sort value. Defaults to what is rendered in the cell. <br />`(row) => {}`
|**`visible`**|bool|`true`|false|Is the column visible by default. User can unhide if `hideable` is set to `true`
|**`hideable`**|bool|`true`|false|Can the column be hidden / unhidden
|**`sortable`**|bool|`true`|false|Can this column be sorted using column headers.
|**`filterable`**|bool|`true`|false|Can this column be filtered / searched on. Applies to both column filters and global search.


