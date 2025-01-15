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
  disablePortal,
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
      enabled: !isLocked,
      actions: listboxSelectionToolbarItems,
      popoverProps: {
        elevation: 0,
      },
      popoverPaperStyle: {
        boxShadow: '0 12px 8px -8px rgba(0, 0, 0, 0.2)',
        minWidth: '250px',
      },
      disablePortal,
    },
    selections: {
      show: showToolbar,
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
