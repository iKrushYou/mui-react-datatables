import React, { useState } from 'react';

export default function useMergeState(initialState) {
  const [state, setState] = useState(initialState);

  const updater = update => {
    if (update === null) return;
    if (typeof update === 'function') {
      setState(state => {
        const nextState = update(state);
        return nextState == null ? state : { ...state, ...nextState };
      });
    } else {
      setState(state => ({ ...state, ...update }));
    }
  };

  return [state, updater];
}
