import { useCallback, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SERVER_URI, USER_INFO } from "./constants";
import { Message, MessageCreatePayload, MessageUpdatePayload } from "./types";

import axios from "axios";

// экземпляр сокета
let socket: Socket;

export const useChat = () => {
  const userInfo = USER_INFO;

  // это важно: один пользователь - один сокет
  if (!socket) {
    socket = io(SERVER_URI, {
      query: {
        userName: userInfo.userName,
      },
      transports: ["websocket", "polling"], // Добавьте для надежности
    });
  }

  const [messages, setMessages] = useState<Message[]>([]); // Инициализируем пустым массивом
  const [log, setLog] = useState<string>();

  useEffect(() => {
    // Обработчик для логов
    const handleLog = (log: string) => {
      console.log("Log:", log);
      setLog(log);
    };

    // Обработчик для получения всех сообщений
    const handleMessages = (newMessages: Message[]) => {
      console.log("Получены сообщения:", newMessages);
      setMessages(newMessages);
    };

    // Обработчик для нового сообщения
    const handleNewMessage = (message: Message) => {
      console.log("Новое сообщение получено:", message);
      setMessages(prev => {
        // Проверяем, есть ли уже такое сообщение
        const exists = prev.some(m => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });
    };

    // Обработчик для обновления сообщения
    const handleUpdateMessage = (updatedMessage: Message) => {
      console.log("Сообщение обновлено:", updatedMessage);
      setMessages(prev =>
        prev.map(m => (m.id === updatedMessage.id ? updatedMessage : m)),
      );
    };

    // Обработчик для удаления сообщения
    const handleDeleteMessage = (deletedMessage: Message) => {
      console.log("Сообщение удалено:", deletedMessage);
      setMessages(prev => prev.filter(m => m.id !== deletedMessage.id));
    };

    // Подписываемся на события
    socket.on("log", handleLog);
    socket.on("messages", handleMessages);
    socket.on("message:post", handleNewMessage);
    socket.on("message:put", handleUpdateMessage);
    socket.on("message:delete", handleDeleteMessage);

    // Запрашиваем сообщения при подключении
    socket.emit("messages:get");

    // Очищаем подписки при размонтировании
    return () => {
      socket.off("log", handleLog);
      socket.off("messages", handleMessages);
      socket.off("message:post", handleNewMessage);
      socket.off("message:put", handleUpdateMessage);
      socket.off("message:delete", handleDeleteMessage);
    };
  }, []); // Пустой массив зависимостей - выполняется один раз

  // Функция для загрузки файлов
  const uploadFiles = useCallback(async (files: File[]): Promise<any[]> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append("files", file);
    });

    const token = localStorage.getItem("accessToken");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/attachments/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `${token}`, // Добавил Bearer
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Ошибка загрузки файлов:", error);
      return [];
    }
  }, []);

  // отправка сообщения с файлами
  const send = useCallback(
    async (payload: MessageCreatePayload, files?: File[]) => {
      console.log("Отправка сообщения:", payload, files);

      if (!socket.connected) {
        console.error("Socket не подключен");
        return;
      }

      if (files && files.length > 0) {
        const uploadedFiles = await uploadFiles(files);
        socket.emit("message:post", {
          ...payload,
          attachments: uploadedFiles,
        });
      } else {
        socket.emit("message:post", payload);
      }
    },
    [uploadFiles],
  );

  const update = useCallback((payload: MessageUpdatePayload) => {
    console.log("Обновление сообщения:", payload);
    socket.emit("message:put", payload);
  }, []);

  const remove = useCallback((payload: { id: number }) => {
    console.log("Удаление сообщения:", payload);
    socket.emit("message:delete", payload);
  }, []);

  const downloadFile = useCallback(
    async (attachmentId: string, fileName: string) => {
      const token = localStorage.getItem("accessToken");

      try {
        const response = await axios.get(
          `http://localhost:5000/api/attachments/${attachmentId}`,
          {
            headers: {
              Authorization: `${token}`, // Добавил Bearer
            },
            responseType: "blob",
          },
        );

        // Создаем ссылку для скачивания
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Ошибка загрузки файла:", error);
        throw error;
      }
    },
    [],
  );

  // Для отладки - показываем количество сообщений при изменении
  useEffect(() => {
    console.log("Текущее количество сообщений:", messages?.length || 0);
  }, [messages]);

  // Для отладки - статус подключения
  useEffect(() => {
    const onConnect = () => console.log("Socket подключен");
    const onDisconnect = () => console.log("Socket отключен");
    const onConnectError = (error: Error) =>
      console.error("Ошибка подключения:", error);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, []);

  window.clearMessages = useCallback(() => {
    socket.emit("messages:clear");
    location.reload();
  }, []);

  const chatActions = useMemo(
    () => ({
      send,
      update,
      remove,
      uploadFiles,
      downloadFile,
    }),
    [send, update, remove, uploadFiles, downloadFile],
  );

  return { messages, log, chatActions };
};
