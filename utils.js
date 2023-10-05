module.exports.ERROR_CODE_BAD_REQUEST = 400;
module.exports.ERROR_CODE_UNAUTHORIZED = 401;
module.exports.ERROR_CODE_FORBIDDEN = 403;
module.exports.ERROR_CODE_NOT_FOUND = 404;
module.exports.ERROR_CODE_SERVER_ERROR = 500;


/*
Убедитесь, что ссылка на аватар выполняет условия:
Начинается с http:// или https://.
www. — это необязательная группа.
Путь — последовательность из цифр, латинских букв и символов -._~:/?#[]@!$&'()*+,;=, указанных после названия домена и доменной зоны. На конце пути может стоять решётка #.

http://ya.ru
https://www.ya.ru
http://2-domains.ru
http://ya.ru/path/to/deep/
http://ya-ya-ya.ru

спецсимвол \w — он ищет все латинские символы, цифры и нижние подчёркивания.

*/

// /^(https?):\/\/(www.)?([A-Z0-9]\-)*\.[A-Z0-9]+(\w\.\~\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=)*/i
