import { createPortal } from 'react-dom';
import { useModalStore, ModalType } from '../core/store/useModalStore';
import { UpdateLogsModal } from '../features/UpdateLogsModal';

const MODAL_COMPONENTS: Record<ModalType, React.ComponentType<any>> = {
  [ModalType.UPDATE_LOGS]: UpdateLogsModal,
};

export function ModalRoot() {
  const modals = useModalStore(s => s.modals);
  if (modals.length === 0) return null;

  return createPortal(
    <>
      {modals.map((modal, index) => {
        const Component = MODAL_COMPONENTS[modal.id];
        if (!Component) return null;
        return <Component key={modal.id} zIndex={1000 + index * 10} {...modal.props} />;
      })}
    </>,
    document.body
  );
}
