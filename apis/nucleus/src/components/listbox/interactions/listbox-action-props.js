export default function getListboxActionProps({
  isDetached,
  showToolbar,
  containerRef,
  isLocked,
  listboxSelectionToolbarItems,
  extraItems,
  selections,
  keyboard,
  autoConfirm,
}) {
  return {
    autoConfirm,
    isDetached,
    show: showToolbar && !isDetached,
    popover: {
      show: showToolbar && isDetached,
      anchorEl: containerRef.current,
    },
    extraItems,
    more: {
      enabled: !isLocked && (showToolbar || selections.isActive()), // show more button even when popover is not in selection mode
      actions: listboxSelectionToolbarItems,
      popoverProps: {
        elevation: 0,
      },
      popoverPaperStyle: {
        boxShadow: '0 12px 8px -8px rgba(0, 0, 0, 0.2)',
        minWidth: '250px',
      },
    },
    selections: {
      show: showToolbar && selections.isActive(),
      api: selections,
      onConfirm: () => {
        keyboard?.focus();
      },
      onCancel: () => {
        keyboard?.focus();
      },
    },
  };
}
