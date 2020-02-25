import createKeyStore from './createKeyStore';

const [useAppSelectionsStore, appSelectionsStore] = createKeyStore({});
const [useAppModalStore, appModalStore] = createKeyStore({});
const [useObjectSelectionsStore, objectSelectionsStore] = createKeyStore({});
const [useModalObjectStore, modalObjectStore] = createKeyStore({});

export {
  useAppSelectionsStore,
  useAppModalStore,
  useObjectSelectionsStore,
  appSelectionsStore,
  appModalStore,
  objectSelectionsStore,
  useModalObjectStore,
  modalObjectStore,
};
