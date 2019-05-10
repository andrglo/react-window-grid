import React, {useRef, useState, useLayoutEffect, useMemo} from 'react'
import PropTypes from 'prop-types'
import {VariableSizeList, VariableSizeGrid} from 'react-window'
import scrollbarSize from 'dom-helpers/util/scrollbarSize'

const noPivot = {rowIndex: -1, columnIndex: -1}
const flex = {
  display: 'flex'
}

const renderColumnHeader = params => {
  const {
    index,
    style,
    data: {columns, render, pivot, setPivot}
  } = params
  const column = columns[index]
  return (
    <div
      style={style}
      onMouseEnter={
        setPivot && (() => setPivot({rowIndex: -1, columnIndex: index}))
      }
      onMouseLeave={setPivot && (() => setPivot(noPivot))}
    >
      {render
        ? render({
            columnIndex: index,
            label: column.label,
            id: column.id,
            column,
            pivot
          })
        : columns[index].label || columns[index].id || ''}
    </div>
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
    overscanCount,
    pivot,
    setPivot,
    style,
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
      itemData={{columns, render, pivot, setPivot}}
      overscanCount={overscanCount}
      style={{...style, overflow: 'hidden'}}
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
  overscanCount: PropTypes.number,
  pivot: PropTypes.object.isRequired,
  setPivot: PropTypes.func,
  style: PropTypes.object.isRequired
}

const renderRowHeader = params => {
  const {
    index,
    style,
    data: {render, pivot, setPivot}
  } = params
  return (
    <div
      style={style}
      onMouseEnter={
        setPivot && (() => setPivot({rowIndex: index, columnIndex: -1}))
      }
      onMouseLeave={setPivot && (() => setPivot(noPivot))}
    >
      {render
        ? render({
            rowIndex: index,
            pivot
          })
        : index + 1}
    </div>
  )
}

const RowHeader = props => {
  const {
    height,
    width,
    itemCount,
    itemSize,
    render,
    rowHeaderRef,
    overscanCount,
    pivot,
    setPivot,
    ...rest
  } = props
  return (
    <VariableSizeList
      ref={rowHeaderRef}
      height={height}
      width={width}
      itemCount={itemCount}
      itemSize={itemSize}
      itemData={{render, pivot, setPivot}}
      overscanCount={overscanCount}
      style={{overflow: 'hidden'}}
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
  overscanCount: PropTypes.number,
  pivot: PropTypes.object.isRequired,
  setPivot: PropTypes.func
}

const calcColumnSize = (value, column, textContext) => {
  let columnHeight = column.height
  let columnWidth = column.width
  if (columnHeight && columnWidth) {
    return [columnHeight, columnWidth]
  }
  if (!textContext) {
    return [0, 0]
  }
  const text = String(value)
  const label = column.label || ''
  const metrics = textContext.measureText(
    text.length > label.length ? text : column.label
  )
  const padding = 8
  const valueWidth = metrics.width
  const fontSize = parseFloat(textContext.font)
  if (typeof value !== 'string') {
    return [
      fontSize + padding,
      column.width || (columnWidth || valueWidth) + padding
    ]
  }
  if (!columnWidth) {
    const words = value.split(' ').length
    columnWidth =
      words > 5 /* A sentence?  */ ? Math.round(valueWidth / 2) : valueWidth
  }
  if (columnWidth >= valueWidth) {
    return [fontSize, column.width || valueWidth + padding]
  }
  const lines = Math.round(valueWidth / columnWidth)
  columnHeight = lines * fontSize // approx.
  if (column.maxHeight && columnHeight > column.maxHeight) {
    return [column.maxHeight, column.width || columnWidth + padding]
  }
  const paddingBottom = padding + fontSize
  return [columnHeight + paddingBottom, column.width || columnWidth + padding]
}

const renderCell = params => {
  let {
    columnIndex,
    rowIndex,
    style,
    data: {
      recordset,
      footerIndex,
      width,
      columns,
      Footer,
      render,
      pivot,
      setPivot
    }
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
  const record = recordset[rowIndex]
  const value = (record || {})[columns[columnIndex].id]
  if (!render) {
    style = {...style, overflow: 'hidden', textOverflow: 'ellipsis'}
  }
  return (
    <div
      style={style}
      onMouseEnter={setPivot && (() => setPivot({rowIndex, columnIndex}))}
      onMouseLeave={setPivot && (() => setPivot(noPivot))}
    >
      {render
        ? render({
            value,
            rowIndex,
            columnIndex,
            record,
            pivot,
            column: columns[columnIndex]
          })
        : value || ''}
    </div>
  )
}

const ReactWindowGrid = props => {
  // console.log('ReactWindowGrid', props)
  let {
    height,
    width,
    recordset,
    footer: Footer,
    columns,
    headerHeight,
    headerRenderer,
    cellRenderer,
    rowHeaderRenderer,
    rowHeaderWidth = 0,
    overscanColumnsCount,
    overscanRowsCount,
    headerProps,
    rowHeaderProps,
    bodyProps,
    maxHeight,
    gridRef,
    scrollToTopOnNewRecordset,
    borderHeight = 0,
    enablePivot,
    ...rest
  } = props
  const [font, setFont] = useState(0)
  const [textContext, setTextContex] = useState(null)
  useLayoutEffect(() => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    context.font = font
    setTextContex(context)
  }, [font])
  const [rowHeights, columnWidths, totalHeight] = useMemo(() => {
    const rowHeights = []
    const columnWidths = []
    let totalHeight = 0
    for (const record of recordset) {
      let recordRowHeight = 0
      let i = 0
      for (const column of columns) {
        const value = record[column.id]
        const [columnHeight, columnWidth] = calcColumnSize(
          value,
          column,
          textContext
        )
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
    return [rowHeights, columnWidths, totalHeight]
  }, [recordset, columns, textContext])

  const getRowHeight = i => rowHeights[i] || 0
  const mayBeRef = useRef(null)
  if (!gridRef) {
    gridRef = mayBeRef
  }
  const outerRef = useRef(null)
  const headerRef = useRef(null)
  const rowHeaderRef = useRef(null)

  let [pivot, setPivot] = useState(noPivot)
  if (!enablePivot) {
    pivot = noPivot
    setPivot = undefined
  }

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

  const [finalWidth, setFinalWidth] = useState(0)
  const [hasVerticalScrollBar, setHasVerticalScrollBar] = useState(false)
  const [hasHorizontalScrollBar, setHasHorizontalScrollBar] = useState(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const hasHorizontal =
      outerRef.current.scrollWidth > outerRef.current.offsetWidth
    const hasVertical =
      outerRef.current.scrollHeight > outerRef.current.offsetHeight
    if (hasHorizontal !== hasHorizontalScrollBar) {
      setHasHorizontalScrollBar(hasHorizontal)
    }
    if (hasVertical !== hasVerticalScrollBar) {
      setHasVerticalScrollBar(hasVertical)
    }
    if (finalWidth !== outerRef.current.offsetWidth) {
      setFinalWidth(outerRef.current.offsetWidth)
    }
    setFont(
      window.getComputedStyle(outerRef.current, null).getPropertyValue('font')
    )
  })

  const footerIndex = Footer ? recordset.length : -1
  const rowCount = recordset.length + (Footer ? 1 : 0)
  const hasRowHeader = rowHeaderWidth > 0
  width -= rowHeaderWidth
  const columnsWidth = columns.reduce((w, c) => w + c.width, 0)
  let widthIsNotEnough = width < columnsWidth
  headerHeight =
    headerHeight || (textContext ? parseFloat(textContext.font) : 0)
  if (height === undefined) {
    height = headerHeight + totalHeight + borderHeight
    if (hasHorizontalScrollBar || widthIsNotEnough) {
      height += scrollbarSize()
    }
  }
  let heightIsNotEnough
  if (height > maxHeight) {
    height = maxHeight
    heightIsNotEnough = true
    if (width < columnsWidth + scrollbarSize()) {
      widthIsNotEnough = true
    }
  }
  useLayoutEffect(() => {
    headerRef.current.resetAfterIndex(0)
    gridRef.current.resetAfterColumnIndex(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, rowHeights, columnWidths])
  const getColumnWidth = i => columnWidths[i]
  width =
    width - (hasVerticalScrollBar || heightIsNotEnough ? scrollbarSize() : 0)
  const headerMarginRight =
    hasVerticalScrollBar || heightIsNotEnough ? scrollbarSize() : 0
  return (
    <div {...rest}>
      <div style={flex}>
        {hasRowHeader && <div style={{width: rowHeaderWidth}} />}
        <ColumnHeader
          headerRef={headerRef}
          height={headerHeight}
          width={width - headerMarginRight}
          itemCount={columns.length}
          itemSize={getColumnWidth}
          render={headerRenderer}
          columns={columns}
          overscanCount={overscanColumnsCount}
          pivot={pivot}
          setPivot={setPivot}
          style={{
            marginRight: headerMarginRight
          }}
          {...headerProps}
        />
      </div>
      <div style={flex}>
        {hasRowHeader && (
          <RowHeader
            rowHeaderRef={rowHeaderRef}
            height={
              height -
              headerHeight -
              (hasHorizontalScrollBar || widthIsNotEnough ? scrollbarSize() : 0)
            }
            width={rowHeaderWidth}
            itemCount={recordset.length}
            itemSize={getRowHeight}
            render={rowHeaderRenderer}
            overscanCount={overscanRowsCount}
            pivot={pivot}
            setPivot={setPivot}
            {...rowHeaderProps}
          />
        )}
        <VariableSizeGrid
          ref={gridRef}
          outerRef={outerRef}
          height={height - headerHeight + borderHeight}
          width={width}
          rowCount={rowCount}
          rowHeight={getRowHeight}
          columnCount={columns.length}
          columnWidth={getColumnWidth}
          onScroll={onScroll}
          overscanColumnsCount={overscanColumnsCount}
          overscanRowsCount={overscanRowsCount}
          itemData={{
            recordset,
            footerIndex,
            width:
              finalWidth -
              (hasVerticalScrollBar || heightIsNotEnough ? scrollbarSize() : 0),
            columns,
            Footer,
            pivot,
            setPivot,
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
  footer: PropTypes.func,
  headerRenderer: PropTypes.func,
  cellRenderer: PropTypes.func,
  rowHeaderRenderer: PropTypes.func,
  rowHeaderWidth: PropTypes.number,
  headerHeight: PropTypes.number,
  borderHeight: PropTypes.number,
  overscanColumnsCount: PropTypes.number,
  overscanRowsCount: PropTypes.number,
  headerProps: PropTypes.object,
  rowHeaderProps: PropTypes.object,
  bodyProps: PropTypes.object,
  gridRef: PropTypes.object,
  style: PropTypes.object,
  scrollToTopOnNewRecordset: PropTypes.bool,
  enablePivot: PropTypes.bool // too slow, avoid using
}

export default ReactWindowGrid
