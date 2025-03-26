export const useBaseEditor = ({
  baseEditor,
  onSubmit,
}: {
  baseEditor: Ref;
  onSubmit?: () => void;
}) => {
  const { meta, ctrl, enter } = useMagicKeys();

  function openBaseEditorFileDialog() {
    baseEditor.value.openFileDialog();
  }

  watch(
    [meta, ctrl, enter],
    ([isMetaPressed, isCtrlPressed, isEnterPressed]) => {
      if (isEnterPressed && (isMetaPressed || isCtrlPressed)) {
        onSubmit?.();
      }
    }
  );

  return {
    openBaseEditorFileDialog,
  };
};
