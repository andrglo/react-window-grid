import React from 'react'
import scrollbarSize from 'dom-helpers/util/scrollbarSize'

const ReactWindowGrid = props => {
  return <div>
    {`The scroll bar size is ${scrollbarSize(false)}`}
  </div>
}

export default ReactWindowGrid
