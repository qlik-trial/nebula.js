const scenarios = {};

scenarios['invalid-type'] = {
  name: 'Invalid type',
  genericObject: {
    getLayout() {
      return {
        qInfo: {
          qId: 'bb8',
        },
        visualization: 'voooz',
      };
    },
  },
};

scenarios['valid-type'] = {
  name: 'Valid type',
  genericObject: {
    getLayout() {
      return {
        qInfo: {
          qId: 'bb8',
          qType: 'doesnt matter',
        },
        qMeta: {
          privileges: ['read', 'update', 'delete', 'exportdata'],
        },
        qSelectionInfo: {},
        visualization: 'my-chart',
      };
    },
    getProperties() {
      return {};
    },
  },
};

scenarios['long-running'] = {
  name: 'Long running query',
  options: {
    delay: 5000,
  },
  genericObject: {
    session: {
      getObjectApi() {
        return {
          cancelRequest() {
            return {};
          },
        };
      },
    },
    getLayout() {
      return {
        qInfo: {
          qId: 'bb8',
          qType: 'doesnt matter',
        },
        qMeta: {
          privileges: ['read', 'update', 'delete', 'exportdata'],
        },
        qSelectionInfo: {},
        visualization: 'my-chart',
        qHyperCube: {
          qSize: {
            qcx: 2,
            qcy: 1,
          },
          qDimensionInfo: [
            {
              qFallbackTitle: '=a',
              qApprMaxGlyphCount: 1,
              qCardinal: 0,
              qSortIndicator: 'N',
              qGroupFallbackTitles: ['=a'],
              qGroupPos: 0,
              qStateCounts: {
                qLocked: 0,
                qSelected: 0,
                qOption: 0,
                qDeselected: 0,
                qAlternative: 0,
                qExcluded: 0,
                qSelectedExcluded: 0,
                qLockedExcluded: 0,
              },
              qTags: [],
              qDimensionType: 'D',
              qGrouping: 'N',
              qNumFormat: {
                qType: 'U',
                qnDec: 0,
                qUseThou: 0,
              },
              qIsAutoFormat: true,
              qGroupFieldDefs: ['=a'],
              qMin: 'NaN',
              qMax: 'NaN',
              qAttrExprInfo: [],
              qAttrDimInfo: [],
              qIsCalculated: true,
              qCardinalities: {
                qCardinal: 0,
                qHypercubeCardinal: 1,
                qAllValuesCardinal: -1,
              },
            },
          ],
          qMeasureInfo: [
            {
              qFallbackTitle: '=1',
              qApprMaxGlyphCount: 1,
              qCardinal: 0,
              qSortIndicator: 'N',
              qNumFormat: {
                qType: 'U',
                qnDec: 0,
                qUseThou: 0,
              },
              qMin: 1,
              qMax: 1,
              qIsAutoFormat: true,
              qAttrExprInfo: [],
              qAttrDimInfo: [],
              qTrendLines: [],
            },
          ],
          qEffectiveInterColumnSortOrder: [0, 1],
          qGrandTotalRow: [
            {
              qText: '1',
              qNum: 1,
              qElemNumber: -1,
              qState: 'X',
              qIsTotalCell: true,
            },
          ],
          qDataPages: [],
          qPivotDataPages: [],
          qStackedDataPages: [],
          qMode: 'S',
          qNoOfLeftDims: -1,
          qTreeNodesOnDim: [],
          qColumnOrder: [],
        },
      };
    },
    getProperties() {
      return {};
    },
  },
};

scenarios['calc-unfulfilled'] = {
  name: 'Calculations unfulfilled',
  genericObject: {
    getLayout() {
      return {
        qInfo: {
          qId: 'bb8',
          qType: 'doesnt matter',
        },
        qMeta: {
          privileges: ['read', 'update', 'delete', 'exportdata'],
        },
        qSelectionInfo: {},
        visualization: 'my-chart',
        qHyperCube: {
          qSize: {
            qcx: 0,
            qcy: 0,
          },
          qDimensionInfo: [
            {
              qFallbackTitle: '=a',
              qApprMaxGlyphCount: 0,
              qCardinal: 0,
              qSortIndicator: 'N',
              qGroupFallbackTitles: ['=a'],
              qGroupPos: 0,
              qStateCounts: {
                qLocked: 0,
                qSelected: 0,
                qOption: 0,
                qDeselected: 0,
                qAlternative: 0,
                qExcluded: 0,
                qSelectedExcluded: 0,
                qLockedExcluded: 0,
              },
              qTags: [],
              qError: {
                qErrorCode: 7014,
              },
              qDimensionType: 'D',
              qGrouping: 'N',
              qNumFormat: {
                qType: 'U',
                qnDec: 10,
                qUseThou: 0,
              },
              qGroupFieldDefs: ['=a'],
              qMin: 0,
              qMax: 0,
              qAttrExprInfo: [],
              qAttrDimInfo: [],
              qCardinalities: {
                qCardinal: 0,
                qHypercubeCardinal: 0,
                qAllValuesCardinal: -1,
              },
            },
          ],
          qMeasureInfo: [
            {
              qFallbackTitle: '=1',
              qApprMaxGlyphCount: 0,
              qCardinal: 0,
              qSortIndicator: 'N',
              qNumFormat: {
                qType: 'U',
                qnDec: 10,
                qUseThou: 0,
              },
              qMin: 0,
              qMax: 0,
              qAttrExprInfo: [],
              qAttrDimInfo: [],
              qTrendLines: [],
            },
          ],
          qEffectiveInterColumnSortOrder: [1],
          qGrandTotalRow: [],
          qDataPages: [],
          qPivotDataPages: [],
          qStackedDataPages: [],
          qMode: 'S',
          qNoOfLeftDims: -1,
          qTreeNodesOnDim: [],
          qColumnOrder: [],
          qError: {
            qErrorCode: 7005,
          },
        },
      };
    },
    getProperties() {
      return {};
    },
  },
};

