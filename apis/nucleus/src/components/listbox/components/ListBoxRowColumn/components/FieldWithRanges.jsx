import React from 'react';
import CheckboxField from './CheckboxField';
import ValueField from './ValueField';

function LabelsWithRanges({ labels, dense, showGray, checkboxes }) {
  return (
    <>
      {labels.map(([label, highlighted], index) => {
        const key = `${index}`;
        return (
          <ValueField
            label={label}
            key={key}
            highlighted={highlighted}
            dense={dense}
            showGray={showGray}
            checkboxes={checkboxes}
          />
        );
      })}
    </>
  );
}

function FieldWithRanges({
  labels,
  checkboxes,
  dense,
  showGray,
  color,
  qElemNumber,
  isSelected,
  cell,
  isGridCol,
  isSingleSelect,
  valueTextAlign,
}) {
  const LWR = <LabelsWithRanges labels={labels} dense={dense} showGray={showGray} checkboxes={checkboxes} />;
  return checkboxes ? (
    <CheckboxField
      label={LWR}
      color={color}
      qElemNumber={qElemNumber}
      isSelected={isSelected}
      dense={dense}
      cell={cell}
      isGridCol={isGridCol}
      showGray={showGray}
      isSingleSelect={isSingleSelect}
      checkboxes={checkboxes}
      valueTextAlign={valueTextAlign}
    />
  ) : (
    LWR
  );
}

export default FieldWithRanges;
