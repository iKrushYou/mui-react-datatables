## Material-UI Dataforms

[![Build Status](https://travis-ci.com/iKrushYou/mui-dataforms.svg?branch=master)](https://travis-ci.com/iKrushYou/mui-dataforms)
[![npm package](https://img.shields.io/npm/v/mui-dataforms/latest.svg)](https://www.npmjs.com/package/mui-dataforms)
[![NPM Downloads](https://img.shields.io/npm/dt/mui-dataforms.svg?style=flat)](https://npmcharts.com/compare/mui-dataforms?minimal=true)

MUI Dataforms is a library intended to assist in creating dynamic forms based on a JSON input. Fields are completely dynamic with a multitude of pre-defined components (with the option of custom components). 

## Getting Started
### Installation

```
npm install mui-dataforms
```
or
```
yarn add mui-dataforms
```
### Using the forms
```
import MUIDatatable from 'mui-dataforms'
```
#### Define your fields
```
const fields = [
    {
        title: "Personal Information",
        description: "Some info about yourself.",
        fields: [
            {
                id: 'first-name',
                title: 'First Name',
                type: 'text',
                validation: {
                    required: true,
                    min: 3,
                    max: 16,
                },
                size: {
                    xs: 12,
                    md: 6,
                },
            },
        ]
    }
]
```
#### Set up a state
```
const [values, setValues] = useState({"first-name": "Alex"})

const handleOnChange = (key) => (value) => {
	setValues(prevValues => ({...prevValues, [key]: value}))
}
```
#### Implementation
```
<MUIDatatable title={"My Form"} fields={fields} values={values} onChange={handleOnChange}/>
```


## API


#### &lt;MUIDatatable />

The component accepts the following props:

|Name|Type|Default|Required|Description
|:--:|:-----|:-----|:-----|:-----|
|**`title`**|string|`''`|false|Title of the form
|**`fields`**|array|`[]`|true|Data used to describe the fields. Array of [`section`](#options-section) objects.
|**`values`**|object|`{}`|false|Object containing the values of the form. Each value's key is linked to the `id` of the relative field.
|**`onChange`**|function||true|A function that will be triggered when the field changes. <br />`key => value => ()`

#### <a name="options-section"></a>section:
|Name|Type|Default|Required|Description
|:--:|:-----|:--|:-----|:-----|
|**`title`**|string|`''`|false|Title of the section.
|**`description`**|string|`''`|false|Description of the section.
|**`fields`**|array|`[]`|false|Fields for the section. Array of [`field`](#options-field) objects.


#### <a name="options-field"></a>field:
|Name|Type|Default|Required|Description
|:--:|:-----|:--|:-----|:-----|
|**`id`**|string||true|Reference to the value stored in the `values` object. Required unless `type` is set to `spacer`.
|**`title`**|string||false|Title of the field
|**`type`**|string||true|Type of field to display.<br/>`enum(text, number, select, date, time, datetime, checkbox, switch, spacer, custom)`
|**`validation`**|object||false|Title of the field.
|**`validation.required`**|bool|`false`|false|Title of the field.
|**`validation.min`**|int||false|Minimum length or size of input.
|**`validation.max`**|int||false|Maximum length or size of input.
|**`size`**|object|`{xs: 12}`|false|Grid sizing of each field. Uses same sizing from MUI: `xs`, `sm`, `md`, `lg`, `xl`.
|**`props`**|object||false|Additional props to pass through.
|**`options`**|array||false|Required for `type: select`. List of options defined by an array of objects with `value` and `label`.
|**`validator`**|function||false|Custom validation logic that returns whether the input is valid and an optional `errorMessage` to display to the client.<br/>`(value) => {valid, errorMessage}`

