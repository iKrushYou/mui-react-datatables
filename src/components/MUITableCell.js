import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import { makeStyles } from '@material-ui/core';
import classnames from 'classnames';

const useStyles = makeStyles(theme => ({
  tableCellNoWrap: {
    whiteSpace: 'nowrap',
  },
  tableCellPadding: ({ column, options, lastCol }) => ({
    padding: `${column.padding.top}px ${lastCol ? 16 : column.padding.right}px ${column.padding.bottom}px ${
      column.padding.left
    }px`,
    maxHeight: options.maxRowHeight ? options.maxRowHeight - column.padding.top - column.padding.bottom : null,
    overflow: 'hidden',
    minWidth: column.minWidth,
  }),
}));

export default function MUITableCell({ column, colValue, row, options, lastCol }) {
  const classes = useStyles({ column, options, lastCol });

  return (
    <TableCell
      align={column.align}
      className={classnames(column.noWrap && classes.tableCellNoWrap)}
      style={{ padding: 0 }}>
      <div className={classnames(classes.tableCellPadding)}>{colValue(row, column.id)}</div>
    </TableCell>
  );
}
