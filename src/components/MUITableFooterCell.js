import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import { makeStyles } from '@material-ui/core';
import classnames from 'classnames';

const useStyles = makeStyles(theme => ({
  tableCellNoWrap: {
    whiteSpace: 'nowrap',
  },
  tableCellPadding: ({ column, lastCol }) => ({
    padding: `${column.padding.top}px ${lastCol ? 16 : column.padding.right}px ${column.padding.bottom}px ${
      column.padding.left
    }px`,
    overflow: 'hidden',
    minWidth: column.minWidth,
    width: column.shrink ? 1 : null,
  }),
}));

export default function MUITableFooterCell({ column, filteredData, lastCol }) {
  const classes = useStyles({ column, lastCol });

  return (
    <TableCell {...column.props} className={classnames(column.noWrap && classes.tableCellNoWrap)} align={column.align}>
      {typeof column.Footer === 'function' ? column.Footer(filteredData, column) : <></>}
    </TableCell>
  );
}
