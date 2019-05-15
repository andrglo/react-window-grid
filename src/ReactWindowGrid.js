import React, {useRef, useState, useLayoutEffect, useMemo} from 'react'
import PropTypes from 'prop-types'
import {VariableSizeList, VariableSizeGrid} from 'react-window'
import scrollbarSize from 'dom-helpers/util/scrollbarSize'

const absolute = 'absolute'

const getText = value => String(value === undefined ? '' : value)

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
  const text = getText(value)
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
      (column.width || valueWidth) + columnHorizontalPadding
    ]
  }
  const lines = Math.ceil(valueWidth / columnWidth)
  columnHeight = lines * lineHeight
  if (column.maxHeight && columnHeight > column.maxHeight) {
    return [
      column.maxHeight,
      (column.width || columnWidth) + columnHorizontalPadding
    ]
  }
  return [
    columnHeight + columnVerticalPadding,
    (column.width || columnWidth) + columnHorizontalPadding
  ]
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
    verticalPadding,
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
    height = requiredHeight + verticalPadding
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
    <div {...rest} style={{...style, width, position: 'relative', height}}>
      <div style={{position: absolute, top: 0, left: rowHeaderWidth}}>
        <VariableSizeList
          ref={headerRef}
          layout="horizontal"
          height={columnHeaderHeight}
          width={gridWidth - headerMarginRight}
          itemCount={columns.length}
          itemSize={getColumnWidth}
          {...columnHeaderProps}
          style={{
            overflow: 'hidden',
            ...((columnHeaderProps && columnHeaderProps.style) || {})
          }}
        >
          {({style, index}) =>
            columnHeaderRenderer ? (
              columnHeaderRenderer({columnIndex: index, style})
            ) : (
              <div style={style}>
                {columns[index].label || columns[index].id || ''}
              </div>
            )
          }
        </VariableSizeList>
      </div>
      {hasRowHeader && (
        <div style={{position: absolute, left: 0, top: columnHeaderHeight}}>
          <VariableSizeList
            ref={rowHeaderRef}
            height={height - columnHeaderHeight - columnHeaderMarginBottom}
            width={rowHeaderWidth}
            itemCount={recordset.length}
            itemSize={getRowHeight}
            {...rowHeaderProps}
            style={{
              overflow: 'hidden',
              ...((rowHeaderProps && rowHeaderProps.style) || {})
            }}
          >
            {({style, index}) =>
              rowHeaderRenderer ? (
                rowHeaderRenderer({
                  rowIndex: index,
                  style
                })
              ) : (
                <div style={style}>{index + 1}</div>
              )
            }
          </VariableSizeList>
        </div>
      )}
      <div
        style={{
          position: absolute,
          left: rowHeaderWidth,
          top: columnHeaderHeight
        }}
      >
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
          {...bodyProps}
        >
          {({columnIndex, rowIndex, style}) => {
            if (footerIndex === rowIndex) {
              if (columnIndex === 0) {
                style = {...style, width: measuredWidth - headerMarginRight}
                return (
                  <div style={style}>
                    <Footer />
                  </div>
                )
              }
              return null
            }
            if (cellRenderer) {
              return cellRenderer({
                rowIndex,
                columnIndex,
                style
              })
            }
            const record = recordset[rowIndex]
            const value = (record || {})[columns[columnIndex].id]
            style = {...style, overflow: 'hidden', textOverflow: 'ellipsis'}
            return <div style={style}>{getText(value)}</div>
          }}
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
  verticalPadding: PropTypes.number,
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
  columnVerticalPadding: 0,
  verticalPadding: 0
}

export default ReactWindowGrid
