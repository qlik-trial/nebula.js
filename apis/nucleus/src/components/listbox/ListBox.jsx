/* eslint no-underscore-dangle:0 */

import React, { useEffect, useState, useCallback, useRef } from 'react';

import { FixedSizeList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { makeStyles } from '@nebula.js/ui/theme';

import useLayout from '../../hooks/useLayout';

import useSelectionsInteractions from './useSelectionsInteractions';

import RowColumn from './ListBoxRowColumn';

const scrollBarThumb = '#BBB';
const scrollBarThumbHover = '#555';
const scrollBarBackground = '#f1f1f1';

const useStyles = makeStyles(() => ({
  styledScrollbars: {
    scrollbarColor: `${scrollBarThumb} ${scrollBarBackground}`,

    '&::-webkit-scrollbar': {
      width: 10,
      height: 10,
    },

    '&::-webkit-scrollbar-track': {
      backgroundColor: scrollBarBackground,
    },

    '&::-webkit-scrollbar-thumb': {
      backgroundColor: scrollBarThumb,
      borderRadius: '1rem',
    },

    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: scrollBarThumbHover,
    },
  },
}));

function getSizeInfo({ isVertical, checkboxes, dense, height }) {
  let sizeVertical = checkboxes ? 40 : 33;
  if (dense) {
    sizeVertical = 20;
  }
  const itemSize = isVertical ? sizeVertical : 200;
  const listHeight = height || 8 * itemSize;

  return {
    itemSize,
    listHeight,
  };
}

