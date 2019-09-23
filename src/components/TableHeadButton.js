import { makeStyles } from '@material-ui/core';
import TableCell from '@material-ui/core/TableCell';
import ButtonBase from '@material-ui/core/ButtonBase';
import React from 'react';

const useStyles = makeStyles(theme => ({
  sortIndicatorAsc: {
    position: 'absolute',
    backgroundColor: '#3498db',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  sortIndicatorDesc: {
    position: 'absolute',
    backgroundColor: '#3498db',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  tableHeaderCell: ({ column }) => ({
    width: column.shrink ? '1%' : null,
    position: 'relative',
    padding: 0,
    whiteSpace: 'nowrap',
    '&:last-child': {
      paddingRight: 0,
      '& button': {
        paddingRight: 16,
      },
    },
  }),
  tableHeaderButton: ({ column }) => ({
    display: 'table-cell',
    width: '100%',
    padding: '14px 40px 14px 16px',
    textAlign: column.align || 'left',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  }),
}));

export default function TableHeadButton({ column, sorts, onSortColumn }) {
  const classes = useStyles({ column });

  const columnSort = sorts.find(x => x.columnId === column.id);

  const sortClass = columnSort
    ? columnSort.direction === 'asc'
      ? classes.sortIndicatorAsc
      : classes.sortIndicatorDesc
    : null;

  return (
    <TableCell key={column.id} {...column.props} className={classes.tableHeaderCell}>
      <ButtonBase
        className={classes.tableHeaderButton}
        disabled={!column.sortable}
        onClick={event => onSortColumn(event, column.id)}>
        <span>{column.title || <span>&nbsp;</span>}</span>
        <div className={sortClass} />
      </ButtonBase>
    </TableCell>
  );
}
