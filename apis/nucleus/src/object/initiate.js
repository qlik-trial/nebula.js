/* eslint no-underscore-dangle:0 */
import vizualizationAPI from '../viz';

export default async function init(model, optional, halo, navigation, initialError, onDestroy = async () => {}) {
  const { onRender, onError } = optional;
  const api = vizualizationAPI({
    model,
    halo,
    navigation,
    initialError,
    onDestroy,
    onRender,
    onError,
  });
  if (optional.options) {
    api.__DO_NOT_USE__.options(optional.options);
  }
  if (optional.plugins) {
    api.__DO_NOT_USE__.plugins(optional.plugins);
  }
  if (optional.element) {
    await api.__DO_NOT_USE__.mount(optional.element);
  }

  return api;
}
