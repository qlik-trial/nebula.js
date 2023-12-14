const fixture = {
  instanceConfig: {
    context: {
      theme: 'theme-tarallo',
    },
  },
  getLayout: () => ({
    title: 'Field title',
    qInfo: {
      qId: 'qId',
    },
    visualization: 'listbox',
    qListObject: {
      qDimensionInfo: {
        qLocked: false,
      },
      qSize: {
        qcy: 5,
      },
      qInitialDataFetch: [{ qLeft: 0, qWidth: 0, qTop: 0, qHeight: 0 }],
    },
    qSelectionInfo: {
      qInSelections: false,
    },
    layoutOptions: {
      layoutOrder: 'row',
    },
  }),
  getListObjectData: () => [
    {
      qMatrix: [
        [
          {
            qText: 'Selected',
            qNum: 'NaN',
            qElemNumber: 0,
            qState: 'S',
          },
        ],
        [
          {
            qText: 'Alternative',
            qNum: 'NaN',
            qElemNumber: 1,
            qState: 'A',
          },
        ],
        [
          {
            qText: 'Optional',
            qNum: 'NaN',
            qElemNumber: 2,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Selected Excluded',
            qNum: 'NaN',
            qElemNumber: 3,
            qState: 'XS',
          },
        ],
        [
          {
            qText: 'Excluded',
            qNum: 'NaN',
            qElemNumber: 4,
            qState: 'X',
          },
        ],
      ],
      qTails: [],
      qArea: {
        qLeft: 0,
        qTop: 0,
        qWidth: 1,
        qHeight: 5,
      },
    },
  ],
};

export default fixture;
