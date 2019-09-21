import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { makeStyles } from '@material-ui/core';
import classnames from 'classnames';
import MUITableCell from './MUITableCell';

const useStyles = makeStyles(theme => ({
  tableRowClick: {
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: '#eaeaea',
    },
    '&:active': {
      backgroundColor: '#dadada',
    },
  },
}));

export default function MUITableRow({ row, onRowClick, visibleColumns, colValue, options }) {
  const classes = useStyles();

  const clickable = typeof options.onRowClick === 'function';

  return (
    <TableRow className={classnames(clickable && classes.tableRowClick)} onClick={event => onRowClick(event, row)}>
      {!!visibleColumns &&
        visibleColumns.map(column => (
          <MUITableCell key={column.id} colValue={colValue} column={column} options={options} row={row} />
        ))}
    </TableRow>
  );
}
