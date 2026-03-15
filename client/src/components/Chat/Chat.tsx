import { AttachFile, InsertDriveFile, Send } from "@mui/icons-material";
import {
  alpha,
  Box,
  Button,
  CardActions,
  Chip,
  CircularProgress,
  LinearProgress,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { FiEdit2, FiTrash } from "react-icons/fi";
import { MdOutlineClose } from "react-icons/md";
import TimeAgo from "react-timeago";
import { Slide, toast, ToastContainer } from "react-toastify";
import { useLazyDownloadFileQuery } from "../../services/api";
import { Message } from "../../types";
import { useChat } from "../../useChat";

const notify = (message: string) =>
  toast.info(message, {
    position: "top-left",
    autoClose: 1000,
    hideProgressBar: true,
    transition: Slide,
  });

const FileAttachment = ({ attachment }: { attachment: any }) => {
  const { chatActions } = useChat();
  const [isDownloading, setIsDownloading] = useState(false);

  const [downloadTrigger, { isLoading }] = useLazyDownloadFileQuery();

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("excel") || fileType.includes("sheet")) return "📊";
    return "📎";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await chatActions.downloadFile(attachment.id, attachment.fileName);
      toast.success("Файл загружен");
    } catch (error) {
      toast.error("Ошибка загрузки файла");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Tooltip
      title={`${attachment.fileName} (${formatFileSize(attachment.fileSize)})`}
    >
      <Chip
        icon={isLoading ? <CircularProgress size={20} /> : <InsertDriveFile />}
        label={
          attachment.fileName.length > 20
            ? attachment.fileName.substring(0, 20) + "..."
            : attachment.fileName
        }
        onClick={handleDownload}
        disabled={isLoading}
        size="small"
        sx={{ mr: 1, mb: 1, cursor: "pointer" }}
      />
    </Tooltip>
  );
};

