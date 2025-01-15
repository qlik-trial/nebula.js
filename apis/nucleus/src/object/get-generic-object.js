import init from './initiate';
import initSheet from './initiate-sheet';
import createNavigationApi from './navigation/navigation';

export default async function getObject(
  { id, options, plugins, element, onRender, onError, navigation: inputNavigation },
  halo,
  store
) {
  const { modelStore, rpcRequestModelStore } = store;
  const key = `${id}`;
  let rpc = rpcRequestModelStore.get(key);
  if (!rpc) {
    rpc = halo.app.getObject(id);
    rpcRequestModelStore.set(key, rpc);
  }
  const model = await rpc;
  modelStore.set(key, model);
  const navigation =
    inputNavigation || (model.genericType === 'sheet' ? createNavigationApi(halo, store, model) : undefined);
  if (model.genericType === 'sheet') {
    return initSheet(model, { options, plugins, element }, halo, navigation);
  }

  return init(model, { options, plugins, element, onRender, onError }, halo, navigation);
}
