# spa-render

Установка

```
npm install
```
Запуск [nodemon](https://github.com/remy/nodemon)
(в примере "render" - имя очереди)
```
node server --queue render
```
Для тестирования можно отправить 10 задач в очередь командой
```
node send
```
От клиента можно отправить уведомление о завершении загрузки данных
```
if (typeof window.callPhantom === 'function') {
  window.callPhantom({ loaded: true });
}
```
