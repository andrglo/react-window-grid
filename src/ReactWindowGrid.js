import React, {useRef, useState, useLayoutEffect, useMemo} from 'react'
import PropTypes from 'prop-types'
import {VariableSizeList, VariableSizeGrid} from 'react-window'
import scrollbarSize from 'dom-helpers/util/scrollbarSize'

const flex = {
  display: 'flex'
}

const renderColumnHeader = params => {
  const {
    index,
    style,
    data: {columns, render}
  } = params
  if (render) {
    return render({columnIndex: index, style})
  }
  return (
    <div style={style}>{columns[index].label || columns[index].id || ''}</div>
  )
}

const ColumnHeader = props => {
  const {
    height,
    itemCount,
    itemSize,
    width,
    columns,
    render,
    headerRef,
    style = {},
    ...rest
  } = props
  useLayoutEffect(() => {
    headerRef.current.resetAfterIndex(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns])
  return (
    <VariableSizeList
      ref={headerRef}
      layout="horizontal"
      height={height}
      width={width}
      itemCount={itemCount}
      itemSize={itemSize}
      itemData={{columns, render}}
      style={{overflow: 'hidden', ...style}}
      {...rest}
    >
      {renderColumnHeader}
    </VariableSizeList>
  )
}

ColumnHeader.propTypes = {
  headerRef: PropTypes.object.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  itemCount: PropTypes.number.isRequired,
  itemSize: PropTypes.func.isRequired,
  render: PropTypes.func,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  style: PropTypes.object
}

const renderRowHeader = params => {
  const {
    index,
    style,
    data: {render}
  } = params
  if (render) {
    return render({
      rowIndex: index,
      style
    })
  }
  return <div style={style}>{index + 1}</div>
}

const RowHeader = props => {
  const {
    height,
    width,
    itemCount,
    itemSize,
    render,
    rowHeaderRef,
    style = {},
    ...rest
  } = props
  return (
    <VariableSizeList
      ref={rowHeaderRef}
      height={height}
      width={width}
      itemCount={itemCount}
      itemSize={itemSize}
      itemData={{render}}
      style={{overflow: 'hidden', ...style}}
      {...rest}
    >
      {renderRowHeader}
    </VariableSizeList>
  )
}

RowHeader.propTypes = {
  rowHeaderRef: PropTypes.object.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  itemCount: PropTypes.number.isRequired,
  itemSize: PropTypes.func.isRequired,
  render: PropTypes.func,
  style: PropTypes.object
}

const calcColumnSize = ({
  value,
  column,
  lineHeight,
  columnHorizontalPadding,
  columnVerticalPadding,
  textContext
}) => {
  let columnHeight = column.height
  let columnWidth = column.width
  if (columnHeight && columnWidth) {
    return [columnHeight, columnWidth]
  }
  if (!textContext) {
    return [0, 0]
  }
  const text = String(value || '')
  const label = !columnWidth ? column.label || column.id : ''
  const metrics = textContext.measureText(
    text.length > label.length ? text : label
  )
  const valueWidth = metrics.width
  if (typeof value !== 'string') {
    return [
      lineHeight + columnVerticalPadding,
      column.width || (columnWidth || valueWidth) + columnHorizontalPadding
    ]
  }
  if (!columnWidth) {
    const words = value.split(' ').length
    columnWidth =
      words > 5 /* A sentence?  */ ? Math.round(valueWidth / 2) : valueWidth
  }
  if (columnWidth >= valueWidth + columnVerticalPadding) {
    return [
      lineHeight + columnVerticalPadding,
      column.width || valueWidth + columnHorizontalPadding
    ]
  }
  const lines = 1 + Math.round(valueWidth / columnWidth)
  columnHeight = lines * lineHeight
  if (column.maxHeight && columnHeight > column.maxHeight) {
    return [
      column.maxHeight,
      column.width || columnWidth + columnHorizontalPadding
    ]
  }
  return [
    columnHeight + columnVerticalPadding,
    column.width || columnWidth + columnHorizontalPadding
  ]
}

const renderCell = params => {
  let {
    columnIndex,
    rowIndex,
    style,
    data: {recordset, footerIndex, width, columns, Footer, render}
  } = params
  if (footerIndex === rowIndex) {
    if (columnIndex === 0) {
      style = {...style, width}
      return (
        <div style={style}>
          <Footer />
        </div>
      )
    }
    return null
  }
  let value
  if (!render) {
    const record = recordset[rowIndex]
    value = (record || {})[columns[columnIndex].id]
    style = {...style, overflow: 'hidden', textOverflow: 'ellipsis'}
  } else {
    return render({
      rowIndex,
      columnIndex,
      style
    })
  }
  return <div style={style}>{value || ''}</div>
}

const ReactWindowGrid = props => {
  // console.log('ReactWindowGrid', props)
  let {
    height,
    width,
    recordset,
    footerRenderer: Footer,
    columns,
    columnHeaderHeight,
    columnHeaderRenderer,
    cellRenderer,
    rowHeaderRenderer,
    rowHeaderWidth = 0,
    columnHeaderProps,
    rowHeaderProps,
    bodyProps,
    maxHeight,
    gridRef,
    scrollToTopOnNewRecordset,
    lineHeight,
    style = {},
    columnHorizontalPadding,
    columnVerticalPadding,
    ...rest
  } = props
  const [font, setFont] = useState(0)
  const [textContext, setTextContex] = useState(null)
  useLayoutEffect(() => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    context.font = font
    setTextContex(context)
  }, [font, columns])

  if (!lineHeight && textContext) {
    const fontSize = parseFloat(textContext.font)
    lineHeight = fontSize + fontSize / 4
  }
  if (!columnHeaderHeight) {
    if (lineHeight) {
      columnHeaderHeight = lineHeight
    } else {
      columnHeaderHeight = 0
    }
  }

  const [rowHeights, columnWidths, totalHeight] = useMemo(() => {
    const rowHeights = []
    const columnWidths = []
    let totalHeight = 0
    const calcColumnsSize = record => {
      let recordRowHeight = 0
      let i = 0
      for (const column of columns) {
        const value = record[column.id]
        const [columnHeight, columnWidth] = calcColumnSize({
          value,
          column,
          lineHeight,
          columnHorizontalPadding,
          columnVerticalPadding,
          textContext
        })
        if (columnHeight > recordRowHeight) {
          recordRowHeight = columnHeight
        }
        if (!columnWidths[i] || columnWidth > columnWidths[i]) {
          columnWidths[i] = columnWidth
        }
        i++
      }
      rowHeights.push(recordRowHeight)
      totalHeight += recordRowHeight
    }
    if (recordset.length) {
      recordset.forEach(calcColumnsSize)
    } else {
      calcColumnsSize({})
    }
    return [rowHeights, columnWidths, totalHeight]
  }, [
    recordset,
    columns,
    lineHeight,
    columnHorizontalPadding,
    columnVerticalPadding,
    textContext
  ])

  const getRowHeight = i => rowHeights[i] || 0
  const mayBeRef = useRef(null)
  if (!gridRef) {
    gridRef = mayBeRef
  }
  const innerRef = useRef(null)
  const headerRef = useRef(null)
  const rowHeaderRef = useRef(null)

  const onScroll = params => {
    const {scrollLeft, scrollTop} = params
    headerRef.current.scrollTo(scrollLeft)
    if (rowHeaderRef.current) {
      rowHeaderRef.current.scrollTo(scrollTop)
    }
  }

  useLayoutEffect(() => {
    if (scrollToTopOnNewRecordset) {
      gridRef.current.scrollTo({scrollLeft: 0, scrollTop: 0})
    }
    gridRef.current.resetAfterRowIndex(0)
    if (rowHeaderRef.current) {
      rowHeaderRef.current.resetAfterIndex(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordset, rowHeights, columnWidths])

  const [measuredWidth, setMeasuredWidth] = useState(0)
  const [hasVerticalScrollBar, setHasVerticalScrollBar] = useState(false)
  const [hasHorizontalScrollBar, setHasHorizontalScrollBar] = useState(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const hasHorizontal =
      innerRef.current.scrollWidth > innerRef.current.offsetWidth
    const hasVertical =
      innerRef.current.scrollHeight > innerRef.current.offsetHeight
    if (hasHorizontal !== hasHorizontalScrollBar) {
      setHasHorizontalScrollBar(hasHorizontal)
    }
    if (hasVertical !== hasVerticalScrollBar) {
      setHasVerticalScrollBar(hasVertical)
    }
    if (measuredWidth !== innerRef.current.offsetWidth) {
      setMeasuredWidth(innerRef.current.offsetWidth)
    }
    setFont(
      window.getComputedStyle(innerRef.current, null).getPropertyValue('font')
    )
  })

  const footerIndex = Footer ? recordset.length : -1
  const rowCount = recordset.length + (Footer ? 1 : 0)
  const hasRowHeader = rowHeaderWidth > 0
  const gridWidth = width - rowHeaderWidth
  const columnsWidth = columnWidths.reduce((w, width) => w + width, 0)
  let widthIsNotEnough = gridWidth < columnsWidth
  let requiredHeight = columnHeaderHeight + totalHeight
  if (hasHorizontalScrollBar || widthIsNotEnough) {
    requiredHeight += scrollbarSize()
  }
  let heightIsNotEnough
  if (height === undefined) {
    height = requiredHeight + 4 /* padding case when using borders */
  } else {
    heightIsNotEnough = requiredHeight > height
  }
  if (height > maxHeight) {
    height = maxHeight
    heightIsNotEnough = true
    if (gridWidth < columnsWidth + scrollbarSize()) {
      widthIsNotEnough = true
    }
  }

  useLayoutEffect(() => {
    headerRef.current.resetAfterIndex(0)
    gridRef.current.resetAfterColumnIndex(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, rowHeights, columnWidths])
  const getColumnWidth = i => columnWidths[i] || 0
  const headerMarginRight =
    hasVerticalScrollBar || heightIsNotEnough ? scrollbarSize() : 0
  const columnHeaderMarginBottom =
    hasHorizontalScrollBar || widthIsNotEnough ? scrollbarSize() : 0
  return (
    <div {...rest} style={{...style, width}}>
      <div style={flex}>
        {hasRowHeader && <div style={{width: rowHeaderWidth}} />}
        <ColumnHeader
          headerRef={headerRef}
          height={columnHeaderHeight}
          width={gridWidth - headerMarginRight}
          itemCount={columns.length}
          itemSize={getColumnWidth}
          render={columnHeaderRenderer}
          columns={columns}
          {...columnHeaderProps}
        />
      </div>
      <div style={flex}>
        {hasRowHeader && (
          <RowHeader
            rowHeaderRef={rowHeaderRef}
            height={height - columnHeaderHeight - columnHeaderMarginBottom}
            width={rowHeaderWidth}
            itemCount={recordset.length}
            itemSize={getRowHeight}
            render={rowHeaderRenderer}
            {...rowHeaderProps}
          />
        )}
        <VariableSizeGrid
          ref={gridRef}
          innerRef={innerRef}
          height={height - columnHeaderHeight}
          width={gridWidth}
          rowCount={rowCount}
          rowHeight={getRowHeight}
          columnCount={columns.length}
          columnWidth={getColumnWidth}
          onScroll={onScroll}
          itemData={{
            recordset,
            footerIndex,
            width: measuredWidth - headerMarginRight,
            columns,
            Footer,
            render: cellRenderer
          }}
          {...bodyProps}
        >
          {renderCell}
        </VariableSizeGrid>
      </div>
    </div>
  )
}

ReactWindowGrid.propTypes = {
  height: PropTypes.number,
  maxHeight: PropTypes.number,
  width: PropTypes.number.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string,
      height: PropTypes.number,
      width: PropTypes.number
    }).isRequired
  ).isRequired,
  recordset: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  footerRenderer: PropTypes.func,
  columnHeaderRenderer: PropTypes.func,
  cellRenderer: PropTypes.func,
  rowHeaderRenderer: PropTypes.func,
  rowHeaderWidth: PropTypes.number,
  lineHeight: PropTypes.number,
  columnHorizontalPadding: PropTypes.number,
  columnVerticalPadding: PropTypes.number,
  columnHeaderHeight: PropTypes.number,
  columnHeaderProps: PropTypes.object,
  rowHeaderProps: PropTypes.object,
  bodyProps: PropTypes.object,
  gridRef: PropTypes.object,
  style: PropTypes.object,
  scrollToTopOnNewRecordset: PropTypes.bool
}

ReactWindowGrid.defaultProps = {
  columnHorizontalPadding: 0,
  columnVerticalPadding: 0
}

export default ReactWindowGrid
