
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

export const ModalPortal = ({ children }: { children: ReactNode }) => {
  return createPortal(children, document.body);
};