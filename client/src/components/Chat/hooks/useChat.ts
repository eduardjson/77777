import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import {
  addLog,
  clearError,
  clearLog,
  deleteMessage,
  downloadFile,
  fetchMessages,
  sendMessage,
  updateMessage,
} from '../store/chatSlice';

export const useChat = () => {
  const dispatch = useDispatch<AppDispatch>();

  const messages = useSelector((state: RootState) => state.chat.messages);
  const log = useSelector((state: RootState) => state.chat.log);
  const isLoading = useSelector((state: RootState) => state.chat.isLoading);
  const error = useSelector((state: RootState) => state.chat.error);
  const uploadProgress = useSelector((state: RootState) => state.chat.uploadProgress);

  useEffect(() => {
    dispatch(fetchMessages());
  }, [dispatch]);

  const chatActions = {
    send: useCallback(
      async (message: any, files?: File[]) => {
        try {
          await dispatch(sendMessage({ message, files })).unwrap();
          dispatch(addLog('Сообщение отправлено'));
        } catch (error) {
          dispatch(addLog('Ошибка отправки сообщения'));
          throw error;
        }
      },
      [dispatch]
    ),

    update: useCallback(
      async (payload: { id: number; text: string }) => {
        try {
          await dispatch(updateMessage(payload)).unwrap();
          dispatch(addLog('Сообщение обновлено'));
        } catch (error) {
          dispatch(addLog('Ошибка обновления сообщения'));
          throw error;
        }
      },
      [dispatch]
    ),

    remove: useCallback(
      async (payload: { id: number }) => {
        try {
          await dispatch(deleteMessage(payload.id)).unwrap();
          dispatch(addLog('Сообщение удалено'));
        } catch (error) {
          dispatch(addLog('Ошибка удаления сообщения'));
          throw error;
        }
      },
      [dispatch]
    ),

    downloadFile: useCallback(
      async (fileId: string, fileName: string) => {
        try {
          await dispatch(downloadFile({ fileId, fileName })).unwrap();
          dispatch(addLog('Файл загружен'));
        } catch (error) {
          dispatch(addLog('Ошибка загрузки файла'));
          throw error;
        }
      },
      [dispatch]
    ),

    // Добавляем метод clearLog
    clearLog: useCallback(() => {
      dispatch(clearLog());
    }, [dispatch]),

    clearError: useCallback(() => {
      dispatch(clearError());
    }, [dispatch]),
  };

  return {
    messages,
    log,
    isLoading,
    error,
    uploadProgress,
    chatActions,
  };
};