export default function ListBox({
  model,
  selections,
  direction,
  height,
  width,
  listLayout = 'vertical',
  frequencyMode = 'N',
  histogram = false,
  checkboxes = false,
  update = undefined,
  fetchStart = undefined,
  dense = false,
  keyboard = {},
  showGray = true,
  scrollState,
  sortByState,
  selectDisabled = () => false,
  filterValues = undefined,
}) {
  const [layout] = useLayout(model);
  const isSingleSelect = !!(layout && layout.qListObject.qDimensionInfo.qIsOneAndOnlyOne);
  const [pages, setPages] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const styles = useStyles();
  const {
    instantPages = [],
    interactionEvents,
    select,
  } = useSelectionsInteractions({
    layout,
    selections,
    pages,
    checkboxes,
    selectDisabled,
    doc: document,
    isSingleSelect,
  });
  const loaderRef = useRef(null);
  const local = useRef({
    queue: [],
    validPages: false,
  });

  const listData = useRef({
    pages: [],
  });

  const isItemLoaded = useCallback(
    (index) => {
      if (!pages || !local.current.validPages) {
        return false;
      }
      local.current.checkIdx = index;
      const isLoaded = (p) => p.qArea.qTop <= index && index < p.qArea.qTop + p.qArea.qHeight;
      const page = pages.filter((p) => isLoaded(p))[0];
      return page && isLoaded(page);
    },
    [layout, pages]
  );

  const applyValueFilter = (pagesToFilter, filterFunc) => {
    // After applying filter, adapt qHeight to reflect the filtered values (if any).

    let count = 0;
    const filteredPages = pagesToFilter.map((page) => {
      const { qMatrix: matrix = [], qArea } = page;
      const initialLength = matrix.length;
      const qMatrix = filterFunc(matrix || []);
      const nbrValuesRemoved = initialLength - qMatrix.length;
      count += nbrValuesRemoved;
      const qHeight = Math.max(0, qArea.qHeight - nbrValuesRemoved);
      return { ...page, qMatrix, count, qArea: { ...qArea, qHeight } };
    });
    return filteredPages;
  };

  // The time from scroll end until new data is being fetched, may be exposed in API later on.
  const SCROLL_TIMEOUT = 20;

  const loadMoreItems = useCallback(
    (startIndex, stopIndex) => {
      local.current.queue.push({
        start: startIndex,
        stop: stopIndex,
      });

      const isScrolling = loaderRef.current ? loaderRef.current._listRef.state.isScrolling : false;

      const fetchData = async () => {
        const sorted = local.current.queue.slice(-2).sort((a, b) => a.start - b.start);
        const hasSelections = true;
        const ps = sorted.map((s) => ({
          qTop: s.start,
          qHeight: s.stop - s.start + 1,
          qLeft: 0,
          qWidth: 1,
        }));
        const dataPages = hasSelections
          ? await model.getHyperCubeData('/qHyperCubeDef', ps)
          : await model.getListObjectData('/qListObjectDef', ps);
        return dataPages;
      };

      if (local.current.queue.length > 10) {
        local.current.queue.shift();
      }
      clearTimeout(local.current.timeout);
      setIsLoadingData(true);
      return new Promise((resolve) => {
        local.current.timeout = setTimeout(
          () => {
            const reqPromise = fetchData().then((p) => {
              let receivedPages = p;
              if (filterValues && p && p.length) {
                receivedPages = applyValueFilter(p, filterValues);
              }
              local.current.validPages = true;
              listData.current.pages = receivedPages;
              setPages(receivedPages);
              setIsLoadingData(false);
              resolve();
            });
            fetchStart && fetchStart(reqPromise);
          },
          isScrolling ? SCROLL_TIMEOUT : 0
        );
      });
    },
    [layout]
  );

  const fetchData = () => {
    local.current.queue = [];
    local.current.validPages = false;
    if (loaderRef.current) {
      loaderRef.current.resetloadMoreItemsCache(true);
      // Skip scrollToItem if we are in selections, or if we dont sort by state.
      if ((layout && layout.qSelectionInfo.qInSelections) || sortByState === 0) {
        return;
      }
      loaderRef.current._listRef.scrollToItem(0);
    }
  };

  if (update) {
    // Hand over the update function for manual refresh from hosting application.
    update.call(null, fetchData);
  }

  useEffect(() => {
    fetchData();
  }, [layout]);

  useEffect(() => {
    if (!instantPages || isLoadingData) {
      return;
    }
    setPages(filterValues ? applyValueFilter(instantPages, filterValues) : instantPages);
  }, [instantPages]);

  const [initScrollPosIsSet, setInitScrollPosIsSet] = useState(false);
  useEffect(() => {
    if (scrollState && !initScrollPosIsSet && loaderRef.current) {
      loaderRef.current._listRef.scrollToItem(scrollState.initScrollPos);
      setInitScrollPosIsSet(true);
    }
  }, [loaderRef.current]);

  if (!layout) {
    return null;
  }

  const count = layout.qListObject.qSize.qcy;

  const isVertical = listLayout !== 'horizontal';
  const { itemSize, listHeight } = getSizeInfo({ isVertical, checkboxes, dense, height });
  const isLocked = layout && layout.qListObject.qDimensionInfo.qLocked;
  const { frequencyMax } = layout;

  const getPagesHeight = (ps) => (ps && ps.length ? ps.reduce((h, { qArea }) => h + qArea.qHeight, 0) : 0);
  const itemCount = filterValues ? getPagesHeight(pages) : count;

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={count}
      loadMoreItems={loadMoreItems}
      threshold={0}
      minimumBatchSize={100}
      ref={loaderRef}
    >
      {({ onItemsRendered, ref }) => {
        local.current.listRef = ref;
        return (
          <FixedSizeList
            direction={direction}
            data-testid="fixed-size-list"
            useIsScrolling
            style={{}}
            height={listHeight}
            width={width}
            itemCount={itemCount}
            layout={listLayout}
            className={styles.styledScrollbars}
            itemData={{
              isLocked,
              column: !isVertical,
              pages,
              ...(isLocked || selectDisabled() ? {} : interactionEvents),
              checkboxes,
              dense,
              frequencyMode,
              isSingleSelect,
              actions: {
                select,
                confirm: () => selections && selections.confirm.call(selections),
                cancel: () => selections && selections.cancel.call(selections),
              },
              frequencyMax,
              histogram,
              keyboard,
              showGray,
            }}
            itemSize={itemSize}
            onItemsRendered={(renderProps) => {
              if (scrollState) {
                scrollState.setScrollPos(renderProps.visibleStopIndex);
              }
              onItemsRendered({ ...renderProps });
            }}
            ref={ref}
          >
            {RowColumn}
          </FixedSizeList>
        );
      }}
    </InfiniteLoader>
  );
}
