import { useCallback, useState } from 'react';
import { fetchAdminRecordDetail, fetchRecordImages } from '../services/adminDetail.service';
import { AppError } from '../services/errorService';

const INITIAL = {
  isOpen: false,
  type: null,
  id: null,
  data: null,
  images: [],
  loading: false,
  error: null,
  imageError: null,
};

export function useAdminDetail() {
  const [state, setState] = useState(INITIAL);

  const close = useCallback(() => setState(INITIAL), []);

  const openDetail = useCallback(async (type, id) => {
    setState({
      isOpen: true,
      type,
      id,
      data: null,
      images: [],
      loading: true,
      error: null,
      imageError: null,
    });

    try {
      const data = await fetchAdminRecordDetail(type, id);
      let images = [];
      let imageError = null;
      try {
        images = await fetchRecordImages(type, id);
      } catch (imgErr) {
        imageError = imgErr.userMessage || imgErr.message || 'No se pudieron cargar las imágenes.';
      }
      setState((prev) => ({
        ...prev,
        data,
        images,
        loading: false,
        imageError,
      }));
    } catch (err) {
      let message = err.userMessage || err.message || 'No se pudo cargar el registro.';
      if (err.status === 404) {
        message = 'El registro no fue encontrado. Puede haber sido eliminado.';
      } else if (err.status === 0 || err.tipo === 'red') {
        message = 'No se pudo conectar con el servidor. Verifique que el backend esté activo.';
      }
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof AppError ? { ...err, userMessage: message } : new AppError(message, { status: err.status }),
      }));
    }
  }, []);

  return { ...state, openDetail, close };
}
