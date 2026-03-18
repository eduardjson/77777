import { AttachFile, InsertDriveFile, Send } from '@mui/icons-material';
import {
  alpha,
  Box,
  Button,
  CardActions,
  Chip,
  LinearProgress,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { MdOutlineClose } from 'react-icons/md';
import { Slide, toast, ToastContainer } from 'react-toastify';
import { Message } from '../../types';
import { useChat } from '../../useChat';
import { MessageBubble } from './MessageBubble';
import { truncateFileName } from './utils/chatUtils';

export interface ChatActions {
  send: (message: any, files?: File[]) => Promise<void>;
  update: (payload: { id: number; text: string }) => Promise<void>;
  remove: (payload: { id: number }) => Promise<void>;
  downloadFile: (fileId: string, fileName: string) => Promise<void>;
  clearLog: () => void;
  clearError: () => void;
}

// Обновите возвращаемый тип в useChat
export interface UseChatReturn {
  messages: Message[];
  log: string | null;
  isLoading: boolean;
  error: string | null;
  uploadProgress: number | null;
  chatActions: ChatActions;
}

export const Chat = ({ id, username }: { id: string; username: string }) => {
  const theme = useTheme();
  // Используем хук с автоочисткой лога через 3 секунды
  const { messages, log, uploadProgress, chatActions } = useChat(3000);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState('');
  const [editingState, setEditingState] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(0);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showTopGradient, setShowTopGradient] = useState(false);
  const [showBottomGradient, setShowBottomGradient] = useState(false);

  // Логирование - теперь без ручной очистки
  useEffect(() => {
    if (!log) return;
    toast.info(log, {
      position: 'top-left',
      autoClose: 1000,
      hideProgressBar: true,
      transition: Slide,
    });
    // Убираем chatActions.clearLog() - автоочистка работает в хуке
  }, [log]);

  // Скролл градиенты
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setShowTopGradient(scrollTop > 10);
      setShowBottomGradient(scrollTop + clientHeight < scrollHeight - 10);
    }
  };

  useEffect(() => {
    checkScroll();
  }, [messages]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScroll);
      return () => scrollElement.removeEventListener('scroll', checkScroll);
    }
  }, []);

  // Обработчики
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = text.trim();
    if (!trimmed && attachedFiles.length === 0) return;

    setIsUploading(true);

    try {
      const message = {
        userId: id,
        userName: username,
        text: trimmed || '(Файл)',
      };

      if (editingState) {
        await chatActions.update({ id: editingMessageId, text });
        setEditingState(false);
      } else {
        await chatActions.send(message, attachedFiles);
      }

      setText('');
      setAttachedFiles([]);
    } catch (error) {
      console.error('Ошибка отправки:', error);
      toast.error('Ошибка при отправке сообщения');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      className="min-w-100 max-w-250 h-9/10 gap-4 flex flex-col pb-1"
    >
      <Typography variant="h5">Чат документов</Typography>

      {/* Область сообщений с градиентами */}
      <Box sx={{ position: 'relative', flex: 1, minHeight: 0 }}>
        {/* Градиенты */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 30,
            background: `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.95)} 0%, transparent 100%)`,
            opacity: showTopGradient ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 30,
            background: `linear-gradient(to top, ${alpha(theme.palette.background.paper, 0.95)} 0%, transparent 100%)`,
            opacity: showBottomGradient ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Список сообщений */}
        <Box
          ref={scrollRef}
          className="flex flex-col h-full overflow-y-scroll"
          sx={{
            overflowY: 'auto',
            pr: 1,
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <Box sx={{ pt: 2, pb: 2 }}>
            {messages && messages.length > 0 ? (
              messages.map((message: any) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={message.userId === id}
                  isEditing={editingState && editingMessageId === message.id}
                  onEdit={() => {
                    setEditingState(true);
                    setEditingMessageId(message.id);
                    setText(message.text);
                  }}
                  onDelete={() => chatActions.remove({ id: message.id })}
                  disabled={editingState}
                />
              ))
            ) : (
              <Box className="flex items-center justify-center h-full text-gray-400">
                Нет сообщений. Напишите что-нибудь!
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Прикрепленные файлы */}
      {attachedFiles.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 1 }}>
          {attachedFiles.map((file, index) => (
            <Chip
              key={index}
              label={truncateFileName(file.name)}
              onDelete={() => removeFile(index)}
              size="small"
              icon={<InsertDriveFile />}
            />
          ))}
        </Box>
      )}

      {/* Прогресс загрузки */}
      {(isUploading || uploadProgress !== null) && (
        <LinearProgress variant="determinate" value={uploadProgress || 0} />
      )}

      {/* Форма отправки */}
      <CardActions className="flex flex-col" sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', width: '100%', gap: 1 }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            style={{ display: 'none' }}
          />

          <Tooltip title="Прикрепить файл (PDF, Word, Excel)">
            <Button
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <AttachFile />
            </Button>
          </Tooltip>

          <TextField
            type="text"
            size="small"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isUploading}
            autoComplete="off"
            className="flex-1"
            placeholder="Введите сообщение..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e);
              }
            }}
          />

          {editingState && (
            <Button
              variant="text"
              color="error"
              onClick={() => {
                setEditingState(false);
                setText('');
              }}
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <MdOutlineClose fontSize={20} />
            </Button>
          )}

          <Button
            color="primary"
            variant="contained"
            onClick={sendMessage}
            disabled={(!text.trim() && attachedFiles.length === 0) || isUploading}
            sx={{ minWidth: 'auto', p: 1 }}
          >
            <Send className="-rotate-45 scale-75" />
          </Button>
        </Box>
      </CardActions>

      <ToastContainer />
    </Box>
  );
};