scenarios['hypercube-error'] = {
  name: 'Hypercube error',
  genericObject: {
    getLayout() {
      return {
        qInfo: {
          qId: 'bb8',
          qType: 'doesnt matter',
        },
        qMeta: {
          privileges: ['read', 'update', 'delete', 'exportdata'],
        },
        qSelectionInfo: {},
        visualization: 'my-chart',
        qHyperCube: {
          qSize: {
            qcx: 1,
            qcy: 1,
          },
          qDimensionInfo: [],
          qMeasureInfo: [
            {
              qApprMaxGlyphCount: 1,
              qCardinal: 0,
              qSortIndicator: 'N',
              qNumFormat: {
                qType: 'U',
                qnDec: 0,
                qUseThou: 0,
              },
              qMin: 'NaN',
              qMax: 'NaN',
              qIsAutoFormat: true,
              qAttrExprInfo: [],
              qAttrDimInfo: [],
              qTrendLines: [],
            },
          ],
          qEffectiveInterColumnSortOrder: [0],
          qGrandTotalRow: [
            {
              qText: '-',
              qNum: 'NaN',
              qElemNumber: -1,
              qState: 'X',
              qIsTotalCell: true,
            },
          ],
          qDataPages: [],
          qPivotDataPages: [],
          qStackedDataPages: [],
          qMode: 'S',
          qNoOfLeftDims: -1,
          qTreeNodesOnDim: [],
          qColumnOrder: [],
          qError: {
            qErrorCode: 7008,
          },
        },
      };
    },
    getProperties() {
      return {};
    },
  },
};

scenarios['valid-config'] = {
  name: 'Valid config',
  genericObject: {
    getLayout() {
      return {
        qInfo: {
          qId: 'bb8',
          qType: 'doesnt matter',
        },
        qMeta: {
          privileges: ['read', 'update', 'delete', 'exportdata'],
        },
        qSelectionInfo: {},
        visualization: 'my-chart',
        qHyperCube: {
          qSize: {
            qcx: 2,
            qcy: 1,
          },
          qDimensionInfo: [
            {
              qFallbackTitle: '=a',
              qApprMaxGlyphCount: 1,
              qCardinal: 0,
              qSortIndicator: 'N',
              qGroupFallbackTitles: ['=a'],
              qGroupPos: 0,
              qStateCounts: {
                qLocked: 0,
                qSelected: 0,
                qOption: 0,
                qDeselected: 0,
                qAlternative: 0,
                qExcluded: 0,
                qSelectedExcluded: 0,
                qLockedExcluded: 0,
              },
              qTags: [],
              qDimensionType: 'D',
              qGrouping: 'N',
              qNumFormat: {
                qType: 'U',
                qnDec: 0,
                qUseThou: 0,
              },
              qIsAutoFormat: true,
              qGroupFieldDefs: ['=a'],
              qMin: 'NaN',
              qMax: 'NaN',
              qAttrExprInfo: [],
              qAttrDimInfo: [],
              qIsCalculated: true,
              qCardinalities: {
                qCardinal: 0,
                qHypercubeCardinal: 1,
                qAllValuesCardinal: -1,
              },
            },
          ],
          qMeasureInfo: [
            {
              qFallbackTitle: '=1',
              qApprMaxGlyphCount: 1,
              qCardinal: 0,
              qSortIndicator: 'N',
              qNumFormat: {
                qType: 'U',
                qnDec: 0,
                qUseThou: 0,
              },
              qMin: 1,
              qMax: 1,
              qIsAutoFormat: true,
              qAttrExprInfo: [],
              qAttrDimInfo: [],
              qTrendLines: [],
            },
          ],
          qEffectiveInterColumnSortOrder: [0, 1],
          qGrandTotalRow: [
            {
              qText: '1',
              qNum: 1,
              qElemNumber: -1,
              qState: 'X',
              qIsTotalCell: true,
            },
          ],
          qDataPages: [],
          qPivotDataPages: [],
          qStackedDataPages: [],
          qMode: 'S',
          qNoOfLeftDims: -1,
          qTreeNodesOnDim: [],
          qColumnOrder: [],
        },
      };
    },
    getProperties() {
      return {};
    },
  },
};

