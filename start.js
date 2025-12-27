const { exec } = require("child_process");

// 1. Собираем фронтенд
exec("npm --prefix client install && npm --prefix client run build", (err) => {
  if (err) {
    console.error("Frontend build error:", err);
    return;
  }
  console.log("Frontend built successfully.");

  // 2. Запускаем сервер
  const server = require("./server/index.js"); // путь к точке входа сервера
});