export const Chat = ({ id, username }: { id: string; username: string }) => {
  const theme = useTheme();
  const { messages, log, chatActions } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState("");
  const [editingState, setEditingState] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(0);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [showTopGradient, setShowTopGradient] = useState(false);
  const [showBottomGradient, setShowBottomGradient] = useState(false);

  const changeText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
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
        text: trimmed || "(Файл)",
      };

      if (editingState) {
        await chatActions.update({ id: editingMessageId, text });
        setEditingState(false);
      } else {
        await chatActions.send(message, attachedFiles);
      }

      setText("");
      setAttachedFiles([]);
    } catch (error) {
      console.error("Ошибка отправки:", error);
      toast.error("Ошибка при отправке сообщения");
    } finally {
      setIsUploading(false);
    }
  };

  const removeMessage = (id: number) => {
    chatActions.remove({ id });
  };

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
      scrollElement.addEventListener("scroll", checkScroll);
      return () => scrollElement.removeEventListener("scroll", checkScroll);
    }
  }, []);

  useEffect(() => {
    if (!log) return;
    notify(log);
  }, [log]);

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      className="min-w-100 max-w-250 h-9/10 gap-4 flex flex-col pb-1"
    >
      <Typography variant="h5">Чат документов</Typography>
      <Box sx={{ position: "relative", flex: 1, minHeight: 0 }}>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 30,
            background: `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.95)} 0%, transparent 100%)`,
            opacity: showTopGradient ? 1 : 0,
            transition: "opacity 0.2s ease-in-out",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 30,
            background: `linear-gradient(to top, ${alpha(theme.palette.background.paper, 0.95)} 0%, transparent 100%)`,
            opacity: showBottomGradient ? 1 : 0,
            transition: "opacity 0.2s ease-in-out",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        <Box
          ref={scrollRef}
          className="flex flex-col h-full overflow-y-scroll"
          sx={{
            overflowY: "auto",
            pr: 1,
            "&::-webkit-scrollbar": {
              display: "none",
            },
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <Box sx={{ pt: 2, pb: 2 }}>
            {messages && messages.length > 0 ? (
              messages.map((message: Message) => {
                const isMsgBelongsToUser = message.userId === id;
                return (
                  <div
                    key={message.id}
                    className={[
                      "my-2 p-4 rounded-lg text-gray-800 w-[75%]",
                      isMsgBelongsToUser
                        ? "self-end border border-green-500 bg-green-300"
                        : "self-start border border-blue-500 bg-blue-300",
                      editingState && editingMessageId === message.id
                        ? "opacity-50"
                        : "",
                    ].join(" ")}
                    style={{
                      marginLeft: isMsgBelongsToUser ? "auto" : undefined,
                      marginRight: isMsgBelongsToUser ? undefined : "auto",
                    }}
                  >
                    <div className="flex justify-between text-sm mb-1">
                      <span>
                        {isMsgBelongsToUser ? "Вы: " : ""}
                        {message.userName}
                      </span>
                      <TimeAgo date={message.createdAt} />
                    </div>

                    {message.text && message.text !== "(Файл)" && (
                      <p>{message.text}</p>
                    )}

                    {/* Отображение вложений */}
                    {message.attachments && message.attachments.length > 0 && (
                      <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap" }}>
                        {message.attachments.map(att => (
                          <FileAttachment key={att.id} attachment={att} />
                        ))}
                      </Box>
                    )}

                    {isMsgBelongsToUser && (
                      <div className="flex justify-end mt-2">
                        <Button
                          size="small"
                          disabled={editingState}
                          onClick={() => {
                            setEditingState(true);
                            setEditingMessageId(message.id);
                            setText(message.text);
                          }}
                          sx={{ minWidth: "auto", p: 0.5, mr: 0.5 }}
                        >
                          <FiEdit2
                            size="18"
                            color={editingState ? "#ccc" : "#22c55e"}
                          />
                        </Button>
                        <Button
                          size="small"
                          disabled={editingState}
                          onClick={() => removeMessage(message.id)}
                          sx={{ minWidth: "auto", p: 0.5 }}
                        >
                          <FiTrash
                            size="18"
                            color={editingState ? "#ccc" : "#22c55e"}
                          />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <Box className="flex items-center justify-center h-full text-gray-400">
                Нет сообщений. Напишите что-нибудь!
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      {/* Отображение прикрепленных файлов */}
      {attachedFiles.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, p: 1 }}>
          {attachedFiles.map((file, index) => (
            <Chip
              key={index}
              label={
                file.name.length > 20
                  ? file.name.substring(0, 20) + "..."
                  : file.name
              }
              onDelete={() => removeFile(index)}
              size="small"
              icon={<InsertDriveFile />}
            />
          ))}
        </Box>
      )}
      {isUploading && <LinearProgress />}
      {/* Форма отправки */}
      <CardActions className="flex flex-col" sx={{ pt: 2 }}>
        <Box sx={{ display: "flex", width: "100%", gap: 1 }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            style={{ display: "none" }}
          />

          <Tooltip title="Прикрепить файл (PDF, Word, Excel)">
            <Button
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              sx={{ minWidth: "auto", p: 1 }}
            >
              <AttachFile />
            </Button>
          </Tooltip>

          <TextField
            type="text"
            size="small"
            value={text}
            onChange={changeText}
            disabled={isUploading}
            autoComplete="off"
            className="flex-1"
            placeholder="Введите сообщение..."
            onKeyPress={e => {
              if (e.key === "Enter" && !e.shiftKey) {
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
                setText("");
              }}
              sx={{ minWidth: "auto", p: 1 }}
            >
              <MdOutlineClose fontSize={20} />
            </Button>
          )}

          <Button
            color="primary"
            variant="contained"
            onClick={sendMessage}
            disabled={
              (!text.trim() && attachedFiles.length === 0) || isUploading
            }
            sx={{ minWidth: "auto", p: 1 }}
          >
            <Send className="-rotate-45 scale-75" />
          </Button>
        </Box>
      </CardActions>
      <ToastContainer />
    </Box>
  );
};