scenarios.destroy = {
  name: 'Destroy',
  genericObject: {
    getLayout() {
      return {
        qInfo: {
          qId: 'bb8',
          qType: 'doesnt matter',
        },
        qMeta: {
          privileges: ['read', 'update', 'delete', 'exportdata'],
        },
        qSelectionInfo: {},
        visualization: 'my-chart',
        qHyperCube: {
          qSize: {
            qcx: 2,
            qcy: 1,
          },
          qDimensionInfo: [
            {
              qFallbackTitle: '=a',
              qApprMaxGlyphCount: 1,
              qCardinal: 0,
              qSortIndicator: 'N',
              qGroupFallbackTitles: ['=a'],
              qGroupPos: 0,
              qStateCounts: {
                qLocked: 0,
                qSelected: 0,
                qOption: 0,
                qDeselected: 0,
                qAlternative: 0,
                qExcluded: 0,
                qSelectedExcluded: 0,
                qLockedExcluded: 0,
              },
              qTags: [],
              qDimensionType: 'D',
              qGrouping: 'N',
              qNumFormat: {
                qType: 'U',
                qnDec: 0,
                qUseThou: 0,
              },
              qIsAutoFormat: true,
              qGroupFieldDefs: ['=a'],
              qMin: 'NaN',
              qMax: 'NaN',
              qAttrExprInfo: [],
              qAttrDimInfo: [],
              qIsCalculated: true,
              qCardinalities: {
                qCardinal: 0,
                qHypercubeCardinal: 1,
                qAllValuesCardinal: -1,
              },
            },
          ],
          qMeasureInfo: [
            {
              qFallbackTitle: '=1',
              qApprMaxGlyphCount: 1,
              qCardinal: 0,
              qSortIndicator: 'N',
              qNumFormat: {
                qType: 'U',
                qnDec: 0,
                qUseThou: 0,
              },
              qMin: 1,
              qMax: 1,
              qIsAutoFormat: true,
              qAttrExprInfo: [],
              qAttrDimInfo: [],
              qTrendLines: [],
            },
          ],
          qEffectiveInterColumnSortOrder: [0, 1],
          qGrandTotalRow: [
            {
              qText: '1',
              qNum: 1,
              qElemNumber: -1,
              qState: 'X',
              qIsTotalCell: true,
            },
          ],
          qDataPages: [],
          qPivotDataPages: [],
          qStackedDataPages: [],
          qMode: 'S',
          qNoOfLeftDims: -1,
          qTreeNodesOnDim: [],
          qColumnOrder: [],
        },
      };
    },
    getProperties() {
      return {};
    },
    removeListener() {
      return {};
    },
  },
  post: (viz) => {
    window.setTimeout(() => viz.destroy(), 500);
  },
};

const { useElement, useLayout, embed, EnigmaMocker } = window.stardust;

const chart = {
  qae: {
    data: {
      targets: [
        {
          path: '/qHyperCubeDef',
          dimensions: { min: 1, description: () => 'Some dimension' },
          measures: { min: 1 },
        },
      ],
    },
  },
  component() {
    const element = useElement();
    const layout = useLayout();

    element.innerHTML = `
    <div>
      <div class="rendered">Success!</div>
      <div class="pages">${layout.qHyperCube.qDataPages[0] && layout.qHyperCube.qDataPages[0].qMatrix[0][1].qText}</div>
    </div>
    `;
  },
};

const configuration = embed.createConfiguration({
  types: [
    {
      name: 'my-chart',
      load: () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(chart), 1500);
        }),
    },
  ],
});

function getScenario() {
  const queryParams = new URLSearchParams(window.location.search);
  const id = queryParams.get('scenario');
  const scenario = scenarios[id];

  if (!scenario) {
    throw new Error(`No scenario with id "${id}" found`);
  }

  return scenario;
}

async function render() {
  const scenario = getScenario();
  const app = await EnigmaMocker.fromGenericObjects([scenario.genericObject], scenario.options);
  const element = document.querySelector('.viz');
  const viz = await configuration(app).render({
    element,
    id: 'bb8',
    onError: (e) => {
      console.log(e);
      const errorElement = document.querySelector('.errors');
      errorElement.textContent = e.message;
    },
  });

  if (typeof scenario.post === 'function') {
    scenario.post(viz);
  }
}

function addButtons() {
  const actionsElement = document.querySelector('.actions');

  Object.entries(scenarios).forEach(([id, scenario]) => {
    const btn = document.createElement('button');
    btn.textContent = scenario.name;
    btn.addEventListener('click', () => {
      window.location = `/visualize/life.html?scenario=${id}`;
    });
    actionsElement.appendChild(btn);
  });
}

window.addEventListener('load', render);
window.addEventListener('load', addButtons);
